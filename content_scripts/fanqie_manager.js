/**
 * 番茄小说章节管理内容脚本
 * 检测已发布章节、管理分卷、翻页读取
 *
 * 功能：
 * 1. 翻页支持：自动翻页读取所有章节
 * 2. 分卷切换：自动切换分卷读取各卷章节
 * 3. 更精确的状态检测：区分"已发布"/"草稿"/"审核中"
 */

(function() {
  'use strict';

  // ============================================================
  // 一、常量定义
  // ============================================================

  // 章节状态关键词
  const STATUS_KEYWORDS = {
    published: ['已发布', '发布成功', '已发', '上线'],
    draft: ['草稿', '未发布', '待发布'],
    reviewing: ['审核中', '审核', '待审核', '审核中...'],
    rejected: ['审核驳回', '驳回', '未通过']
  };

  // 章节行选择器（多备选）
  const CHAPTER_ROW_SELECTORS = [
    'tr',
    'li',
    '.chapter-item',
    '.chapter-row',
    '[class*="chapter"]',
    '[class*="item"]',
    '[class*="row"]'
  ];

  // 翻页按钮关键词
  const NEXT_PAGE_KEYWORDS = ['下一页', '下页', '>', '»', 'Next'];

  // 分卷标签选择器
  const VOLUME_TAB_SELECTORS = [
    '[class*="volume"]',
    '[class*="tab"]',
    '[class*="folder"]',
    '[class*="group"]',
    '[role="tab"]',
    '[role="tablist"] > *'
  ];

  // ============================================================
  // 二、工具函数
  // ============================================================

  /**
   * 延时工具
   * @param {number} ms
   * @returns {Promise<void>}
   */
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 检查元素是否可见
   * @param {Element} el
   * @returns {boolean}
   */
  function isVisible(el) {
    if (!el) return false;
    try {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' &&
             style.visibility !== 'hidden' &&
             style.opacity !== '0' &&
             el.offsetWidth > 0 &&
             el.offsetHeight > 0;
    } catch (_e) {
      return false;
    }
  }

  /**
   * 查找包含指定文本的可见元素
   * @param {string} text - 文本（部分匹配）
   * @param {string} tagName - 标签名
   * @returns {Element|null}
   */
  function findElementByText(text, tagName = 'button') {
    const elements = Array.from(document.querySelectorAll(tagName));
    return elements.find(el => {
      const elText = (el.textContent || '').trim();
      return elText.includes(text) && isVisible(el);
    }) || null;
  }

  /**
   * 安全点击
   * @param {Element} element
   * @returns {Promise<boolean>}
   */
  async function safeClick(element) {
    if (!element) return false;
    try {
      element.click();
      await delay(100);
      return true;
    } catch (_e) {
      try {
        const event = new MouseEvent('click', {
          bubbles: true, cancelable: true, view: window
        });
        element.dispatchEvent(event);
        await delay(100);
        return true;
      } catch (_e2) {
        return false;
      }
    }
  }

  // ============================================================
  // 三、章节状态检测
  // ============================================================

  /**
   * 判断章节的发布状态
   * @param {string} text - 章节行文本
   * @returns {string} 'published' | 'draft' | 'reviewing' | 'rejected' | 'unknown'
   */
  function detectChapterStatus(text) {
    if (!text) return 'unknown';

    // 按优先级检测
    for (const [status, keywords] of Object.entries(STATUS_KEYWORDS)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return status;
        }
      }
    }

    return 'unknown';
  }

  /**
   * 从文本中提取章节号
   * @param {string} text
   * @returns {number|null}
   */
  function extractChapterNumber(text) {
    if (!text) return null;
    const match = text.match(/第\s*(\d+)\s*章/);
    if (match) return parseInt(match[1], 10);
    // 也尝试纯数字模式
    const numMatch = text.match(/(\d{1,5})\s*[.、\s]/);
    if (numMatch) return parseInt(numMatch[1], 10);
    return null;
  }

  /**
   * 从文本中提取章节标题
   * @param {string} text
   * @returns {string}
   */
  function extractChapterTitle(text) {
    if (!text) return '';
    // 尝试匹配"第X章 标题"格式
    const match = text.match(/第\s*\d+\s*章[：:\s]*(.+)/);
    if (match) return match[1].trim().substring(0, 50); // 限制长度
    return text.trim().substring(0, 50);
  }

  /**
   * 从文本中提取发布日期
   * @param {string} text
   * @returns {string|null}
   */
  function extractPublishDate(text) {
    if (!text) return null;
    const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})\s*\d{2}:\d{2}/);
    if (dateMatch) return dateMatch[1];
    // 也尝试 "YYYY/MM/DD" 格式
    const dateMatch2 = text.match(/(\d{4}\/\d{2}\/\d{2})/);
    if (dateMatch2) return dateMatch2[1].replace(/\//g, '-');
    return null;
  }

  /**
   * 从文本中提取字数
   * @param {string} text
   * @returns {number|null}
   */
  function extractWordCount(text) {
    if (!text) return null;
    const match = text.match(/(\d+)\s*字/);
    if (match) return parseInt(match[1], 10);
    return null;
  }

  // ============================================================
  // 四、章节检测
  // ============================================================

  /**
   * 检测当前页面的章节列表
   * @returns {Array<Object>}
   */
  function detectChaptersOnCurrentPage() {
    const chapters = [];

    for (const selector of CHAPTER_ROW_SELECTORS) {
      try {
        const rows = document.querySelectorAll(selector);
        if (rows.length === 0) continue;

        for (const row of rows) {
          const text = row.innerText || '';
          const chapterNum = extractChapterNumber(text);
          if (!chapterNum) continue; // 不是章节行

          const status = detectChapterStatus(text);
          const title = extractChapterTitle(text);
          const publishDate = extractPublishDate(text);
          const wordCount = extractWordCount(text);

          chapters.push({
            index: chapterNum,
            title,
            status,
            publishDate,
            wordCount,
            rawText: text.substring(0, 200) // 保留原始文本片段用于调试
          });
        }

        // 如果找到了章节，就不再尝试其他选择器
        if (chapters.length > 0) break;
      } catch (_e) {
        // 选择器可能无效，继续尝试下一个
      }
    }

    return chapters;
  }

  /**
   * 检测已发布章节（兼容旧接口）
   * @returns {Object}
   */
  async function detectPublishedChapters() {
    const allChapters = await detectAllChapters();

    const published = [];
    const drafts = [];
    const reviewing = [];
    const rejected = [];
    const publishDates = {};

    for (const ch of allChapters) {
      switch (ch.status) {
        case 'published':
          published.push(ch.index);
          if (ch.publishDate) publishDates[ch.index] = ch.publishDate;
          break;
        case 'draft':
          drafts.push(ch.index);
          break;
        case 'reviewing':
          reviewing.push(ch.index);
          break;
        case 'rejected':
          rejected.push(ch.index);
          break;
      }
    }

    return {
      published: published.sort((a, b) => a - b),
      drafts: drafts.sort((a, b) => a - b),
      reviewing: reviewing.sort((a, b) => a - b),
      rejected: rejected.sort((a, b) => a - b),
      publishDates,
      unpublished: [...drafts, ...rejected].sort((a, b) => a - b),
      allChapters
    };
  }

  // ============================================================
  // 五、翻页支持
  // ============================================================

  /**
   * 查找"下一页"按钮
   * @returns {Element|null}
   */
  function findNextPageButton() {
    // 方式 1：通过关键词查找按钮
    for (const keyword of NEXT_PAGE_KEYWORDS) {
      const btn = findElementByText(keyword, 'button');
      if (btn) return btn;

      const link = findElementByText(keyword, 'a');
      if (link) return link;

      // 也检查 span 等元素
      const span = findElementByText(keyword, 'span');
      if (span) {
        // 检查是否在可点击的父元素中
        const parent = span.closest('button, a, [role="button"], [class*="page"]');
        if (parent) return parent;
        return span;
      }
    }

    // 方式 2：通过分页组件查找
    const paginationSelectors = [
      '[class*="pagination"] [class*="next"]',
      '[class*="pager"] [class*="next"]',
      '[class*="page"] [class*="next"]',
      'li[class*="next"]',
      'a[class*="next"]',
      'button[class*="next"]'
    ];

    for (const selector of paginationSelectors) {
      try {
        const el = document.querySelector(selector);
        if (el && isVisible(el)) return el;
      } catch (_e) {
        // 无效选择器
      }
    }
    return null;
  }

  /**
   * 检查是否有下一页
   * @returns {boolean}
   */
  function hasNextPage() {
    return findNextPageButton() !== null;
  }

  /**
   * 翻到下一页
   * @returns {Promise<boolean>}
   */
  async function goToNextPage() {
    const btn = findNextPageButton();
    if (!btn) return false;

    // 检查按钮是否被禁用
    if (btn.disabled || btn.classList.contains('disabled') ||
        btn.classList.contains('is-disabled') ||
        btn.getAttribute('aria-disabled') === 'true') {
      return false;
    }

    await safeClick(btn);
    await delay(2000); // 等待页面加载
    return true;
  }

  /**
   * 检测所有章节（自动翻页）
   * @param {number} maxPages - 最大翻页数，默认 50
   * @returns {Promise<Array<Object>>}
   */
  async function detectAllChapters(maxPages = 50) {
    const allChapters = [];
    const seenIndices = new Set(); // 防止重复
    let pageCount = 0;

    while (pageCount < maxPages) {
      pageCount++;

      // 检测当前页的章节
      const pageChapters = detectChaptersOnCurrentPage();

      // 去重并添加
      let newCount = 0;
      for (const ch of pageChapters) {
        if (!seenIndices.has(ch.index)) {
          seenIndices.add(ch.index);
          allChapters.push(ch);
          newCount++;
        }
      }

      console.log(`[Novel Publisher] 第 ${pageCount} 页：检测到 ${pageChapters.length} 章（新增 ${newCount} 章）`);

      // 如果当前页没有章节，或者没有新章节，停止翻页
      if (pageChapters.length === 0 || newCount === 0) {
        break;
      }

      // 尝试翻到下一页
      if (!hasNextPage()) {
        break;
      }

      const success = await goToNextPage();
      if (!success) {
        break;
      }
    }

    // 按章节号排序
    allChapters.sort((a, b) => a.index - b.index);

    console.log(`[Novel Publisher] 共检测到 ${allChapters.length} 章（翻 ${pageCount} 页）`);
    return allChapters;
  }

  // ============================================================
  // 六、分卷管理
  // ============================================================

  /**
   * 获取所有分卷标签
   * @returns {Array<{element: Element, name: string, number: string}>}
   */
  function getVolumeTabs() {
    const volumes = [];

    // 方式 1：通过选择器查找分卷标签
    for (const selector of VOLUME_TAB_SELECTORS) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          const text = (el.textContent || '').trim();
          const match = text.match(/第([一二三四五六七八九十\d]+)卷[：:]*\s*(.*)/);
          if (match && isVisible(el)) {
            volumes.push({
              element: el,
              name: match[2].trim() || `第${match[1]}卷`,
              number: match[1],
              fullText: text
            });
          }
        }
        if (volumes.length > 0) break;
      } catch (_e) {
        // 无效选择器
      }
    }

    // 方式 2：全局搜索包含分卷关键词的元素
    if (volumes.length === 0) {
      const allElements = Array.from(document.querySelectorAll('*'));
      for (const el of allElements) {
        // 只检查直接文本节点（避免匹配到父元素）
        const directText = Array.from(el.childNodes)
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent)
          .join('');

        if (!directText) continue;

        const match = directText.match(/第([一二三四五六七八九十\d]+)卷[：:]*\s*(.*)/);
        if (match && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0) {
          // 检查是否已经添加过（避免重复）
          const exists = volumes.some(v => v.element === el);
          if (!exists) {
            volumes.push({
              element: el,
              name: match[2].trim() || `第${match[1]}卷`,
              number: match[1],
              fullText: directText.trim()
            });
          }
        }
      }
    }

    return volumes;
  }

  /**
   * 获取所有分卷信息
   * @returns {Array<Object>}
   */
  async function getVolumes() {
    const tabs = getVolumeTabs();
    return tabs.map(t => ({
      number: t.number,
      name: t.name,
      fullText: t.fullText
    }));
  }

  /**
   * 切换到指定分卷
   * @param {string} volumeName - 分卷名称
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function switchToVolume(volumeName) {
    try {
      const tabs = getVolumeTabs();

      if (tabs.length === 0) {
        return { success: false, error: '未找到分卷标签' };
      }

      // 查找目标分卷
      let targetTab = null;

      // 按名称匹配
      targetTab = tabs.find(t =>
        t.name === volumeName ||
        t.name.includes(volumeName) ||
        volumeName.includes(t.name)
      );

      // 按完整文本匹配
      if (!targetTab) {
        targetTab = tabs.find(t => t.fullText.includes(volumeName));
      }

      // 按《名称》格式匹配
      if (!targetTab) {
        const bookName = volumeName.startsWith('《') ? volumeName : `《${volumeName}》`;
        targetTab = tabs.find(t => t.fullText.includes(bookName));
      }

      if (!targetTab) {
        return { success: false, error: `未找到分卷"${volumeName}"` };
      }

      // 点击切换
      await safeClick(targetTab.element);
      await delay(2000); // 等待内容加载

      console.log(`[Novel Publisher] 已切换到分卷: ${targetTab.fullText}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取所有分卷的章节（自动切换分卷）
   * @returns {Promise<Array<{volumeName: string, chapters: Array}>>}
   */
  async function getAllVolumeChapters() {
    const tabs = getVolumeTabs();
    const result = [];

    if (tabs.length === 0) {
      // 没有分卷，直接读取当前页
      const chapters = await detectAllChapters();
      result.push({
        volumeName: '默认',
        volumeNumber: '',
        chapters
      });
      return result;
    }

    for (const tab of tabs) {
      // 切换到分卷
      await safeClick(tab.element);
      await delay(2000);

      // 读取该分卷的章节
      const chapters = await detectAllChapters();

      result.push({
        volumeName: tab.name,
        volumeNumber: tab.number,
        chapters
      });

      console.log(`[Novel Publisher] 分卷"${tab.name}"：${chapters.length} 章`);
    }

    return result;
  }

  // ============================================================
  // 七、分卷创建
  // ============================================================

  /**
   * 创建新分卷
   * @param {string} volumeName - 分卷名称
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function createVolume(volumeName) {
    try {
      // 点击"编辑分卷"按钮
      const editBtnTexts = ['编辑分卷', '管理分卷', '分卷管理'];
      let editBtn = null;

      for (const text of editBtnTexts) {
        editBtn = findElementByText(text, 'button') ||
                  findElementByText(text, 'a') ||
                  findElementByText(text, 'span');
        if (editBtn) break;
      }

      if (!editBtn) {
        return { success: false, error: '未找到"编辑分卷"按钮' };
      }

      await safeClick(editBtn);
      await delay(2000);

      // 点击"新建分卷"按钮
      const newTexts = ['新建分卷', '+ 新建分卷', '添加分卷', '+ 添加分卷', '新建'];
      let newBtn = null;

      for (const text of newTexts) {
        newBtn = findElementByText(text, 'button') ||
                 findElementByText(text, 'a') ||
                 findElementByText(text, 'span');
        if (newBtn) break;
      }

      if (!newBtn) {
        return { success: false, error: '未找到"新建分卷"按钮' };
      }

      await safeClick(newBtn);
      await delay(2000);

      // 填写分卷名称
      const nameInput = document.querySelector('input[placeholder*="分卷"]') ||
                        document.querySelector('input[placeholder*="名称"]') ||
                        document.querySelector('input[type="text"]');

      if (!nameInput) {
        return { success: false, error: '未找到分卷名称输入框' };
      }

      const displayName = volumeName.startsWith('《') ? volumeName : `《${volumeName}》`;

      // React 兼容的值设置
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set;

      if (nativeSetter) {
        nativeSetter.call(nameInput, displayName);
      } else {
        nameInput.value = displayName;
      }

      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      await delay(500);

      // 点击确认按钮（查找输入框附近的确认按钮）
      const confirmBtn = findElementByText('确定', 'button') ||
                         findElementByText('确认', 'button');

      if (confirmBtn) {
        await safeClick(confirmBtn);
        await delay(1000);
      }

      // 再次点击确定（关闭分卷管理弹窗）
      const closeBtn = findElementByText('确定', 'button') ||
                       findElementByText('完成', 'button') ||
                       findElementByText('关闭', 'button');

      if (closeBtn) {
        await safeClick(closeBtn);
        await delay(2000);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ============================================================
  // 八、章节操作
  // ============================================================

  /**
   * 点击"新建章节"按钮
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function clickNewChapter() {
    const btnTexts = ['新建章节', '+ 新建章节', '新建', '+ 新建'];

    for (const text of btnTexts) {
      const btn = findElementByText(text, 'button');
      if (btn) {
        await safeClick(btn);
        await delay(3000);
        return { success: true };
      }
    }

    return { success: false, error: '未找到"新建章节"按钮' };
  }

  /**
   * 获取作品 ID
   * @returns {string|null}
   */
  function getBookId() {
    // 从 URL 提取
    const match = window.location.href.match(/chapter-manage\/(\d+)/);
    if (match) return match[1];

    // 也尝试其他 URL 格式
    const match2 = window.location.href.match(/writer\/(\d+)/);
    if (match2) return match2[1];

    return null;
  }

  // ============================================================
  // 九、消息处理
  // ============================================================

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    /**
     * 检测已发布章节（兼容旧接口）
     */
    if (request.action === 'detectPublishedChapters') {
      (async () => {
        try {
          const result = await detectPublishedChapters();
          sendResponse({ success: true, data: result });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true;
    }

    /**
     * 检测当前页章节
     */
    if (request.action === 'detectCurrentPageChapters') {
      try {
        const chapters = detectChaptersOnCurrentPage();
        sendResponse({ success: true, data: chapters });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }

    /**
     * 检测所有章节（自动翻页）
     */
    if (request.action === 'detectAllChapters') {
      (async () => {
        try {
          const chapters = await detectAllChapters(request.maxPages || 50);
          sendResponse({ success: true, data: chapters });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true;
    }

    /**
     * 获取分卷列表
     */
    if (request.action === 'getVolumes') {
      (async () => {
        try {
          const result = await getVolumes();
          sendResponse({ success: true, data: result });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true;
    }

    /**
     * 切换分卷
     */
    if (request.action === 'switchToVolume') {
      (async () => {
        try {
          const result = await switchToVolume(request.volumeName);
          sendResponse(result);
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true;
    }

    /**
     * 获取所有分卷的章节
     */
    if (request.action === 'getAllVolumeChapters') {
      (async () => {
        try {
          const result = await getAllVolumeChapters();
          sendResponse({ success: true, data: result });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true;
    }

    /**
     * 创建新分卷
     */
    if (request.action === 'createVolume') {
      (async () => {
        try {
          const result = await createVolume(request.volumeName);
          sendResponse(result);
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true;
    }

    /**
     * 点击新建章节
     */
    if (request.action === 'clickNewChapter') {
      (async () => {
        try {
          const result = await clickNewChapter();
          sendResponse(result);
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true;
    }

    /**
     * 获取管理页状态
     */
    if (request.action === 'getManagerStatus') {
      try {
        const url = window.location.href;
        const isManager = url.includes('/chapter-manage/') ||
                          url.includes('/writer/');

        sendResponse({
          success: true,
          data: {
            url,
            isManager,
            bookId: getBookId(),
            hasVolumes: getVolumeTabs().length > 0,
            volumeCount: getVolumeTabs().length
          }
        });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }

    /**
     * 翻到下一页
     */
    if (request.action === 'goToNextPage') {
      (async () => {
        try {
          const success = await goToNextPage();
          sendResponse({ success, data: { hasNextPage: hasNextPage() } });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true;
    }
  });

  // ============================================================
  // 十、初始化
  // ============================================================

  // 通知 background 内容脚本已就绪
  chrome.runtime.sendMessage({
    action: 'contentScriptReady',
    url: window.location.href,
    platform: 'fanqie_manager'
  }).catch(() => {
    // background 可能未就绪，忽略
  });

  console.log('[Novel Publisher] 番茄章节管理内容脚本已加载');
})();
