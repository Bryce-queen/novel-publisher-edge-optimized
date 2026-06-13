/**
 * Background Service Worker
 * 小说发布扩展 - 后台服务脚本
 *
 * 职责：
 * 1. 消息路由（popup <-> content scripts）
 * 2. 通用章节解析（与 options.js 数据模型一致）
 * 3. 发布队列管理（暂停/恢复/重试）
 * 4. 存储管理（sync: 设置/作品, local: 状态/日志）
 * 5. 侧边栏管理（点击图标打开 sidePanel）
 */

// 引入共享模块
importScripts('../shared/storage.js', '../shared/parser.js');

// 使用共享模块的存储工具（别名保持向后兼容）
var storageSyncGet = NovelPublisherStorage.storageSyncGet;
var storageSyncSet = NovelPublisherStorage.storageSyncSet;
var storageLocalGet = NovelPublisherStorage.storageLocalGet;
var storageLocalSet = NovelPublisherStorage.storageLocalSet;
var storageLocalRemove = NovelPublisherStorage.storageLocalRemove;

// 使用共享模块的解析工具（别名保持向后兼容）
var chineseToNumber = NovelPublisherParser.chineseToNumber;
var extractChapterNumber = NovelPublisherParser.extractChapterNumber;
var extractVolumeName = NovelPublisherParser.extractVolumeName;
var autoFormat = NovelPublisherParser.autoFormat;

// ============================================================
// 加密工具 - AES-GCM 加密存储敏感信息
// ============================================================

const CRYPTO_KEY_NAME = 'novel_publisher_enc_key';
const CRYPTO_SALT = 'NovelPublisher2024';

/**
 * 从原始字节数组重新导入 AES-GCM 密钥
 * @param {Array<number>} rawBytes
 * @returns {Promise<CryptoKey>}
 */
async function importRawKey(rawBytes) {
  const raw = new Uint8Array(rawBytes);
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * 生成或获取 AES-256 加密密钥（存储在 chrome.storage.local）
 * @returns {Promise<CryptoKey>} 加密密钥
 */
async function getEncryptionKey() {
  const stored = await chrome.storage.local.get(CRYPTO_KEY_NAME);
  if (stored[CRYPTO_KEY_NAME]) {
    // 存储的是字节数组，需要重新 importKey
    return importRawKey(stored[CRYPTO_KEY_NAME]);
  }
  // 生成新密钥
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await crypto.subtle.exportKey('raw', key);
  await chrome.storage.local.set({ [CRYPTO_KEY_NAME]: Array.from(new Uint8Array(exported)) });
  return key;
}

/**
 * AES-GCM 加密
 * @param {string} plaintext
 * @returns {Promise<string>} base64 编码的密文
 */
async function encryptText(plaintext) {
  if (!plaintext) return '';
  try {
    const key = await getEncryptionKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );
    // 合并 iv + 密文，转 base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode.apply(null, combined));
  } catch (e) {
    console.warn('[Novel Publisher] 加密失败，使用明文存储:', e.message);
    return plaintext;
  }
}

/**
 * AES-GCM 解密
 * @param {string} ciphertext - base64 编码的密文
 * @returns {Promise<string>} 明文
 */
async function decryptText(ciphertext) {
  if (!ciphertext) return '';
  try {
    const key = await getEncryptionKey();
    const combined = Uint8Array.from(atob(ciphertext), function(c) { return c.charCodeAt(0); });
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );
    return new TextDecoder().decode(decrypted);
  } catch (_e) {
    // 可能是旧的明文数据，直接返回
    return ciphertext;
  }
}

/**
 * 加密存储 API 配置（Client ID、Access Token、Open ID）
 * @param {string} clientId - 腾讯文档 Client ID
 * @param {string} accessToken - 腾讯文档 Access Token
 * @param {string} openId - 腾讯文档 Open ID
 * @returns {Promise<void>}
 */
async function saveApiConfigEncrypted(clientId, accessToken, openId) {
  const encClientId = await encryptText(clientId);
  const encAccessToken = await encryptText(accessToken);
  const encOpenId = await encryptText(openId);
  await chrome.storage.sync.set({
    tencentDocClientId: encClientId,
    tencentDocAccessToken: encAccessToken,
    tencentDocOpenId: encOpenId,
    apiConfigEncrypted: true
  });
}

/**
 * 解密读取 API 配置
 * @returns {Promise<{clientId: string, accessToken: string, openId: string}>} 解密后的 API 配置
 */
async function readApiConfigDecrypted() {
  const data = await storageSyncGet(['tencentDocClientId', 'tencentDocAccessToken', 'tencentDocOpenId', 'apiConfigEncrypted']);
  const clientId = await decryptText(data.tencentDocClientId || '');
  const accessToken = await decryptText(data.tencentDocAccessToken || '');
  const openId = await decryptText(data.tencentDocOpenId || '');
  return { clientId, accessToken, openId };
}

// ============================================================
// 零、点击扩展图标 → 打开侧边栏
// ============================================================
chrome.action.onClicked.addListener((tab) => {
  // 打开侧边栏（sidePanel API）
  chrome.sidePanel.open({ tabId: tab.id });
});

// ============================================================
// 一、中文数字转换工具
// 注：chineseToNumber 已从 shared/parser.js 引入
// ============================================================

const CN_NUM_MAP = {
  '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
  '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
  '百': 100, '千': 1000, '万': 10000
};

// ============================================================
// 二、通用章节解析器（从 shared/parser.js 引入）
// extractVolumeName、autoFormat 通过 NovelPublisherParser 调用
// ============================================================

/**
 * 清除控制字符
 * @param {string} text
 * @returns {string}
 */
function cleanControlChars(text) {
  if (!text) return '';
  return text.replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f]/g, '');
}

/**
 * 通用章节解析器
 * 从纯文本内容中解析出章节列表
 *
 * @param {string} content - 原始文本内容
 * @returns {Array<{index: number, title: string, content: string, charCount: number}>}
 */
function parseChapters(content) {
  if (!content || typeof content !== 'string') return [];

  // 0. 自动排版预处理
  content = NovelPublisherParser.autoFormat(content);

  // 1. 规范化章节标题格式：确保章节标题独占一行
  // 支持：第X章、第X回、第X卷、序章、楔子、引子、尾声、番外
  content = content.replace(
    /(?<!》)\s*(第[零一二三四五六七八九十百千万\d]+[章节回卷集部篇][\s：:])/g,
    '\n$1'
  );
  content = content.replace(
    /(?<!》)\s*((?:序章|楔子|引子|前言|序言|序幕|尾声|后记|番外(?:篇)?|终章|卷首语)[\s：:])/g,
    '\n$1'
  );

  // 2. 用正则匹配所有章节标题（增强版）
  const pattern = /^(第[零一二三四五六七八九十百千万\d]+[章节回卷集部篇][：:\s]*.+)|(?:序章|楔子|引子|前言|序言|序幕|尾声|后记|番外(?:篇)?|终章|卷首语)[：:\s]*.*/gm;
  const matches = Array.from(content.matchAll(pattern));

  if (!matches.length) return [];

  // 3. 拆分标题和正文
  const MAX_TITLE_CHARS = 20;
  const chapters = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const titleFull = (match[0] || match[1] || '').trim();
    const nextStart = matches[i + 1] ? matches[i + 1].index : content.length;

    // 找到标题结束位置
    let headingEnd = 0;
    for (let j = 0; j < titleFull.length; j++) {
      if (j >= MAX_TITLE_CHARS) {
        headingEnd = j;
        break;
      }
      if (j > 0 && '，。！？；、—…'.includes(titleFull[j])) {
        headingEnd = j;
        break;
      }
    }
    if (headingEnd === 0) {
      headingEnd = Math.min(MAX_TITLE_CHARS, titleFull.length);
    }

    const cleanTitle = titleFull.slice(0, headingEnd).trim();
    
    let bodyStart = match.index + match[0].length;

    // 跳过标题后的分隔符
    while (bodyStart < content.length && ' \t\n\r：:'.includes(content[bodyStart])) {
      bodyStart++;
    }

    let body = content.slice(bodyStart, nextStart).trim();
    body = body.replace(/\x0c/g, '').trim();

    // 4. 提取章节号
    const chapterNum = extractChapterNumber(cleanTitle) || (i + 1);
    const normalizedTitle = cleanTitle.replace(/第(\d+)章[：:]/, '第$1章');

    chapters.push({
      index: chapterNum,
      title: normalizedTitle,
      content: body,
      charCount: body.length
    });
  }

  return chapters;
}

// ============================================================
// 三、存储工具
// 注：storageSyncGet/Set、storageLocalGet/Set 已从 shared/storage.js 引入
// ============================================================

// ============================================================
// 数据加密中间件（可选，根据 dataEncryption 开关决定是否加密）
// ============================================================

/**
 * 加密并存储数据到 chrome.storage.local
 * 当全局加密开关开启时，数据经过 AES-256 加密后再存储
 * @param {string} key - 存储键名
 * @param {*} data - 要存储的数据（将被 JSON 序列化后加密）
 * @returns {Promise<void>}
 */
async function encryptAndStore(key, data) {
  const { dataEncryption } = await storageSyncGet(['dataEncryption']);
  if (dataEncryption) {
    try {
      const encrypted = await encryptText(JSON.stringify(data));
      await chrome.storage.local.set({ [key]: encrypted });
    } catch (e) {
      console.warn('[Novel Publisher] 加密存储失败，回退明文:', e.message);
      await chrome.storage.local.set({ [key]: data });
    }
  } else {
    await chrome.storage.local.set({ [key]: data });
  }
}

/**
 * 从 chrome.storage.local 读取并解密数据
 * 当全局加密开关开启时，尝试解密数据；解密失败则返回原始数据
 * @param {string} key - 存储键名
 * @returns {Promise<*>} 解密后的数据，或 null
 */
async function decryptAndLoad(key) {
  const { dataEncryption } = await storageSyncGet(['dataEncryption']);
  const raw = await chrome.storage.local.get([key]);
  if (!raw[key]) return null;

  if (dataEncryption) {
    try {
      const decrypted = await decryptText(raw[key]);
      return JSON.parse(decrypted);
    } catch (e) {
      console.warn('[Novel Publisher] 解密 ' + key + ' 失败:', e);
      return raw[key];
    }
  }
  return raw[key];
}

// ============================================================
// 四、发布状态管理
// ============================================================

/**
 * 发布状态结构（存储在 chrome.storage.local）
 * {
 *   isPublishing: boolean,
 *   isPaused: boolean,
 *   currentChapterIndex: number,
 *   totalChapters: number,
 *   successCount: number,
 *   failCount: number,
 *   currentWorkId: string,
 *   startTime: number
 * }
 */

/**
 * 获取当前发布状态
 * @returns {Promise<Object>}
 */
async function getPublishState() {
  const data = await storageLocalGet('publishState');
  return data.publishState || {
    isPublishing: false,
    isPaused: false,
    currentChapterIndex: 0,
    totalChapters: 0,
    successCount: 0,
    failCount: 0,
    currentWorkId: null,
    startTime: null
  };
}

/**
 * 更新发布状态
 * @param {Object} updates
 * @returns {Promise<void>}
 */
async function updatePublishState(updates) {
  const current = await getPublishState();
  const newState = { ...current, ...updates };
  await storageLocalSet({ publishState: newState });
  return newState;
}

/**
 * 添加发布日志
 * @param {Object} logEntry
 * @returns {Promise<void>}
 */
async function addPublishLog(logEntry) {
  const data = await storageLocalGet('publishLog');
  const logs = data.publishLog || [];
  logs.push({
    ...logEntry,
    timestamp: Date.now()
  });
  // 最多保留 500 条日志
  if (logs.length > 500) {
    logs.splice(0, logs.length - 500);
  }
  await storageLocalSet({ publishLog: logs });
}

/**
 * 向所有扩展页面广播消息（popup 等）
 * @param {string} action
 * @param {Object} data
 */
function broadcastToPopup(action, data = {}) {
  chrome.runtime.sendMessage({ action, ...data }).catch(() => {
    // popup 可能未打开，忽略错误
  });
}

// ============================================================
// 五、发布流程
// ============================================================

/**
 * 发布单章
 * @param {number} tabId - 番茄编辑器 tab ID
 * @param {Object} chapter - 章节数据 {index, title, content, charCount}
 * @param {Object} workConfig - 作品配置 {bookId, aiGenerated, ...}
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function publishSingleChapter(tabId, chapter, workConfig) {
  const startTime = Date.now();

  try {
    // 1. 发送消息到 fanqie_editor.js 的 content script
    const response = await chrome.tabs.sendMessage(tabId, {
      action: 'publishChapter',
      chapter: chapter,
      config: { ...workConfig, antiDetectionMode: workConfig.antiDetectionMode !== false }
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (response && response.success) {
      // 2. 更新 publishState
      const state = await getPublishState();
      const completed = (state.completedChapters || []).concat(chapter.index);
      await updatePublishState({
        successCount: state.successCount + 1,
        currentChapterIndex: state.currentChapterIndex + 1,
        completedChapters: completed
      });

      // 3. 记录 publishLog
      await addPublishLog({
        type: 'success',
        chapterIndex: chapter.index,
        chapterTitle: chapter.title,
        workId: workConfig.bookId,
        elapsed: parseFloat(elapsed)
      });

      console.log(`[Novel Publisher] 第${chapter.index}章发布成功，耗时 ${elapsed}s`);

      // 4. 通知 popup 更新进度
      broadcastToPopup('publishProgress', {
        current: state.currentChapterIndex + 1,
        total: state.totalChapters,
        chapterIndex: chapter.index,
        chapterTitle: chapter.title,
        success: true,
        dryRun: !!(response.dryRun)
      });

      return { success: true };
    } else {
      const errorMsg = response?.error || '未知错误';

      const state = await getPublishState();
      await updatePublishState({
        failCount: state.failCount + 1,
        currentChapterIndex: state.currentChapterIndex + 1
      });

      await addPublishLog({
        type: 'fail',
        chapterIndex: chapter.index,
        chapterTitle: chapter.title,
        workId: workConfig.bookId,
        error: errorMsg,
        elapsed: parseFloat(elapsed),
        snapshot: response.snapshot || null
      });

      console.error(`[Novel Publisher] 第${chapter.index}章发布失败: ${errorMsg}`);
      if (response.snapshot) {
        console.error('[Novel Publisher] 失败快照:', JSON.stringify(response.snapshot));
      }

      broadcastToPopup('publishProgress', {
        current: state.currentChapterIndex + 1,
        total: state.totalChapters,
        chapterIndex: chapter.index,
        chapterTitle: chapter.title,
        success: false,
        error: errorMsg
      });

      return { success: false, error: errorMsg };
    }
  } catch (error) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const errorMsg = error.message || '通信超时或 content script 未就绪';

    const state = await getPublishState();
    await updatePublishState({
      failCount: state.failCount + 1,
      currentChapterIndex: state.currentChapterIndex + 1
    });

    await addPublishLog({
      type: 'fail',
      chapterIndex: chapter.index,
      chapterTitle: chapter.title,
      workId: workConfig.bookId,
      error: errorMsg,
      elapsed: parseFloat(elapsed)
    });

    console.error(`[Novel Publisher] 第${chapter.index}章发布异常: ${errorMsg}`);

    broadcastToPopup('publishProgress', {
      current: state.currentChapterIndex + 1,
      total: state.totalChapters,
      chapterIndex: chapter.index,
      chapterTitle: chapter.title,
      success: false,
      error: errorMsg
    });

    return { success: false, error: errorMsg };
  }
}

/**
 * 按队列逐章发布
 * @param {Array} chapters - 章节列表
 * @param {Object} workConfig - 作品配置
 * @returns {Promise<{successCount: number, failCount: number}>}
 */
async function publishChapterQueue(chapters, workConfig) {
  // 读取全局设置（从 globalSettings 嵌套对象中读取）
  const allSettings = await storageSyncGet(['globalSettings']);
  const globalSettings = allSettings.globalSettings || {};
  const minInterval = (globalSettings.publishIntervalMin || 30) * 1000;
  const maxInterval = (globalSettings.publishIntervalMax || 60) * 1000;
  const publishInterval = minInterval + Math.random() * (maxInterval - minInterval);
  const autoRetry = globalSettings.autoRetry !== false;
  const maxRetries = globalSettings.retryCount || 2;
  // antiDetectionMode：传递给 content script，控制是否启用人类行为模拟
  const antiDetectionMode = globalSettings.antiDetectionMode !== false;
  // dryRunMode：演练模式，完整流程但在最终提交前停止
  const dryRunMode = globalSettings.dryRunMode === true;
  // logRetentionDays：传递给 cleanupOldData 使用

  // 将 antiDetectionMode 和 dryRunMode 合并到 workConfig，传递给 content script
  workConfig.antiDetectionMode = antiDetectionMode;
  workConfig.dryRunMode = dryRunMode;

  // 初始化发布状态
  await updatePublishState({
    isPublishing: true,
    isPaused: false,
    currentChapterIndex: 0,
    totalChapters: chapters.length,
    successCount: 0,
    failCount: 0,
    currentWorkId: workConfig.bookId,
    startTime: Date.now(),
    completedChapters: []  // 已完成章节索引，用于中断恢复
  });

  let successCount = 0;
  let failCount = 0;

  // 查找番茄小说编辑器 tab
  let tabs = await chrome.tabs.query({
    url: ['https://fanqienovel.com/main/writer/*', 'https://*.fanqienovel.com/main/writer/*']
  });

  let tab;
  if (tabs.length === 0) {
    // 打开番茄小说创作页面
    tab = await chrome.tabs.create({
      url: 'https://fanqienovel.com/main/writer/',
      active: false
    });
    // 等待页面加载
    await new Promise(r => setTimeout(r, 8000));
  } else {
    tab = tabs[0];
  }

  for (let i = 0; i < chapters.length; i++) {
    // 检查是否暂停
    const currentState = await getPublishState();
    if (currentState.isPaused) {
      console.log('[Novel Publisher] 发布队列已暂停');
      break;
    }

    const chapter = chapters[i];
    let retryCount = 0;
    let published = false;

    // 重试逻辑
    while (retryCount <= maxRetries && !published) {
      const result = await publishSingleChapter(tab.id, chapter, workConfig);

      if (result.success) {
        published = true;
        successCount++;
      } else if (autoRetry && retryCount < maxRetries) {
        retryCount++;
        console.log(`[Novel Publisher] 第${chapter.index}章重试 (${retryCount}/${maxRetries})`);
        await addPublishLog({
          type: 'retry',
          chapterIndex: chapter.index,
          chapterTitle: chapter.title,
          workId: workConfig.bookId,
          retryCount
        });
        // 重试前等待更长时间
        await new Promise(r => setTimeout(r, publishInterval * 2));
      } else {
        published = false; // 最终失败
        failCount++;
        break;
      }
    }

    // 章节间等待（最后一章不等待）
    if (i < chapters.length - 1) {
      await new Promise(r => setTimeout(r, publishInterval));
    }

    // 让出主线程，避免阻塞其他消息处理
    if (i < chapters.length - 1) {
      await new Promise(r => setTimeout(r, 0));
    }
  }

  // 发布完成，更新状态
  await updatePublishState({
    isPublishing: false,
    isPaused: false,
    successCount,
    failCount
  });

  // 发送完成通知
  broadcastToPopup('publishComplete', {
    successCount,
    failCount,
    total: chapters.length
  });

  // 发送系统通知
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: '小说发布助手',
    message: `发布完成！成功 ${successCount} 章，失败 ${failCount} 章`
  });

  return { successCount, failCount };
}

/**
 * 暂停发布队列
 */
async function pausePublishQueue() {
  await updatePublishState({ isPaused: true });
  console.log('[Novel Publisher] 发布队列已暂停');
}

/**
 * 恢复发布队列
 */
async function resumePublishQueue() {
  await updatePublishState({ isPaused: false });
  console.log('[Novel Publisher] 发布队列已恢复');
}

// ============================================================
// 六、消息处理器（完整事件总线）
// ============================================================

/**
 * 从腾讯文档 OpenAPI 返回的 JSON 树中递归提取纯文本
 * 文档结构：Document -> MainStory -> Section -> Paragraph -> Run -> Text
 *
 * @param {object} node - JSON 树节点
 * @returns {string} 纯文本内容
 */
function extractTextFromDocNode(node) {
  if (!node) return '';

  let text = '';

  // 如果节点本身有 text 属性（Run 节点）
  if (node.text && typeof node.text === 'string') {
    text += node.text;
  }

  // 递归处理子节点
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      const childText = extractTextFromDocNode(child);

      // Paragraph 节点之间加换行
      if (child.type === 'Paragraph' && childText) {
        text += childText + '\n';
      } else if (child.type === 'Section' && childText) {
        text += childText + '\n';
      } else {
        text += childText;
      }
    }
  }

  return text;
}

/**
 * 通过腾讯文档 OpenAPI 获取文档内容
 *
 * @param {string} fileId - 文档 ID
 * @param {object} apiConfig - API 配置 { clientId, accessToken, openId }
 * @returns {Promise<string>} 文档纯文本内容
 */
async function fetchDocContentViaApi(fileId, apiConfig) {
  const url = 'https://docs.qq.com/openapi/doc/v3/' + fileId;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Access-Token': apiConfig.accessToken,
      'Client-Id': apiConfig.clientId,
      'Open-Id': apiConfig.openId
    }
  });

  if (!response.ok) {
    throw new Error('API 请求失败 (HTTP ' + response.status + ')');
  }

  const data = await response.json();

  if (!data.document) {
    throw new Error('API 返回数据格式异常：缺少 document 字段');
  }

  // 递归提取文本
  const fullText = extractTextFromDocNode(data.document);

  if (!fullText || fullText.trim().length < 50) {
    throw new Error('API 返回的文档内容为空或过短');
  }

  return fullText.trim();
}

/**
 * 处理从腾讯文档提取
 */
async function handleExtractFromDoc(sendResponse) {
  try {
    // 从当前作品的分卷配置中获取文档 URL
    const syncData = await storageSyncGet(['works', 'currentWorkId']);
    const currentWork = syncData.works?.find(w => w.id === syncData.currentWorkId);
    let docUrl = '';

    if (currentWork && currentWork.volumes) {
      const vol = currentWork.volumes.find(v => v.sourceType === 'tencent_doc' && v.sourceUrl);
      if (vol) docUrl = vol.sourceUrl;
    }

    // 从 URL 提取 fileId
    const fileIdMatch = docUrl.match(/docs\.qq\.com\/doc\/([A-Za-z0-9]+)/);
    const fileId = fileIdMatch ? fileIdMatch[1] : '';

    if (!fileId) {
      sendResponse({
        success: false,
        error: '无法从 URL 中提取文档 ID'
      });
      return;
    }

    // === 策略 1：尝试 OpenAPI ===
    const apiConfig = await readApiConfigDecrypted();

    if (apiConfig.clientId && apiConfig.accessToken && apiConfig.openId) {
      try {
        const apiContent = await fetchDocContentViaApi(fileId, apiConfig);

        // API 提取成功，解析章节
        const chapters = parseChapters(apiContent);

        if (chapters.length > 0) {
          // 保存提取结果
          await storageLocalSet({
            lastExtracted: {
              chapters: chapters,
              docInfo: { title: '', url: docUrl, fileId: fileId },
              timestamp: Date.now(),
              source: 'api'
            }
          });

          sendResponse({
            success: true,
            data: {
              chapters: chapters,
              docInfo: {
                title: '（通过 API 提取）',
                url: docUrl,
                fileId: fileId,
                contentLength: apiContent.length
              },
              source: 'api',
              totalChars: apiContent.length
            }
          });
          return;
        }
      } catch (apiError) {
        console.log('[Novel Publisher] API 提取失败，回退到 content script:', apiError.message);
        // 继续尝试 content script
      }
    }

    // === 策略 2：通过 content script 提取 ===
    const tabs = await chrome.tabs.query({ url: ['https://docs.qq.com/doc/*'] });

    if (tabs.length === 0) {
      sendResponse({
        success: false,
        error: 'API 未配置或提取失败，且未找到腾讯文档标签页。请打开文档页面，或配置 API。'
      });
      return;
    }

    const tab = tabs[0];
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractChapters' });

    if (response && response.success) {
      const rawContent = response.data.content || '';
      const chapters = parseChapters(rawContent);

      await storageLocalSet({
        lastExtracted: {
          chapters: chapters,
          docInfo: { title: response.data.title, url: docUrl, fileId: fileId },
          timestamp: Date.now(),
          source: 'content_script'
        }
      });

      sendResponse({
        success: true,
        data: {
          chapters: chapters,
          docInfo: response.data,
          source: 'content_script',
          totalChars: rawContent.length
        }
      });
    } else {
      sendResponse({
        success: false,
        error: response ? response.error : 'content script 提取失败'
      });
    }
  } catch (error) {
    sendResponse({
      success: false,
      error: error.message || '与腾讯文档通信失败'
    });
  }
}

/**
 * 处理解析本地文件内容
 */
function handleParseLocalFile(request, sendResponse) {
  try {
    const { text, filename } = request;
    if (!text || typeof text !== 'string') {
      sendResponse({ success: false, error: '文本内容为空' });
      return;
    }

    const chapters = parseChapters(text);
    const volumeName = NovelPublisherParser.extractVolumeName(filename || '');

    sendResponse({
      success: true,
      data: {
        chapters,
        title: filename || '本地文件',
        volumeName,
        contentLength: text.length,
        source: 'local'
      }
    });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 处理解析粘贴文本
 */
function handleParsePasteText(request, sendResponse) {
  try {
    const { text } = request;
    if (!text || typeof text !== 'string') {
      sendResponse({ success: false, error: '粘贴内容为空' });
      return;
    }

    const chapters = parseChapters(text);

    sendResponse({
      success: true,
      data: {
        chapters,
        title: '粘贴文本',
        volumeName: '',
        contentLength: text.length,
        source: 'paste'
      }
    });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 处理发布选中章节
 */
async function handlePublishChapters(request, sendResponse) {
  try {
    let { chapters, workConfig } = request;

    if (!chapters || chapters.length === 0) {
      sendResponse({ success: false, error: '没有要发布的章节' });
      return;
    }

    // 检查是否已在发布中
    const currentState = await getPublishState();
    if (currentState.isPublishing && !currentState.isPaused) {
      sendResponse({ success: false, error: '已有发布任务进行中' });
      return;
    }

    // 如果 popup 未传递 workConfig，自动从 storage 中读取当前作品配置
    if (!workConfig) {
      const allSettings = await storageSyncGet(['works', 'currentWorkId']);
      const currentWork = allSettings.works?.find(w => w.id === allSettings.currentWorkId);
      if (currentWork) {
        workConfig = {
          bookId: currentWork.fanqieBookId,
          aiGenerated: currentWork.aiGenerated,
          chaptersPerDay: currentWork.chaptersPerDay
        };
      }
    }

    // 合并配置
    const mergedConfig = {
      ...workConfig
    };

    if (!mergedConfig.bookId) {
      sendResponse({ success: false, error: '未配置番茄小说作品 ID，请在设置页配置' });
      return;
    }

    // 异步启动发布队列（不阻塞 sendResponse）
    sendResponse({
      success: true,
      data: {
        message: `开始发布 ${chapters.length} 章`,
        total: chapters.length
      }
    });

    // 在后台执行发布
    publishChapterQueue(chapters, mergedConfig).catch(err => {
      console.error('[Novel Publisher] 发布队列异常:', err);
    });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 获取当前作品状态
 */
async function handleGetWorkStatus(sendResponse) {
  try {
    const syncData = await storageSyncGet(['works', 'currentWorkId']);
    const localData = await storageLocalGet(['publishState', 'publishLog']);

    const works = syncData.works || [];
    const currentWorkId = syncData.currentWorkId || null;
    const currentWork = currentWorkId ? works.find(w => w.id === currentWorkId) : null;

    const publishState = localData.publishState || {};
    const publishLog = localData.publishLog || [];

    sendResponse({
      success: true,
      data: {
        works: works,
        currentWorkId: currentWorkId,
        workTitle: currentWork ? currentWork.name : '',
        fanqieBookId: currentWork ? (currentWork.fanqieBookId || '') : '',
        publishState,
        recentLogs: publishLog.slice(-20) // 最近 20 条日志
      }
    });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 切换当前作品
 */
async function handleSwitchWork(request, sendResponse) {
  try {
    const { workId } = request;
    if (!workId) {
      sendResponse({ success: false, error: '缺少 workId' });
      return;
    }

    await storageSyncSet({ currentWorkId: workId });
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 获取设置
 * API 凭证字段在 sync 中存的是密文，此处通过 readApiConfigDecrypted() 解密后
 * 以明文形式返回给 popup / options 页面使用。
 */
async function handleGetSettings(sendResponse) {
  try {
    const settings = await storageSyncGet([
      'currentWorkId', 'works', 'globalSettings', 'apiSkipped',
      'dataEncryption', 'aiProvider', 'aiApiUrl', 'aiApiKey', 'aiModel'
    ]);

    // 解密 API 凭证，以明文返回
    const apiConfig = await readApiConfigDecrypted();
    settings.tencentDocClientId = apiConfig.clientId;
    settings.tencentDocAccessToken = apiConfig.accessToken;
    settings.tencentDocOpenId = apiConfig.openId;

    sendResponse({ success: true, data: settings });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 保存设置
 * 注意：API 凭证字段（tencentDocClientId / tencentDocAccessToken / tencentDocOpenId）
 * 已由 saveApiConfigEncrypted 单独加密存储，此处从 settings 中剔除，避免明文回写。
 */
async function handleSaveSettings(request, sendResponse) {
  try {
    const settings = { ...request.settings };

    // 加密存储 API 密钥，并从 settings 中删除明文字段
    if (settings && settings.tencentDocClientId) {
      await saveApiConfigEncrypted(
        settings.tencentDocClientId || '',
        settings.tencentDocAccessToken || '',
        settings.tencentDocOpenId || ''
      );
      delete settings.tencentDocClientId;
      delete settings.tencentDocAccessToken;
      delete settings.tencentDocOpenId;
    }

    await storageSyncSet(settings);
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 获取发布进度
 */
async function handleGetStatus(sendResponse) {
  try {
    const state = await getPublishState();
    const localData = await storageLocalGet(['lastExtracted']);
    const lastExtracted = localData.lastExtracted;

    sendResponse({
      success: true,
      data: {
        isPublishing: state.isPublishing,
        isPaused: state.isPaused,
        currentChapterIndex: state.currentChapterIndex,
        totalChapters: state.totalChapters,
        successCount: state.successCount,
        failCount: state.failCount,
        extractedCount: lastExtracted?.chapters?.length || 0,
        startTime: state.startTime,
        queueLength: Math.max(0, state.totalChapters - state.currentChapterIndex)
      }
    });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 暂停发布
 */
async function handlePausePublish(sendResponse) {
  try {
    await pausePublishQueue();
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 恢复发布
 */
async function handleResumePublish(sendResponse) {
  try {
    await resumePublishQueue();
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// ============================================================
// 七、消息监听器（事件总线）
// ============================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 防止重复发送响应
  let responded = false;
  const safeSend = (data) => {
    if (!responded) {
      responded = true;
      sendResponse(data);
    }
  };

  try {
    switch (request.action) {
      // --- 从 content script 发来的消息 ---
      case 'contentScriptReady':
        console.log(`[Novel Publisher] 内容脚本已就绪: ${request.platform || 'unknown'} - ${request.url || ''}`);
        safeSend({ success: true });
        break;

      // --- 从 tencent_doc.js 发来的提取进度，转发给 popup ---
      case 'extractProgress':
        broadcastToPopup('extractProgress', {
          status: request.status,
          message: request.message,
          ...request
        });
        safeSend({ success: true });
        break;

      // --- 从 popup 发来的消息 ---
      case 'extractFromDoc':
        handleExtractFromDoc(safeSend);
        return true; // 异步

      case 'parseLocalFile':
        handleParseLocalFile(request, safeSend);
        return false; // 同步

      case 'parsePasteText':
        handleParsePasteText(request, safeSend);
        return false; // 同步

      case 'publishChapters':
        handlePublishChapters(request, safeSend);
        return true; // 异步

      case 'getWorkStatus':
        handleGetWorkStatus(safeSend);
        return true; // 异步

      case 'switchWork':
        handleSwitchWork(request, safeSend);
        return true; // 异步

      case 'getSettings':
        handleGetSettings(safeSend);
        return true; // 异步

      case 'saveSettings':
        handleSaveSettings(request, safeSend);
        return true; // 异步

      case 'getStatus':
        handleGetStatus(safeSend);
        return true; // 异步

      case 'pausePublish':
        handlePausePublish(safeSend);
        return true; // 异步

      case 'resumePublish':
        handleResumePublish(safeSend);
        return true; // 异步

      case 'openOptions':
        chrome.runtime.openOptionsPage();
        safeSend({ success: true });
        break;

      case 'openFanqieLogin':
        chrome.tabs.create({ url: 'https://fanqienovel.com/main/writer/' });
        safeSend({ success: true });
        break;

      case 'checkFanqieLogin':
        handleCheckFanqieLogin(safeSend);
        return true; // 异步

      // --- 兼容旧版 popup 消息 ---
      case 'extractChapters':
        // 旧版消息，转发到新处理器
        handleExtractFromDoc(safeSend);
        return true;

      case 'getExtractedChapters':
        storageLocalGet('lastExtracted').then(data => {
          const extracted = data.lastExtracted || {};
          safeSend({
            success: true,
            data: {
              chapters: extracted.chapters || [],
              docInfo: extracted.docInfo || null
            }
          });
        }).catch(err => {
          safeSend({ success: false, error: err.message });
        });
        return true;

      case 'clearExtracted':
        storageLocalSet({ lastExtracted: null }).then(() => {
          safeSend({ success: true });
        }).catch(err => {
          safeSend({ success: false, error: err.message });
        });
        return true;

      // --- AI 辅助创作 ---
      case 'aiGenerate':
        handleAiGenerate(request, safeSend);
        return true;

      case 'aiTestConfig':
        handleAiTestConfig(request, safeSend);
        return true;

      case 'saveApiConfig':
        saveApiConfigEncrypted(request.data.tencentDocClientId, request.data.tencentDocAccessToken, request.data.tencentDocOpenId)
          .then(() => safeSend({ success: true }))
          .catch(err => safeSend({ success: false, error: err.message }));
        return true;

      default:
        console.warn(`[Novel Publisher] 未知消息类型: ${request.action}`);
        safeSend({ success: false, error: `未知操作: ${request.action}` });
        break;
    }
  } catch (error) {
    console.error('[Novel Publisher] 消息处理异常:', error);
    safeSend({ success: false, error: error.message });
  }
});

// ============================================================
// 八、初始化
// ============================================================

chrome.runtime.onInstalled.addListener((details) => {
  console.log(`[Novel Publisher] 扩展${details.reason === 'install' ? '安装' : '更新'}完成`);

  if (details.reason === 'install') {
    // 首次安装，设置默认值
    storageSyncSet({
      globalSettings: {
        minChapterChars: 1000,
        publishIntervalMin: 30,
        publishIntervalMax: 60,
        autoCloseModals: true,
        autoRetry: true,
        retryCount: 2
      }
    }).then(() => {
      console.log('[Novel Publisher] 默认设置已保存');
    }).catch(err => {
      console.error('[Novel Publisher] 保存默认设置失败:', err);
    });
  }
});

// 监听 tab 更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    if (tab.url?.includes('docs.qq.com/doc/')) {
      console.log('[Novel Publisher] 腾讯文档页面已加载:', tab.url);
    } else if (tab.url?.includes('fanqienovel.com/main/writer/')) {
      console.log('[Novel Publisher] 番茄小说页面已加载:', tab.url);
    }
  }
});

console.log('[Novel Publisher] 后台服务脚本已加载');

// ============================================================
// 性能监控（仅开发环境）
// ============================================================
if (typeof PerformanceObserver !== 'undefined') {
  try {
    const perfObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 100) {
          console.warn('[Performance] ' + entry.name + ' took ' + entry.duration.toFixed(2) + 'ms');
        }
      }
    });
    perfObserver.observe({ entryTypes: ['measure', 'longtask'] });
  } catch (_e) {
    // 浏览器不支持时静默失败
  }
}

// ============================================================
// 八、番茄小说登录检测
// ============================================================

/**
 * 通过 cookie 检测番茄小说登录状态
 */
async function handleCheckFanqieLogin(safeSend) {
  try {
    const cookieNames = ['sessionid', 'session_id', 'passport_csrf_token', 'sid_guard'];
    let loggedIn = false;

    for (const name of cookieNames) {
      try {
        const cookie = await chrome.cookies.get({ url: 'https://fanqienovel.com', name: name });
        if (cookie && cookie.value && cookie.value.length > 0) {
          loggedIn = true;
          break;
        }
      } catch (_e) {
        continue;
      }
    }

    // 缓存登录状态
    await chrome.storage.local.set({
      fanqieLoggedIn: loggedIn,
      fanqieLoginTime: new Date().toISOString()
    });

    safeSend({ success: true, loggedIn: loggedIn });
  } catch (err) {
    safeSend({ success: false, error: err.message });
  }
}

// ============================================================
// 九、Alarm 定时发布 + 数据清理
// ============================================================

/**
 * 设置定时发布 Alarm
 * @param {number} delayMinutes - 延迟分钟数
 * @returns {Promise<void>}
 */
async function schedulePublishAlarm(delayMinutes) {
  if (!delayMinutes || delayMinutes < 1) return;

  await chrome.alarms.create('scheduledPublish', {
    delayInMinutes: delayMinutes
  });

  console.log('[Novel Publisher] 已设置定时发布，' + delayMinutes + ' 分钟后执行');
}

/**
 * 取消定时发布
 */
async function cancelPublishAlarm() {
  await chrome.alarms.clear('scheduledPublish');
  console.log('[Novel Publisher] 已取消定时发布');
}

/**
 * Alarm 触发处理
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'scheduledPublish') {
    console.log('[Novel Publisher] 定时发布触发');
    // 检查是否有待发布章节
    const localData = await chrome.storage.local.get(['publishState']);
    const state = localData.publishState || {};

    if (state.chapters && state.chapters.length > 0) {
      // 如果有已完成记录，过滤掉已完成的章节
      const completedSet = new Set(state.completedChapters || []);
      const pending = state.chapters.filter(ch =>
        (ch.status === 'pending' || ch.status === 'error') && !completedSet.has(ch.index)
      );
      if (pending.length > 0) {
        console.log('[Novel Publisher] 定时发布：发现 ' + pending.length + ' 个待发布章节');
        // 从 sync 读取完整作品配置（与手动发布路径一致）
        const syncData = await storageSyncGet(['works', 'currentWorkId', 'globalSettings']);
        const currentWork = (syncData.works || []).find(w => w.id === syncData.currentWorkId);
        const fullConfig = {
          bookId: state.workId || (currentWork && currentWork.fanqieBookId),
          aiGenerated: currentWork ? currentWork.aiGenerated : false,
          chaptersPerDay: currentWork ? currentWork.chaptersPerDay : undefined
        };
        // 触发发布流程（publishChapterQueue 内部会补充 antiDetectionMode/dryRunMode）
        publishChapterQueue(state.chapters, fullConfig);
        return;
      }
    }
    console.log('[Novel Publisher] 定时发布：无待发布章节');
  }

  if (alarm.name === 'dataCleanup') {
    await cleanupOldData();
  }

  if (alarm.name === 'dailyBackup') {
    await performDailyBackup();
  }
});

/**
 * 设置每日数据备份 Alarm（每天凌晨4点）
 * @returns {Promise<void>}
 */
async function setupDailyBackup() {
  await chrome.alarms.create('dailyBackup', {
    when: getNextBackupTime(),
    periodInMinutes: 24 * 60
  });
  console.log('[Novel Publisher] 已设置每日数据备份任务');
}

/**
 * 计算下一次备份时间（凌晨4点）
 */
function getNextBackupTime() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(4, 0, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

/**
 * 执行数据备份（备份 sync/local 关键数据，清理超过7天的旧备份）
 * @returns {Promise<void>}
 */
async function performDailyBackup() {
  try {
    const syncKeys = ['works', 'currentWorkId', 'globalSettings'];
    const localKeys = ['fanqieLoggedIn', 'fanqieLoginTime', 'backupList'];
    const syncData = await storageSyncGet(syncKeys);
    const localData = await storageLocalGet(localKeys);

    // 读取已有备份列表
    const backupList = localData.backupList || [];
    const now = new Date();
    const backupId = 'backup_' + now.getTime();

    // 创建备份（只保留设置和作品数据，不保留临时状态）
    const backup = {
      id: backupId,
      timestamp: now.toISOString(),
      sync: {},
      local: {}
    };

    // 只备份关键数据
    const importantKeys = ['works', 'currentWorkId', 'globalSettings'];
    importantKeys.forEach(function(key) {
      if (syncData[key] !== undefined) backup.sync[key] = syncData[key];
    });

    const localImportantKeys = ['fanqieLoggedIn', 'fanqieLoginTime'];
    localImportantKeys.forEach(function(key) {
      if (localData[key] !== undefined) backup.local[key] = localData[key];
    });

    // 保存备份
    backupList.push(backupId);
    await chrome.storage.local.set({ ['bk_' + backupId]: backup, backupList: backupList });

    // 清理超过7天的旧备份
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const validBackups = backupList.filter(function(id) {
      return id > 'backup_' + sevenDaysAgo;
    });

    // 删除过期备份
    const toRemove = backupList.filter(function(id) {
      return id <= 'backup_' + sevenDaysAgo;
    });
    for (const id of toRemove) {
      await chrome.storage.local.remove('bk_' + id);
    }

    if (validBackups.length !== backupList.length) {
      await chrome.storage.local.set({ backupList: validBackups });
    }

    console.log('[Novel Publisher] 每日备份完成，当前备份数: ' + validBackups.length);
  } catch (err) {
    console.error('[Novel Publisher] 每日备份失败:', err);
  }
}

/**
 * 设置每日数据清理 Alarm（每天凌晨3点）
 */
async function setupDailyCleanup() {
  await chrome.alarms.create('dataCleanup', {
    when: getNextCleanupTime(),
    periodInMinutes: 24 * 60 // 每天重复
  });
  console.log('[Novel Publisher] 已设置每日数据清理任务');
}

/**
 * 计算下一次清理时间（凌晨3点）
 */
function getNextCleanupTime() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(3, 0, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

/**
 * 清理旧数据（超过保留天数的发布日志和已完成发布状态）
 * @returns {Promise<void>}
 */
async function cleanupOldData() {
  try {
    // 从 globalSettings 读取 logRetentionDays，默认 30 天
    const settings = await storageSyncGet(['globalSettings']);
    const globalSettings = settings.globalSettings || {};
    const retentionDays = globalSettings.logRetentionDays || 30;
    const cutoff = Date.now() - retentionDays * 86400000;
    let cleaned = 0;
    const updates = {};
    const removals = [];

    const localData = await storageLocalGet(['publishLog', 'publishState']);

    // 清理旧的发布日志（批量过滤）
    if (localData.publishLog && Array.isArray(localData.publishLog)) {
      const before = localData.publishLog.length;
      const filtered = localData.publishLog.filter(entry => {
        return !entry.timestamp || entry.timestamp > cutoff;
      });
      if (filtered.length !== before) {
        updates.publishLog = filtered;
        cleaned += before - filtered.length;
      }
    }

    // 清理旧的发布状态（已完成超过保留期的）
    if (localData.publishState) {
      const state = localData.publishState;
      if (state.completed && state.completedAt && state.completedAt < cutoff) {
        removals.push('publishState');
        cleaned++;
      }
    }

    // 批量写入更新
    if (Object.keys(updates).length > 0) {
      await chrome.storage.local.set(updates);
    }
    if (removals.length > 0) {
      await chrome.storage.local.remove(removals);
    }

    if (cleaned > 0) {
      console.log('[Novel Publisher] 数据清理完成，清理了 ' + cleaned + ' 条旧记录');
    } else {
      console.log('[Novel Publisher] 数据清理：无需清理');
    }
  } catch (err) {
    console.error('[Novel Publisher] 数据清理失败:', err);
  }
}

// 初始化：设置每日清理任务
setupDailyCleanup();

// 初始化：设置每日备份任务
setupDailyBackup();

// ============================================================
// 数据版本管理与迁移
// ============================================================

const CURRENT_SCHEMA_VERSION = 2;

/**
 * 检查并执行数据迁移
 * 在 service worker 启动时调用，确保存储结构与当前版本一致。
 * 迁移逻辑：
 *   v0→v1: 将 sync 中的明文 API 凭证迁移到加密存储，删除 sync 中的明文
 *   v1→v2: 确保 globalSettings 中包含 dryRunMode 字段
 */
async function runDataMigration() {
  try {
    const localData = await storageLocalGet(['schemaVersion']);
    const currentVersion = localData.schemaVersion || 0;

    if (currentVersion >= CURRENT_SCHEMA_VERSION) {
      console.log('[Novel Publisher] 数据版本已是最新: v' + currentVersion);
      return;
    }

    console.log('[Novel Publisher] 开始数据迁移: v' + currentVersion + ' → v' + CURRENT_SCHEMA_VERSION);

    // v0 → v1: 迁移明文 API 凭证到加密存储
    if (currentVersion < 1) {
      const syncData = await storageSyncGet(['tencentDocClientId', 'tencentDocAccessToken', 'tencentDocOpenId']);
      if (syncData.tencentDocClientId) {
        console.log('[Novel Publisher] 迁移: 发现明文 API 凭证，正在加密...');
        try {
          await saveApiConfigEncrypted(
            syncData.tencentDocClientId,
            syncData.tencentDocAccessToken || '',
            syncData.tencentDocOpenId || ''
          );
          // 删除 sync 中的明文
          await chrome.storage.sync.remove(['tencentDocClientId', 'tencentDocAccessToken', 'tencentDocOpenId']);
          console.log('[Novel Publisher] 迁移完成: API 凭证已加密');
        } catch (e) {
          console.error('[Novel Publisher] 迁移失败: API 凭证加密出错', e);
        }
      }
    }

    // v1 → v2: 确保 globalSettings 包含新字段
    if (currentVersion < 2) {
      const syncData = await storageSyncGet(['globalSettings']);
      const gs = syncData.globalSettings || {};
      let needsUpdate = false;
      if (gs.dryRunMode === undefined) { gs.dryRunMode = false; needsUpdate = true; }
      if (gs.confirmBeforePublish === undefined) { gs.confirmBeforePublish = false; needsUpdate = true; }
      if (gs.antiDetectionMode === undefined) { gs.antiDetectionMode = true; needsUpdate = true; }
      if (gs.logRetentionDays === undefined) { gs.logRetentionDays = 30; needsUpdate = true; }
      if (needsUpdate) {
        await storageSyncSet({ globalSettings: gs });
        console.log('[Novel Publisher] 迁移完成: globalSettings 补充新字段');
      }
    }

    // 更新版本号
    await storageLocalSet({ schemaVersion: CURRENT_SCHEMA_VERSION });
    console.log('[Novel Publisher] 数据迁移完成，当前版本: v' + CURRENT_SCHEMA_VERSION);
  } catch (err) {
    console.error('[Novel Publisher] 数据迁移异常:', err);
  }
}

// 初始化：执行数据迁移
runDataMigration();

// ============================================================
// 十、AI 辅助创作模块
// ============================================================

/**
 * 调用 AI 大模型 API（支持 DeepSeek、豆包、OpenAI 兼容接口）
 * @param {Object} config - AI 配置 {apiUrl, apiKey, model}
 * @param {Array<{role: string, content: string}>} messages - 消息列表
 * @returns {Promise<string>} AI 返回的文本内容
 * @throws {Error} API 配置缺失或请求失败时抛出异常
 */
async function callAiApi(config, messages) {
  const { apiUrl, apiKey, model } = config;

  if (!apiUrl || !apiKey || !model) {
    throw new Error('请先在设置中配置 AI API');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '未知错误');
    throw new Error('AI API 请求失败 (' + response.status + '): ' + errorText.slice(0, 200));
  }

  const data = await response.json();
  return data.choices && data.choices[0] && data.choices[0].message
    ? data.choices[0].message.content.trim()
    : '';
}

/**
 * 获取 AI 配置（从 chrome.storage.sync 读取 API URL、Key、Model）
 * @returns {Promise<{apiUrl: string, apiKey: string, model: string, provider: string}>} AI 配置对象
 */
async function getAiConfig() {
  const data = await storageSyncGet(['aiApiUrl', 'aiApiKey', 'aiModel', 'aiProvider']);
  return {
    apiUrl: data.aiApiUrl || '',
    apiKey: data.aiApiKey || '',
    model: data.aiModel || '',
    provider: data.aiProvider || 'custom'
  };
}

/**
 * 构建 AI 提示词
 */
function buildAiPrompt(type, context) {
  const prompts = {
    outline: [
      { role: 'system', content: '你是专业的小说编辑和大纲策划师。基于提供的章节内容，为下一章设计3个不同方向的大纲。每个大纲包括：方向名称、核心冲突、关键情节节点（3-5个）、预期字数。要求3个方向有显著差异化，不要只是换个说法。' },
      { role: 'user', content: '章节内容：\n' + context }
    ],
    continue: [
      { role: 'system', content: '你是一位专业的网络小说作家。请根据给定的章节内容续写后续内容。要求：1.保持风格一致 2.字数约500-800字 3.情节自然流畅 4.直接输出续写内容，不要加任何说明' },
      { role: 'user', content: '以下是当前章节的末尾内容：\n\n' + context }
    ],
    polish: [
      { role: 'system', content: '你是一位专业的小说编辑。请对给定的章节内容进行润色优化。要求：1.保持原意不变 2.优化文笔和表达 3.修正语法错误 4.提升可读性 5.直接输出润色后的内容，不要加任何说明' },
      { role: 'user', content: '以下是需要润色的内容：\n\n' + context }
    ],
    title: [
      { role: 'system', content: '你是一位专业的网络小说编辑。请根据给定的章节内容生成一个吸引人的章节标题。要求：1.标题简洁有力 2.符合网络小说风格 3.字数控制在2-15字 4.只输出一个标题，不要加任何说明或标点' },
      { role: 'user', content: '以下是章节内容：\n\n' + context }
    ]
  };
  return prompts[type] || prompts.continue;
}

/**
 * 处理 AI 生成请求（接收 popup 的生成请求，调用 AI API 返回结果）
 * @param {Object} request - 消息请求对象 {data: {type, content, system}}
 * @param {Function} safeSend - 安全发送响应的函数
 * @returns {Promise<void>}
 */
async function handleAiGenerate(request, safeSend) {
  try {
    const data = request.data || {};
    const { type, content, system: customSystem } = data;

    if (!type || !content) {
      safeSend({ success: false, error: '缺少必要参数' });
      return;
    }

    if (content.length < 10) {
      safeSend({ success: false, error: '内容太短，至少需要10个字符' });
      return;
    }

    const config = await getAiConfig();

    if (!config.apiUrl || !config.apiKey) {
      safeSend({ success: false, error: '请先在设置中配置 AI API（设置 → 全局设置 → AI 辅助创作）' });
      return;
    }

    // 使用popup传递的system prompt，如果没有则使用本地模板
    let messages;
    if (customSystem) {
      messages = [
        { role: 'system', content: customSystem },
        { role: 'user', content: content }
      ];
    } else {
      messages = buildAiPrompt(type, content);
    }

    const result = await callAiApi(config, messages);

    if (!result) {
      safeSend({ success: false, error: 'AI 未返回有效内容' });
      return;
    }

    safeSend({ success: true, result: result });
  } catch (err) {
    safeSend({ success: false, error: err.message });
  }
}

/**
 * 测试 AI 配置（发送测试消息验证 API 连接和密钥有效性）
 * @param {Object} request - 消息请求对象 {data: {apiUrl, apiKey, model, provider}}
 * @param {Function} safeSend - 安全发送响应的函数
 * @returns {Promise<void>}
 */
async function handleAiTestConfig(request, safeSend) {
  try {
    const data = request.data || {};
    let config;

    // 如果请求中直接传了配置参数，优先使用（options 页面测试时）
    if (data.apiUrl && data.apiKey) {
      config = {
        apiUrl: data.apiUrl,
        apiKey: data.apiKey,
        model: data.model || 'default',
        provider: data.provider || 'custom'
      };
    } else {
      config = await getAiConfig();
    }

    if (!config.apiUrl || !config.apiKey) {
      safeSend({ success: false, error: '请填写 API 地址和密钥' });
      return;
    }

    const testMessages = [
      { role: 'user', content: '请回复"连接成功"四个字' }
    ];

    const result = await callAiApi(config, testMessages);
    safeSend({
      success: true,
      result: result || '(空响应)',
      model: config.model,
      provider: config.provider
    });
  } catch (err) {
    safeSend({ success: false, error: err.message });
  }
}
