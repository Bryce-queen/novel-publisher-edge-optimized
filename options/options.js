/**
 * 小说发布助手 - 设置页面脚本
 * 引导式步骤配置：API -> 番茄平台 -> 全局设置
 */

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

// ========================================
// 应用状态
// ========================================
let appState = {
  currentWorkId: null,
  works: [],
  globalSettings: {
    autoCloseModals: true,
    autoRetry: true,
    retryCount: 2,
    confirmBeforePublish: false,
    antiDetectionMode: true,
    dryRunMode: false,
    publishIntervalMin: 30,
    publishIntervalMax: 60,
    logRetentionDays: 30,
    aiProvider: 'deepseek',
    aiApiUrl: '',
    aiApiKey: '',
    aiModel: ''
  },
  apiSkipped: false,
  aiActivated: false
};

// ========================================
// 激活码常量（预留空对象，后续手动管理）
// ========================================
const ACTIVATION_CODES = {};

// 发布状态（从 chrome.storage.local 加载）
let publishState = {};
let publishLog = [];

// 模态框回调
let confirmCallback = null;

// ========================================
// DOM 元素引用
// ========================================
const $ = (id) => document.getElementById(id);

const els = {
  // 作品列表（步骤 2 内联）
  worksList: $('worksList'),
  btnAddWork: $('btnAddWork'),
  workFanqieUrl: $('workFanqieUrl'),
  workFanqieUrlError: $('workFanqieUrlError'),
  workName: $('workName'),
  workChaptersPerDay: $('workChaptersPerDay'),
  workAiGenerated: $('workAiGenerated'),

  // 全局设置（步骤 3）
  autoCloseModals: $('autoCloseModals'),
  autoRetry: $('autoRetry'),
  retryCount: $('retryCount'),
  publishIntervalMin: $('publishIntervalMin'),
  publishIntervalMax: $('publishIntervalMax'),
  logRetentionDays: $('logRetentionDays'),
  confirmBeforePublish: $('confirmBeforePublish'),
  antiDetectionMode: $('antiDetectionMode'),
  dryRunMode: $('dryRunMode'),

  // AI 配置（步骤 3）
  aiProvider: $('aiProvider'),
  aiApiUrl: $('aiApiUrl'),
  aiApiKey: $('aiApiKey'),
  aiModel: $('aiModel'),
  btnTestAi: $('btnTestAi'),
  aiTestResult: $('aiTestResult'),

  // 激活码管理（步骤 3）
  activationCode: $('activationCode'),
  btnActivate: $('btnActivate'),
  activationStatus: $('activationStatus'),
  aiActivated: $('aiActivated'),

  // 腾讯文档 API 配置（步骤 1）
  tencentDocClientId: $('tencentDocClientId'),
  tencentDocAccessToken: $('tencentDocAccessToken'),
  tencentDocOpenId: $('tencentDocOpenId'),
  btnTestApi: $('btnTestApi'),
  apiTestResult: $('apiTestResult'),

  // 数据管理
  btnExportData: $('btnExportData'),
  btnImportData: $('btnImportData'),
  importFile: $('importFile'),
  btnClearData: $('btnClearData'),

  // 数据加密开关
  dataEncryption: $('dataEncryption'),

  // 保存
  btnSave: $('btnSave'),
  saveStatus: $('saveStatus'),

  // 确认对话框
  confirmModal: $('confirmModal'),
  confirmTitle: $('confirmTitle'),
  confirmMessage: $('confirmMessage'),
  confirmModalClose: $('confirmModalClose'),
  btnConfirmCancel: $('btnConfirmCancel'),
  btnConfirmOk: $('btnConfirmOk'),

  // Toast
  toastContainer: $('toastContainer')
};

// ========================================
// 初始化
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
  await loadLanguage();
  bindEvents();
  await loadSettings();
});

function bindEvents() {
  // 语言切换
  const btnSwitchLang = $('btnSwitchLang');
  if (btnSwitchLang) {
    btnSwitchLang.addEventListener('click', () => {
      const newLang = currentLang === 'zh' ? 'en' : 'zh';
      switchLanguage(newLang);
    });
  }

  // 步骤折叠/展开（通过 data-toggle 属性委托）
  document.querySelectorAll('[data-toggle]').forEach(header => {
    header.addEventListener('click', () => {
      const stepId = header.dataset.toggle;
      toggleStep(stepId);
    });
  });

  // 进度条点击
  document.querySelectorAll('.step-progress-item[data-toggle]').forEach(item => {
    item.addEventListener('click', () => {
      const stepId = item.dataset.toggle;
      toggleStep(stepId);
    });
  });

  // 跳过 API 配置
  $('skipApiLink').addEventListener('click', (e) => {
    e.preventDefault();
    skipApiConfig();
  });

  // 替代方案卡片（通过 data-action 属性委托）
  document.querySelectorAll('.alt-option[data-action]').forEach(card => {
    card.addEventListener('click', () => {
      const action = card.dataset.action;
      switch (action) {
        case 'open-fanqie-login':
          openFanqieLogin();
          break;
        case 'open-file-upload':
          openFileUploadWindow();
          break;
        case 'open-tencent-doc':
          openTencentDoc();
          break;
      }
    });
  });

  // 数据管理折叠/展开
  $('dataHeader').addEventListener('click', toggleDataSection);

  // 步骤 2：添加作品（内联表单）
  els.btnAddWork.addEventListener('click', addWorkFromForm);

  // 步骤 2：前往番茄小说登录按钮
  $('btnGoFanqieLogin').addEventListener('click', openFanqieLogin);

  // 腾讯文档 API 测试连接（步骤 1）
  els.btnTestApi.addEventListener('click', testTencentDocApi);

  // API Key 显示/隐藏 + 复制
  if (els.btnToggleToken) {
    els.btnToggleToken.addEventListener('click', function() {
      var input = els.tencentDocAccessToken;
      if (input.type === 'password') {
        input.type = 'text';
        els.btnToggleToken.textContent = '隐藏';
      } else {
        input.type = 'password';
        els.btnToggleToken.textContent = '显示';
      }
    });
  }
  if (els.btnCopyClientId) {
    els.btnCopyClientId.addEventListener('click', function() {
      navigator.clipboard.writeText(els.tencentDocClientId.value).then(function() {
        showToast('Client ID 已复制', 'success');
      });
    });
  }
  if (els.btnCopyToken) {
    els.btnCopyToken.addEventListener('click', function() {
      navigator.clipboard.writeText(els.tencentDocAccessToken.value).then(function() {
        showToast('Access Token 已复制', 'success');
      });
    });
  }
  if (els.btnCopyOpenId) {
    els.btnCopyOpenId.addEventListener('click', function() {
      navigator.clipboard.writeText(els.tencentDocOpenId.value).then(function() {
        showToast('Open ID 已复制', 'success');
      });
    });
  }

  // AI 配置事件（步骤 3）
  els.aiProvider.addEventListener('change', onAiProviderChange);
  els.btnTestAi.addEventListener('click', testAiConfig);

  // 激活码事件（步骤 3）
  els.btnActivate.addEventListener('click', () => activateCode());

  // 数据管理
  els.btnExportData.addEventListener('click', exportAllData);
  els.btnImportData.addEventListener('click', () => els.importFile.click());
  els.importFile.addEventListener('change', importData);
  els.btnClearData.addEventListener('click', () => {
    showConfirm('清除所有数据', '确定要清除所有数据吗？此操作不可恢复，包括所有作品和发布记录。', clearAllData);
  });

  // 保存
  els.btnSave.addEventListener('click', saveSettings);

  // 确认对话框
  els.confirmModalClose.addEventListener('click', hideConfirm);
  els.btnConfirmCancel.addEventListener('click', hideConfirm);
  els.btnConfirmOk.addEventListener('click', () => {
    hideConfirm();
    if (typeof confirmCallback === 'function') {
      confirmCallback();
      confirmCallback = null;
    }
  });

  // 点击模态框遮罩关闭
  els.confirmModal.addEventListener('click', (e) => {
    if (e.target === els.confirmModal) {
      els.confirmModal.style.display = 'none';
    }
  });

  // 首次使用引导弹窗
  $('btnWelcomeStart').addEventListener('click', closeWelcomeModal);
  $('welcomeModal').addEventListener('click', (e) => {
    if (e.target.id === 'welcomeModal') {
      closeWelcomeModal();
    }
  });

  // 全局快捷键
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S: 保存设置
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveSettings();
    }
  });

  // 表单输入防抖：作品名称
  const debouncedValidateWorkName = debounce((name) => {
    if (!name.trim()) return;
    // 轻量提示，可扩展为实时查重等
  }, 300);
  if (els.workName) {
    els.workName.addEventListener('input', (e) => debouncedValidateWorkName(e.target.value));
  }

  // 表单输入防抖：番茄作品 URL/ID
  const debouncedValidateWorkUrl = debounce((url) => {
    validateWorkUrl(url);
  }, 300);
  if (els.workFanqieUrl) {
    els.workFanqieUrl.addEventListener('input', (e) => debouncedValidateWorkUrl(e.target.value));
  }
}

/**
 * 防抖函数
 * @param {Function} fn - 需要防抖的函数
 * @param {number} delay - 延迟毫秒数
 * @returns {Function} 防抖后的函数
 */
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * 验证番茄作品 URL/ID
 */
function validateWorkUrl(url) {
  if (!url) {
    if (els.workFanqieUrlError) els.workFanqieUrlError.textContent = '';
    return;
  }
  const bookId = url.match(/^\d+$/) ? url : '';
  if (!bookId) {
    if (els.workFanqieUrlError) els.workFanqieUrlError.textContent = '作品 ID 格式不正确，应为纯数字';
  } else {
    if (els.workFanqieUrlError) els.workFanqieUrlError.textContent = '';
  }
}

// ========================================
// 步骤引导功能
// ========================================

/**
 * 更新步骤状态指示器（API配置、作品数量等）
 * @returns {void}
 */
function updateStepStates() {
  // 更新水平进度条
  updateProgressBar();

  // Step 1: API
  const hasApi = appState.tencentDocClientId && appState.tencentDocAccessToken && appState.tencentDocOpenId;
  const step1Indicator = $('step1Indicator');
  const step1Status = $('step1Status');
  const step1Desc = $('step1Desc');
  if (hasApi) {
    step1Indicator.className = 'step-indicator done';
    step1Status.textContent = '已配置';
    step1Status.className = 'step-status done';
    step1Desc.textContent = 'API 已配置，可直接读取文档';
  } else if (appState.apiSkipped) {
    step1Indicator.className = 'step-indicator done';
    step1Status.textContent = '已跳过';
    step1Status.className = 'step-status skip';
    step1Desc.textContent = '使用手动复制方式提取内容';
  }

  // Step 2: Works
  const workCount = appState.works ? appState.works.length : 0;
  const step2Indicator = $('step2Indicator');
  const step2Status = $('step2Status');
  if (workCount > 0) {
    step2Indicator.className = 'step-indicator done';
    step2Status.textContent = workCount + ' 个作品';
    step2Status.className = 'step-status done';
  }
}

/**
 * 切换步骤展开/折叠
 * @param {string} stepId - 步骤 ID（如 'step1'、'step2'、'step3'）
 * @returns {void}
 */
function toggleStep(stepId) {
  const body = $(stepId + 'Body');
  const arrow = body.previousElementSibling.querySelector('.step-arrow');
  if (body.classList.contains('open')) {
    body.classList.remove('open');
    arrow.classList.remove('open');
  } else {
    body.classList.add('open');
    arrow.classList.add('open');
  }
}

/**
 * 更新水平进度条状态（done / active）
 * @returns {void}
 */
function updateProgressBar() {
  const steps = ['step1', 'step2', 'step3'];
  const states = {
    step1: appState.apiConfigured || appState.apiSkipped ? 'done' : (appState.currentStep === 1 ? 'active' : ''),
    step2: appState.works.length > 0 ? 'done' : (appState.currentStep === 2 ? 'active' : ''),
    step3: 'active' // 全局设置始终可访问
  };

  steps.forEach(function(stepId, i) {
    const dot = $('stepProgressDot' + (i + 1));
    const line = $('stepProgressLine' + (i + 1));
    const item = $('stepProgress' + (i + 1));
    if (!dot || !item) return;

    dot.className = 'step-progress-dot';
    item.className = 'step-progress-item';

    if (states[stepId] === 'done') {
      dot.classList.add('done');
      item.classList.add('done');
    } else if (states[stepId] === 'active') {
      dot.classList.add('active');
      item.classList.add('active');
    }

    if (line) {
      line.className = 'step-progress-line';
      if (states[stepId] === 'done') {
        line.classList.add('done');
      }
    }
  });
}

/**
 * 跳过 API 配置
 * 跳过并展开替代方案区域，引导用户使用文件上传或手动复制
 */
function skipApiConfig() {
  appState.apiSkipped = true;
  updateStepStates();

  // 展开替代方案区域（显示番茄登录 + 腾讯文档链接）
  const alternatives = $('step1Alternatives');
  if (alternatives) {
    alternatives.style.display = 'flex';
  }

  // 自动展开步骤 2
  const step2Body = $('step2Body');
  if (!step2Body.classList.contains('open')) toggleStep('step2');
}

/**
 * 打开番茄小说平台登录页
 * 在新标签页中打开，并检测登录状态
 */
async function openFanqieLogin() {
  // 打开番茄小说作家后台
  chrome.tabs.create({ url: 'https://fanqienovel.com/main/writer/' });

  // 提示用户（同时更新步骤1和步骤2中的状态）
  const statusEl = $('fanqieLoginStatus');
  const statusElStep2 = $('fanqieLoginStatusStep2');
  if (statusEl) {
    statusEl.textContent = '已打开番茄小说页面，请在新标签页中登录...';
    statusEl.className = 'alt-desc';
  }
  if (statusElStep2) {
    statusElStep2.textContent = '已打开番茄小说页面，请在新标签页中登录...';
    statusElStep2.className = 'alt-desc';
  }

  // 先立即检测一次（可能已经登录过）
  const immediateResult = await checkFanqieLoginViaCookie();
  if (immediateResult) return;

  // 5 秒后再检测一次（用户可能正在登录）
  setTimeout(async () => {
    try {
      await checkFanqieLoginViaCookie();
    } catch (e) {
      console.warn('番茄登录检测(5s)失败:', e);
    }
  }, 5000);

  // 15 秒后最终检测
  setTimeout(async () => {
    try {
      const localData = await chrome.storage.local.get(['fanqieLoggedIn']);
      if (!localData.fanqieLoggedIn) {
        await checkFanqieLoginViaCookie();
      }
    } catch (e) {
      console.warn('番茄登录检测(15s)失败:', e);
    }
  }, 15000);
}

/**
 * 打开腾讯文档
 */
function openTencentDoc() {
  chrome.tabs.create({ url: 'https://docs.qq.com/' });
}

/**
 * 打开文件上传窗口（popup 页面）
 * 在新标签页中打开 popup，用户可以直接拖拽上传文件
 */
function openFileUploadWindow() {
  // 获取扩展的 popup URL 并在新标签页中打开
  const popupUrl = chrome.runtime.getURL('popup/popup.html');
  chrome.tabs.create({ url: popupUrl });
}

/**
 * 恢复番茄登录缓存状态到 UI
 */
function restoreFanqieLoginStatus(localData) {
  const statusEl = $('fanqieLoginStatus');
  const statusElStep2 = $('fanqieLoginStatusStep2');

  if (localData.fanqieLoggedIn) {
    const loginTime = localData.fanqieLoginTime;
    let timeText = '';
    if (loginTime) {
      try {
        const _d = new Date(loginTime);
        timeText = '（上次验证: ' + formatDate(loginTime) + '）';
      } catch (_e) {
        // ignore
      }
    }
    const text = '已登录番茄小说平台 ' + timeText;
    if (statusEl) {
      statusEl.textContent = text;
      statusEl.className = 'alt-desc logged-in';
    }
    if (statusElStep2) {
      statusElStep2.textContent = text;
      statusElStep2.className = 'alt-desc logged-in';
    }
  } else {
    const text = '点击检测登录状态';
    if (statusEl) {
      statusEl.textContent = text;
      statusEl.className = 'alt-desc';
    }
    if (statusElStep2) {
      statusElStep2.textContent = text;
      statusElStep2.className = 'alt-desc';
    }
  }
}

/**
 * 通过 cookie 检测番茄登录状态
 */
async function checkFanqieLoginViaCookie() {
  const statusEl = $('fanqieLoginStatus');
  const statusElStep2 = $('fanqieLoginStatusStep2');

  try {
    // 尝试多个可能的 cookie 名称
    const cookieNames = ['sessionid', 'session_id', 'passport_csrf_token', 'sid_guard'];
    for (const name of cookieNames) {
      try {
        const cookie = await chrome.cookies.get({ url: 'https://fanqienovel.com', name: name });
        if (cookie && cookie.value && cookie.value.length > 0) {
          await chrome.storage.local.set({
            fanqieLoggedIn: true,
            fanqieLoginTime: new Date().toISOString()
          });
          const text = '已登录番茄小说平台';
          if (statusEl) {
            statusEl.textContent = text;
            statusEl.className = 'alt-desc logged-in';
          }
          if (statusElStep2) {
            statusElStep2.textContent = text;
            statusElStep2.className = 'alt-desc logged-in';
          }
          return true;
        }
      } catch (_e) {
        continue;
      }
    }

    // 没找到任何有效 cookie
    await chrome.storage.local.set({ fanqieLoggedIn: false });
    const text = '未检测到登录，请先在新标签页中登录';
    if (statusEl) {
      statusEl.textContent = text;
      statusEl.className = 'alt-desc not-logged-in';
    }
    if (statusElStep2) {
      statusElStep2.textContent = text;
      statusElStep2.className = 'alt-desc not-logged-in';
    }
    return false;
  } catch (_err) {
    const text = '检测失败，请手动确认登录状态';
    if (statusEl) {
      statusEl.textContent = text;
      statusEl.className = 'alt-desc';
    }
    if (statusElStep2) {
      statusElStep2.textContent = text;
      statusElStep2.className = 'alt-desc';
    }
    return false;
  }
}

/**
 * 切换数据管理区展开/折叠
 */
function toggleDataSection() {
  const body = $('dataBody');
  const arrow = $('dataArrow');
  if (body.style.display === 'none') {
    body.style.display = 'block';
    arrow.classList.add('open');
  } else {
    body.style.display = 'none';
    arrow.classList.remove('open');
  }
}

// ========================================
// 数据加载与保存
// ========================================

/**
 * 从 storage 加载所有数据并渲染 UI
 * API 凭证通过 background 的 getSettings 接口获取（已解密），
 * 避免直接读 sync 里的密文字段。
 * @returns {Promise<void>}
 */
async function loadSettings() {
  try {
    // 通过 background 获取已解密的设置（含 API 凭证明文）
    let decryptedApiConfig = { clientId: '', accessToken: '', openId: '' };
    try {
      const resp = await chrome.runtime.sendMessage({ action: 'getSettings' });
      if (resp && resp.success && resp.data) {
        const d = resp.data;
        appState.currentWorkId = d.currentWorkId || null;
        appState.works = d.works || [];
        appState.globalSettings = Object.assign({
          autoCloseModals: true,
          autoRetry: true,
          retryCount: 2,
          confirmBeforePublish: false,
          antiDetectionMode: true,
          dryRunMode: false,
          publishIntervalMin: 30,
          publishIntervalMax: 60,
          logRetentionDays: 30,
          aiProvider: 'deepseek',
          aiApiUrl: '',
          aiApiKey: '',
          aiModel: ''
        }, d.globalSettings || {});
        appState.apiSkipped = d.apiSkipped || false;
        appState.dataEncryption = d.dataEncryption || false;
        decryptedApiConfig = {
          clientId: d.tencentDocClientId || '',
          accessToken: d.tencentDocAccessToken || '',
          openId: d.tencentDocOpenId || ''
        };
      }
    } catch (e) {
      // background 不可用时回退到直接读 sync（兼容开发模式）
      console.warn('[Options] getSettings 消息失败，回退到直接读取:', e.message);
    }

    // 如果 background 没返回数据（回退路径），从 sync 直接读非敏感字段
    if (!appState.works.length && !appState.currentWorkId) {
      const syncData = await chrome.storage.sync.get([
        'currentWorkId', 'works', 'globalSettings', 'apiSkipped', 'dataEncryption'
      ]);
      appState.currentWorkId = syncData.currentWorkId || null;
      appState.works = syncData.works || [];
      appState.globalSettings = Object.assign(appState.globalSettings, syncData.globalSettings || {});
      appState.apiSkipped = syncData.apiSkipped || false;
      appState.dataEncryption = syncData.dataEncryption || false;
    }

    // 从 local 加载 AI 激活状态
    const aiLocalData = await chrome.storage.local.get(['ai_activated']);
    appState.aiActivated = aiLocalData.ai_activated || false;

    // 从 local 加载发布状态（按 key 精准读取）
    const localData = await chrome.storage.local.get(['publishState', 'publishLog', 'fanqieLoggedIn', 'fanqieLoginTime']);
    publishState = localData.publishState || {};
    publishLog = localData.publishLog || [];

    // 恢复番茄登录缓存状态
    restoreFanqieLoginStatus(localData);

    // 渲染所有内容
    renderGlobalSettings();
    renderWorksList();

    // 使用 background 返回的已解密 API 配置
    appState.tencentDocClientId = decryptedApiConfig.clientId;
    appState.tencentDocAccessToken = decryptedApiConfig.accessToken;
    appState.tencentDocOpenId = decryptedApiConfig.openId;
    els.tencentDocClientId.value = appState.tencentDocClientId;
    els.tencentDocAccessToken.value = appState.tencentDocAccessToken;
    els.tencentDocOpenId.value = appState.tencentDocOpenId;

    // 更新步骤状态
    updateStepStates();

    // 自动展开第一个未完成的步骤
    autoExpandFirstIncompleteStep();

    // 首次使用引导
    checkAndShowWelcome();
  } catch (error) {
    showToast('加载设置失败: ' + error.message, 'error');
  }
}

/**
 * 自动展开第一个未完成的步骤（API未配置展开步骤1，无作品展开步骤2）
 * @returns {void}
 */
function autoExpandFirstIncompleteStep() {
  const hasApi = appState.tencentDocClientId && appState.tencentDocAccessToken && appState.tencentDocOpenId;
  if (!hasApi && !appState.apiSkipped) {
    toggleStep('step1');
    return;
  }
  if (appState.works.length === 0) {
    toggleStep('step2');
    return;
  }
}

/**
 * 保存所有设置到 chrome.storage（包括全局设置、AI配置、API配置等）
 * @returns {Promise<void>}
 */
async function saveSettings() {
  try {
    // 读取全局设置表单
    appState.globalSettings = {
      autoCloseModals: els.autoCloseModals.checked,
      autoRetry: els.autoRetry.checked,
      retryCount: parseInt(els.retryCount.value) || 2,
      confirmBeforePublish: els.confirmBeforePublish.checked,
      antiDetectionMode: els.antiDetectionMode.checked,
      dryRunMode: els.dryRunMode.checked,
      publishIntervalMin: parseInt(els.publishIntervalMin.value) || 30,
      publishIntervalMax: parseInt(els.publishIntervalMax.value) || 60,
      logRetentionDays: parseInt(els.logRetentionDays.value) || 30,
      aiProvider: els.aiProvider.value,
      aiApiUrl: els.aiApiUrl.value.trim(),
      aiApiKey: els.aiApiKey.value.trim(),
      aiModel: els.aiModel.value.trim()
    };

    // 保存到 sync
    await chrome.storage.sync.set({
      currentWorkId: appState.currentWorkId,
      works: appState.works,
      globalSettings: appState.globalSettings,
      apiSkipped: appState.apiSkipped,
      dataEncryption: els.dataEncryption ? els.dataEncryption.checked : false
    });

    // AI 激活状态保存到 local（统一键名 ai_activated）
    await chrome.storage.local.set({ ai_activated: appState.aiActivated });

    // 保存腾讯文档API配置（通过background加密）
    const apiConfig = {
      tencentDocClientId: els.tencentDocClientId.value.trim(),
      tencentDocAccessToken: els.tencentDocAccessToken.value.trim(),
      tencentDocOpenId: els.tencentDocOpenId.value.trim()
    };
    appState.tencentDocClientId = apiConfig.tencentDocClientId;
    appState.tencentDocAccessToken = apiConfig.tencentDocAccessToken;
    appState.tencentDocOpenId = apiConfig.tencentDocOpenId;
    try {
      await chrome.runtime.sendMessage({
        action: 'saveApiConfig',
        data: apiConfig
      });
    } catch(e) {
      console.warn('API配置加密保存失败:', e);
    }

    // 同时将AI配置提升到sync顶层，供popup和background直接读取
    await chrome.storage.sync.set({
      aiProvider: appState.globalSettings.aiProvider || 'deepseek',
      aiApiUrl: appState.globalSettings.aiApiUrl || '',
      aiApiKey: appState.globalSettings.aiApiKey || '',
      aiModel: appState.globalSettings.aiModel || ''
    });

    // 更新步骤状态
    updateStepStates();

    showSaveStatus('设置已保存', false);
    showToast('设置保存成功', 'success');
  } catch (error) {
    showSaveStatus('保存失败: ' + error.message, true);
    showToast('保存失败: ' + error.message, 'error');
  }
}

// ========================================
// 作品管理（内联表单）
// ========================================

/**
 * 从内联表单添加作品
 * @returns {void}
 */
function addWorkFromForm() {
  const fanqieUrl = els.workFanqieUrl.value.trim();

  if (!fanqieUrl) {
    els.workFanqieUrlError.textContent = '请输入作品 ID';
    els.workFanqieUrl.focus();
    return;
  }

  // 作品 ID 直接使用输入值（纯数字）
  const bookId = fanqieUrl.match(/^\d+$/) ? fanqieUrl : '';

  if (!bookId) {
    els.workFanqieUrlError.textContent = '作品 ID 格式不正确，应为纯数字（如 7356123456789）';
    els.workFanqieUrl.focus();
    return;
  }

  els.workFanqieUrlError.textContent = '';

  const name = els.workName.value.trim() || ('作品_' + bookId);
  const chaptersPerDay = parseInt(els.workChaptersPerDay.value) || 3;
  const aiGenerated = els.workAiGenerated.checked;

  const work = {
    id: 'work_' + Date.now(),
    name: name,
    fanqieUrl: 'https://fanqienovel.com/main/writer/chapter-manage/' + bookId,
    fanqieBookId: bookId,
    chaptersPerDay: chaptersPerDay,
    aiGenerated: aiGenerated,
    createdAt: new Date().toISOString()
  };

  addWork(work);

  // 清空表单
  els.workFanqieUrl.value = '';
  els.workName.value = '';
  els.workChaptersPerDay.value = 3;
  els.workAiGenerated.checked = true;

  showToast('作品已创建', 'success');
}

/**
 * 创建新作品并添加到列表
 * @param {Object} work - 作品数据对象
 * @returns {void}
 */
function addWork(work) {
  appState.works.push(work);
  // 如果是第一个作品，自动设为当前
  if (appState.works.length === 1) {
    appState.currentWorkId = work.id;
  }
  renderWorksList();
  updateStepStates();
}

function updateWork(id, updates) {
  const idx = appState.works.findIndex(w => w.id === id);
  if (idx !== -1) {
    appState.works[idx] = Object.assign({}, appState.works[idx], updates);
    renderWorksList();
  }
}

/**
 * 删除指定作品，若为当前作品则自动切换
 * @param {string} id - 作品 ID
 * @returns {Promise<void>}
 */
async function deleteWork(id) {
  appState.works = appState.works.filter(w => w.id !== id);
  // 如果删除的是当前作品，切换到第一个
  if (appState.currentWorkId === id) {
    appState.currentWorkId = appState.works.length > 0 ? appState.works[0].id : null;
  }
  // 清理发布状态
  delete publishState[id];
  renderWorksList();
  updateStepStates();
  // 异步清理 local storage
  await chrome.storage.local.set({ publishState: publishState });
}

/**
 * 设置当前使用的作品
 * @param {string} id - 作品 ID
 * @returns {void}
 */
function setCurrentWork(id) {
  appState.currentWorkId = id;
  renderWorksList();
  updateStepStates();
}

/**
 * 获取当前作品
 */
function getCurrentWork() {
  if (!appState.currentWorkId) return null;
  return appState.works.find(w => w.id === appState.currentWorkId) || null;
}

/**
 * 获取作品的统计信息
 */
function getWorkStats(work) {
  // 从发布状态中获取已发布章节数
  const state = publishState[work.id];
  let publishedCount = 0;
  if (state && state.chapters) {
    publishedCount = Object.values(state.chapters).filter(c => c.status === 'published').length;
  }

  return {
    publishedChapters: publishedCount
  };
}

/**
 * 渲染作品列表（步骤 2 内联），包含设为当前和删除操作
 * @returns {void}
 */
function renderWorksList() {
  if (appState.works.length === 0) {
    els.worksList.innerHTML = '';
    return;
  }

  els.worksList.innerHTML = appState.works.map(work => {
    const isCurrent = work.id === appState.currentWorkId;
    const stats = getWorkStats(work);

    // 显示作品 ID
    const bookIdDisplay = work.fanqieBookId || '';

    return '<div class="work-item' + (isCurrent ? ' current' : '') + '" data-id="' + work.id + '">' +
      '<div class="work-item-info">' +
        '<div class="work-item-name">' +
          escapeHtml(work.name) +
          (isCurrent ? '<span class="work-current-badge">当前使用</span>' : '') +
        '</div>' +
        '<div class="work-item-meta">' +
          (bookIdDisplay ? '<span>作品ID: ' + escapeHtml(bookIdDisplay) + '</span>' : '') +
          '<span>已发布: ' + stats.publishedChapters + ' 章</span>' +
        '</div>' +
      '</div>' +
      '<div class="work-item-actions">' +
        '<button class="btn btn-sm btn-secondary" data-action="set-current" data-id="' + work.id + '"' +
          (isCurrent ? ' disabled' : '') + '>设为当前</button>' +
        '<button class="btn btn-sm btn-danger" data-action="delete-work" data-id="' + work.id + '">删除</button>' +
      '</div>' +
    '</div>';
  }).join('');

  // 绑定事件委托
  els.worksList.onclick = function(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;

    switch (action) {
      case 'set-current':
        setCurrentWork(id);
        showToast('已切换当前作品', 'success');
        break;
      case 'delete-work': {
        const work = appState.works.find(w => w.id === id);
        showConfirm('删除作品', '确定要删除作品"' + (work ? work.name : '') + '"吗？关联的发布记录也将被删除。', () => {
          deleteWork(id);
          showToast('作品已删除', 'success');
        });
        break;
      }
    }
  };
}

// ========================================
// 全局设置渲染
// ========================================

/**
 * 渲染全局设置表单（将 appState.globalSettings 填充到 UI 控件）
 * @returns {void}
 */
function renderGlobalSettings() {
  els.autoCloseModals.checked = appState.globalSettings.autoCloseModals !== false;
  els.autoRetry.checked = appState.globalSettings.autoRetry !== false;
  els.retryCount.value = appState.globalSettings.retryCount || 2;
  els.confirmBeforePublish.checked = appState.globalSettings.confirmBeforePublish === true;
  els.antiDetectionMode.checked = appState.globalSettings.antiDetectionMode !== false;
  els.dryRunMode.checked = appState.globalSettings.dryRunMode === true;
  els.publishIntervalMin.value = appState.globalSettings.publishIntervalMin || 30;
  els.publishIntervalMax.value = appState.globalSettings.publishIntervalMax || 60;
  els.logRetentionDays.value = appState.globalSettings.logRetentionDays || 30;

  // AI 配置渲染
  els.aiProvider.value = appState.globalSettings.aiProvider || 'deepseek';
  els.aiApiUrl.value = appState.globalSettings.aiApiUrl || '';
  els.aiApiKey.value = appState.globalSettings.aiApiKey || '';
  els.aiModel.value = appState.globalSettings.aiModel || '';

  // 激活码状态渲染
  updateActivationStatus();

  // 数据加密开关渲染
  if (els.dataEncryption) {
    els.dataEncryption.checked = appState.dataEncryption === true;
  }
}

// ========================================
// AI 配置逻辑
// ========================================

const AI_PROVIDER_PRESETS = {
  deepseek: { url: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-chat' },
  doubao: { url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', model: 'doubao-pro-32k' },
  zhipu: { url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', model: 'glm-4.7-flash' },
  openai: { url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-3.5-turbo' },
  custom: { url: '', model: '' }
};

/**
 * AI 服务商切换时自动填充预设的 API URL 和模型名称
 * @returns {void}
 */
function onAiProviderChange() {
  const provider = els.aiProvider.value;
  const preset = AI_PROVIDER_PRESETS[provider];
  if (preset && preset.url) {
    els.aiApiUrl.value = preset.url;
    els.aiModel.value = preset.model;
  }
}

/**
 * 测试 AI 配置连接（通过 background 发送测试请求）
 * @returns {Promise<void>}
 */
async function testAiConfig() {
  const apiUrl = els.aiApiUrl.value.trim();
  const apiKey = els.aiApiKey.value.trim();
  const model = els.aiModel.value.trim();

  if (!apiUrl || !apiKey) {
    els.aiTestResult.textContent = '请填写 API 地址和密钥';
    els.aiTestResult.className = 'form-hint error';
    return;
  }

  els.aiTestResult.textContent = '测试中...';
  els.aiTestResult.className = 'form-hint';

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'aiTestConfig',
      data: { apiUrl, apiKey, model }
    });

    if (response && response.success) {
      els.aiTestResult.textContent = '连接成功！模型: ' + (response.model || model);
      els.aiTestResult.className = 'form-hint';
    } else {
      els.aiTestResult.textContent = '连接失败: ' + (response ? response.error : '未知错误');
      els.aiTestResult.className = 'form-hint error';
    }
  } catch (error) {
    els.aiTestResult.textContent = '测试异常: ' + error.message;
    els.aiTestResult.className = 'form-hint error';
  }
}

// ========================================
// 激活码逻辑
// ========================================

/**
 * 验证激活码并更新 AI 激活状态
 * @returns {Promise<void>}
 */
async function activateCode() {
  const code = els.activationCode.value.trim();
  if (!code) {
    els.activationStatus.textContent = '请输入激活码';
    els.activationStatus.className = 'form-hint error';
    return;
  }

  // 验证激活码
  if (ACTIVATION_CODES[code]) {
    appState.aiActivated = true;
    // 立即保存到 local 持久化（统一键名）
    await chrome.storage.local.set({ ai_activated: true });
    els.activationStatus.textContent = '激活成功！AI 写作助手已解锁';
    els.activationStatus.className = 'form-hint';
    updateActivationStatus();
    showToast('激活成功', 'success');
  } else {
    appState.aiActivated = false;
    els.activationStatus.textContent = '激活码无效，请检查后重试';
    els.activationStatus.className = 'form-hint error';
    updateActivationStatus();
    showToast('激活码无效', 'error');
  }
}

function updateActivationStatus() {
  els.aiActivated.checked = appState.aiActivated === true;
  if (appState.aiActivated) {
    els.activationStatus.textContent = 'AI 写作助手已激活';
    els.activationStatus.className = 'form-hint';
  } else {
    els.activationStatus.textContent = '';
  }
}

// ========================================
// 确认对话框
// ========================================

function showConfirm(title, message, callback) {
  els.confirmTitle.textContent = title;
  els.confirmMessage.textContent = message;
  confirmCallback = callback;
  els.confirmModal.style.display = 'flex';
}

function hideConfirm() {
  els.confirmModal.style.display = 'none';
  confirmCallback = null;
}

// ========================================
// 数据管理
// ========================================

/**
 * 导出全部数据为 JSON 备份文件（包含 sync 和 local 存储）
 * @returns {Promise<void>}
 */
async function exportAllData() {
  try {
    const includeCredentials = confirm(
      '导出数据选项：\n\n' +
      '点击"确定"：完整导出（包含 API 凭证密文）\n' +
      '点击"取消"：普通导出（不含敏感凭证）\n\n' +
      '建议：日常备份选择"取消"，迁移设备时选择"确定"。'
    );

    const syncData = await chrome.storage.sync.get(null);
    const localData = await chrome.storage.local.get(null);

    // 普通导出：移除敏感字段
    if (!includeCredentials) {
      delete syncData.apiConfigEncrypted;
      delete syncData.apiConfigIv;
      delete localData.novel_publisher_enc_key;
    }

    const exportData = {
      _meta: {
        type: 'novel-publisher-backup',
        version: '2.0',
        schemaVersion: 2,
        exportDate: new Date().toISOString(),
        includeCredentials: includeCredentials
      },
      sync: syncData,
      local: localData
    };

    downloadFile(
      JSON.stringify(exportData, null, 2),
      'novel-publisher-backup-' + new Date().toISOString().split('T')[0] + '.json',
      'application/json'
    );

    showToast(includeCredentials ? '完整备份已导出（含凭证）' : '普通备份已导出（不含凭证）', 'success');
  } catch (error) {
    showToast('导出失败: ' + error.message, 'error');
  }
}

/**
 * 从 JSON 备份文件导入数据（覆盖当前所有数据）
 * @param {Event} event - 文件选择事件
 * @returns {Promise<void>}
 */
async function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    showConfirm('导入数据', '导入将覆盖当前所有数据，确定要继续吗？', async () => {
      try {
        if (data.sync) {
          await chrome.storage.sync.set(data.sync);
        }
        if (data.local) {
          await chrome.storage.local.set(data.local);
        }

        await loadSettings();
        showToast('数据导入成功', 'success');
      } catch (error) {
        showToast('导入失败: ' + error.message, 'error');
      }
    });
  } catch (error) {
    showToast('文件解析失败: ' + error.message, 'error');
  }

  // 重置文件输入
  event.target.value = '';
}

/**
 * 清除所有数据（sync 和 local 存储），重置应用状态
 * @returns {Promise<void>}
 */
async function clearAllData() {
  try {
    await chrome.storage.sync.clear();
    await chrome.storage.local.clear();

    appState.currentWorkId = null;
    appState.works = [];
    appState.globalSettings = {
      autoCloseModals: true,
      autoRetry: true,
      retryCount: 2,
      confirmBeforePublish: false,
      antiDetectionMode: true,
      dryRunMode: false,
      publishIntervalMin: 30,
      publishIntervalMax: 60,
      logRetentionDays: 30
    };
    appState.apiSkipped = false;
    appState.dataEncryption = false;
    appState.tencentDocClientId = '';
    appState.tencentDocAccessToken = '';
    appState.tencentDocOpenId = '';
    appState.aiActivated = false;
    publishState = {};
    publishLog = [];

    renderGlobalSettings();
    renderWorksList();
    updateStepStates();

    // 清空表单
    els.tencentDocClientId.value = '';
    els.tencentDocAccessToken.value = '';
    els.tencentDocOpenId.value = '';
    els.workFanqieUrl.value = '';
    els.workName.value = '';
    els.workChaptersPerDay.value = 3;
    els.workAiGenerated.checked = true;
    els.aiProvider.value = 'deepseek';
    els.aiApiUrl.value = '';
    els.aiApiKey.value = '';
    els.aiModel.value = '';
    els.activationCode.value = '';
    if (els.dataEncryption) els.dataEncryption.checked = false;
    updateActivationStatus();

    showToast('所有数据已清除', 'success');
  } catch (error) {
    showToast('清除失败: ' + error.message, 'error');
  }
}

// ========================================
// 工具函数
// ========================================

/**
 * 格式化日期
 */
function formatDate(isoString) {
  if (!isoString) return '未知';
  try {
    const d = new Date(isoString);
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0') + ' ' +
      String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0');
  } catch (_e) {
    return '未知';
  }
}

/**
 * HTML 转义
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 下载文件
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 显示保存状态
 */
function showSaveStatus(message, isError) {
  els.saveStatus.textContent = message;
  els.saveStatus.className = 'save-status' + (isError ? ' error' : '');
  setTimeout(() => {
    els.saveStatus.textContent = '';
  }, 3000);
}

/**
 * Toast 通知
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

// ========================================
// 首次使用引导
// ========================================

/**
 * 检查是否需要显示首次使用引导弹窗（首次安装且无配置数据时显示）
 * @returns {Promise<void>}
 */
async function checkAndShowWelcome() {
  try {
    const data = await chrome.storage.local.get(['welcomeDismissed']);
    if (data.welcomeDismissed) return;

    // 如果已有配置数据（非首次安装），不显示
    const syncData = await chrome.storage.sync.get(['works', 'apiConfigEncrypted']);
    if (syncData.works && syncData.works.length > 0) return;
    if (syncData.apiConfigEncrypted) return;

    // 显示引导弹窗
    $('welcomeModal').style.display = 'flex';
  } catch (_e) {
    // 静默失败
  }
}

/**
 * 关闭首次使用引导弹窗，可选"不再显示"
 * @returns {Promise<void>}
 */
async function closeWelcomeModal() {
  const dontShow = $('welcomeDontShow').checked;
  $('welcomeModal').style.display = 'none';

  if (dontShow) {
    await chrome.storage.local.set({ welcomeDismissed: true });
  }

  // 自动展开第一个未完成的步骤
  autoExpandFirstIncompleteStep();
}

// ========================================
// 腾讯文档 API 测试连接
// ========================================

/**
 * 测试腾讯文档 API 连接（发送 GET 请求验证 Client ID / Token / Open ID）
 * @returns {Promise<void>}
 */
async function testTencentDocApi() {
  const clientId = els.tencentDocClientId.value.trim();
  const accessToken = els.tencentDocAccessToken.value.trim();
  const openId = els.tencentDocOpenId.value.trim();

  if (!clientId || !accessToken || !openId) {
    els.apiTestResult.textContent = '请填写完整的 API 配置';
    els.apiTestResult.className = 'form-hint error';
    return;
  }

  els.apiTestResult.textContent = '测试中...';
  els.apiTestResult.className = 'form-hint';

  try {
    const response = await fetch('https://docs.qq.com/openapi/doc/v3/test', {
      method: 'GET',
      headers: {
        'Access-Token': accessToken,
        'Client-Id': clientId,
        'Open-Id': openId
      }
    });

    if (response.ok || response.status === 400) {
      // 400 说明 API 配置正确，只是 fileId 不对
      els.apiTestResult.textContent = '连接成功！API 配置有效';
      els.apiTestResult.className = 'form-hint';
    } else if (response.status === 401) {
      els.apiTestResult.textContent = '认证失败，请检查 Token';
      els.apiTestResult.className = 'form-hint error';
    } else {
      els.apiTestResult.textContent = '连接异常 (HTTP ' + response.status + ')';
      els.apiTestResult.className = 'form-hint error';
    }
  } catch (error) {
    els.apiTestResult.textContent = '网络错误: ' + error.message;
    els.apiTestResult.className = 'form-hint error';
  }
}

/**
 * 设置按钮加载态
 */
function setButtonLoading(btn, loading, text) {
  if (!btn) return;
  if (loading) {
    btn._orig = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = text || '处理中...';
  } else {
    btn.disabled = false;
    if (btn._orig) { btn.innerHTML = btn._orig; delete btn._orig; }
  }
}
