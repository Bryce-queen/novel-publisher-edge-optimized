/**
 * 共享国际化工具
 * 优先使用 chrome.i18n，缺失时回退到内置语言包。
 * 通过全局变量 NovelPublisherI18n 暴露。
 */
var NovelPublisherI18n = (function() {
  var DEFAULT_LANG = 'zh';

  var FALLBACK_MESSAGES = {
    'app.title': { zh: '小说发布助手', en: 'Novel Publisher' },
    'btn.settings': { zh: '设置', en: 'Settings' },
    'btn.refreshLogin': { zh: '刷新登录', en: 'Refresh Login' },
    'btn.fanqieLogin': { zh: '番茄小说登录', en: 'Fanqie Login' },
    'btn.save': { zh: '保存设置', en: 'Save Settings' },
    'btn.cancel': { zh: '取消', en: 'Cancel' },
    'btn.confirm': { zh: '确认', en: 'Confirm' },
    'btn.close': { zh: '关闭', en: 'Close' },
    'btn.add': { zh: '添加', en: 'Add' },
    'btn.delete': { zh: '删除', en: 'Delete' },
    'btn.export': { zh: '导出', en: 'Export' },
    'btn.import': { zh: '导入', en: 'Import' },
    'btn.clear': { zh: '清空', en: 'Clear' },
    'btn.test': { zh: '测试连接', en: 'Test Connection' },
    'btn.activate': { zh: '激活', en: 'Activate' },
    'btn.publish': { zh: '发布', en: 'Publish' },
    'btn.pause': { zh: '暂停', en: 'Pause' },
    'btn.extract': { zh: '提取章节', en: 'Extract Chapters' },
    'quick.fanqie': { zh: '番茄平台', en: 'Fanqie Platform' },
    'quick.fanqie.desc': { zh: '作者后台', en: 'Author Dashboard' },
    'quick.doc': { zh: '腾讯文档', en: 'Tencent Docs' },
    'quick.upload': { zh: '文件上传', en: 'File Upload' },
    'works.title': { zh: '我的作品', en: 'My Works' },
    'works.empty': { zh: '还没有添加作品', en: 'No works yet' },
    'works.empty.hint': { zh: '点击上方按钮添加你的第一本小说', en: 'Click the button above to add your first novel' },
    'works.add': { zh: '添加作品', en: 'Add Work' },
    'works.stats.volumes': { zh: '分卷', en: 'Volumes' },
    'works.stats.total': { zh: '章节', en: 'Chapters' },
    'works.stats.published': { zh: '已发', en: 'Published' },
    'works.stats.pending': { zh: '待发', en: 'Pending' },
    'ai.title': { zh: 'AI 写作助手', en: 'AI Writing Assistant' },
    'ai.tab.outline': { zh: '大纲', en: 'Outline' },
    'ai.tab.continue': { zh: '续写', en: 'Continue' },
    'ai.tab.polish': { zh: '润色', en: 'Polish' },
    'ai.tab.title': { zh: '标题', en: 'Title' },
    'ai.usage': { zh: '剩余 {used}/{total}', en: '{used}/{total} left' },
    'ai.generate': { zh: '生成大纲', en: 'Generate Outline' },
    'ai.continue': { zh: '开始续写', en: 'Start Writing' },
    'ai.polish': { zh: '润色优化', en: 'Polish Content' },
    'ai.titleGen': { zh: '生成标题', en: 'Generate Title' },
    'ai.activate.placeholder': { zh: '输入激活码解锁无限使用', en: 'Enter activation code for unlimited use' },
    'chapters.title': { zh: '章节列表', en: 'Chapter List' },
    'chapters.select.all': { zh: '全选', en: 'Select All' },
    'chapters.select.inverse': { zh: '反选', en: 'Invert' },
    'chapters.select.clear': { zh: '清空', en: 'Clear' },
    'chapters.publish.selected': { zh: '发布选中', en: 'Publish Selected' },
    'chapters.selected': { zh: '已选 {selected}/{total} 章', en: '{selected}/{total} selected' },
    'chapters.empty': { zh: '暂无章节，请先提取内容', en: 'No chapters yet. Extract content first.' },
    'stats.works': { zh: '作品', en: 'Works' },
    'stats.chapters': { zh: '章节', en: 'Chapters' },
    'stats.published': { zh: '已发布', en: 'Published' },
    'stats.today': { zh: '今日', en: 'Today' },
    'setup.api': { zh: 'API 配置', en: 'API Config' },
    'setup.api.desc': { zh: '配置后可直接读取文档内容', en: 'Connect to read document content directly' },
    'setup.fanqie': { zh: '番茄平台', en: 'Fanqie Platform' },
    'setup.fanqie.desc': { zh: '登录后填写作品 ID 关联你的小说', en: 'Login and enter work ID to link your novel' },
    'setup.global': { zh: '全局设置', en: 'Global Settings' },
    'setup.global.desc': { zh: '发布间隔、重试策略等高级选项', en: 'Publish interval, retry strategy and more' },
    'toast.saved': { zh: '设置已保存', en: 'Settings saved' },
    'toast.exported': { zh: '导出成功', en: 'Export successful' },
    'toast.imported': { zh: '导入成功', en: 'Import successful' },
    'toast.cleared': { zh: '数据已清空', en: 'Data cleared' },
    'toast.published': { zh: '发布完成', en: 'Publishing complete' },
    'toast.error': { zh: '操作失败', en: 'Operation failed' },
    'toast.warning': { zh: '请注意', en: 'Attention' },
    'toast.noSelection': { zh: '请先选择要发布的章节', en: 'Please select chapters to publish' },
    'toast.loginRequired': { zh: '请先登录番茄小说', en: 'Please login to Fanqie first' },
    'welcome.title': { zh: '欢迎使用小说发布助手', en: 'Welcome to Novel Publisher' },
    'welcome.subtitle': { zh: '番茄小说自动发布工具，只需 3 步即可开始使用', en: 'Auto-publish tool for Fanqie Novel, get started in 3 steps' },
    'welcome.step1': { zh: '配置内容来源', en: 'Configure Content Source' },
    'welcome.step1.desc': { zh: '连接腾讯文档 API，或使用文件上传 / 手动粘贴', en: 'Connect Tencent Docs API, or use file upload / paste' },
    'welcome.step2': { zh: '登录番茄平台', en: 'Login to Fanqie' },
    'welcome.step2.desc': { zh: '登录番茄小说并填写作品 ID', en: 'Login and enter your work ID' },
    'welcome.step3': { zh: '全局设置', en: 'Global Settings' },
    'welcome.step3.desc': { zh: '发布间隔、重试策略等高级选项', en: 'Publish interval, retry strategy and more' },
    'welcome.start': { zh: '开始配置', en: 'Get Started' },
    'welcome.dontShow': { zh: '不再显示此引导', en: "Don't show again" },
    'welcome.tip1': { zh: '所有数据本地存储，不上传任何第三方服务器', en: 'All data stored locally, no third-party servers' },
    'welcome.tip2': { zh: '内置反检测模式，模拟人类操作行为', en: 'Built-in anti-detection mode simulates human behavior' },
    'welcome.tip3': { zh: '支持 AI 续写、润色、生成标题', en: 'Supports AI continue, polish, and title generation' }
  };

  function getLang() {
    if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getUILanguage) {
      var uiLang = chrome.i18n.getUILanguage();
      return uiLang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
    }
    return DEFAULT_LANG;
  }

  function t(key, substitutions) {
    substitutions = substitutions || {};
    if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getMessage) {
      var msg = chrome.i18n.getMessage(key, substitutions);
      if (msg) return msg;
    }
    var entry = FALLBACK_MESSAGES[key];
    if (!entry) return key;
    var lang = getLang();
    var text = entry[lang] || entry[DEFAULT_LANG] || key;
    Object.keys(substitutions).forEach(function(k) {
      text = text.replace(new RegExp('\\{' + k + '\\}', 'g'), substitutions[k]);
    });
    return text;
  }

  function getCurrentLang() {
    return getLang();
  }

  return { t: t, getCurrentLang: getCurrentLang };
})();
