# 消息协议 (Message Protocol)

本文档列出 popup、options、background、content scripts 之间所有 `chrome.runtime.sendMessage` / `chrome.tabs.sendMessage` 的 action、请求参数和返回结构。

---

## 一、Popup/Options → Background

### getSettings
获取全部设置（API 凭证已解密）。
- **请求**: `{ action: 'getSettings' }`
- **响应**: `{ success: true, data: { currentWorkId, works, globalSettings, apiSkipped, dataEncryption, tencentDocClientId, tencentDocAccessToken, tencentDocOpenId } }`

### saveSettings
保存全部设置（API 凭证会被加密存储）。
- **请求**: `{ action: 'saveSettings', data: { currentWorkId, works, globalSettings, tencentDocClientId, tencentDocAccessToken, tencentDocOpenId } }`
- **响应**: `{ success: true }`

### getStatus
获取当前发布状态。
- **请求**: `{ action: 'getStatus' }`
- **响应**: `{ success: true, data: { isPublishing, isPaused, currentChapterIndex, totalChapters, successCount, failCount } }`

### publishChapters
提交批量发布任务。
- **请求**: `{ action: 'publishChapters', chapters: Array<Chapter>, workConfig?: Object }`
- **响应**: `{ success: true, data: { message, total } }`

### pausePublish / resumePublish
暂停/恢复发布队列。
- **请求**: `{ action: 'pausePublish' }` / `{ action: 'resumePublish' }`
- **响应**: `{ success: true }`

### switchWork
切换当前作品。
- **请求**: `{ action: 'switchWork', workId: string }`
- **响应**: `{ success: true }`

### getWorkStatus
获取当前作品状态。
- **请求**: `{ action: 'getWorkStatus' }`
- **响应**: `{ success: true, data: { currentWorkId, work } }`

### extractFromDoc
从腾讯文档提取章节。
- **请求**: `{ action: 'extractFromDoc', url: string }`
- **响应**: `{ success: true, data: { chapters } }`

### parseLocalFile
解析本地文件（ZIP/TXT）。
- **请求**: `{ action: 'parseLocalFile', content: string, filename: string }`
- **响应**: `{ success: true, data: { chapters, volumes } }`

### parsePasteText
解析粘贴的文本。
- **请求**: `{ action: 'parsePasteText', text: string }`
- **响应**: `{ success: true, data: { chapters } }`

### aiGenerate
调用 AI 生成内容。
- **请求**: `{ action: 'aiGenerate', type: 'outline'|'continue'|'polish'|'title', context: string }`
- **响应**: `{ success: true, data: { content } }`

### aiTestConfig
测试 AI 配置连通性。
- **请求**: `{ action: 'aiTestConfig', config: { aiProvider, aiApiUrl, aiApiKey, aiModel } }`
- **响应**: `{ success: true, data: { message } }`

### checkFanqieLogin
检查番茄小说登录状态。
- **请求**: `{ action: 'checkFanqieLogin' }`
- **响应**: `{ success: true, data: { loggedIn, loginTime } }`

### openOptions / openFanqieLogin
打开设置页 / 番茄登录页。
- **请求**: `{ action: 'openOptions' }` / `{ action: 'openFanqieLogin' }`
- **响应**: `{ success: true }`

---

## 二、Background → Content Scripts (fanqie_editor.js)

### publishChapter
发布单章到番茄编辑器。
- **请求**: `{ action: 'publishChapter', chapter: { index, title, content, charCount }, config: { bookId, aiGenerated, antiDetectionMode, dryRunMode } }`
- **响应**: `{ success: true, dryRun?: boolean, snapshot?: Object }` 或 `{ success: false, error: string, snapshot?: Object }`

### switchVolume
切换分卷。
- **请求**: `{ action: 'switchVolume', volumeName: string }`
- **响应**: `{ success: true }`

### getEditorStatus
获取编辑器当前状态。
- **请求**: `{ action: 'getEditorStatus' }`
- **响应**: `{ success: true, data: { url, title, hasContent, hasTitle } }`

### handleModals
手动触发弹窗处理。
- **请求**: `{ action: 'handleModals', config: Object }`
- **响应**: `{ success: true, data: { handled: boolean } }`

---

## 三、Background → Content Scripts (fanqie_manager.js)

### detectPublishedChapters
检测已发布章节列表。
- **请求**: `{ action: 'detectPublishedChapters' }`
- **响应**: `{ success: true, data: { chapters: Array } }`

### getVolumes
获取分卷列表。
- **请求**: `{ action: 'getVolumes' }`
- **响应**: `{ success: true, data: { volumes: Array } }`

### switchToVolume
切换到指定分卷。
- **请求**: `{ action: 'switchToVolume', volumeName: string }`
- **响应**: `{ success: true }`

### getAllVolumeChapters
获取所有分卷的章节。
- **请求**: `{ action: 'getAllVolumeChapters' }`
- **响应**: `{ success: true, data: { volumes: Array<{name, chapters}> } }`

### createVolume
创建新分卷。
- **请求**: `{ action: 'createVolume', volumeName: string }`
- **响应**: `{ success: true }`

### clickNewChapter
点击"新建章节"按钮。
- **请求**: `{ action: 'clickNewChapter' }`
- **响应**: `{ success: true }`

### getManagerStatus
获取管理页状态。
- **请求**: `{ action: 'getManagerStatus' }`
- **响应**: `{ success: true, data: { bookId, currentVolume, chapterCount } }`

---

## 四、Background → Content Scripts (tencent_doc.js)

### extractChapters
从腾讯文档页面提取章节内容。
- **请求**: `{ action: 'extractChapters' }`
- **响应**: `{ success: true, data: { chapters: Array<{title, content, charCount}> } }`

### getDocInfo
获取文档基本信息。
- **请求**: `{ action: 'getDocInfo' }`
- **响应**: `{ success: true, data: { title, url } }`

### scrollToLoad
滚动加载更多内容。
- **请求**: `{ action: 'scrollToLoad' }`
- **响应**: `{ success: true }`

---

## 五、Background → Popup (广播)

### publishProgress
发布进度更新。
- **数据**: `{ action: 'publishProgress', current, total, chapterIndex, chapterTitle, success, dryRun?, error? }`

### publishComplete
发布完成。
- **数据**: `{ action: 'publishComplete', total, successCount, failCount }`

### extractProgress
提取进度更新。
- **数据**: `{ action: 'extractProgress', current, total, chapterTitle }`

---

## 六、Content Scripts → Background

### contentScriptReady
content script 注入完成通知。
- **请求**: `{ action: 'contentScriptReady', type: 'editor'|'manager'|'tencentDoc' }`

---

## 数据结构

### Chapter
```
{
  index: number,        // 章节序号
  title: string,       // 章节标题
  content: string,     // 章节正文
  charCount: number,   // 字数
  selected?: boolean,  // 是否选中（popup 用）
  status?: string      // 'pending' | 'published' | 'publishing' | 'error' | 'dry-run'
}
```

### Work
```
{
  id: string,              // 作品 ID
  name: string,            // 作品名称
  fanqieBookId: string,    // 番茄作品 ID
  aiGenerated: boolean,    // 是否 AI 生成标记
  chaptersPerDay: number,  // 每日发布章数
  createdAt: number        // 创建时间戳
}
```

### GlobalSettings
```
{
  autoCloseModals: boolean,      // 自动关闭弹窗
  autoRetry: boolean,            // 自动重试
  retryCount: number,            // 重试次数
  confirmBeforePublish: boolean, // 发布前确认
  antiDetectionMode: boolean,    // 反检测模式
  dryRunMode: boolean,           // 演练模式
  publishIntervalMin: number,    // 发布最小间隔（秒）
  publishIntervalMax: number,    // 发布最大间隔（秒）
  logRetentionDays: number,      // 日志保留天数
  aiProvider: string,            // AI 服务商
  aiApiUrl: string,              // AI API 地址
  aiApiKey: string,              // AI API Key
  aiModel: string                // AI 模型名
}
```

### PublishState
```
{
  isPublishing: boolean,
  isPaused: boolean,
  currentChapterIndex: number,
  totalChapters: number,
  successCount: number,
  failCount: number,
  currentWorkId: string,
  startTime: number,
  chapters?: Array<Chapter>
}
```

### PageSnapshot（失败快照）
```
{
  trigger: string,           // 触发原因
  phase: string,             // 当前阶段
  url: string,               // 页面 URL
  title: string,             // 页面标题
  timestamp: number,         // 时间戳
  visibleButtons: Array<{text, class, id}>,  // 可见按钮
  modalKeywords: Array<string>                // 弹窗关键词
}
```
