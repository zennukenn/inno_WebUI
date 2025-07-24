# VLLM Chat 使用指南

## 🚀 快速开始

### 1. 启动服务

**方法一：一键启动（推荐）**
```bash
cd /home/vllm-chat
./scripts/start_all.sh
```

**方法二：分步启动**
```bash
# 1. 启动VLLM服务（如果还没有运行）
./scripts/start_vllm.sh Qwen3-0.6B-GPTQ-Int8 8000

# 2. 启动后端服务
./scripts/start_backend.sh

# 3. 启动前端服务
./scripts/start_frontend.sh
```

### 2. 访问界面

打开浏览器访问：http://localhost:3000 (或显示的端口)

## 🎯 主要功能

### 聊天功能

1. **创建新聊天**
   - 点击左侧边栏的"New Chat"按钮
   - 系统会自动创建一个新的聊天会话

2. **发送消息**
   - 在底部输入框输入消息
   - 按Enter发送，Shift+Enter换行
   - 支持Markdown格式和代码高亮

3. **查看聊天历史**
   - 左侧边栏显示所有聊天记录
   - 点击任意聊天可切换到该会话
   - 支持搜索聊天记录

### 模型管理

1. **打开模型设置**
   - 点击右上角的设置按钮（齿轮图标）
   - 选择"Model Settings"

2. **查看可用模型**
   - 系统会自动检测VLLM中的可用模型
   - 显示模型名称、所有者等信息

3. **切换模型**
   - 在模型列表中点击"Select"按钮
   - 新的聊天会话将使用选定的模型

4. **添加自定义模型**
   - 点击"Add Model"按钮
   - 填写模型配置信息：
     - **模型名称**：自定义的模型标识
     - **API Base URL**：模型服务的API地址
     - **API Key**：访问密钥（可选）
     - **Max Tokens**：最大令牌数
   - 点击"Add Model"保存

5. **测试模型连接**
   - 点击模型旁边的"Test"按钮
   - 系统会验证模型连接是否正常

6. **删除自定义模型**
   - 对于用户添加的模型，点击"Remove"按钮删除

### 通用设置

1. **打开通用设置**
   - 点击设置按钮，选择"General Settings"

2. **调整参数**
   - **Temperature**：控制回复的随机性（0-2）
     - 0：更保守、确定性的回复
     - 1：平衡的回复
     - 2：更有创意、随机的回复
   
   - **Max Tokens**：控制回复的最大长度（256-8192）
   
   - **System Prompt**：设置AI的角色和行为
     - 例如："你是一个专业的编程助手"
   
   - **Theme**：选择界面主题（目前支持深色主题）

## 📝 使用示例

### 示例1：编程助手

1. 在通用设置中设置System Prompt：
   ```
   你是一个专业的编程助手，擅长多种编程语言，能够提供清晰的代码示例和解释。
   ```

2. 发送消息：
   ```
   请帮我写一个Python函数来计算斐波那契数列
   ```

### 示例2：添加本地模型

1. 假设你有一个本地运行的模型服务在端口8001：
   - 模型名称：`my-local-model`
   - API Base URL：`http://localhost:8001/v1`
   - API Key：留空（如果不需要）

2. 添加后可以在模型列表中看到并选择使用

### 示例3：多模型对比

1. 添加多个不同的模型配置
2. 为不同的聊天会话选择不同的模型
3. 对比不同模型的回复效果

## 🔧 高级配置

### 环境变量

可以通过环境变量自定义配置：

```bash
# VLLM配置
export VLLM_API_BASE_URL="http://localhost:8000/v1"
export DEFAULT_MODEL="your-model-name"

# 后端配置
export PORT=8080
export DATABASE_URL="sqlite:///./data/chat.db"

# 前端配置
export VITE_API_BASE_URL="http://localhost:8080"
```

### 数据库

- 聊天记录默认保存在SQLite数据库中
- 数据库文件位置：`backend/data/chat.db`
- 支持PostgreSQL（修改DATABASE_URL）

### 自定义模型服务

支持任何兼容OpenAI API格式的模型服务：

1. **Ollama**
   ```
   API Base URL: http://localhost:11434/v1
   ```

2. **LocalAI**
   ```
   API Base URL: http://localhost:8080/v1
   ```

3. **其他VLLM实例**
   ```
   API Base URL: http://your-server:8000/v1
   ```

## 🐛 故障排除

### 常见问题

1. **无法连接到模型**
   - 检查VLLM服务是否正常运行
   - 验证API Base URL是否正确
   - 使用"Test"功能检查连接

2. **聊天记录丢失**
   - 检查数据库文件是否存在
   - 确认后端服务正常运行

3. **前端无法加载**
   - 检查后端API是否可访问
   - 查看浏览器控制台错误信息

4. **模型响应慢**
   - 检查VLLM服务资源使用情况
   - 调整Max Tokens参数
   - 考虑使用更小的模型

### 日志查看

- **后端日志**：在后端终端查看实时日志
- **前端日志**：打开浏览器开发者工具查看控制台
- **VLLM日志**：在VLLM服务终端查看

## 📚 更多资源

- [开发指南](DEVELOPMENT.md)
- [项目README](README.md)
- [VLLM官方文档](https://docs.vllm.ai/)

## 🤝 支持

如果遇到问题或有建议，请：

1. 检查日志输出
2. 查看故障排除部分
3. 提交Issue描述问题
