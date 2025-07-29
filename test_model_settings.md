# 模型设置修复测试指南

## 问题描述
用户在模型设置中选择模型并保存后，模型名无法传递到后端并连接模型。

## 修复内容

### 1. 前端修复
- **设置持久化改进**: 重构了 `settings` store，添加了自动的 localStorage 持久化
- **全局设置初始化**: 在应用启动时自动加载保存的设置
- **模型状态管理**: 改进了模型连接状态的检查和管理
- **自动模型配置**: 当有 VLLM URL 但没有选择模型时，自动测试连接并选择第一个可用模型

### 2. 后端修复
- **调试日志增强**: 添加了详细的调试日志，帮助诊断模型传递问题
- **模型配置验证**: 改进了模型配置的获取和验证逻辑

## 测试步骤

### 步骤 1: 清理现有设置
1. 打开浏览器开发者工具 (F12)
2. 进入 Application/Storage -> Local Storage
3. 删除 `inno-webui-settings` 项（如果存在）
4. 刷新页面

### 步骤 2: 配置 VLLM 连接
1. 点击右上角的设置按钮（齿轮图标）
2. 在模型设置中：
   - 输入 VLLM API URL (例如: `http://localhost:8000/v1`)
   - 如果需要，输入 API Key
   - 点击 "Test Connection" 按钮
3. 验证连接成功并显示可用模型列表

### 步骤 3: 选择模型
1. 在可用模型列表中选择一个模型
2. 点击 "Save Settings" 按钮
3. 关闭设置对话框

### 步骤 4: 验证设置持久化
1. 刷新页面
2. 检查右上角的模型状态指示器是否显示为绿色（已连接）
3. 重新打开设置，确认选择的模型仍然被选中

### 步骤 5: 测试聊天功能
1. 在聊天输入框中输入一条消息
2. 发送消息
3. 检查浏览器控制台的调试日志，确认：
   - 模型名正确传递到请求中
   - VLLM URL 正确配置
   - 请求成功发送到后端

### 步骤 6: 检查后端日志
1. 查看后端控制台输出
2. 确认看到类似以下的调试日志：
   ```
   🚀 [DEBUG] Chat completion request received:
     - Model: [选择的模型名]
     - VLLM URL: [配置的URL]
     - Messages count: 1
   🤖 [DEBUG] Using model: [模型名]
   🔧 [DEBUG] Model config: {...}
   🌐 [DEBUG] VLLM URL: [完整URL]
   ```

## 预期结果

### 成功指标
- ✅ 设置在页面刷新后保持不变
- ✅ 模型状态指示器显示为绿色（已连接）
- ✅ 聊天请求包含正确的模型名称
- ✅ 后端接收到完整的模型配置信息
- ✅ 能够成功发送消息并获得回复

### 调试信息
如果仍有问题，请检查：

1. **浏览器控制台**: 查看前端错误和调试日志
2. **网络面板**: 检查 API 请求是否包含正确的模型信息
3. **后端日志**: 确认后端接收到的请求参数
4. **localStorage**: 验证设置是否正确保存

## 故障排除

### 问题: 设置没有保存
- 检查浏览器是否允许 localStorage
- 确认没有浏览器扩展阻止存储

### 问题: 模型状态显示未连接
- 验证 VLLM 服务是否正在运行
- 检查 VLLM URL 是否正确
- 确认网络连接正常

### 问题: 后端没有接收到模型名
- 检查前端请求是否包含 model 字段
- 验证后端日志中的调试信息
- 确认 ChatCompletionRequest 的模型字段不为空

## 技术细节

### 修改的文件
- `frontend/src/lib/stores/index.ts` - 设置存储重构
- `frontend/src/lib/utils/settings.ts` - 新增设置工具函数
- `frontend/src/routes/+layout.svelte` - 添加全局设置初始化
- `frontend/src/lib/components/Chat/ChatInterface.svelte` - 改进模型状态检查
- `frontend/src/lib/components/Settings/ModelSettings.svelte` - 简化设置加载逻辑
- `backend/app/api/chat_completion.py` - 添加调试日志
- `backend/app/services/vllm_service.py` - 增强模型配置日志
