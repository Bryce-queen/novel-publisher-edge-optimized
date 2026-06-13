/**
 * 腾讯文档内容脚本
 * 从腾讯文档中提取小说章节内容
 *
 * 功能：
 * 1. 滚动加载支持：自动滚动到底部触发懒加载
 * 2. 多策略内容提取：取最长结果
 * 3. 提取进度通知：实时反馈给 background
 */

(function() {
  'use strict';

  // ============================================================
  // 一、工具函数
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
   * 发送进度消息给 background
   * @param {string} status - 状态：scrolling | extracting | done | error
   * @param {Object} data - 附加数据
   */
  function sendProgress(status, data = {}) {
    try {
      chrome.runtime.sendMessage({
        action: 'extractProgress',
        status,
        ...data
      }).catch(() => {
        // background 可能未就绪，忽略
      });
    } catch (_e) {
      // 忽略发送失败
    }
  }

  /**
   * 延时工具
   * @param {number} ms
   * @returns {Promise<void>}
   */
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================
  // 二、滚动加载支持
  // ============================================================

  /**
   * 自动滚动到文档底部，触发腾讯文档的懒加载
   * 每次滚动一屏，等待内容加载后再继续
   * @param {number} maxScrollTime - 最大滚动时间（毫秒），默认 30 秒
   * @returns {Promise<{scrolled: boolean, scrollCount: number}>}
   */
  async function scrollToLoadAll(maxScrollTime = 30000) {
    sendProgress('scrolling', { message: '正在滚动加载文档内容...' });

    // 先检查是否有虚拟滚动容器
    const scrollContainers = [
      document.querySelector('.doc-content'),
      document.querySelector('[class*="scroll-container"]'),
      document.querySelector('[class*="virtual-scroll"]'),
      document.querySelector('[class*="editor-container"]'),
      document.querySelector('.web-office-viewer-container'),
      document.documentElement
    ].filter(Boolean);

    const container = scrollContainers[0] || document.documentElement;
    const isWindow = container === document.documentElement;

    const startTime = Date.now();
    let scrollCount = 0;
    let lastScrollHeight = 0;
    let stableCount = 0; // 连续未变化的次数

    const getScrollHeight = () => isWindow
      ? (document.documentElement.scrollHeight || document.body.scrollHeight)
      : container.scrollHeight;
    const getClientHeight = () => isWindow
      ? (document.documentElement.clientHeight || document.body.clientHeight)
      : container.clientHeight;
    const getScrollTop = () => isWindow
      ? (window.scrollY || document.documentElement.scrollTop)
      : container.scrollTop;
    const scrollBy = (amount) => {
      if (isWindow) {
        window.scrollBy(0, amount);
      } else {
        container.scrollTop += amount;
      }
    };

    while (Date.now() - startTime < maxScrollTime) {
      // 获取当前滚动高度
      const scrollHeight = getScrollHeight();
      const clientHeight = getClientHeight();
      const scrollTop = getScrollTop();

      // 检查是否已经到底
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        // 已经在底部，等待一下看是否有新内容加载
        await delay(1500);

        const newScrollHeight = getScrollHeight();
        if (newScrollHeight === lastScrollHeight) {
          stableCount++;
          // 连续 3 次没有新内容，认为已全部加载
          if (stableCount >= 3) {
            console.log(`[Novel Publisher] 滚动加载完成，共滚动 ${scrollCount} 次`);
            sendProgress('scrolling', {
              message: `滚动加载完成，共滚动 ${scrollCount} 次`,
              scrollCount
            });
            return { scrolled: true, scrollCount };
          }
        } else {
          stableCount = 0;
        }
        lastScrollHeight = newScrollHeight;
        continue;
      }

      // 向下滚动一屏
      scrollBy(clientHeight);
      scrollCount++;

      // 滚动后等待内容加载
      await delay(800);

      lastScrollHeight = getScrollHeight();
      stableCount = 0;

      // 每滚动 5 次通知一次进度
      if (scrollCount % 5 === 0) {
        sendProgress('scrolling', {
          message: `正在滚动加载... (${scrollCount} 次)`,
          scrollCount
        });
      }
    }

    console.log(`[Novel Publisher] 滚动超时，共滚动 ${scrollCount} 次`);
    sendProgress('scrolling', {
      message: `滚动超时，共滚动 ${scrollCount} 次`,
      scrollCount,
      timeout: true
    });
    return { scrolled: true, scrollCount };
  }

  /**
   * 检测文档是否使用了懒加载
   * 通过观察滚动高度变化来判断
   * @returns {Promise<boolean>}
   */
  async function hasLazyLoading() {
    const scrollHeight1 = document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;

    // 如果内容不足以滚动，则不需要懒加载
    if (scrollHeight1 <= clientHeight * 1.5) {
      return false;
    }

    // 滚动一屏后检查高度变化
    window.scrollBy(0, clientHeight);
    await delay(1000);

    const scrollHeight2 = document.documentElement.scrollHeight || document.body.scrollHeight;
    // 滚回顶部
    window.scrollTo(0, 0);
    await delay(500);

    // 如果高度变化超过 100px，说明有懒加载
    return Math.abs(scrollHeight2 - scrollHeight1) > 100;
  }

  // ============================================================
  // 三、内容提取策略（多策略，取最长结果）
  // ============================================================

  /**
   * 策略 1：从 contenteditable 元素的 innerText 提取
   * 优先级最高，通常能获取完整格式化文本
   * @returns {Promise<string>}
   */
  async function extractFromContentEditable() {
    const editors = document.querySelectorAll('[contenteditable="true"]');
    if (editors.length === 0) return '';

    let content = '';
    for (const editor of editors) {
      const text = editor.innerText || '';
      if (text.length > content.length) {
        content = text;
      }
    }

    return content;
  }

  /**
   * 策略 2：通过 Ctrl+A 全选 + getSelection() 提取
   * 适用于某些编辑器 innerText 不完整的情况
   * @returns {Promise<string>}
   */
  async function extractFromSelection() {
    const editable = document.querySelector('[contenteditable]');
    if (!editable) return '';

    try {
      // 聚焦编辑器
      editable.focus();
      editable.click();
      await delay(500);

      // 全选
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editable);
      selection.removeAllRanges();
      selection.addRange(range);
      await delay(500);

      // 获取选中文本
      const text = selection.toString();

      // 清除选区
      selection.removeAllRanges();

      return text || '';
    } catch (e) {
      console.log('[Novel Publisher] 选区提取失败:', e.message);
      return '';
    }
  }

  /**
   * 策略 3：从剪贴板读取
   * 需要先执行 Ctrl+C，然后读取剪贴板
   * @returns {Promise<string>}
   */
  async function extractFromClipboard() {
    try {
      // 尝试直接读取剪贴板（用户可能已复制）
      const text = await navigator.clipboard.readText();
      return text || '';
    } catch (_e) {
      // 剪贴板权限不足或无内容
      return '';
    }
  }

  /**
   * 策略 4：从 document.body.innerText 智能过滤提取
   * 优先查找主内容区域，找不到则过滤 UI 文本
   * @returns {Promise<string>}
   */
  async function extractFromBodyFiltered() {
    const rawText = document.body.innerText || '';
    if (!rawText || rawText.length < 100) return '';

    // 尝试只获取主内容区域
    const contentSelectors = [
      '.doc-content', '.editor-area', '.content-area',
      '[class*="doc-content"]', '[class*="editor"]',
      '[class*="content-body"]', '[class*="main-content"]',
      '.ProseMirror', '[contenteditable="true"]',
      '#app-container .doc-body',
      '.web-office-viewer-container'
    ];

    for (const selector of contentSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        const text = el.innerText || '';
        if (text.length > 500) {
          return text;
        }
      }
    }

    // 如果找不到主内容区域，用 body.innerText 但过滤 UI 文本
    // 按行分割，过滤掉短行和已知的 UI 文本模式
    const lines = rawText.split('\n');
    const uiPatterns = [
      /^腾讯文档$/, /^所有编辑内容都会自动保存/, /^在线文档$/,
      /^插入$/, /^格式$/, /^表格$/, /^工具$/, /^视图$/,
      /^文件$/, /^编辑$/, /^帮助$/,
      /^\d+人正在编辑/, /^最近编辑/,
      /^大纲$/, /^目录$/, /^评论$/, /^历史版本$/,
      /^[+-]\s*$/, // 工具栏按钮文本
    ];

    const filteredLines = lines.filter(line => {
      const trimmed = line.trim();
      if (trimmed.length === 0) return false;
      if (trimmed.length < 3) return false; // 过滤极短行
      for (const pattern of uiPatterns) {
        if (pattern.test(trimmed)) return false;
      }
      return true;
    });

    return filteredLines.join('\n');
  }

  /**
   * 策略 5：从 document.body.innerText 提取（原始兜底）
   * 最后的兜底方案，可能包含页面 UI 文本
   * @returns {Promise<string>}
   */
  async function extractFromBody() {
    return document.body.innerText || '';
  }

  /**
   * 使用所有策略提取内容，取最长结果
   * 每个策略独立执行，互不影响
   * @returns {Promise<{content: string, strategy: string}>}
   */
  async function extractContent() {
    sendProgress('extracting', { message: '正在提取文档内容...' });

    const strategies = [
      { name: 'body_filtered', fn: extractFromBodyFiltered },
      { name: 'contenteditable', fn: extractFromContentEditable },
      { name: 'selection', fn: extractFromSelection },
      { name: 'clipboard', fn: extractFromClipboard },
      { name: 'body_raw', fn: extractFromBody }
    ];

    let bestContent = '';
    let bestStrategy = '';

    for (const strategy of strategies) {
      try {
        const content = await strategy.fn();
        const cleaned = cleanControlChars(content);

        sendProgress('extracting', {
          message: `尝试 ${strategy.name} 策略：获取 ${cleaned.length} 字符`,
          strategy: strategy.name,
          length: cleaned.length
        });

        if (cleaned.length > bestContent.length) {
          bestContent = cleaned;
          bestStrategy = strategy.name;
        }

        // 如果已经获取到足够长的内容，可以提前结束
        if (bestContent.length > 10000) {
          console.log(`[Novel Publisher] 使用 ${bestStrategy} 策略，获取 ${bestContent.length} 字符`);
          break;
        }
      } catch (e) {
        console.log(`[Novel Publisher] ${strategy.name} 策略失败:`, e.message);
      }
    }

    console.log(`[Novel Publisher] 最佳策略: ${bestStrategy}，内容长度: ${bestContent.length}`);
    sendProgress('extracting', {
      message: `提取完成，使用 ${bestStrategy} 策略，共 ${bestContent.length} 字符`,
      strategy: bestStrategy,
      length: bestContent.length
    });

    return { content: bestContent, strategy: bestStrategy };
  }

  // ============================================================
  // 四、文档信息获取
  // ============================================================

  /**
   * 获取文档标题
   * @returns {string}
   */
  function getDocumentTitle() {
    // 尝试多种选择器获取标题
    const titleSelectors = [
      'h1',
      '.doc-title',
      '[class*="title"]',
      '[class*="doc-title"]',
      '[data-testid*="title"]'
    ];

    for (const selector of titleSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        return el.textContent.trim();
      }
    }

    // 兜底：从页面 title 提取
    return document.title.replace(/\s*[-–—|]\s*腾讯文档.*$/, '').trim();
  }

  /**
   * 获取文档 URL
   * @returns {string}
   */
  function getDocumentUrl() {
    return window.location.href;
  }

  /**
   * 从 URL 中提取文件 ID
   * @param {string} url
   * @returns {string}
   */
  function extractFileId(url) {
    if (!url) return '';
    const match = url.match(/docs\.qq\.com\/doc\/([A-Za-z0-9]+)/);
    if (match) return match[1];
    if (/^[A-Za-z0-9]{10,}$/.test(url)) return url;
    return '';
  }

  // ============================================================
  // 五、消息处理
  // ============================================================

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    /**
     * 处理提取章节请求
     * 完整流程：滚动加载 -> 内容提取 -> 返回结果
     */
    if (request.action === 'extractChapters') {
      (async () => {
        try {
          // 1. 检测并执行滚动加载
          const lazy = await hasLazyLoading();
          if (lazy) {
            const scrollResult = await scrollToLoadAll(30000);
            console.log(`[Novel Publisher] 滚动加载结果:`, scrollResult);
          }

          // 2. 提取内容
          const { content, strategy } = await extractContent();

          if (!content || content.length < 100) {
            sendResponse({
              success: false,
              error: '文档内容过短，请确认文档已完全加载。建议在文档页面按 Ctrl+A 全选后 Ctrl+C 复制。',
              strategy
            });
            return;
          }

          // 3. 检查是否包含章节标题
          const chapterPattern = /第[零一二三四五六七八九十百千万\d]+章/;
          if (!chapterPattern.test(content)) {
            sendResponse({
              success: false,
              error: '未检测到章节标题（第X章格式），请确认文档内容正确',
              strategy
            });
            return;
          }

          // 4. 返回原始内容和文档信息
          // 注意：章节解析在 background.js 中进行，这里只负责提取
          sendProgress('done', {
            message: `提取完成，共 ${content.length} 字符`,
            length: content.length,
            strategy
          });

          sendResponse({
            success: true,
            data: {
              title: getDocumentTitle(),
              url: getDocumentUrl(),
              fileId: extractFileId(getDocumentUrl()),
              volumeName: '',
              contentLength: content.length,
              content: content, // 原始文本，由 background 解析章节
              strategy
            }
          });
        } catch (error) {
          console.error('[Novel Publisher] 提取失败:', error);
          sendProgress('error', { message: error.message });
          sendResponse({
            success: false,
            error: error.message || '提取过程中发生未知错误'
          });
        }
      })();
      return true; // 保持消息通道开放（异步响应）
    }

    /**
     * 获取文档基本信息（不提取内容）
     */
    if (request.action === 'getDocInfo') {
      try {
        sendResponse({
          success: true,
          data: {
            title: getDocumentTitle(),
            url: getDocumentUrl(),
            fileId: extractFileId(getDocumentUrl()),
            volumeName: ''
          }
        });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }

    /**
     * 仅执行滚动加载（不提取内容）
     */
    if (request.action === 'scrollToLoad') {
      (async () => {
        try {
          const result = await scrollToLoadAll(request.maxTime || 30000);
          sendResponse({ success: true, data: result });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true;
    }
  });

  // ============================================================
  // 六、初始化
  // ============================================================

  // 通知 background 内容脚本已就绪
  chrome.runtime.sendMessage({
    action: 'contentScriptReady',
    url: window.location.href,
    platform: 'tencent_doc'
  }).catch(() => {
    // background 可能未就绪，忽略
  });

  console.log('[Novel Publisher] 腾讯文档内容脚本已加载');
})();
