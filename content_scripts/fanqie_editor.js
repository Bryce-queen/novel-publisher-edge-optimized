/**
 * 番茄小说编辑器内容脚本
 * 处理番茄小说平台的章节发布
 *
 * 功能：
 * 1. 更可靠的选择器（多备选）
 * 2. 发布状态检测（多种成功/失败判断条件）
 * 3. 弹窗处理增强（内容检测、错别字、风险检测、新手引导、发布设置）
 * 4. 超时处理（单章 120 秒）
 * 5. 错误恢复（发布失败后返回章节管理页）
 */

(function() {
  'use strict';

  // Firefox 兼容：MV2 不支持 exclude_matches，在此手动检查
  if (window.location.href.includes('/chapter-manage')) {
    console.log('[Novel Publisher] 当前在章节管理页面，跳过编辑器脚本');
    return; // 退出 IIFE，不注册任何消息监听器
  }

  // 反检测模式开关（由 background 通过 config.antiDetectionMode 传入）
  var _antiDetectionMode = true;

  // ============================================================
  // 一、DOM 选择器（从 FanqieAdapter 平台适配层加载）
  // ============================================================

  // 发布频率限制器
  const PublishRateLimiter = {
    minInterval: 8000,       // 两次操作最小间隔 8 秒
    maxOpsPerMinute: 4,      // 每分钟最多 4 次操作
    lastOpTime: 0,
    opsInMinute: [],

    async wait() {
      const now = Date.now();

      // 清理1分钟前的记录
      this.opsInMinute = this.opsInMinute.filter(t => now - t < 60000);

      // 如果1分钟内操作过多，等待
      if (this.opsInMinute.length >= this.maxOpsPerMinute) {
        const oldestInMinute = this.opsInMinute[0];
        const waitTime = 60000 - (now - oldestInMinute) + 1000;
        console.log('[Fanqie Editor] 频率限制：等待 ' + Math.round(waitTime) + 'ms');
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      // 确保两次操作之间有最小间隔
      const timeSinceLastOp = now - this.lastOpTime;
      if (timeSinceLastOp < this.minInterval) {
        const waitTime = this.minInterval - timeSinceLastOp + Math.random() * 2000;
        console.log('[Fanqie Editor] 频率限制：间隔等待 ' + Math.round(waitTime) + 'ms');
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      this.lastOpTime = Date.now();
      this.opsInMinute.push(this.lastOpTime);
    },

    reset() {
      this.lastOpTime = 0;
      this.opsInMinute = [];
    }
  };

  const SELECTORS = (typeof FanqieAdapter !== 'undefined') ? FanqieAdapter.SELECTORS : {
    // 回退：如果 adapter 未加载，使用内联选择器
    chapterNumber: ['.serial-editor-title-left [contenteditable]', 'input[class*="chapter-num"]'],
    title: ['.serial-editor-title-left [contenteditable]', 'input[class*="title"]'],
    content: ['div.ProseMirror[contenteditable="true"]', 'div[contenteditable="true"]'],
    saveDraft: ['button.auto-editor-save', 'button[class*="save"]'],
    nextStep: ['button.auto-editor-next', 'button[class*="next"]'],
    submit: ['button[class*="submit"]'],
    publishConfirm: ['button[class*="confirm"]', 'button[class*="publish"]'],
    aiOption: ['div[class*="ai"]']
  };

  // ============================================================
  // 二、状态检测关键词（从 FanqieAdapter 加载）
  // ============================================================

  const ADAPTER_KW = (typeof FanqieAdapter !== 'undefined') ? FanqieAdapter.KEYWORDS : {};
  const PUBLISH_SUCCESS_HINTS = ADAPTER_KW.publishSuccess || ['发布成功', '发布完成', '章节发布成功', '提交成功'];
  const PUBLISH_FAIL_HINTS = ADAPTER_KW.publishFail || ['发布失败', '提交失败', '操作失败', '服务器错误', '网络异常'];
  const CONTENT_DETECT_KEYWORDS = ADAPTER_KW.contentDetect || ['请选择内容检测方式', '内容检测方式'];
  const TYPO_WARNING_KEYWORDS = ADAPTER_KW.typoWarning || ['错别字', '疑似错别字', '文字错误', '拼写检查'];
  const RISK_DETECT_KEYWORDS = ADAPTER_KW.riskDetect || ['风险检测', '内容风险', '违规内容', '审核不通过', '敏感内容'];
  const GUIDE_KEYWORDS = ADAPTER_KW.guide || ['新手引导', '功能介绍', '操作指引', '教程'];

  // 单章发布超时时间（从适配层读取，默认 120 秒）
  const PUBLISH_TIMEOUT = (typeof FanqieAdapter !== 'undefined') ? FanqieAdapter.PUBLISH_TIMEOUT : 120000;

  // ============================================================
  // 三、工具函数
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
   * 人类化随机延迟
   * 当 antiDetectionMode 关闭时使用最短固定延迟
   */
  function humanDelay(min, max) {
    // 如果反检测模式关闭，使用最短延迟
    if (!_antiDetectionMode) {
      return new Promise(resolve => setTimeout(resolve, min));
    }
    // 10% 概率出现长停顿（2-5秒），模拟人类阅读/思考
    if (Math.random() < 0.1) {
      const longPause = 2000 + Math.random() * 3000;
      console.log('[Fanqie Editor] 模拟人类思考停顿: ' + Math.round(longPause) + 'ms');
      return new Promise(resolve => setTimeout(resolve, longPause));
    }
    const delay = min + Math.random() * (max - min);
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * 模拟人类鼠标移动（在目标元素附近随机移动）
   * 当 antiDetectionMode 关闭时跳过
   */
  async function simulateHumanMouseMove(element) {
    if (!element || !_antiDetectionMode) return;
    try {
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width * (0.3 + Math.random() * 0.4);
      const y = rect.top + rect.height * (0.3 + Math.random() * 0.4);

      // 创建鼠标事件序列
      const events = ['mouseenter', 'mousemove', 'mouseover'];
      for (const eventType of events) {
        element.dispatchEvent(new MouseEvent(eventType, {
          bubbles: true, cancelable: true, view: window,
          clientX: x, clientY: y
        }));
        await humanDelay(30, 80);
      }
    } catch (_e) {
      // 静默失败
    }
  }

  /**
   * 等待关键组件出现（轮询机制）
   * @param {Function} conditionFn - 返回 true 表示组件已出现
   * @param {number} timeout - 超时时间（毫秒），默认 30 秒
   * @param {number} interval - 轮询间隔（毫秒），默认 300ms
   * @returns {Promise<Element|null>}
   */
  async function waitForCondition(conditionFn, timeout = 30000, _interval = 300) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const result = conditionFn();
      if (result) return result;
      await humanDelay(200, 400);
    }
    return null;
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
   * 收集当前页面快照（用于失败诊断和演练模式）
   * 记录 URL、页面标题、可见按钮、弹窗关键词、最近操作阶段
   * @param {string} trigger - 触发原因
   * @param {string} phase - 当前阶段描述
   * @returns {Object} 页面快照
   */
  function collectPageSnapshot(trigger, phase) {
    var visibleButtons = [];
    try {
      var buttons = document.querySelectorAll('button, [role="button"]');
      buttons.forEach(function(btn) {
        if (isVisible(btn)) {
          visibleButtons.push({
            text: (btn.textContent || '').trim().slice(0, 50),
            class: btn.className.slice(0, 80),
            id: btn.id || ''
          });
        }
      });
    } catch (_e) { /* ignore */ }

    var modalKeywords = [];
    try {
      var modals = document.querySelectorAll('[class*="modal"], [class*="dialog"], [class*="popup"], [role="dialog"]');
      modals.forEach(function(m) {
        if (isVisible(m)) {
          modalKeywords.push((m.textContent || '').trim().slice(0, 100));
        }
      });
    } catch (_e) { /* ignore */ }

    return {
      trigger: trigger,
      phase: phase,
      url: window.location.href,
      title: document.title,
      timestamp: Date.now(),
      visibleButtons: visibleButtons.slice(0, 10),
      modalKeywords: modalKeywords.slice(0, 5)
    };
  }

  /**
   * 等待元素出现（可见）
   * @param {string[]} selectors - 选择器列表
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<Element|null>}
   */
  async function waitForElement(selectors, timeout = 30000) {
    return waitForCondition(() => {
      for (const selector of selectors) {
        try {
          const el = document.querySelector(selector);
          if (el && isVisible(el)) return el;
        } catch (_e) {
          // 无效选择器，跳过
        }
      }
      return null;
    }, timeout);
  }

  /**
   * 查找包含指定文本的可见按钮
   * @param {string} text - 按钮文本（部分匹配）
   * @returns {Element|null}
   */
  function findButtonByText(text) {
    const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
    return buttons.find(btn => {
      const btnText = (btn.textContent || '').trim();
      return btnText.includes(text) && isVisible(btn);
    }) || null;
  }

  /**
   * 查找包含指定文本的可见元素（不限于按钮）
   * @param {string} text - 文本（部分匹配）
   * @param {string} [tag] - 标签名过滤，如 'label'、'span'
   * @returns {Element|null}
   */
  function findElementByText(text, tag) {
    const selector = tag || '*';
    const elements = Array.from(document.querySelectorAll(selector));
    return elements.find(el => {
      const elText = (el.textContent || '').trim();
      return elText.includes(text) && isVisible(el);
    }) || null;
  }

  /**
   * 安全点击元素（多种方式尝试）
   * @param {Element} element
   * @returns {Promise<boolean>}
   */
  async function safeClick(element) {
    if (!element) return false;

    try {
      // 方式 1：直接 click
      element.click();
      await delay(100);

      // 检查是否成功触发（某些框架需要特殊处理）
      if (element.disabled) return false;

      return true;
    } catch (_e) {
      // 方式 2：MouseEvent
      try {
        const event = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        element.dispatchEvent(event);
        await delay(100);
        return true;
      } catch (_e2) {
        // 方式 3：PointerEvent
        try {
          const event = new PointerEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          element.dispatchEvent(event);
          await delay(50);
          const upEvent = new PointerEvent('pointerup', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          element.dispatchEvent(upEvent);
          await delay(100);
          return true;
        } catch (_e3) {
          return false;
        }
      }
    }
  }

  /**
   * 带超时的 Promise 包装
   * @param {Promise} promise
   * @param {number} timeout - 超时时间（毫秒）
   * @param {string} errorMsg - 超时错误信息
   * @returns {Promise}
   */
  function withTimeout(promise, timeout, errorMsg = '操作超时') {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(errorMsg)), timeout)
      )
    ]);
  }

  // ============================================================
  // 四、表单填充
  // ============================================================

  /**
   * 填写章节序号
   * @param {number} number
   * @returns {Promise<boolean>}
   */
  async function fillChapterNumber(number) {
    const input = await waitForElement(SELECTORS.chapterNumber, 5000);
    if (!input) {
      throw new Error('未找到章节序号输入框');
    }

    // 聚焦并清空
    input.focus();
    input.click();
    await delay(200);

    // 使用 React 兼容的方式设置值
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    )?.set || Object.getOwnPropertyDescriptor(
      window.HTMLDivElement.prototype, 'innerText'
    )?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(input, String(number));
    } else {
      input.value = String(number);
    }

    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    await delay(300);

    return true;
  }

  /**
   * 填写章节标题
   * @param {string} title
   * @returns {Promise<boolean>}
   */
  async function fillChapterTitle(title) {
    const input = await waitForElement(SELECTORS.title, 5000);
    if (!input) {
      throw new Error('未找到章节标题输入框');
    }

    input.focus();
    input.click();
    await delay(200);

    // 清空现有内容
    if (input.value !== undefined) {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(input, '');
      } else {
        input.value = '';
      }
    } else if (input.innerText !== undefined) {
      input.innerText = '';
    }

    await delay(100);

    // 设置新值
    if (input.value !== undefined) {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(input, title);
      } else {
        input.value = title;
      }
    } else if (input.innerText !== undefined) {
      input.innerText = title;
    }

    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    await delay(300);

    return true;
  }

  /**
   * 填写章节正文
   * @param {string} content
   * @returns {Promise<boolean>}
   */
  async function fillChapterContent(content) {
    const editor = await waitForElement(SELECTORS.content, 8000);
    if (!editor) {
      throw new Error('未找到正文编辑器');
    }

    // 聚焦编辑器
    editor.focus();
    editor.click();
    await delay(300);

    // 全选并删除现有内容
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    selection.removeAllRanges();
    selection.addRange(range);
    await delay(200);

    document.execCommand('delete', false, null);
    await delay(200);

    // 插入新内容（分段插入，避免大文本卡顿）
    const paragraphs = content.split('\n');
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i].trim();
      if (!para) continue;

      if (i > 0) {
        // 插入换行
        document.execCommand('insertParagraph', false, null);
        await delay(10);
      }

      document.execCommand('insertText', false, para);
      await delay(10);
    }

    // 触发输入事件（确保框架检测到内容变化）
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    await delay(100);

    // 模拟键盘事件触发字数统计更新
    editor.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', bubbles: true }));
    await delay(200);

    // 验证内容是否成功填入
    const editorText = editor.innerText || '';
    if (editorText.length < content.length * 0.5) {
      // 内容填入不完整，尝试备用方案
      console.warn('[Novel Publisher] 内容填入不完整，尝试备用方案');
      editor.innerText = content;
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      await delay(500);
    }

    return true;
  }

  // ============================================================
  // 五、弹窗处理
  // ============================================================

  /**
   * 处理内容检测弹窗
   * 选择"仅基础检测"
   * @returns {Promise<boolean>} 是否处理了弹窗
   */
  async function handleContentDetectModal() {
    for (const keyword of CONTENT_DETECT_KEYWORDS) {
      if (document.body.innerText.includes(keyword)) {
        console.log('[Novel Publisher] 检测到内容检测弹窗');

        // 尝试点击"仅基础检测"
        const options = ['仅基础检测', '基础检测'];
        for (const option of options) {
          const btn = findButtonByText(option);
          if (btn) {
            await safeClick(btn);
            await delay(2000);
            console.log(`[Novel Publisher] 已选择"${option}"`);
            return true;
          }
        }

        // 尝试点击"跳过检测"
        const skipBtn = findButtonByText('跳过');
        if (skipBtn) {
          await safeClick(skipBtn);
          await delay(2000);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 处理错别字警告弹窗
   * 点击"继续提交"忽略错别字警告
   * @returns {Promise<boolean>} 是否处理了弹窗
   */
  async function handleTypoWarningModal() {
    for (const keyword of TYPO_WARNING_KEYWORDS) {
      if (document.body.innerText.includes(keyword)) {
        console.log('[Novel Publisher] 检测到错别字警告弹窗');

        // 尝试点击"继续提交"或"忽略"
        const continueOptions = ['继续提交', '忽略', '仍然提交', '确认提交', '忽略并继续'];
        for (const option of continueOptions) {
          const btn = findButtonByText(option);
          if (btn) {
            await safeClick(btn);
            await delay(1500);
            console.log(`[Novel Publisher] 已点击"${option}"跳过错别字警告`);
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * 处理风险检测弹窗
   * 风险内容时取消发布
   * @returns {Promise<{handled: boolean, hasRisk: boolean}>}
   */
  async function handleRiskDetectModal() {
    for (const keyword of RISK_DETECT_KEYWORDS) {
      if (document.body.innerText.includes(keyword)) {
        console.warn('[Novel Publisher] 检测到内容风险弹窗，取消发布');

        // 点击取消
        const cancelOptions = ['取消', '返回修改', '我知道了'];
        for (const option of cancelOptions) {
          const btn = findButtonByText(option);
          if (btn) {
            await safeClick(btn);
            await delay(1000);
            return { handled: true, hasRisk: true };
          }
        }

        return { handled: true, hasRisk: true };
      }
    }
    return { handled: false, hasRisk: false };
  }

  /**
   * 处理新手引导弹窗
   * 点击"跳过"或"完成"关闭引导
   * @returns {Promise<boolean>} 是否处理了弹窗
   */
  async function handleGuideModal() {
    for (const keyword of GUIDE_KEYWORDS) {
      if (document.body.innerText.includes(keyword)) {
        console.log('[Novel Publisher] 检测到新手引导弹窗');

        const closeOptions = ['跳过', '我知道了', '知道了', '完成', '关闭', '下一步'];
        for (const option of closeOptions) {
          const btn = findButtonByText(option);
          if (btn && isVisible(btn)) {
            await safeClick(btn);
            await delay(500);
            console.log(`[Novel Publisher] 已点击"${option}"关闭引导`);
            return true;
          }
        }

        // 尝试移除引导遮罩层
        const tourOverlay = document.querySelector('#___reactour');
        if (tourOverlay) {
          tourOverlay.remove();
          console.log('[Novel Publisher] 已移除引导遮罩层');
          return true;
        }

        // 尝试移除其他遮罩
        const overlays = document.querySelectorAll('[class*="mask"], [class*="overlay"], [class*="guide"]');
        for (const overlay of overlays) {
          if (isVisible(overlay)) {
            overlay.style.display = 'none';
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * 处理发布设置弹窗
   * 选择 AI 生成标记 + 确认发布
   * @param {Object} config - 发布配置 {aiGenerated}
   * @returns {Promise<boolean>} 是否处理了弹窗
   */
  async function handlePublishSettingsModal(config) {
    // 检测是否有发布设置弹窗
    const settingsKeywords = ['发布设置', '选择发布方式', '发布选项'];
    let hasSettingsModal = false;

    for (const keyword of settingsKeywords) {
      if (document.body.innerText.includes(keyword)) {
        hasSettingsModal = true;
        break;
      }
    }

    // 也通过检测 AI 相关选项来判断（使用 findElementByText 兼容 label/span）
    if (!hasSettingsModal) {
      const aiEl = findElementByText('AI') || findButtonByText('AI');
      if (aiEl) {
        hasSettingsModal = true;
      }
    }

    if (!hasSettingsModal) return false;

    console.log('[Novel Publisher] 检测到发布设置弹窗');

    // 如果配置了 AI 生成，选择 AI 选项
    if (config && config.aiGenerated) {
      const aiOptions = ['AI 生成', 'AI生成', 'AI 辅助', 'AI辅助', 'AI'];
      for (const option of aiOptions) {
        const btn = findButtonByText(option);
        if (btn) {
          await safeClick(btn);
          await delay(500);
          console.log('[Novel Publisher] 已选择 AI 标记');
          break;
        }
      }
    }

    // 点击确认发布
    const confirmOptions = ['确认发布', '确认', '发布', '确定'];
    for (const option of confirmOptions) {
      const btn = findButtonByText(option);
      if (btn && isVisible(btn)) {
        await safeClick(btn);
        await delay(2000);
        console.log(`[Novel Publisher] 已点击"${option}"`);
        return true;
      }
    }

    return false;
  }

  /**
   * 统一处理所有弹窗
   * 按优先级依次检查和处理
   * @param {Object} config - 发布配置
   * @returns {Promise<{riskDetected: boolean}>}
   */
  async function handleAllModals(config) {
    // 1. 新手引导（优先级最低，随时可关闭）
    await handleGuideModal();

    // 2. 风险检测（优先级最高，需要取消发布）
    const riskResult = await handleRiskDetectModal();
    if (riskResult.hasRisk) {
      return { riskDetected: true };
    }

    // 3. 内容检测弹窗
    await handleContentDetectModal();

    // 4. 错别字警告
    await handleTypoWarningModal();

    // 5. 发布设置弹窗
    await handlePublishSettingsModal(config);

    // 6. 再次检查新手引导（可能在上一步操作后出现）
    await handleGuideModal();

    return { riskDetected: false };
  }

  // ============================================================
  // 六、发布状态检测
  // ============================================================

  /**
   * 检查发布是否成功
   * 多种判断条件
   * @returns {boolean}
   */
  function isPublishSuccess() {
    // 条件 1：页面文本包含成功提示
    for (const hint of PUBLISH_SUCCESS_HINTS) {
      if (document.body.innerText.includes(hint)) {
        return true;
      }
    }

    // 条件 2：URL 跳转到章节管理页
    if (window.location.href.includes('/chapter-manage/')) {
      return true;
    }

    // 条件 3：URL 变为作品主页
    if (window.location.href.match(/\/writer\/\d+\/?$/)) {
      return true;
    }

    // 条件 4：检测到"已发布"状态标签
    const publishedLabels = document.querySelectorAll('[class*="status"], [class*="tag"], [class*="label"]');
    for (const label of publishedLabels) {
      const text = (label.textContent || '').trim();
      if (text === '已发布' || text === '发布成功') {
        return true;
      }
    }

    return false;
  }

  /**
   * 检查发布是否失败
   * @returns {boolean}
   */
  function isPublishFailed() {
    for (const hint of PUBLISH_FAIL_HINTS) {
      if (document.body.innerText.includes(hint)) {
        return true;
      }
    }
    return false;
  }

  // ============================================================
  // 七、错误恢复
  // ============================================================

  /**
   * 发布失败后尝试返回章节管理页
   * @param {string} bookId - 作品 ID
   * @returns {Promise<boolean>}
   */
  async function navigateBackToManager(bookId) {
    try {
      if (bookId) {
        const managerUrl = `https://fanqienovel.com/main/writer/chapter-manage/${bookId}`;
        if (window.location.href !== managerUrl) {
          window.location.href = managerUrl;
          console.log('[Novel Publisher] 正在返回章节管理页...');
          return true;
        }
      }

      // 尝试点击浏览器后退
      const backButtons = ['返回', '返回列表', '章节管理'];
      for (const text of backButtons) {
        const btn = findButtonByText(text);
        if (btn) {
          await safeClick(btn);
          await delay(2000);
          return true;
        }
      }

      return false;
    } catch (e) {
      console.error('[Novel Publisher] 返回管理页失败:', e.message);
      return false;
    }
  }

  // ============================================================
  // 八、核心发布流程
  // ============================================================

  /**
   * 发布单章（完整流程）
   * @param {Object} chapterData - {index, title, content, charCount}
   * @param {Object} config - 发布配置 {aiGenerated, bookId}
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function publishChapter(chapterData, config = {}) {
    const { index, title, content } = chapterData;
    const startTime = Date.now();

    try {
      console.log(`[Novel Publisher] 开始发布第${index}章: ${title}`);

      // 发布频率限制
      await PublishRateLimiter.wait();

      // === 阶段 1：填写内容 ===

      // 处理可能存在的引导弹窗
      await handleGuideModal();

      // 填写章节序号
      try {
        await fillChapterNumber(index);
        await simulateHumanMouseMove(document.querySelector(SELECTORS.title[0]));
        await humanDelay(300, 600);
      } catch (e) {
        console.warn('[Novel Publisher] 填写序号失败（非致命）:', e.message);
      }

      // 填写标题
      await fillChapterTitle(title);
      await simulateHumanMouseMove(document.querySelector(SELECTORS.content[0]));
      await humanDelay(300, 600);

      // 填写正文
      await fillChapterContent(content);
      await simulateHumanMouseMove(document.querySelector(SELECTORS.nextStep[0]));
      await humanDelay(500, 1000);

      // === 阶段 2：提交发布 ===

      // 演练模式拦截：完整流程到此为止，不真正提交
      if (config.dryRunMode) {
        console.log(`[Novel Publisher] [演练模式] 第${index}章流程验证完成，停在提交前`);
        // 收集当前页面状态作为快照
        var snapshot = collectPageSnapshot('演练模式拦截', '阶段2-提交前');
        return {
          success: true,
          dryRun: true,
          snapshot: snapshot,
          message: `[演练] 第${index}章 "${title}" 流程验证通过，未实际提交`
        };
      }

      // 点击下一步
      const nextBtn = await waitForElement(SELECTORS.nextStep, 5000);
      if (nextBtn) {
        await simulateHumanMouseMove(nextBtn);
        await safeClick(nextBtn);
        await humanDelay(500, 1000);
      } else {
        // 尝试直接找"下一步"文本按钮
        const nextTextBtn = findButtonByText('下一步');
        if (nextTextBtn) {
          await simulateHumanMouseMove(nextTextBtn);
          await safeClick(nextTextBtn);
          await humanDelay(500, 1000);
        }
      }

      // === 阶段 3：处理弹窗和确认发布（带超时） ===

      const publishResult = await withTimeout(
        (async () => {
          const checkInterval = 500;
          const maxChecks = Math.ceil(PUBLISH_TIMEOUT / checkInterval);
          let checks = 0;

          while (checks < maxChecks) {
            checks++;

            // 检查是否已成功
            if (isPublishSuccess()) {
              return { success: true };
            }

            // 检查是否失败
            if (isPublishFailed()) {
              return { success: false, error: '发布被拒绝' };
            }

            // 处理所有弹窗
            const modalResult = await handleAllModals(config);
            if (modalResult.riskDetected) {
              return { success: false, error: '检测到内容风险，发布已取消' };
            }

            // 尝试点击提交按钮
            const submitBtn = await waitForElement(SELECTORS.submit, 800);
            if (submitBtn && isVisible(submitBtn)) {
              await safeClick(submitBtn);
              await delay(1000);
              continue;
            }

            // 尝试点击确认发布按钮
            const confirmBtn = await waitForElement(SELECTORS.publishConfirm, 800);
            if (confirmBtn && isVisible(confirmBtn)) {
              await safeClick(confirmBtn);
              await delay(1000);
              continue;
            }

            // 尝试文本匹配
            const submitTextBtn = findButtonByText('提交');
            if (submitTextBtn) {
              await safeClick(submitTextBtn);
              await delay(1000);
              continue;
            }

            const confirmTextBtn = findButtonByText('确认发布');
            if (confirmTextBtn) {
              await safeClick(confirmTextBtn);
              await delay(1000);
              continue;
            }

            await delay(checkInterval);
          }

          // 超时后最终检查一次
          if (isPublishSuccess()) {
            return { success: true };
          }

          return { success: false, error: `发布超时（${PUBLISH_TIMEOUT / 1000}秒）` };
        })(),
        PUBLISH_TIMEOUT + 5000, // 额外 5 秒缓冲
        '发布流程异常中断'
      );

      // === 阶段 4：后处理 ===

      if (publishResult.success) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[Novel Publisher] 第${index}章发布成功，耗时 ${elapsed}s`);
        return { success: true };
      } else {
        // 发布失败，收集页面快照用于诊断
        console.error(`[Novel Publisher] 第${index}章发布失败: ${publishResult.error}`);
        var failSnapshot = collectPageSnapshot('发布失败', '阶段3-弹窗/确认');
        await navigateBackToManager(config.bookId);
        return { success: false, error: publishResult.error, snapshot: failSnapshot };
      }

    } catch (error) {
      const errorMsg = error.message || '发布过程中发生未知错误';
      console.error(`[Novel Publisher] 第${index}章发布异常: ${errorMsg}`);
      var errorSnapshot = collectPageSnapshot('发布异常', error.stack ? error.stack.split('\n')[0] : '未知');

      // 尝试返回管理页
      try {
        await navigateBackToManager(config.bookId);
      } catch (_e) {
        // 忽略恢复失败
      }

      return { success: false, error: errorMsg, snapshot: errorSnapshot };
    }
  }

  // ============================================================
  // 九、分卷切换
  // ============================================================

  /**
   * 切换分卷
   * @param {string} volumeName - 分卷名称
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function switchVolume(volumeName) {
    try {
      // 查找分卷指示器
      const volumeElements = Array.from(document.querySelectorAll('*'));
      const volumeEl = volumeElements.find(el => {
        const text = el.textContent || '';
        const rect = el.getBoundingClientRect();
        return /第[一二三四五六七八九十\d]+卷/.test(text) &&
               rect.y < 150 &&
               rect.width > 0 &&
               rect.height > 0;
      });

      if (!volumeEl) {
        return { success: false, error: '未找到分卷指示器' };
      }

      await safeClick(volumeEl);
      await delay(1500);

      // 查找目标分卷
      const searchNames = [volumeName];
      if (!volumeName.startsWith('《')) {
        searchNames.push(`《${volumeName}》`);
      }

      const allElements = Array.from(document.querySelectorAll('*'));
      for (const name of searchNames) {
        const targetEl = allElements.find(el => {
          const text = el.textContent || '';
          const rect = el.getBoundingClientRect();
          return text.includes(name) && rect.y > 150 && rect.width > 0;
        });

        if (targetEl) {
          await safeClick(targetEl);
          await delay(1000);

          // 点击确定
          const confirmBtn = findButtonByText('确定');
          if (confirmBtn) {
            await safeClick(confirmBtn);
            await delay(2000);
          }

          return { success: true };
        }
      }

      return { success: false, error: `未找到分卷"${volumeName}"` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ============================================================
  // 十、消息处理
  // ============================================================

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    /**
     * 发布章节
     */
    if (request.action === 'publishChapter') {
      (async () => {
        try {
          // 从 config 中读取反检测模式设置
          if (request.config && typeof request.config.antiDetectionMode === 'boolean') {
            _antiDetectionMode = request.config.antiDetectionMode;
          }
          const result = await publishChapter(request.chapter, request.config);
          sendResponse(result);
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true; // 异步响应
    }

    /**
     * 切换分卷
     */
    if (request.action === 'switchVolume') {
      (async () => {
        try {
          const result = await switchVolume(request.volumeName);
          sendResponse(result);
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true;
    }

    /**
     * 获取编辑器状态
     */
    if (request.action === 'getEditorStatus') {
      try {
        const url = window.location.href;
        const isEditor = url.includes('/publish/') ||
                         url.includes('/editor/') ||
                         document.querySelector('.ProseMirror') !== null ||
                         document.querySelector('[contenteditable="true"]') !== null;

        const contentEl = document.querySelector('.ProseMirror') ||
                          document.querySelector('[contenteditable="true"]');
        const hasContent = contentEl ? (contentEl.innerText || '').length > 0 : false;

        // 环境兼容性检测：检查关键选择器是否可用
        var compatibilityIssues = [];
        var criticalSelectors = ['content', 'nextStep', 'submit'];
        criticalSelectors.forEach(function(key) {
          var selectors = SELECTORS[key] || [];
          var found = selectors.some(function(s) { return document.querySelector(s); });
          if (!found) {
            compatibilityIssues.push(key);
          }
        });

        sendResponse({
          success: true,
          data: {
            url,
            isEditor,
            hasContent,
            title: document.title || '',
            compatibilityIssues: compatibilityIssues,
            compatibilityOk: compatibilityIssues.length === 0
          }
        });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }

    /**
     * 处理弹窗（外部调用）
     */
    if (request.action === 'handleModals') {
      (async () => {
        try {
          const result = await handleAllModals(request.config || {});
          sendResponse({ success: true, data: result });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
      })();
      return true;
    }
  });

  // ============================================================
  // 十一、初始化
  // ============================================================

  // 通知 background 内容脚本已就绪
  chrome.runtime.sendMessage({
    action: 'contentScriptReady',
    url: window.location.href,
    platform: 'fanqie_editor'
  }).catch(() => {
    // background 可能未就绪，忽略
  });

  console.log('[Novel Publisher] 番茄编辑器内容脚本已加载');
})();
