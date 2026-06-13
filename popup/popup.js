/**
 * Popup Script - 小说发布助手（核心功能前置版）
 * 处理 popup 界面的所有交互逻辑
 *
 * 改动：
 *   - 核心功能前置：作品选择、文档链接、文件上传、发布按钮合并为一个紧凑操作区
 *   - 新增 API 配置状态提示（未配置时显示醒目引导）
 *   - 文件上传改为紧凑按钮触发（替代旧的拖拽大区域）
 *   - 删除独立的"提取章节"按钮（合并到内联提取按钮）
 *   - 章节列表和日志面板移到更靠下的位置
 *   - 新增 AI 写作助手：大纲生成、AI 续写、润色、标题（带 Tab 切换和使用限制）
 */

'use strict';

// ========================================
// 国际化语言包
// ========================================
const i18n = {
  'zh': {
    // 通用
    'app.title': '小说发布助手',
    'btn.settings': '设置',
    'btn.refreshLogin': '刷新登录',
    'btn.fanqieLogin': '番茄小说登录',
    'btn.save': '保存设置',
    'btn.cancel': '取消',
    'btn.confirm': '确认',
    'btn.close': '关闭',
    'btn.add': '添加',
    'btn.delete': '删除',
    'btn.export': '导出',
    'btn.import': '导入',
    'btn.clear': '清空',
    'btn.test': '测试连接',
    'btn.activate': '激活',
    'btn.publish': '发布',
    'btn.pause': '暂停',
    'btn.extract': '提取章节',

    // 快捷操作
    'quick.fanqie': '番茄平台',
    'quick.fanqie.desc': '作者后台',
    'quick.doc': '腾讯文档',
    'quick.upload': '文件上传',

    // 作品
    'works.title': '我的作品',
    'works.empty': '还没有添加作品',
    'works.empty.hint': '点击上方按钮添加你的第一本小说',
    'works.add': '添加作品',
    'works.stats.volumes': '分卷',
    'works.stats.total': '章节',
    'works.stats.published': '已发',
    'works.stats.pending': '待发',

    // AI
    'ai.title': 'AI 写作助手',
    'ai.tab.outline': '大纲',
    'ai.tab.continue': '续写',
    'ai.tab.polish': '润色',
    'ai.tab.title': '标题',
    'ai.usage': '剩余 {used}/{total}',
    'ai.generate': '生成大纲',
    'ai.continue': '开始续写',
    'ai.polish': '润色优化',
    'ai.titleGen': '生成标题',
    'ai.activate.placeholder': '输入激活码解锁无限使用',

    // 章节
    'chapters.title': '章节列表',
    'chapters.select.all': '全选',
    'chapters.select.inverse': '反选',
    'chapters.select.clear': '清空',
    'chapters.publish.selected': '发布选中',
    'chapters.selected': '已选 {selected}/{total} 章',
    'chapters.empty': '暂无章节，请先提取内容',

    // 统计
    'stats.works': '作品',
    'stats.chapters': '章节',
    'stats.published': '已发布',
    'stats.today': '今日',

    // 设置页
    'setup.api': 'API 配置',
    'setup.api.desc': '配置后可直接读取文档内容',
    'setup.fanqie': '番茄平台',
    'setup.fanqie.desc': '登录后填写作品 ID 关联你的小说',
    'setup.global': '全局设置',
    'setup.global.desc': '发布间隔、重试策略等高级选项',

    // Toast
    'toast.saved': '设置已保存',
    'toast.exported': '导出成功',
    'toast.imported': '导入成功',
    'toast.cleared': '数据已清空',
    'toast.published': '发布完成',
    'toast.error': '操作失败',
    'toast.warning': '请注意',
    'toast.noSelection': '请先选择要发布的章节',
    'toast.loginRequired': '请先登录番茄小说',

    // 欢迎弹窗
    'welcome.title': '欢迎使用小说发布助手',
    'welcome.subtitle': '番茄小说自动发布工具，只需 3 步即可开始使用',
    'welcome.step1': '配置内容来源',
    'welcome.step1.desc': '连接腾讯文档 API，或使用文件上传 / 手动粘贴',
    'welcome.step2': '登录番茄平台',
    'welcome.step2.desc': '登录番茄小说并填写作品 ID',
    'welcome.step3': '全局设置',
    'welcome.step3.desc': '发布间隔、重试策略等高级选项',
    'welcome.start': '开始配置',
    'welcome.dontShow': '不再显示此引导',
    'welcome.tip1': '🔒 所有数据本地存储，不上传任何第三方服务器',
    'welcome.tip2': '🛡️ 内置反检测模式，模拟人类操作行为',
    'welcome.tip3': '🤖 支持 AI 续写、润色、生成标题',
  },
  'en': {
    // 通用
    'app.title': 'Novel Publisher',
    'btn.settings': 'Settings',
    'btn.refreshLogin': 'Refresh Login',
    'btn.fanqieLogin': 'Fanqie Login',
    'btn.save': 'Save Settings',
    'btn.cancel': 'Cancel',
    'btn.confirm': 'Confirm',
    'btn.close': 'Close',
    'btn.add': 'Add',
    'btn.delete': 'Delete',
    'btn.export': 'Export',
    'btn.import': 'Import',
    'btn.clear': 'Clear',
    'btn.test': 'Test Connection',
    'btn.activate': 'Activate',
    'btn.publish': 'Publish',
    'btn.pause': 'Pause',
    'btn.extract': 'Extract Chapters',

    // 快捷操作
    'quick.fanqie': 'Fanqie Platform',
    'quick.fanqie.desc': 'Author Dashboard',
    'quick.doc': 'Tencent Docs',
    'quick.upload': 'File Upload',

    // 作品
    'works.title': 'My Works',
    'works.empty': 'No works yet',
    'works.empty.hint': 'Click the button above to add your first novel',
    'works.add': 'Add Work',
    'works.stats.volumes': 'Volumes',
    'works.stats.total': 'Chapters',
    'works.stats.published': 'Published',
    'works.stats.pending': 'Pending',

    // AI
    'ai.title': 'AI Writing Assistant',
    'ai.tab.outline': 'Outline',
    'ai.tab.continue': 'Continue',
    'ai.tab.polish': 'Polish',
    'ai.tab.title': 'Title',
    'ai.usage': '{used}/{total} left',
    'ai.generate': 'Generate Outline',
    'ai.continue': 'Start Writing',
    'ai.polish': 'Polish Content',
    'ai.titleGen': 'Generate Title',
    'ai.activate.placeholder': 'Enter activation code for unlimited use',

    // 章节
    'chapters.title': 'Chapter List',
    'chapters.select.all': 'Select All',
    'chapters.select.inverse': 'Invert',
    'chapters.select.clear': 'Clear',
    'chapters.publish.selected': 'Publish Selected',
    'chapters.selected': '{selected}/{total} selected',
    'chapters.empty': 'No chapters yet. Extract content first.',

    // 统计
    'stats.works': 'Works',
    'stats.chapters': 'Chapters',
    'stats.published': 'Published',
    'stats.today': 'Today',

    // 设置页
    'setup.api': 'API Config',
    'setup.api.desc': 'Connect to read document content directly',
    'setup.fanqie': 'Fanqie Platform',
    'setup.fanqie.desc': 'Login and enter work ID to link your novel',
    'setup.global': 'Global Settings',
    'setup.global.desc': 'Publish interval, retry strategy and more',

    // Toast
    'toast.saved': 'Settings saved',
    'toast.exported': 'Export successful',
    'toast.imported': 'Import successful',
    'toast.cleared': 'Data cleared',
    'toast.published': 'Publishing complete',
    'toast.error': 'Operation failed',
    'toast.warning': 'Attention',
    'toast.noSelection': 'Please select chapters to publish',
    'toast.loginRequired': 'Please login to Fanqie first',

    // 欢迎弹窗
    'welcome.title': 'Welcome to Novel Publisher',
    'welcome.subtitle': 'Auto-publish tool for Fanqie Novel, get started in 3 steps',
    'welcome.step1': 'Configure Content Source',
    'welcome.step1.desc': 'Connect Tencent Docs API, or use file upload / paste',
    'welcome.step2': 'Login to Fanqie',
    'welcome.step2.desc': 'Login and enter your work ID',
    'welcome.step3': 'Global Settings',
    'welcome.step3.desc': 'Publish interval, retry strategy and more',
    'welcome.start': 'Get Started',
    'welcome.dontShow': "Don't show this again",
    'welcome.tip1': '🔒 All data stored locally, no third-party servers',
    'welcome.tip2': '🛡️ Built-in anti-detection, simulates human behavior',
    'welcome.tip3': '🤖 AI-powered continue, polish, and title generation',
  }
};

let currentLang = 'zh';

/**
 * 获取翻译文本
 * @param {string} key - 翻译键
 * @param {Object} params - 替换参数，如 { used: 5, total: 15 }
 * @returns {string}
 */
function t(key, params = {}) {
  let text = (i18n[currentLang] && i18n[currentLang][key]) || (i18n['zh'][key]) || key;
  Object.entries(params).forEach(([k, v]) => {
    text = text.replace(`{${k}}`, v);
  });
  return text;
}

/**
 * 切换语言并更新所有带 data-i18n 属性的元素
 * @param {string} lang - 'zh' 或 'en'
 */
function switchLanguage(lang) {
  currentLang = lang;
  chrome.storage.local.set({ language: lang });

  // 更新所有带 data-i18n 属性的元素
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (el.tagName === 'INPUT' && el.type !== 'checkbox') {
      el.placeholder = text;
    } else if (el.tagName === 'OPTION') {
      el.textContent = text;
    } else {
      el.textContent = text;
    }
  });

  // 更新所有带 data-i18n-title 属性的元素
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.getAttribute('data-i18n-title'));
  });

  // 更新所有带 data-i18n-placeholder 属性的元素
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
}

/**
 * 从 storage 加载语言设置
 */
async function loadLanguage() {
  const data = await chrome.storage.local.get(['language']);
  currentLang = data.language || 'zh';
  switchLanguage(currentLang);
}

// ============================================
// State
// ============================================
let works = [];              // 作品列表
let currentWorkId = '';      // 当前选中的作品 ID
let extractedChapters = [];  // 当前提取的章节
let isPublishing = false;    // 是否正在发布
let isPaused = false;        // 是否暂停

// AI 状态管理
let aiState = {
  activated: false,
  dailyUsage: 0,
  usageDate: '',
  currentAiTab: 'outline'
};

// ============================================
// DOM Elements
// ============================================
const $ = (id) => document.getElementById(id);

const el = {
  // Header
  btnSettings: $('btnSettings'),
  btnRefreshLogin: $('btnRefreshLogin'),
  btnFanqieLogin: $('btnFanqieLogin'),
  fanqieLoginText: $('fanqieLoginText'),

  // Quick Actions
  quickFanqie: $('quickFanqie'),
  quickFanqieDesc: $('quickFanqieDesc'),
  quickDoc: $('quickDoc'),
  quickUpload: $('quickUpload'),

  // API Notice
  apiNotice: $('apiNotice'),
  btnGoSettings: $('btnGoSettings'),
  btnCloseApiNotice: $('btnCloseApiNotice'),

  // Works Section
  worksList: $('worksList'),
  worksEmpty: $('worksEmpty'),
  btnAddWork: $('btnAddWork'),

  // Action Panel
  actionPanel: $('actionPanel'),
  actionPanelTitle: $('actionPanelTitle'),
  btnClosePanel: $('btnClosePanel'),
  statVolumes: $('statVolumes'),
  statTotal: $('statTotal'),
  statPublished: $('statPublished'),
  statPending: $('statPending'),

  // Doc URL
  docUrlInput: $('docUrlInput'),
  btnExtractInline: $('btnExtractInline'),
  docUrlHint: $('docUrlHint'),

  // File Upload (compact)
  fileUploadBtn: $('fileUploadBtn'),
  zipFileInput: $('zipFileInput'),

  // Paste Fallback
  pasteFallback: $('pasteFallback'),
  pasteFallbackTextarea: $('pasteFallbackTextarea'),
  btnPasteExtract: $('btnPasteExtract'),

  // Actions
  btnPublish: $('btnPublish'),
  btnPause: $('btnPause'),

  // AI Section (extended)
  aiSection: $('aiSection'),
  aiUsageBadge: $('aiUsageBadge'),
  tabOutline: $('tabOutline'),
  tabContinue: $('tabContinue'),
  tabPolish: $('tabPolish'),
  tabTitle: $('tabTitle'),

  panelOutline: $('panelOutline'),
  panelContinue: $('panelContinue'),
  panelPolish: $('panelPolish'),
  panelTitle: $('panelTitle'),

  btnGenerateOutline: $('btnGenerateOutline'),
  btnGenerateContinue: $('btnGenerateContinue'),
  btnAiPolish: $('btnAiPolish'),
  btnAiTitle: $('btnAiTitle'),

  resultOutline: $('resultOutline'),
  resultContinue: $('resultContinue'),
  resultPolish: $('resultPolish'),
  resultTitle: $('resultTitle'),

  aiActivationRow: $('aiActivationRow'),
  aiActivationCode: $('aiActivationCode'),
  btnAiActivate: $('btnAiActivate'),

  // Chapters
  chaptersCard: $('chaptersCard'),
  selectAll: $('selectAll'),
  chaptersList: $('chaptersList'),
  chaptersCount: $('chaptersCount'),
  selectedInfo: $('selectedInfo'),

  // Batch Actions
  batchActionsBar: $('batchActionsBar'),
  batchCount: $('batchCount'),
  btnBatchSelectAll: $('btnBatchSelectAll'),
  btnBatchInverse: $('btnBatchInverse'),
  btnBatchClear: $('btnBatchClear'),
  btnStatusFilter: $('btnStatusFilter'),
  btnRetryFailed: $('btnRetryFailed'),
  btnBatchPublish: $('btnBatchPublish'),

  // Stats Panel
  statsPanel: $('statsPanel'),
  statTotalWorks: $('statTotalWorks'),
  statTotalChapters: $('statTotalChapters'),
  statPublishedCount: $('statPublishedCount'),
  statTodayCount: $('statTodayCount'),
};

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  await loadLanguage();
  await loadWorks();
  await loadAiState();
  bindEvents();
  updateAllPanels();
  await checkApiConfig();
  await checkFanqieLoginStatus();
  await updateStats();

  // 自动填充文档链接并尝试提取
  await autoFillDocUrl();
});

// popup 关闭时清理大型数据引用，帮助垃圾回收
window.addEventListener('unload', () => {
  works = [];
  extractedChapters = [];
  currentWorkId = '';
});

// ============================================
// AI State Management
// ============================================
/**
 * 加载 AI 状态（激活状态、每日使用次数、使用日期）
 * @returns {Promise<void>}
 */
async function loadAiState() {
  try {
    const data = await chrome.storage.local.get(['ai_activated', 'ai_daily_usage', 'ai_usage_date']);
    aiState.activated = data['ai_activated'] || false;
    aiState.dailyUsage = data['ai_daily_usage'] || 0;
    aiState.usageDate = data['ai_usage_date'] || '';
    updateAiUsageBadge();
    // 控制激活码输入行显示
    if (el.aiActivationRow) {
      el.aiActivationRow.style.display = aiState.activated ? 'none' : 'flex';
    }
  } catch(e) {
    console.warn('加载AI状态失败:', e);
  }
}

/**
 * 获取剩余 AI 使用次数（未激活用户每天 15 次免费额度）
 * @returns {number} 剩余次数，已激活用户返回 Infinity
 */
function remainingUses() {
  if (aiState.activated) return Infinity;
  checkDailyReset();
  return Math.max(0, 15 - aiState.dailyUsage);
}

/**
 * 检查每日使用次数是否需要重置（跨天后自动归零）
 * @returns {void}
 */
function checkDailyReset() {
  const today = new Date().toISOString().slice(0, 10);
  if (aiState.usageDate !== today) {
    aiState.dailyUsage = 0;
    aiState.usageDate = today;
    chrome.storage.local.set({
      ai_daily_usage: aiState.dailyUsage,
      ai_usage_date: aiState.usageDate
    });
  }
}

/**
 * 记录一次 AI 使用次数并持久化到 chrome.storage.local
 * @returns {void}
 */
function recordUsage() {
  if (!aiState.activated) {
    aiState.dailyUsage++;
    chrome.storage.local.set({
      ai_daily_usage: aiState.dailyUsage,
      ai_usage_date: aiState.usageDate
    });
    updateAiUsageBadge();
  }
}

/**
 * 更新 AI 使用次数徽章显示（已激活显示"无限使用"，否则显示"剩余 X/15"）
 * @returns {void}
 */
function updateAiUsageBadge() {
  if (!el.aiUsageBadge) return;
  if (aiState.activated) {
    el.aiUsageBadge.textContent = '无限使用';
    el.aiUsageBadge.style.color = 'var(--success)';
    el.aiUsageBadge.style.background = 'var(--success-bg)';
  } else {
    const remaining = Math.max(0, 15 - aiState.dailyUsage);
    el.aiUsageBadge.textContent = '剩余 ' + remaining + '/15';
    el.aiUsageBadge.style.color = 'var(--fq-primary)';
    el.aiUsageBadge.style.background = 'var(--fq-info-bg)';
  }
}

// ============================================
// API Config Check
// 通过 background 的 getSettings 接口获取已解密的 API 配置，
// 避免直接读 sync 里的密文字段。
// ============================================
async function checkApiConfig() {
  try {
    const resp = await chrome.runtime.sendMessage({ action: 'getSettings' });
    if (resp && resp.success && resp.data) {
      const hasApi = resp.data.tencentDocClientId && resp.data.tencentDocAccessToken && resp.data.tencentDocOpenId;
      if (el.apiNotice) {
        el.apiNotice.style.display = hasApi ? 'none' : 'flex';
      }
      return;
    }
  } catch (_e) {
    // background 不可用时静默失败
  }
  // 回退：无法判断时显示提示
  if (el.apiNotice) {
    el.apiNotice.style.display = 'flex';
  }
}

// ============================================
// Event Bindings
// ============================================
function bindEvents() {
  // Settings - 直接调用，不经过 background
  el.btnSettings.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
    }
  });

  // 语言切换
  const btnSwitchLang = $('btnSwitchLang');
  if (btnSwitchLang) {
    btnSwitchLang.addEventListener('click', () => {
      const newLang = currentLang === 'zh' ? 'en' : 'zh';
      switchLanguage(newLang);
    });
  }

  // 番茄小说登录
  el.btnFanqieLogin.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openFanqieLogin' });
  });

  // 刷新登录状态
  el.btnRefreshLogin.addEventListener('click', async () => {
    setButtonLoading(el.btnRefreshLogin, true);
    // 清除缓存
    await chromeStorageSet({ fanqieLoggedIn: false });
    const response = await chrome.runtime.sendMessage({ action: 'checkFanqieLogin' });
    setButtonLoading(el.btnRefreshLogin, false);
    if (response && response.loggedIn) {
      updateLoginUI(true);
      showToast('番茄小说登录状态：已登录', 'success');
    } else {
      updateLoginUI(false);
      showToast('未检测到番茄小说登录，请先登录', 'warning');
    }
  });

  // 快捷操作卡片
  el.quickFanqie.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openFanqieLogin' });
  });

  el.quickDoc.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://docs.qq.com/' });
  });

  el.quickUpload.addEventListener('click', () => {
    el.zipFileInput.click();
  });

  // API Notice buttons
  el.btnGoSettings.addEventListener('click', function() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
    }
  });
  el.btnCloseApiNotice.addEventListener('click', function() {
    el.apiNotice.style.display = 'none';
  });

  // Work select - 不再使用下拉框，改为卡片点击

  // Close action panel
  el.btnClosePanel.addEventListener('click', closeActionPanel);

  // Add work button
  el.btnAddWork.addEventListener('click', onAddWorkClick);

  // Doc URL inline extract button
  el.btnExtractInline.addEventListener('click', onExtract);

  // Paste fallback
  el.btnPasteExtract.addEventListener('click', onPasteExtract);

  // Action buttons
  el.btnPublish.addEventListener('click', onPublish);
  el.btnPause.addEventListener('click', onPause);

  // Select all
  el.selectAll.addEventListener('change', onSelectAll);

  // Batch actions
  el.btnBatchSelectAll.addEventListener('click', () => {
    extractedChapters.forEach(ch => ch.selected = true);
    renderChaptersList(extractedChapters);
    updateBatchCount();
  });

  el.btnBatchInverse.addEventListener('click', () => {
    extractedChapters.forEach(ch => ch.selected = !ch.selected);
    renderChaptersList(extractedChapters);
    updateBatchCount();
  });

  el.btnBatchClear.addEventListener('click', () => {
    extractedChapters.forEach(ch => ch.selected = false);
    renderChaptersList(extractedChapters);
    updateBatchCount();
  });

  el.btnBatchPublish.addEventListener('click', () => {
    const selected = extractedChapters.filter(ch => ch.selected);
    if (selected.length === 0) {
      showToast('请先选择要发布的章节', 'warning');
      return;
    }
    onPublish(selected);
  });

  // 状态筛选
  el.btnStatusFilter.addEventListener('change', () => {
    renderChaptersList();
  });

  // 一键重试失败章节
  el.btnRetryFailed.addEventListener('click', () => {
    const failed = extractedChapters.filter(ch => ch.status === 'error');
    if (failed.length === 0) {
      showToast('没有失败的章节', 'info');
      return;
    }
    // 先清除所有选择，选中失败章节
    extractedChapters.forEach(ch => ch.selected = ch.status === 'error');
    renderChaptersList();
    updateBatchCount();
    onPublish(failed);
  });

  // Listen for messages from background
  chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    if (request.action === 'publishProgress') {
      handlePublishProgress(request);
    }
    if (request.action === 'publishComplete') {
      handlePublishComplete(request);
    }
  });

  // File upload (compact button)
  el.fileUploadBtn.addEventListener('click', function() { el.zipFileInput.click(); });
  el.zipFileInput.addEventListener('change', function(e) {
    if (e.target.files[0]) onFileUpload(e.target.files[0]);
  });

  // 也支持拖拽到整个 popup
  document.body.addEventListener('dragover', function(e) { e.preventDefault(); });
  document.body.addEventListener('drop', function(e) {
    e.preventDefault();
    if (e.dataTransfer.files[0]) onFileUpload(e.dataTransfer.files[0]);
  });

  // 快捷键
  document.addEventListener('keydown', function(e) {
    // Ctrl+S / Cmd+S: 触发发布
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (!el.btnPublish.disabled) onPublish();
    }
  });

  // AI Tab 切换
  document.querySelectorAll('.ai-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      const targetTab = tab.dataset.aiTab;
      switchAiTab(targetTab);
    });
  });

  // AI actions
  el.btnGenerateOutline.addEventListener('click', function() { handleAiAction('outline'); });
  el.btnGenerateContinue.addEventListener('click', function() { handleAiAction('continue'); });
  el.btnAiPolish.addEventListener('click', function() { handleAiAction('polish'); });
  el.btnAiTitle.addEventListener('click', function() { handleAiAction('title'); });

  // AI 激活码
  el.btnAiActivate.addEventListener('click', onAiActivate);

  // 文档链接实时验证（300ms 防抖）
  const debouncedValidateDocUrl = debounce((url) => {
    if (!url) {
      el.docUrlHint.textContent = '';
      el.docUrlHint.className = 'doc-url-hint';
      return;
    }
    if (url.includes('docs.qq.com')) {
      el.docUrlHint.textContent = '✓ 腾讯文档链接';
      el.docUrlHint.className = 'doc-url-hint success';
    } else {
      el.docUrlHint.textContent = '请输入有效的腾讯文档链接';
      el.docUrlHint.className = 'doc-url-hint warn';
    }
  }, 300);
  el.docUrlInput.addEventListener('input', (e) => {
    debouncedValidateDocUrl(e.target.value);
  });

  // 粘贴文本输入防抖（500ms）
  const debouncedParsePaste = debounce((text) => {
    if (!text || text.trim().length < 50) return;
    // 仅做轻量提示，不自动解析，避免误触发
    el.docUrlHint.textContent = '已输入 ' + text.length + ' 字，点击"解析章节"按钮提取';
    el.docUrlHint.className = 'doc-url-hint success';
  }, 500);
  el.pasteFallbackTextarea.addEventListener('input', (e) => {
    debouncedParsePaste(e.target.value);
  });
}

// ============================================
// AI Tab Switching
// ============================================
/**
 * 切换 AI Tab 面板（outline / continue / polish / title）
 * @param {string} tabName - Tab 名称
 * @returns {void}
 */
function switchAiTab(tabName) {
  aiState.currentAiTab = tabName;

  // 更新 tab 样式
  document.querySelectorAll('.ai-tab').forEach(function(tab) {
    tab.classList.toggle('active', tab.dataset.aiTab === tabName);
  });

  // 更新面板显示
  document.querySelectorAll('.ai-panel').forEach(function(panel) {
    panel.classList.remove('active');
  });
  const targetPanel = document.getElementById('panel' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
  if (targetPanel) {
    targetPanel.classList.add('active');
  }
}

// ============================================
// AI Activation
// ============================================
async function onAiActivate() {
  const code = el.aiActivationCode.value.trim();
  if (!code) {
    showToast('请输入激活码', 'warning');
    return;
  }

  // 这里可以对接真实的激活码验证接口
  // 目前先使用简单的本地验证逻辑：code 长度 >= 8 即视为有效
  if (code.length >= 8) {
    aiState.activated = true;
    await chrome.storage.local.set({ ai_activated: true });
    el.aiActivationRow.style.display = 'none';
    updateAiUsageBadge();
    showToast('激活成功！无限使用 AI 写作助手', 'success');
  } else {
    showToast('激活码无效', 'error');
  }
}

// ============================================
// Prompt Builder
// ============================================
/**
 * 构建 AI 提示词（system + user）
 * @param {string} type - AI 操作类型：outline / continue / polish / title
 * @param {string} content - 章节内容
 * @param {string} [title] - 章节标题
 * @returns {{system: string, user: string}} 包含 system 和 user 角色消息的对象
 */
function buildPrompt(type, content, title) {
  switch (type) {
    case 'outline':
      return {
        system: '你是专业的小说编辑和大纲策划师。基于提供的章节内容，为下一章设计3个不同方向的大纲。每个大纲包括：方向名称、核心冲突、关键情节节点（3-5个）、预期字数。要求3个方向有显著差异化，不要只是换个说法。',
        user: '章节标题：' + (title || '') + '\n\n章节内容：\n' + content.slice(0, 4000)
      };
    case 'continue':
      return {
        system: '你是专业的小说续写师。基于提供的章节内容，为下一章写500-1000字的续写。保持原作的文风、人物性格和故事节奏。直接输出续写内容，不要加解释、标题或前缀。',
        user: '章节结尾部分：\n' + content.slice(-2000)
      };
    case 'polish':
      return {
        system: '你是专业的小说润色师。请优化以下小说的文笔和表达，使其更加流畅、生动、有感染力。保持原意不变，不要删减关键情节。直接输出润色后的内容，不要加解释。',
        user: content.slice(0, 2000)
      };
    case 'title':
      return {
        system: '你是专业的小说标题策划师。基于章节内容，生成一个吸引人的章节标题。标题要简洁有力，能激发读者兴趣，符合网络小说风格。只输出标题文字，不要加解释或前缀。',
        user: '章节内容：\n' + content.slice(0, 200)
      };
    default:
      return { system: '', user: content };
  }
}

// ============================================
// AI Action Handler
// ============================================
/**
 * 处理 AI 操作（大纲生成、续写、润色、标题），调用 background 发起 AI 请求
 * @param {string} type - AI 操作类型：outline / continue / polish / title
 * @returns {Promise<void>}
 */
async function handleAiAction(type) {
  // 获取选中章节的内容
  const selectedChapters = getSelectedChapters();
  if (selectedChapters.length === 0) {
    showToast('请先在章节列表中选择章节', 'warning');
    return;
  }

  // 检查使用限制
  const remaining = remainingUses();
  if (remaining <= 0) {
    showToast('今日免费次数已用完，请输入激活码解锁无限使用', 'warning');
    if (el.aiActivationRow) {
      el.aiActivationRow.style.display = 'flex';
      el.aiActivationCode.focus();
    }
    return;
  }

  // 检查 AI 是否已配置
  const aiConfig = await chromeStorageGet(['aiApiUrl', 'aiApiKey']);
  if (!aiConfig.aiApiUrl || !aiConfig.aiApiKey) {
    showToast('请先在设置中配置 AI 服务（API 地址和密钥）', 'warning');
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
    }
    return;
  }

  // 取第一个选中章节
  const chapter = selectedChapters[0];

  // 准备内容
  let content = '';
  if (type === 'outline') {
    content = chapter.content;
  } else if (type === 'continue') {
    content = chapter.content;
  } else if (type === 'polish') {
    content = chapter.content;
  } else if (type === 'title') {
    content = chapter.content;
  }

  if (!content || content.length < 10) {
    showToast('章节内容太短，无法使用 AI', 'warning');
    return;
  }

  // 构建 prompt
  const prompt = buildPrompt(type, content, chapter.title);

  // 获取对应的结果面板和按钮
  const btnMap = {
    outline: el.btnGenerateOutline,
    continue: el.btnGenerateContinue,
    polish: el.btnAiPolish,
    title: el.btnAiTitle
  };
  const resultMap = {
    outline: el.resultOutline,
    continue: el.resultContinue,
    polish: el.resultPolish,
    title: el.resultTitle
  };

  const btn = btnMap[type];
  const resultEl = resultMap[type];

  // 显示加载中
  if (resultEl) {
    resultEl.innerHTML = '<div class="ai-loading">AI 正在创作中，请稍候...</div>';
    resultEl.classList.add('visible');
  }

  setButtonLoading(btn, true, 'AI 处理中');

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'aiGenerate',
      data: {
        type: type,
        content: prompt.user,
        system: prompt.system
      }
    });

    if (response && response.success) {
      const result = response.result;

      // 记录使用次数
      recordUsage();

      // 显示结果
      if (resultEl) {
        resultEl.textContent = result;
        resultEl.classList.add('visible');
      }

      // 处理不同类型的结果
      if (type === 'continue') {
        // 续写结果追加到章节内容
        chapter.content += '\n\n' + result;
        chapter.charCount = chapter.content.length;
        showToast('续写完成，已追加到章节末尾', 'success');
        updateAllPanels();
      } else if (type === 'polish') {
        // 润色结果替换章节内容
        chapter.content = result;
        chapter.charCount = result.length;
        showToast('润色完成，已替换章节内容', 'success');
        updateAllPanels();
      } else if (type === 'title') {
        // 标题结果更新章节标题
        chapter.title = result.replace(/^第[零一二三四五六七八九十百千万\d]+[章节回卷集部篇][：:\s]*/, '') || result;
        showToast('标题生成: ' + chapter.title, 'success');
        updateAllPanels();
      } else if (type === 'outline') {
        showToast('大纲生成完成', 'success');
      }
    } else {
      const errMsg = (response && response.error) || '未知错误';
      if (resultEl) {
        resultEl.innerHTML = '<div class="ai-error">生成失败：' + escapeHtml(errMsg) + '</div>';
        resultEl.classList.add('visible');
      }
      showToast('AI 处理失败: ' + errMsg, 'error');
    }
  } catch (err) {
    if (resultEl) {
      resultEl.innerHTML = '<div class="ai-error">生成出错：' + escapeHtml(err.message) + '</div>';
      resultEl.classList.add('visible');
    }
    showToast('AI 处理出错: ' + err.message, 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

// ============================================
// Works Management
// ============================================
/**
 * 加载作品列表和当前作品 ID，并渲染作品卡片
 * @returns {Promise<void>}
 */
async function loadWorks() {
  try {
    const data = await chromeStorageGet(['works', 'currentWorkId']);
    works = data.works || [];
    currentWorkId = data.currentWorkId || '';

    renderWorkCards();

    // 如果有已选作品，自动展开操作面板
    if (currentWorkId && works.find(w => w.id === currentWorkId)) {
      openActionPanel(currentWorkId);
    }
  } catch (err) {
    log('加载作品列表失败: ' + err.message, 'error');
  }
}

function renderWorkCards() {
  el.worksList.innerHTML = '';

  if (works.length === 0) {
    el.worksEmpty.style.display = 'block';
    return;
  }

  el.worksEmpty.style.display = 'none';

  works.forEach(work => {
    const card = document.createElement('div');
    card.className = 'work-card' + (work.id === currentWorkId ? ' active' : '');
    card.dataset.workId = work.id;

    const volCount = Array.isArray(work.volumes) ? work.volumes.length : (work.volumes || 0);
    const total = work.totalChapters || 0;
    const published = work.publishedChapters || 0;

    card.innerHTML =
      '<div class="work-card-icon">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>' +
          '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' +
        '</svg>' +
      '</div>' +
      '<div class="work-card-info">' +
        '<div class="work-card-name">' + escapeHtml(work.name) + '</div>' +
        '<div class="work-card-meta">' + volCount + ' 分卷 · ' + total + ' 章 · 已发布 ' + published + ' 章</div>' +
      '</div>' +
      '<svg class="work-card-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';

    card.addEventListener('click', () => {
      openActionPanel(work.id);
    });

    el.worksList.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * 打开指定作品的操作面板，更新统计信息和文档链接区
 * @param {string} workId - 作品 ID
 * @returns {Promise<void>}
 */
async function openActionPanel(workId) {
  currentWorkId = workId;
  await chromeStorageSet({ currentWorkId });
  extractedChapters = [];

  // 更新卡片高亮
  document.querySelectorAll('.work-card').forEach(c => {
    c.classList.toggle('active', c.dataset.workId === workId);
  });

  // 显示操作面板
  const work = getCurrentWork();
  if (work) {
    el.actionPanelTitle.textContent = work.name;
    el.actionPanel.style.display = 'block';

    // 更新统计
    const volCount = Array.isArray(work.volumes) ? work.volumes.length : (work.volumes || 0);
    el.statVolumes.textContent = volCount;
    el.statTotal.textContent = work.totalChapters || 0;
    el.statPublished.textContent = work.publishedChapters || 0;
    el.statPending.textContent = Math.max(0, (work.totalChapters || 0) - (work.publishedChapters || 0));

    // 重置文档链接区
    el.docUrlInput.value = '';
    el.docUrlInput.disabled = false;
    el.pasteFallback.style.display = 'none';
    el.docUrlHint.textContent = '';
    el.docUrlHint.className = 'doc-url-hint';

    updateAllPanels();

    // 自动填充文档链接
    await autoFillDocUrl();
  }
}

function closeActionPanel() {
  el.actionPanel.style.display = 'none';
  currentWorkId = '';
  document.querySelectorAll('.work-card').forEach(c => c.classList.remove('active'));
  el.chaptersCard.style.display = 'none';
  updateAllPanels();
}

async function onWorkChange() {
  // 保留此函数以兼容其他调用
}

function getCurrentWork() {
  return works.find(w => w.id === currentWorkId) || null;
}

function updateWorkInfo() {
  const work = getCurrentWork();
  if (work) {
    const volCount = Array.isArray(work.volumes) ? work.volumes.length : (work.volumes || 0);
    el.statVolumes.textContent = volCount;
    el.statTotal.textContent = work.totalChapters || 0;
    el.statPublished.textContent = work.publishedChapters || 0;
    el.statPending.textContent = Math.max(0, (work.totalChapters || 0) - (work.publishedChapters || 0));
  }
}

// ============================================
// Auto Fill Doc URL
// ============================================
async function autoFillDocUrl() {
  const work = getCurrentWork();
  if (!work) return;

  // 检查作品是否有分卷配置
  const volumes = work.volumes;
  if (!Array.isArray(volumes) || volumes.length === 0) {
    return;
  }

  // 查找第一个腾讯文档类型的分卷
  const firstVol = volumes.find(function(v) {
    return v.sourceType === 'tencent_doc' && v.sourceUrl;
  });

  if (firstVol) {
    el.docUrlInput.value = firstVol.sourceUrl;
    el.docUrlInput.disabled = true;
    el.docUrlHint.textContent = '已从分卷配置自动填入: ' + (firstVol.name || '分卷1');
    el.docUrlHint.className = 'doc-url-hint success';
    log('已自动填入分卷文档链接，正在尝试提取...', 'info');

    // 自动尝试提取
    await extractFromTencentDoc();
  }
}

// ============================================
// Chapter Parsing (inline)
// ============================================

/**
 * 自动排版：去多余空行、统一缩进
 */
function autoFormat(text) {
  if (!text) return '';
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.split('\n').map(function(line) { return line.trim(); }).join('\n');
  text = text.replace(/^\uFEFF/, '');
  text = text.replace(/\n+$/, '');
  return text;
}

/**
 * 中文数字转阿拉伯数字（支持到千万）
 */
function chineseToNumber(str) {
  if (!str) return 0;
  var digits = { '零':0,'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9 };
  var units = { '十':10,'百':100,'千':1000,'万':10000 };
  var result = 0, current = 0;
  for (var i = 0; i < str.length; i++) {
    var ch = str[i];
    if (digits[ch] !== undefined) {
      current = digits[ch];
    } else if (units[ch] !== undefined) {
      var unit = units[ch];
      if (unit === 10000) {
        result += (current || 1) * unit;
        current = 0;
      } else {
        if (current === 0) current = 1;
        result += current * unit;
        current = 0;
      }
    }
  }
  result += current;
  return result || 0;
}

function extractChapterNumber(title) {
  if (!title) return null;
  var match = title.match(/第([零一二三四五六七八九十百千万\d]+)[章节回卷集部篇]/);
  if (!match) return null;
  var numStr = match[1];
  if (/^\d+$/.test(numStr)) return parseInt(numStr, 10);
  return chineseToNumber(numStr);
}

/**
 * 解析纯文本内容中的章节标题和正文
 * @param {string} content - 原始文本内容
 * @returns {Array<{index: number, title: string, content: string, charCount: number, status: string}>} 章节数组
 */
function parseChapters(content) {
  if (!content) return [];

  // 0. 自动排版预处理
  content = autoFormat(content);

  // 1. 规范化章节标题格式：确保章节标题独占一行
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

  const MAX_TITLE_CHARS = 20;
  const chapters = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const titleFull = (match[0] || match[1] || '').trim();
    const nextStart = matches[i + 1] ? matches[i + 1].index : content.length;

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

    while (bodyStart < content.length && ' \t\n\r：:'.includes(content[bodyStart])) {
      bodyStart++;
    }

    let body = content.slice(bodyStart, nextStart).trim();
    body = body.replace(/\x0c/g, '').trim();

    const chapterNum = extractChapterNumber(cleanTitle) || (i + 1);
    const normalizedTitle = cleanTitle.replace(/第(\d+)章[：:]/, '第$1章');

    chapters.push({
      index: chapterNum,
      title: normalizedTitle,
      content: body,
      charCount: body.length,
      status: 'pending'
    });
  }

  return chapters;
}

// ============================================
// Extract from Tencent Doc
// ============================================
async function onExtract() {
  await extractFromTencentDoc();
}

/**
 * 从腾讯文档提取章节（通过 background 消息，支持 API 和 content script 两种方式）
 * @returns {Promise<void>}
 */
async function extractFromTencentDoc() {
  setButtonLoading(el.btnExtractInline, true, '提取中');
  showSkeleton(el.chaptersList, 5);
  log('正在从腾讯文档提取章节...', 'info');

  try {
    const response = await chrome.runtime.sendMessage({ action: 'extractChapters' });

    if (response && response.success) {
      const chapters = response.data.chapters || [];
      const source = response.data.source || 'unknown';
      const sourceLabel = source === 'api' ? '腾讯文档 API' : '页面提取';

      if (chapters.length === 0) {
        log('未从腾讯文档中提取到章节', 'warn');
        el.docUrlHint.textContent = '未找到章节，请确认文档包含"第X章"格式';
        el.docUrlHint.className = 'doc-url-hint warn';
        showToast('未提取到章节，请确认文档格式', 'warning');
        return;
      }

      // 检查是否所有章节字数都为 0
      const allZero = chapters.length > 0 && chapters.every(function(ch) {
        return (ch.charCount || 0) === 0;
      });

      if (allZero) {
        log('自动提取的章节字数为 0，可能是文档未完全加载', 'warn');
        el.docUrlHint.textContent = '提取的章节字数为 0，请使用粘贴方式';
        el.docUrlHint.className = 'doc-url-hint warn';
        showToast('章节字数为 0，建议使用粘贴方式', 'warning');

        extractedChapters = chapters.map(function(ch) {
          return { ...ch, status: 'pending' };
        });
        updateAllPanels();
        showPasteFallback();
        return;
      }

      extractedChapters = chapters.map(function(ch) {
        return { ...ch, status: 'pending' };
      });

      log('通过 ' + sourceLabel + ' 提取了 ' + extractedChapters.length + ' 个章节', 'success');
      el.docUrlHint.textContent = '成功提取 ' + extractedChapters.length + ' 个章节';
      el.docUrlHint.className = 'doc-url-hint success';
      showToast('成功提取 ' + extractedChapters.length + ' 个章节', 'success');

      el.pasteFallback.style.display = 'none';
      renderChaptersList();

      const work = getCurrentWork();
      if (work) {
        work.totalChapters = extractedChapters.length;
        work.volumes = response.data.volumeName ? 1 : 0;
        await saveWorks();
      }

      updateAllPanels();
    } else {
      const errMsg = (response && response.error) || '未知错误';
      log('提取失败: ' + errMsg, 'error');
      el.docUrlHint.textContent = '提取失败: ' + errMsg;
      el.docUrlHint.className = 'doc-url-hint warn';
      showToast('提取失败: ' + errMsg, 'error');

      if (errMsg.indexOf('No Tencent Doc tab') !== -1 || errMsg.indexOf('未找到腾讯文档') !== -1) {
        el.docUrlHint.textContent = '请先在浏览器中打开腾讯文档页面';
      }
    }
  } catch (err) {
    log('提取出错: ' + err.message, 'error');
    el.docUrlHint.textContent = '提取出错: ' + err.message;
    el.docUrlHint.className = 'doc-url-hint warn';
    showToast('提取出错: ' + err.message, 'error');
  } finally {
    setButtonLoading(el.btnExtractInline, false);
  }
}

// ============================================
// Paste Fallback
// ============================================
function showPasteFallback() {
  el.pasteFallback.style.display = 'block';
  el.pasteFallbackTextarea.value = '';
  el.pasteFallbackTextarea.focus();
}

function hidePasteFallback() {
  el.pasteFallback.style.display = 'none';
}

async function onPasteExtract() {
  const content = el.pasteFallbackTextarea.value.trim();
  if (!content) {
    log('请先粘贴文档内容', 'warn');
    return;
  }

  log('正在从粘贴内容解析章节...', 'info');
  const chapters = parseChapters(content);

  if (chapters.length === 0) {
    log('未找到章节，请确认文本包含"第X章"格式的标题', 'warn');
    return;
  }

  // 检查字数
  const allZero = chapters.every(function(ch) {
    return (ch.charCount || 0) === 0;
  });

  if (allZero) {
    log('解析到 ' + chapters.length + ' 个章节标题，但内容为空', 'warn');
    log('请确认粘贴的内容包含章节正文', 'warn');
  }

  extractedChapters = chapters;
  log('成功解析 ' + chapters.length + ' 个章节', 'success');

  el.docUrlHint.textContent = '从粘贴内容解析了 ' + chapters.length + ' 个章节';
  el.docUrlHint.className = 'doc-url-hint success';

  // Update work info
  const work = getCurrentWork();
  if (work) {
    work.totalChapters = chapters.length;
    await saveWorks();
  }

  hidePasteFallback();
  updateAllPanels();
}

// ============================================
// Publish Preview
// ============================================
/**
 * 发布前预览确认
 * 当 confirmBeforePublish 设置开启时弹出确认框；
 * 当关闭时跳过确认直接返回 true。
 * @param {Array} chapters - 待发布章节列表
 * @returns {Promise<boolean>} 用户是否确认发布
 */
async function showPublishPreview(chapters) {
  // 读取 confirmBeforePublish 设置
  let needConfirm = true; // 默认需要确认
  try {
    const resp = await chrome.runtime.sendMessage({ action: 'getSettings' });
    if (resp && resp.success && resp.data && resp.data.globalSettings) {
      // confirmBeforePublish 为 true 时才弹出确认（默认 false，即不弹）
      needConfirm = resp.data.globalSettings.confirmBeforePublish === true;
    }
  } catch (_e) {
    // 读取失败时保持默认行为（弹出确认）
  }

  if (!needConfirm) return true;

  const totalWords = chapters.reduce((sum, ch) => sum + (ch.wordCount || ch.charCount || 0), 0);
  const confirmed = confirm('即将发布 ' + chapters.length + ' 章，约 ' + totalWords + ' 字\n\n确认发布吗？');
  return confirmed;
}

// ============================================
// Publish
// ============================================
/**
 * 发布章节（显示预览确认后通过 background 执行发布）
 * @param {Array} [chapters] - 可选，待发布章节列表；不传则使用当前选中章节
 * @returns {Promise<void>}
 */
async function onPublish(chapters) {
  if (!chapters || chapters.length === 0) {
    chapters = getSelectedChapters();
  }

  if (chapters.length === 0) {
    showToast('请先选择要发布的章节', 'warning');
    return;
  }

  const confirmed = await showPublishPreview(chapters);
  if (!confirmed) return;

  isPublishing = true;
  isPaused = false;
  updateActionButtons();

  // Mark chapters as publishing
  chapters.forEach(function(ch) {
    const target = extractedChapters.find(function(c) { return c.index === ch.index; });
    if (target) target.status = 'publishing';
  });
  renderChaptersList();

  log('开始发布 ' + chapters.length + ' 个章节...', 'info');

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'publishChapters',
      chapters: chapters
    });

    if (response && response.success) {
      log('发布任务已提交，正在后台执行...', 'success');
      startWeakPoll(chapters.length);
    } else {
      const errMsg = (response && response.error) || '未知错误';
      log('发布失败: ' + errMsg, 'error');
      chapters.forEach(function(ch) {
        const target = extractedChapters.find(function(c) { return c.index === ch.index; });
        if (target) target.status = 'error';
      });
      renderChaptersList();
      isPublishing = false;
      updateActionButtons();
    }
  } catch (err) {
    log('发布出错: ' + err.message, 'error');
    isPublishing = false;
    updateActionButtons();
  }
}

/**
 * 暂停/恢复发布队列
 * @returns {Promise<void>}
 */
async function onPause() {
  isPaused = !isPaused;
  el.btnPause.innerHTML = isPaused
    ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> 继续'
    : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> 暂停';

  try {
    await chrome.runtime.sendMessage({
      action: isPaused ? 'pausePublish' : 'resumePublish'
    });
    log(isPaused ? '已暂停发布' : '已继续发布', 'info');
  } catch (err) {
    log('操作失败: ' + err.message, 'error');
  }
}

/**
 * 弱轮询兜底：仅在长时间未收到后台消息时触发一次状态同步
 * 主路径是消息驱动（publishProgress / publishComplete）
 */
let _pollTimer = null;
let _lastProgressTime = 0;
const POLL_INTERVAL_MS = 8000;
const POLL_TIMEOUT_MS = 30000;

function startWeakPoll(total) {
  _lastProgressTime = Date.now();
  if (_pollTimer) clearInterval(_pollTimer);

  _pollTimer = setInterval(async () => {
    if (!isPublishing) {
      clearInterval(_pollTimer);
      _pollTimer = null;
      return;
    }

    const sinceLast = Date.now() - _lastProgressTime;
    // 只有超过阈值才主动查一次，避免常规情况下重复请求
    if (sinceLast < POLL_TIMEOUT_MS) return;

    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
      if (response && response.success) {
        const data = response.data;
        if (!data.isPublishing) {
          handlePublishComplete({ total: total });
          clearInterval(_pollTimer);
          _pollTimer = null;
          return;
        }
        const completed = total - (data.totalChapters - data.currentChapterIndex);
        log('发布进度: ' + completed + '/' + total, 'info');
      }
    } catch (_err) {
      // 静默失败，避免日志噪音
    }
  }, POLL_INTERVAL_MS);
}

function stopWeakPoll() {
  if (_pollTimer) {
    clearInterval(_pollTimer);
    _pollTimer = null;
  }
}

function handlePublishProgress(request) {
  _lastProgressTime = Date.now();
  const current = request.current;
  const total = request.total;

  // 演练模式标记
  if (request.dryRun) {
    log('[演练] ' + current + '/' + total + ' 流程验证通过', 'info');
  } else {
    log('发布进度: ' + current + '/' + total, 'info');
  }

  // Update chapter status
  for (let i = 0; i < current && i < extractedChapters.length; i++) {
    if (extractedChapters[i].status === 'publishing') {
      extractedChapters[i].status = request.dryRun ? 'dry-run' : 'published';
    }
  }
  renderChaptersList();
}

function handlePublishComplete(request) {
  stopWeakPoll();
  const total = request.total || extractedChapters.filter(function(c) { return c.status === 'publishing'; }).length;

  // Mark all publishing chapters as published
  extractedChapters.forEach(function(ch) {
    if (ch.status === 'publishing') {
      ch.status = 'published';
    }
  });

  isPublishing = false;
  isPaused = false;

  // Update work
  const work = getCurrentWork();
  if (work) {
    work.publishedChapters = (work.publishedChapters || 0) + (request.successCount || 0);
    saveWorks();
  }

  log('发布完成! 本次发布 ' + total + ' 章', 'success');
  updateAllPanels();
  renderChaptersList();
}

// ============================================
// Chapters List
// ============================================
function getSelectedChapters() {
  const checkboxes = el.chaptersList.querySelectorAll('input[type="checkbox"]:checked');
  const indices = Array.from(checkboxes).map(function(cb) { return parseInt(cb.dataset.index, 10); });
  return extractedChapters.filter(function(ch) { return indices.includes(ch.index); });
}

function onSelectAll() {
  const checked = el.selectAll.checked;
  const checkboxes = el.chaptersList.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(function(cb) { cb.checked = checked; });
  updateSelectedInfo();
}

function onChapterCheckboxChange() {
  // Update select-all state
  const all = el.chaptersList.querySelectorAll('input[type="checkbox"]');
  const checked = el.chaptersList.querySelectorAll('input[type="checkbox"]:checked');
  el.selectAll.checked = all.length > 0 && all.length === checked.length;
  updateSelectedInfo();
}

function updateSelectedInfo() {
  const selected = getSelectedChapters();
  const totalWords = selected.reduce(function(sum, ch) { return sum + (ch.charCount || 0); }, 0);
  el.selectedInfo.textContent = '已选 ' + selected.length + ' 章，共 ' + totalWords.toLocaleString() + ' 字';
  el.btnPublish.disabled = selected.length === 0 || isPublishing;
  updateBatchCount();
}

/**
 * 更新批量选择计数显示
 * @returns {void}
 */
function updateBatchCount() {
  const selected = extractedChapters.filter(ch => ch.selected).length;
  const total = extractedChapters.length;
  if (el.batchCount) {
    el.batchCount.textContent = '已选 ' + selected + '/' + total + ' 章';
  }
}

function renderChapterItem(ch) {
  const statusClass = ch.status || 'pending';
  const statusText = {
    'pending': '待发布',
    'published': '已发布',
    'publishing': '发布中',
    'error': '失败',
    'dry-run': '演练'
  }[statusClass] || '待发布';

  const checked = ch.selected ? 'checked' : (statusClass === 'pending' ? 'checked' : '');
  const isZero = (ch.charCount || 0) === 0;
  const wordCountClass = isZero ? 'chapter-wordcount zero' : 'chapter-wordcount';

  return '<div class="chapter-item">' +
    '<input type="checkbox" data-index="' + ch.index + '" ' + checked + ' ' +
      (statusClass === 'published' ? 'disabled' : '') + '>' +
    '<span class="chapter-num">第' + ch.index + '章</span>' +
    '<span class="chapter-title" title="' + escapeHtml(ch.title) + '">' + escapeHtml(ch.title) + '</span>' +
    '<span class="' + wordCountClass + '">' + (ch.charCount || 0).toLocaleString() + '字</span>' +
    '<span class="chapter-status ' + statusClass + '">' + statusText + '</span>' +
  '</div>';
}

/**
 * 渲染章节列表（支持分批渲染避免阻塞主线程）
 * @param {Array} [chapters] - 可选，传入时更新全局 extractedChapters
 * @returns {Promise<void>}
 */
async function renderChaptersList(chapters) {
  if (chapters) {
    extractedChapters = chapters;
  }

  if (extractedChapters.length === 0) {
    el.chaptersCard.style.display = 'none';
    return;
  }

  el.chaptersCard.style.display = 'block';
  if (el.chaptersCount) {
    el.chaptersCount.textContent = '共 ' + extractedChapters.length + ' 章';
  }

  // 状态筛选
  const filterValue = el.btnStatusFilter ? el.btnStatusFilter.value : 'all';
  const filtered = filterValue === 'all'
    ? extractedChapters
    : extractedChapters.filter(ch => ch.status === filterValue);

  // 显示/隐藏重试失败按钮
  if (el.btnRetryFailed) {
    const failedCount = extractedChapters.filter(ch => ch.status === 'error').length;
    el.btnRetryFailed.style.display = failedCount > 0 ? '' : 'none';
  }

  const BATCH_SIZE = 50;
  el.chaptersList.innerHTML = '';

  for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
    const batch = filtered.slice(i, i + BATCH_SIZE);
    const html = batch.map(function(ch) { return renderChapterItem(ch); }).join('');
    el.chaptersList.insertAdjacentHTML('beforeend', html);

    // 每批渲染后让出主线程
    if (i + BATCH_SIZE < filtered.length) {
      await new Promise(function(r) { requestAnimationFrame(r); });
    }
  }

  // Bind checkbox events
  el.chaptersList.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
    cb.addEventListener('change', onChapterCheckboxChange);
  });

  updateSelectedInfo();
}

// ============================================
// UI Updates
// ============================================
function updateAllPanels() {
  updateWorkInfo();
  renderChaptersList();
  updateActionButtons();
}

function updateActionButtons() {
  const hasSelected = getSelectedChapters().length > 0;

  el.btnPublish.disabled = !hasSelected || isPublishing;
  el.btnPause.style.display = isPublishing ? 'flex' : 'none';

  if (isPublishing) {
    el.btnExtractInline.disabled = true;
  } else {
    el.btnExtractInline.disabled = false;
  }
}

// ============================================
// Log (console only, no UI panel)
// ============================================
function log(message, type) {
  type = type || 'info';
  const now = new Date();
  const time = now.toLocaleTimeString('zh-CN', { hour12: false });
  console.log('[' + time + '] [' + type + '] ' + message);
}

// ============================================
// Fanqie Login Status
// ============================================
async function checkFanqieLoginStatus() {
  try {
    // 先读缓存
    const cached = await chromeStorageGet(['fanqieLoggedIn', 'fanqieLoginTime']);
    if (cached.fanqieLoggedIn) {
      updateLoginUI(true);
      return;
    }

    // 通过 background 检测 cookie
    const response = await chrome.runtime.sendMessage({ action: 'checkFanqieLogin' });
    if (response && response.loggedIn) {
      updateLoginUI(true);
    }
  } catch (_e) {
    // 静默失败
  }
}

// 初始化

function updateLoginUI(loggedIn) {
  if (loggedIn) {
    if (el.fanqieLoginText) el.fanqieLoginText.textContent = '已登录';
    if (el.btnFanqieLogin) el.btnFanqieLogin.classList.add('logged-in');
    if (el.quickFanqieDesc) el.quickFanqieDesc.textContent = '已登录 ✓';
    if (el.quickFanqieDesc) el.quickFanqieDesc.style.color = 'var(--success)';
  }
}

// ============================================
// Inline Prompt (no alert/prompt)
// ============================================
function promptInline(message) {
  return new Promise(function(resolve) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;';

    const dialog = document.createElement('div');
    dialog.style.cssText = 'background:#1E1B18;border-radius:14px;padding:20px;width:300px;box-shadow:0 8px 32px rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.06);';

    const label = document.createElement('div');
    label.style.cssText = 'color:#e0e0e0;font-size:13px;margin-bottom:12px;';
    label.textContent = message;

    const input = document.createElement('input');
    input.type = 'text';
    input.style.cssText = 'width:100%;padding:9px 12px;background:#1A1714;border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#F0E8E0;font-size:13px;outline:none;font-family:inherit;box-sizing:border-box;';
    input.placeholder = '请输入...';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;margin-top:12px;justify-content:flex-end;';

    const btnCancel = document.createElement('button');
    btnCancel.textContent = '取消';
    btnCancel.style.cssText = 'padding:7px 16px;background:transparent;border:1px solid rgba(255,255,255,0.06);border-radius:24px;color:#A89E94;cursor:pointer;font-size:12px;font-family:inherit;';
    btnCancel.onclick = function() { document.body.removeChild(overlay); resolve(null); };

    const btnOk = document.createElement('button');
    btnOk.textContent = '确定';
    btnOk.style.cssText = 'padding:7px 16px;background:linear-gradient(135deg,#FF9A76,#FF7A59);border:none;border-radius:24px;color:#fff;cursor:pointer;font-size:12px;font-family:inherit;font-weight:500;';
    btnOk.onclick = function() {
      const val = input.value.trim();
      document.body.removeChild(overlay);
      resolve(val || null);
    };

    btnRow.appendChild(btnCancel);
    btnRow.appendChild(btnOk);
    dialog.appendChild(label);
    dialog.appendChild(input);
    dialog.appendChild(btnRow);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Focus input
    setTimeout(function() { input.focus(); }, 50);

    // Enter key to confirm
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') btnOk.click();
      if (e.key === 'Escape') btnCancel.click();
    });

    // Click overlay to cancel
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) btnCancel.click();
    });
  });
}

// Async onAddWork using promptInline
function onAddWorkClick() {
  promptInline('请输入新作品名称').then(name => {
    if (!name) return;
    doAddWork(name);
  });
}

async function doAddWork(name) {
  const newWork = {
    id: 'work_' + Date.now(),
    name: name,
    volumes: [],
    totalChapters: 0,
    publishedChapters: 0,
    createdAt: Date.now()
  };

  works.push(newWork);
  currentWorkId = newWork.id;

  await chromeStorageSet({ works: works, currentWorkId: currentWorkId });
  renderWorkCards();
  openActionPanel(currentWorkId);
  updateAllPanels();
  log('已添加作品: ' + name, 'success');
}

// ============================================
// UI Utilities - 加载态、Toast、防抖节流
// ============================================

/**
 * 设置按钮加载态
 * @param {HTMLElement} btn - 按钮元素
 * @param {boolean} loading - 是否加载中
 * @param {string} [loadingText] - 加载中显示的文字
 */
function setButtonLoading(btn, loading, loadingText) {
  if (!btn) return;
  if (loading) {
    btn._originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.classList.add('btn-loading');
    const text = loadingText || btn.textContent.trim();
    btn.innerHTML = '<svg class="spin-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>' + text;
  } else {
    btn.disabled = false;
    btn.classList.remove('btn-loading');
    if (btn._originalHtml) {
      btn.innerHTML = btn._originalHtml;
      delete btn._originalHtml;
    }
  }
}

/**
 * 显示骨架屏
 * @param {HTMLElement} container - 容器元素
 * @param {number} [count=3] - 骨架屏行数
 */
function showSkeleton(container, count) {
  count = count || 3;
  if (!container) return;
  container.innerHTML = Array(count).fill('<div class="skeleton" style="height:40px;margin-bottom:8px;"></div>').join('');
}

/**
 * 隐藏骨架屏并显示内容
 * @param {HTMLElement} container - 容器元素
 * @param {string} content - HTML 内容
 */
function hideSkeleton(container, content) {
  if (!container) return;
  container.innerHTML = content || '';
}

/**
 * Toast 通知（替代 alert）
 * @param {string} message - 消息内容
 * @param {string} [type='info'] - 类型: success / error / warning / info
 * @param {number} [duration=3000] - 显示时长(ms)
 */
function showToast(message, type, duration) {
  type = type || 'info';
  duration = duration || 3000;

  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const toast = document.createElement('div');
  toast.className = 'toast-item toast-' + type;
  toast.innerHTML =
    '<span class="toast-icon">' + (icons[type] || icons.info) + '</span>' +
    '<span class="toast-message">' + escapeHtml(message) + '</span>' +
    '<button class="toast-close" title="关闭">×</button>' +
    '<div class="toast-progress"></div>';

  toast.querySelector('.toast-close').addEventListener('click', function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(function() { toast.remove(); }, 300);
  });

  container.appendChild(toast);

  requestAnimationFrame(function() {
    toast.classList.add('toast-show');
  });

  setTimeout(function() {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(function() { toast.remove(); }, 300);
    }
  }, duration);
}

/**
 * 操作确认对话框
 * @param {string} message - 确认消息
 * @returns {Promise<boolean>}
 */
function confirmAction(message) {
  return new Promise(function(resolve) {
    resolve(confirm(message));
  });
}

/**
 * 防抖函数
 */
function debounce(fn, delay) {
  var timer = null;
  return function() {
    var context = this;
    var args = arguments;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function() { fn.apply(context, args); }, delay);
  };
}

/**
 * 节流函数
 */
function throttle(fn, limit) {
  var lastCall = 0;
  return function() {
    var now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, arguments);
    }
  };
}

// ============================================
// Utilities
// ============================================
/**
 * 从 chrome.storage.sync 读取数据
 * @param {string|string[]} keys - 键名或键名数组
 * @returns {Promise<Object>} 存储数据对象
 */
function chromeStorageGet(keys) {
  return new Promise(function(resolve) {
    chrome.storage.sync.get(keys, function(result) { resolve(result); });
  });
}

/**
 * 写入数据到 chrome.storage.sync
 * @param {Object} data - 要写入的键值对
 * @returns {Promise<void>}
 */
function chromeStorageSet(data) {
  return new Promise(function(resolve) {
    chrome.storage.sync.set(data, function() { resolve(); });
  });
}

/**
 * 保存作品数据到 chrome.storage.sync
 * @returns {Promise<void>}
 */
function saveWorks() {
  chromeStorageSet({ works: works });
}

// ============================================
// ZIP Upload & Parse
// ============================================

// 最小 ZIP 解析器（支持 STORE 和 DEFLATE）
/**
 * 解析 ZIP 文件（支持 STORE 和 DEFLATE 压缩，自动检测 UTF-8/GBK 编码）
 * @param {ArrayBuffer} arrayBuffer - ZIP 文件的 ArrayBuffer
 * @returns {Promise<Array<{name: string, content: string}>>} 解析出的文件列表
 * @throws {Error} 无效的 ZIP 文件时抛出异常
 */
async function parseZipFile(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const files = [];

  // 查找 End of Central Directory
  let eocdOffset = -1;
  for (let i = bytes.length - 22; i >= 0; i--) {
    if (bytes[i] === 0x50 && bytes[i+1] === 0x4b && bytes[i+2] === 0x05 && bytes[i+3] === 0x06) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error('无效的 ZIP 文件');

  const cdOffset = bytes[eocdOffset + 16] | (bytes[eocdOffset + 17] << 8) |
                   (bytes[eocdOffset + 18] << 16) | (bytes[eocdOffset + 19] << 24);
  const cdEntries = bytes[eocdOffset + 10] | (bytes[eocdOffset + 11] << 8);

  let offset = cdOffset;
  for (let i = 0; i < cdEntries; i++) {
    if (bytes[offset] !== 0x50 || bytes[offset+1] !== 0x4b || bytes[offset+2] !== 0x01 || bytes[offset+3] !== 0x02) break;

    const compressionMethod = bytes[offset + 10] | (bytes[offset + 11] << 8);
    const compressedSize = bytes[offset + 20] | (bytes[offset + 21] << 8) |
                           (bytes[offset + 22] << 16) | (bytes[offset + 23] << 24);
    const fileNameLength = bytes[offset + 28] | (bytes[offset + 29] << 8);
    const extraLength = bytes[offset + 30] | (bytes[offset + 31] << 8);
    const commentLength = bytes[offset + 32] | (bytes[offset + 33] << 8);
    const localHeaderOffset = bytes[offset + 42] | (bytes[offset + 43] << 8) |
                              (bytes[offset + 44] << 16) | (bytes[offset + 45] << 24);

    const fileNameBytes = bytes.slice(offset + 46, offset + 46 + fileNameLength);
    const fileName = new TextDecoder('utf-8').decode(fileNameBytes);

    offset += 46 + fileNameLength + extraLength + commentLength;

    // 只处理 .txt 文件
    if (!fileName.toLowerCase().endsWith('.txt') || fileName.startsWith('__MACOSX')) continue;

    // 读取本地文件头，找到数据
    const dataOffset = localHeaderOffset + 30 +
      (bytes[localHeaderOffset + 26] | (bytes[localHeaderOffset + 27] << 8)) +
      (bytes[localHeaderOffset + 28] | (bytes[localHeaderOffset + 29] << 8));

    const compressedData = bytes.slice(dataOffset, dataOffset + compressedSize);

    let content;
    if (compressionMethod === 0) {
      // STORE - 无压缩
      content = compressedData;
    } else if (compressionMethod === 8) {
      // DEFLATE - 使用 DecompressionStream
      try {
        const ds = new DecompressionStream('deflate-raw');
        const writer = ds.writable.getWriter();
        writer.write(compressedData);
        writer.close();
        const reader = ds.readable.getReader();
        const chunks = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        content = new Uint8Array(totalLength);
        let pos = 0;
        for (const chunk of chunks) {
          content.set(chunk, pos);
          pos += chunk.length;
        }
      } catch (e) {
        console.warn('DEFLATE 解压失败:', fileName, e);
        continue;
      }
    } else {
      continue;
    }

    // 尝试 UTF-8 解码，如果出现乱码尝试 GBK
    let text;
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(content);
    } catch (_e) {
      // 尝试 GBK
      try {
        text = new TextDecoder('gbk').decode(content);
      } catch (_e2) {
        text = new TextDecoder('utf-8', { fatal: false }).decode(content);
      }
    }

    files.push({
      name: fileName.replace(/^.*\//, ''),  // 只取文件名
      content: text
    });
  }

  return files;
}

// ============================================
// 通用文件上传处理（.txt / .docx / .zip）
// ============================================

/**
 * 读取文件为文本（自动检测编码，优先 UTF-8，回退 GBK）
 * @param {File} file - 文件对象
 * @returns {Promise<string>} 文件文本内容
 */
async function readFileAsText(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // 优先尝试 UTF-8
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch (_e) {
    // 回退 GBK
    return new TextDecoder('gbk').decode(bytes);
  }
}

/**
 * 从 .docx 文件中提取纯文本（.docx 本质是 ZIP 包，提取 word/document.xml）
 * @param {File} file - .docx 文件对象
 * @returns {Promise<string>} 提取的纯文本内容
 * @throws {Error} DOCX 文件中未找到文档内容时抛出异常
 */
async function extractTextFromDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  const txtFiles = await parseZipFile(arrayBuffer);

  // 查找 word/document.xml
  const docXml = txtFiles.find(function(f) {
    return f.name === 'document.xml' || f.name.endsWith('word/document.xml');
  });

  if (!docXml) {
    // 如果 parseZipFile 没找到（可能文件名匹配不同），直接搜索
    for (const f of txtFiles) {
      if (f.content && f.content.length > 100) {
        return stripXmlTags(f.content);
      }
    }
    throw new Error('DOCX 文件中未找到文档内容');
  }

  return stripXmlTags(docXml.content);
}

/**
 * 去除 XML 标签，提取纯文本
 */
function stripXmlTags(xml) {
  // 将 XML 标签替换为换行（段落标签 <w:p> 等）
  return xml
    .replace(/<w:p[\s>]/g, '\n')       // 段落换行
    .replace(/<w:br\s*\/?>/g, '\n')    // 手动换行
    .replace(/<[^>]+>/g, '')           // 去除所有标签
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\n{3,}/g, '\n\n')        // 合并多余空行
    .trim();
}

/**
 * 通用文件上传处理
 */
async function onFileUpload(file) {
  if (!file) return;

  const ext = file.name.split('.').pop().toLowerCase();
  log('正在处理文件: ' + file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)', 'info');

  try {
    let content = '';
    let sourceLabel = '';

    if (ext === 'txt') {
      // === .txt 文件：直接读取 ===
      content = await readFileAsText(file);
      sourceLabel = 'TXT 文件';

    } else if (ext === 'docx') {
      // === .docx 文件：解析 XML 提取文本 ===
      content = await extractTextFromDocx(file);
      sourceLabel = 'DOCX 文件';

    } else if (ext === 'zip') {
      // === .zip 文件：解压合并所有 txt ===
      const arrayBuffer = await file.arrayBuffer();
      const txtFiles = await parseZipFile(arrayBuffer);

      if (txtFiles.length === 0) {
        log('ZIP 中未找到 .txt 文件', 'warn');
        return;
      }

      log('ZIP 中找到 ' + txtFiles.length + ' 个 txt 文件', 'info');

      for (const f of txtFiles) {
        content += '\n' + f.content;
        log('  - ' + f.name + ' (' + f.content.length + ' 字)', 'info');
      }
      sourceLabel = 'ZIP 压缩包';

    } else {
      log('不支持的文件格式: .' + ext + '，请使用 .txt / .docx / .zip', 'warn');
      return;
    }

    // 验证内容
    if (!content || content.trim().length < 50) {
      log('文件内容为空或过短（' + (content ? content.length : 0) + ' 字）', 'warn');
      return;
    }

    // 解析章节
    const chapters = parseChapters(content);

    if (chapters.length === 0) {
      log('未从文件内容中找到章节标题（第X章格式）', 'warn');
      return;
    }

    extractedChapters = chapters;
    log('从 ' + sourceLabel + ' 解析了 ' + chapters.length + ' 个章节', 'success');

    const totalWords = chapters.reduce(function(sum, ch) { return sum + ch.charCount; }, 0);
    el.docUrlHint.textContent = '从 ' + sourceLabel + ' 解析了 ' + chapters.length + ' 章，共 ' + totalWords.toLocaleString() + ' 字';
    el.docUrlHint.className = 'doc-url-hint success';

    // 隐藏粘贴备用区
    el.pasteFallback.style.display = 'none';

    updateAllPanels();
    await updateStats();
  } catch (err) {
    log('文件处理失败: ' + err.message, 'error');
  }
}

// ============================================
// Stats Panel
// ============================================
/**
 * 更新统计数据面板（作品数、章节数、已发布数、今日发布数）
 * @returns {Promise<void>}
 */
async function updateStats() {
  const data = await chromeStorageGet(['works']);
  const worksList = data.works || [];

  let totalChapters = 0;
  let publishedCount = 0;
  let todayCount = 0;
  const today = new Date().toISOString().slice(0, 10);

  worksList.forEach(function(work) {
    if (work.chapters) {
      totalChapters += work.chapters.length;
      work.chapters.forEach(function(ch) {
        if (ch.published) publishedCount++;
        if (ch.publishDate && ch.publishDate.startsWith(today)) todayCount++;
      });
    }
  });

  if (el.statTotalWorks) el.statTotalWorks.textContent = worksList.length;
  if (el.statTotalChapters) el.statTotalChapters.textContent = totalChapters;
  if (el.statPublishedCount) el.statPublishedCount.textContent = publishedCount;
  if (el.statTodayCount) el.statTodayCount.textContent = todayCount;
}
