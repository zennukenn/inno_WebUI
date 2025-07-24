# Inno WebUI

基于open-webui聊天功能的智能Web界面，支持Docker一键部署。

## 🚀 快速开始

### Docker部署（推荐）

```bash
# 克隆项目
git clone <your-repo-url>
cd inno_WebUI

# 一键启动（基础模式）
./scripts/docker_start.sh basic

# 访问应用
# 前端: http://localhost:3000
# 后端: http://localhost:8080
```

### 手动部署

## 项目特点

- 🚀 完全兼容open-webui的聊天界面
- 🎯 专门针对VLLM推理框架优化
- 💾 完整的聊天记录保存功能
- 🔄 实时流式响应
- 📱 响应式设计，支持移动端

## 技术栈

### 前端
- Svelte + SvelteKit
- TailwindCSS
- TypeScript
- Socket.IO Client

### 后端
- FastAPI
- SQLAlchemy
- SQLite/PostgreSQL
- Socket.IO
- Pydantic

### 推理框架
- VLLM (OpenAI兼容API)

## 项目结构

```
vllm-chat/
├── frontend/              # Svelte前端应用
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/   # 聊天组件
│   │   │   ├── stores/       # 状态管理
│   │   │   └── utils/        # 工具函数
│   │   └── routes/           # 页面路由
│   ├── static/
│   ├── package.json
│   └── svelte.config.js
├── backend/               # FastAPI后端
│   ├── app/
│   │   ├── api/             # API路由
│   │   ├── models/          # 数据模型
│   │   ├── services/        # 业务逻辑
│   │   └── utils/           # 工具函数
│   ├── requirements.txt
│   └── main.py
├── docker-compose.yml     # 容器编排
└── README.md
```

## 快速开始

### 方法一：使用Qwen模型一键启动（推荐）

```bash
# 进入项目目录
cd /home/vllm-chat

# 复制环境配置
cp .env.example .env

# 使用本地Qwen3-0.6B-GPTQ-Int8模型启动
./scripts/start_qwen.sh

# 或者手动指定端口
./scripts/start_qwen.sh 8000 8080 3000
```

### 方法二：通用一键启动

```bash
# 一键启动所有服务（VLLM + 后端 + 前端）
./scripts/start_all.sh /models/Qwen3-0.6B-GPTQ-Int8
```

### 方法三：分步启动

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

### 方法四：Docker Compose

```bash
# 修改docker-compose.yml中的模型路径
docker-compose up -d
```

启动完成后，打开浏览器访问 `http://localhost:3000` 开始聊天。

## 配置

### 环境变量

```bash
# VLLM API配置
VLLM_API_BASE_URL=http://localhost:8000/v1
VLLM_API_KEY=your-api-key

# 数据库配置
DATABASE_URL=sqlite:///./chat.db

# 服务端口
BACKEND_PORT=8080
FRONTEND_PORT=3000
```

## 功能特性

- ✅ 聊天界面（完全兼容open-webui）
- ✅ 消息发送和接收
- ✅ 流式响应显示
- ✅ 聊天历史保存和管理
- ✅ 聊天搜索功能
- ✅ Markdown渲染和代码高亮
- ✅ 响应式设计，支持移动端
- ✅ 一键启动脚本
- ✅ Docker支持
- ✅ 完整的错误处理

## 开发说明

本项目基于open-webui的聊天功能进行移植和优化，专门针对VLLM推理框架设计。保持了原有的用户界面和交互体验，同时简化了架构，专注于聊天功能的实现。

详细的开发指南请参考 [DEVELOPMENT.md](DEVELOPMENT.md)。

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口占用
   lsof -i :8000  # VLLM端口
   lsof -i :8080  # 后端端口
   lsof -i :3000  # 前端端口
   ```

2. **VLLM服务启动失败**
   - 检查GPU驱动和CUDA版本
   - 确认模型路径正确
   - 检查显存是否足够

3. **后端连接VLLM失败**
   - 检查VLLM服务是否正常运行
   - 确认VLLM_API_BASE_URL配置正确

4. **前端无法连接后端**
   - 检查后端服务是否正常运行
   - 确认API_BASE_URL配置正确

## 贡献

欢迎提交Issue和Pull Request来改进项目。

## 许可证

MIT License
