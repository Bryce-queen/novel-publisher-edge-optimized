# Changelog

## v1.12.1 (2026-06-12)

### 安全修复
- API 凭证加密存储：AES-GCM 加密后存入 sync，明文不再写入 sync
- 加密密钥正确 importKey，修复扩展重启后解密失效问题
- 设置页通过 background getSettings 接口读取已解密配置，不再直接读 sync 密文
- popup 统一走 getSettings 接口，消除直接读 sync 密文字段的链路

### 新功能
- **演练模式**：完整执行发布流程但在最终提交前停止，不真正发布
- **失败快照**：发布失败时自动记录 URL、页面标题、可见按钮、弹窗关键词
- **一键重试失败章节**：popup 中自动检测失败章节，一键选中并重发
- **状态筛选**：章节列表支持按状态（全部/待发布/已发布/失败/演练）筛选
- **导出备份区分**：普通导出不含敏感凭证，完整导出含凭证需确认
- **API Key 显示/隐藏 + 复制**：Access Token 默认遮挡，各字段支持一键复制

### 架构改进
- 抽取 shared/ 共享模块：storage、i18n、parser、utils、fanqie-adapter
- 平台适配层集中管理番茄选择器/关键词/按钮，平台改版只改一处
- schemaVersion + 数据迁移：自动将旧版明文凭证迁移到加密存储
- 解析函数单测 53 个用例（shared/parser.test.js）

### 配置闭环
- antiDetectionMode 接入发布主流程，控制 content script 行为模拟
- confirmBeforePublish 接入发布前确认流程
- logRetentionDays 接入 cleanupOldData，从设置读取保留天数
- 定时发布补全 workConfig（aiGenerated、chaptersPerDay），与手动发布一致

### 稳定性
- 轮询改为消息驱动 + 弱轮询兜底
- 清除 :has-text() 伪选择器，统一用原生 DOM 查询
- manifest 收窄 content_scripts 注入范围，避免脚本冲突
- storage.get(null) 改为按 key 精准读取（导出/备份场景除外）

## v1.12.0 (2026-06-10)

### 初始版本
- 番茄小说自动发布（支持批量、定时、暂停/恢复）
- 腾讯文档 API 连接提取章节
- ZIP/TXT 文件上传
- AI 辅助创作（大纲、续写、润色、标题生成）
- 多作品管理
- 数据加密（可选）
- 中英文国际化
