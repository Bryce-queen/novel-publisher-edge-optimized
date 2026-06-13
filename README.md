# 小说发布助手 (Novel Publisher Assistant)

一个浏览器扩展，用于从腾讯文档自动提取小说章节并批量发布到番茄小说平台。支持 Manifest V3，兼容 Chrome 和 Edge。

## 功能

- **章节提取**：从腾讯文档智能识别章节标题和正文，支持中文数字章节号
- **批量发布**：选中多个章节一键发布，支持暂停/恢复
- **定时发布**：设置定时任务，自动按计划发布
- **演练模式**：完整执行发布流程但在最终提交前停止，用于验证选择器和流程
- **失败快照**：发布失败时自动记录页面环境（URL、按钮、弹窗），便于排错
- **一键重试**：快速选中所有失败章节重新发布
- **状态筛选**：按状态（待发布/已发布/失败/演练）过滤章节列表
- **AI 辅助**：集成 DeepSeek/豆包/OpenAI，支持大纲生成、续写、润色、标题生成
- **多作品管理**：支持多个番茄小说作品切换
- **数据安全**：API 凭证 AES-256 加密存储，导出备份可区分是否包含敏感数据
- **反检测**：模拟人类行为（随机延迟、鼠标移动），降低被平台检测风险
- **国际化**：支持中文和英文

## 安装

### Chrome / Edge

1. 下载并解压扩展源码
2. 打开扩展管理页面：
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展"
5. 选择本项目根目录

### Firefox

本项目使用 `importScripts`（Service Worker），Firefox MV2 兼容层有限支持。建议使用 Chrome 或 Edge。

## 使用

### 快速开始

1. **配置 API 凭证**：打开设置页 → 填写腾讯文档开放平台的 Client ID、Access Token、Open ID
2. **配置作品**：添加番茄小说作品，填入作品 ID（从番茄创作后台 URL 获取）
3. **提取章节**：在 popup 中输入腾讯文档链接或上传 ZIP/TXT 文件
4. **发布**：选中章节 → 点击发布

### 演练模式

在设置页开启"演练模式"后，发布流程会完整执行到填写内容阶段，但在点击"下一步"提交前停止。适合在修改选择器或发布逻辑后验证流程完整性，不会真正发布任何内容。

### 数据备份

- **普通导出**：不含 API 凭证密文，适合日常备份
- **完整导出**：含加密凭证，适合设备迁移

## 项目结构

```
novel-publisher-edge/
├── manifest.json              # MV3 扩展配置
├── background/
│   └── background.js          # Service Worker（发布队列、定时任务、AI、数据迁移）
├── content_scripts/
│   ├── tencent_doc.js         # 腾讯文档页面：章节提取
│   ├── fanqie_editor.js       # 番茄编辑器页面：自动填写+发布
│   └── fanqie_manager.js      # 番茄管理页面：已发布章节检测、分卷管理
├── popup/
│   ├── popup.html             # 主界面（SidePanel）
│   ├── popup.css
│   └── popup.js
├── options/
│   ├── options.html           # 设置页
│   ├── options.css
│   └── options.js
├── shared/
│   ├── storage.js             # chrome.storage Promise 封装
│   ├── i18n.js                # 国际化工具
│   ├── parser.js              # 章节解析（中文数字、标题提取）
│   ├── utils.js               # 通用工具（Toast、文件下载等）
│   ├── fanqie-adapter.js      # 番茄平台适配层（选择器/关键词集中管理）
│   ├── parser.test.js         # 解析函数单测（53 用例）
│   ├── PROTOCOL.md            # 消息协议文档
│   └── SMOKE_TEST.md          # 冒烟测试清单
├── _locales/
│   ├── zh_CN/messages.json    # 简体中文
│   └── en/messages.json       # 英文
├── icons/
├── CHANGELOG.md               # 变更记录
└── eslint.config.js           # ESLint 配置
```

## 开发

### 代码检查

```bash
# ESLint
npx eslint background/background.js popup/popup.js options/options.js \
  content_scripts/fanqie_editor.js content_scripts/fanqie_manager.js \
  content_scripts/tencent_doc.js shared/*.js

# 语法检查
node --check background/background.js
node --check popup/popup.js
node --check options/options.js
node --check content_scripts/fanqie_editor.js
```

### 单元测试

```bash
node shared/parser.test.js
```

覆盖：`chineseToNumber`（18 用例）、`extractChapterNumber`（13 用例）、`extractVolumeName`（7 用例）、`autoFormat`（3 用例）、`parseChapters`（5 用例 + 边界）。

### 冒烟测试

发版前参照 [shared/SMOKE_TEST.md](shared/SMOKE_TEST.md) 手动过一遍。

### 消息协议

popup、options、background、content scripts 之间的通信协议见 [shared/PROTOCOL.md](shared/PROTOCOL.md)。

## 平台适配

番茄小说的 DOM 结构可能随平台改版而变化。所有平台相关的选择器、弹窗关键词、按钮文本集中在 `shared/fanqie-adapter.js` 中管理。如果番茄后台改版导致发布失败，只需修改此文件。

## 数据迁移

扩展启动时自动检查 `schemaVersion` 并执行迁移：

- **v0 → v1**：将 sync 中的明文 API 凭证迁移到 AES-GCM 加密存储
- **v1 → v2**：补充 `globalSettings` 中的新字段（dryRunMode、confirmBeforePublish 等）

## 权限说明

| 权限 | 用途 |
|------|------|
| `storage` | 存储配置、发布状态、日志 |
| `tabs` | 查找/创建番茄编辑器标签页 |
| `activeTab` | 获取当前活动标签页 |
| `notifications` | 发布完成时发送系统通知 |
| `sidePanel` | 侧边栏面板 |
| `cookies` | 检测番茄小说登录状态 |
| `alarms` | 定时发布、每日备份、数据清理 |

### host_permissions

| 域名 | 用途 |
|------|------|
| `docs.qq.com` | 腾讯文档章节提取 |
| `fanqienovel.com` | 番茄小说编辑器/管理页 |
| `*.fanqienovel.com` | 番茄子域名 |
| `open.bigmodel.cn` | 智谱 AI API 调用 |

## 注意事项

1. 使用前请确保已登录番茄小说作家后台
2. 腾讯文档需要有访问权限
3. 发布过程中请勿关闭浏览器
4. 建议先开启演练模式测试流程，确认无误后再正式发布
5. 首次使用建议先测试单章发布

## 隐私

- API 凭证使用 AES-256-GCM 加密后存储在 `chrome.storage.sync`，密钥存储在 `chrome.storage.local`
- 发布日志和章节缓存在本地存储，不上传任何数据到第三方服务器
- 导出备份时可选择是否包含敏感凭证

## 许可证

MIT License
