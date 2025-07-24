# VLLM Chat 开发指南

## 项目概述

VLLM Chat 是一个基于 open-webui 聊天功能移植的专用 VLLM 推理框架聊天界面。项目采用前后端分离架构，前端使用 Svelte + SvelteKit，后端使用 FastAPI。

## 技术栈

### 前端
- **框架**: Svelte + SvelteKit
- **样式**: TailwindCSS
- **语言**: TypeScript
- **构建工具**: Vite
- **状态管理**: Svelte Stores
- **HTTP客户端**: Fetch API
- **Markdown渲染**: marked + DOMPurify
- **代码高亮**: highlight.js

### 后端
- **框架**: FastAPI
- **数据库**: SQLAlchemy + SQLite/PostgreSQL
- **异步**: asyncio + aiohttp
- **WebSocket**: python-socketio
- **认证**: JWT (可选)
- **日志**: loguru

### 推理框架
- **VLLM**: OpenAI兼容API
- **默认模型**: Qwen3-0.6B-GPTQ-Int8 (本地模型)

## 项目结构

```
vllm-chat/
├── frontend/                 # Svelte前端应用
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/   # 聊天组件
│   │   │   │   └── Chat/     # 聊天相关组件
│   │   │   ├── stores/       # 状态管理
│   │   │   ├── api/          # API客户端
│   │   │   ├── types/        # TypeScript类型定义
│   │   │   ├── utils/        # 工具函数
│   │   │   └── constants.ts  # 常量配置
│   │   ├── routes/           # 页面路由
│   │   └── app.css          # 全局样式
│   ├── static/              # 静态资源
│   ├── package.json
│   └── svelte.config.js
├── backend/                 # FastAPI后端
│   ├── app/
│   │   ├── api/             # API路由
│   │   │   ├── chats.py     # 聊天管理API
│   │   │   └── chat_completion.py # 聊天完成API
│   │   ├── models/          # 数据模型
│   │   │   └── chat.py      # 聊天数据模型
│   │   ├── schemas/         # Pydantic模式
│   │   │   └── chat.py      # 聊天数据模式
│   │   ├── services/        # 业务逻辑
│   │   │   ├── chat_service.py    # 聊天服务
│   │   │   └── vllm_service.py    # VLLM集成服务
│   │   ├── utils/           # 工具函数
│   │   ├── config.py        # 配置管理
│   │   └── database.py      # 数据库配置
│   ├── requirements.txt
│   └── main.py             # 应用入口
├── scripts/                # 启动脚本
│   ├── start_vllm.sh       # VLLM启动脚本
│   ├── start_backend.sh    # 后端启动脚本
│   ├── start_frontend.sh   # 前端启动脚本
│   └── start_all.sh        # 完整启动脚本
├── docker-compose.yml      # Docker编排
├── .env.example           # 环境变量示例
└── README.md
```

## 开发环境设置

### 前置要求

- Python 3.8+
- Node.js 18+
- npm 或 yarn

### 快速开始

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd vllm-chat
   ```

2. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件设置你的配置
   ```

3. **启动所有服务**

   使用本地Qwen模型（推荐）：
   ```bash
   ./scripts/start_qwen.sh [vllm_port] [backend_port] [frontend_port]
   ```

   或使用通用启动脚本：
   ```bash
   ./scripts/start_all.sh [model_name] [vllm_port] [backend_port] [frontend_port]
   ```

   示例：
   ```bash
   # 使用本地Qwen模型
   ./scripts/start_qwen.sh 8000 8080 3000

   # 使用其他模型
   ./scripts/start_all.sh /models/Qwen3-0.6B-GPTQ-Int8 8000 8080 3000
   ```

### 分别启动服务

1. **启动VLLM服务**
   ```bash
   ./scripts/start_vllm.sh /models/Qwen3-0.6B-GPTQ-Int8 8000
   ```

2. **启动后端服务**
   ```bash
   ./scripts/start_backend.sh
   ```

3. **启动前端服务**
   ```bash
   ./scripts/start_frontend.sh
   ```

### 模型测试

在启动服务之前，可以先测试模型配置：

```bash
./scripts/test_qwen_model.sh
```

这个脚本会检查：
- 模型文件是否存在
- Python环境是否正确
- VLLM是否已安装
- 模型配置是否正确

## 核心功能

### 聊天管理
- 创建新聊天
- 聊天列表显示
- 聊天历史保存
- 聊天搜索
- 聊天删除

### 消息处理
- 用户消息发送
- AI响应生成
- 流式响应显示
- 消息历史管理
- Markdown渲染
- 代码高亮

### VLLM集成
- OpenAI兼容API调用
- 流式响应处理
- 模型管理
- 错误处理

## API接口

### 聊天管理API

- `POST /api/chats/` - 创建新聊天
- `GET /api/chats/` - 获取聊天列表
- `GET /api/chats/{chat_id}` - 获取特定聊天
- `PUT /api/chats/{chat_id}` - 更新聊天
- `DELETE /api/chats/{chat_id}` - 删除聊天
- `GET /api/chats/search` - 搜索聊天

### 消息API

- `POST /api/chats/{chat_id}/messages` - 添加消息
- `GET /api/chats/{chat_id}/messages` - 获取消息列表
- `PUT /api/chats/{chat_id}/messages/{message_id}` - 更新消息

### 聊天完成API

- `POST /api/chat/completion` - 聊天完成（支持流式）
- `GET /api/chat/models` - 获取可用模型
- `GET /api/chat/health` - 健康检查

## 数据库模型

### Chat表
- id: 聊天ID
- title: 聊天标题
- user_id: 用户ID
- model: 使用的模型
- system_prompt: 系统提示
- temperature: 温度参数
- max_tokens: 最大令牌数
- messages: 消息列表（JSON）
- created_at: 创建时间
- updated_at: 更新时间
- archived: 是否归档

### Message表
- id: 消息ID
- chat_id: 所属聊天ID
- parent_id: 父消息ID
- role: 角色（user/assistant）
- content: 消息内容
- model: 使用的模型
- timestamp: 时间戳
- metadata: 元数据（JSON）
- created_at: 创建时间
- updated_at: 更新时间

## 部署

### Docker部署

```bash
docker-compose up -d
```

### 手动部署

1. 部署VLLM服务
2. 部署后端服务
3. 构建并部署前端

## 故障排除

### 常见问题

1. **VLLM服务无法启动**
   - 检查GPU驱动和CUDA版本
   - 确认模型路径正确
   - 检查端口是否被占用

2. **后端连接VLLM失败**
   - 检查VLLM_API_BASE_URL配置
   - 确认VLLM服务正常运行
   - 检查网络连接

3. **前端无法连接后端**
   - 检查VITE_API_BASE_URL配置
   - 确认后端服务正常运行
   - 检查CORS配置

4. **数据库连接失败**
   - 检查DATABASE_URL配置
   - 确认数据库文件权限
   - 检查数据库驱动安装

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 许可证

MIT License
