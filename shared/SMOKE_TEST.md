# 冒烟测试清单

每次发新版前，手动过一遍以下测试项。

## 基础功能

- [ ] 扩展安装后 popup 正常打开，无 JS 报错
- [ ] 设置页正常打开，所有表单可交互
- [ ] 切换中英文语言，UI 文案正确切换

## 腾讯文档提取

- [ ] 打开腾讯文档链接，点击"提取章节"
- [ ] 章节列表正确显示（标题、字数）
- [ ] 粘贴文本解析正确（中文数字章节号如"第十二章"）
- [ ] 上传 ZIP 文件解析正确
- [ ] 上传 TXT 文件解析正确

## 发布流程

- [ ] 单章发布：选中 1 章 → 确认 → 成功
- [ ] 批量发布：选中多章 → 确认 → 逐章发布
- [ ] 暂停发布：发布中点击暂停 → 队列停止
- [ ] 恢复发布：暂停后点击恢复 → 继续发布
- [ ] 演练模式：开启后发布 → 流程执行但停在提交前 → 章节标记"演练"
- [ ] 一键重试失败：有失败章节时 → 点击重试 → 只重发失败章节
- [ ] 状态筛选：切换筛选 → 列表正确过滤

## 设置与配置

- [ ] 保存 API 凭证 → 刷新页面 → 输入框显示明文（非密文）
- [ ] 切换作品 → 章节列表清空
- [ ] 修改 globalSettings（反检测/确认发布/日志天数/演练模式）→ 保存 → 重新加载 → 值正确
- [ ] 导出备份（普通）→ 文件中不含 apiConfigEncrypted
- [ ] 导出备份（完整）→ 文件中含 apiConfigEncrypted
- [ ] 导入备份 → 数据恢复正确

## 定时发布

- [ ] 设置定时 → 到时间触发 → 自动发布
- [ ] 定时发布中断后恢复 → 跳过已完成章节

## 兼容性

- [ ] 番茄编辑器页面：content script 注入成功
- [ ] 番茄管理页面：content script 注入成功
- [ ] getEditorStatus 返回 compatibilityOk: true
- [ ] Chrome 和 Edge 均可正常使用

## 数据安全

- [ ] API Key 显示/隐藏按钮正常工作
- [ ] 复制按钮正常工作
- [ ] 加密提示文案正确显示

## 自动化测试

```bash
# 解析函数单测
node shared/parser.test.cjs

# ESLint 检查
npx eslint background/background.js popup/popup.js options/options.js \
  content_scripts/fanqie_editor.js content_scripts/fanqie_manager.js \
  content_scripts/tencent_doc.js shared/*.js

# 语法检查
node --check background/background.js
node --check popup/popup.js
node --check options/options.js
node --check content_scripts/fanqie_editor.js
node --check content_scripts/fanqie_manager.js
node --check content_scripts/tencent_doc.js
node --check shared/*.js
```
