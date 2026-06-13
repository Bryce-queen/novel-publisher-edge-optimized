/**
 * 番茄小说平台适配层
 * 集中管理所有平台相关的选择器、弹窗关键词、按钮定位逻辑。
 * 平台 DOM 改版时只需修改此文件。
 *
 * 通过全局变量 FanqieAdapter 暴露。
 */
var FanqieAdapter = (function() {
  // ============================================================
  // 一、DOM 选择器（优先级从高到低）
  // ============================================================
  var SELECTORS = {
    // 章节序号输入框
    chapterNumber: [
      '.serial-editor-title-left [contenteditable]',
      'input[class*="chapter-num"]',
      'input[class*="chapterNum"]',
      'input[type="text"][class*="num"]'
    ],

    // 章节标题输入框
    title: [
      '.serial-editor-title-left [contenteditable]',
      'input[class*="title"]',
      'input[class*="chapter-title"]',
      'input[type="text"][class*="title"]'
    ],

    // 正文编辑器
    content: [
      'div.serial-editor-content .ProseMirror[contenteditable="true"]',
      'div.serial-editor-container .ProseMirror[contenteditable="true"]',
      'div.ProseMirror[contenteditable="true"]',
      '.ProseMirror[contenteditable="true"]',
      'div[contenteditable="true"][class*="editor"]',
      'div[contenteditable="true"][class*="content"]',
      'div[contenteditable="true"][role="textbox"]',
      'div[role="textbox"][contenteditable="true"]',
      'div[contenteditable="true"]'
    ],

    // 保存草稿按钮
    saveDraft: [
      'button.auto-editor-save',
      'div.publish-header-right button',
      'button[class*="save"]',
      'button[class*="draft"]'
    ],

    // 下一步按钮
    nextStep: [
      'div.publish-header-right button.auto-editor-next',
      'button.auto-editor-next',
      'div.publish-header-right button[class*="next"]',
      'button[class*="next"]'
    ],

    // 提交按钮
    submit: [
      'div.publish-header-right button[class*="submit"]',
      'button.auto-editor-next',
      'button[class*="submit"]'
    ],

    // 确认发布按钮
    publishConfirm: [
      'button[class*="confirm"]',
      'button[class*="publish"]'
    ],

    // AI 生成选项
    aiOption: [
      'div[class*="ai"]',
      'div[class*="AI"]'
    ]
  };

  // ============================================================
  // 二、状态检测关键词
  // ============================================================
  var KEYWORDS = {
    draftSaved: ['保存成功', '草稿已保存', '已保存', '保存中'],
    publishSuccess: ['发布成功', '发布完成', '章节发布成功', '提交成功'],
    publishFail: ['发布失败', '提交失败', '操作失败', '服务器错误', '网络异常'],
    contentDetect: ['请选择内容检测方式', '内容检测方式', '选择检测方式'],
    typoWarning: ['错别字', '疑似错别字', '文字错误', '拼写检查'],
    riskDetect: ['风险检测', '内容风险', '违规内容', '审核不通过', '敏感内容'],
    guide: ['新手引导', '功能介绍', '操作指引', '教程']
  };

  // ============================================================
  // 三、按钮文本匹配（弱匹配兜底）
  // ============================================================
  var BUTTON_TEXTS = {
    saveDraft: ['保存草稿', '存草稿'],
    nextStep: ['下一步'],
    submit: ['提交'],
    publishConfirm: ['确认发布', '确认'],
    aiOption: ['AI']
  };

  // ============================================================
  // 四、平台 URL 模式
  // ============================================================
  var URLS = {
    editor: 'https://fanqienovel.com/main/writer/',
    manager: 'https://fanqienovel.com/main/writer/chapter-manage',
    login: 'https://fanqienovel.com/'
  };

  // ============================================================
  // 五、单章发布超时（毫秒）
  // ============================================================
  var PUBLISH_TIMEOUT = 120000;

  return {
    SELECTORS: SELECTORS,
    KEYWORDS: KEYWORDS,
    BUTTON_TEXTS: BUTTON_TEXTS,
    URLS: URLS,
    PUBLISH_TIMEOUT: PUBLISH_TIMEOUT
  };
})();
