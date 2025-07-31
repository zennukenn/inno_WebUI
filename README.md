# Inno WebUI

基于 open-webui 聊天功能的智能 Web 界面，支持 VLLM 推理框架和 Docker 一键部署。

## 📋 目录

- [🚀 快速开始](#-快速开始)
- [🎯 项目特点](#-项目特点)
- [🏗️ 技术栈](#️-技术栈)
- [📁 项目结构](#-项目结构)
- [🔧 部署方式](#-部署方式)
- [⚙️ 配置说明](#️-配置说明)
- [📖 使用指南](#-使用指南)
- [🔧 开发指南](#-开发指南)
- [🐳 Docker 部署](#-docker-部署)
- [🌐 跨机器部署](#-跨机器部署)
- [🤖 Qwen 模型设置](#-qwen-模型设置)
- [🔄 动态模型选择](#-动态模型选择)
- [🔍 故障排除](#-故障排除)
- [🤝 贡献指南](#-贡献指南)

## 🚀 快速开始

### Docker 部署（推荐）

```bash
# 克隆项目
git clone <your-repo-url>
cd inno_WebUI

# 一键部署
./deploy.sh

# 访问应用
# 前端界面: http://localhost:8070
# 后端API: http://localhost:8080
```

### 手动部署

```bash
# 使用 Qwen 模型一键启动
./scripts/start_qwen.sh

# 或通用启动脚本
./scripts/start_all.sh /models/Qwen3-0.6B-GPTQ-Int8
```

## 🎯 项目特点

- 🚀 **完全兼容** open-webui 的聊天界面
- 🎯 **专门优化** 针对 VLLM 推理框架
- 💾 **完整保存** 聊天记录和历史
- 🔄 **实时响应** 支持流式输出
- 📱 **响应式设计** 支持移动端访问
- 🔧 **动态模型** 支持模型动态选择
- 🐳 **容器化** 支持 Docker 一键部署
- 🌐 **跨平台** 支持任意 IP 地址部署

## 🏗️ 技术栈

### 前端
- **框架**: Svelte + SvelteKit
- **样式**: TailwindCSS
- **语言**: TypeScript
- **构建**: Vite
- **状态管理**: Svelte Stores
- **Markdown**: marked + DOMPurify
- **代码高亮**: highlight.js

### 后端
- **框架**: FastAPI
- **数据库**: SQLAlchemy + SQLite/PostgreSQL
- **异步**: asyncio + aiohttp
- **认证**: JWT (可选)
- **日志**: loguru

### 推理框架
- **VLLM**: OpenAI 兼容 API
- **默认模型**: Qwen3-0.6B-GPTQ-Int8

### 部署
- **容器**: Docker + Docker Compose
- **反向代理**: Nginx
- **进程管理**: Supervisor

## 📁 项目结构

```
inno_WebUI/
├── frontend/                 # Svelte 前端应用
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/   # 聊天组件
│   │   │   ├── stores/       # 状态管理
│   │   │   ├── api/          # API 客户端
│   │   │   └── utils/        # 工具函数
│   │   └── routes/           # 页面路由
│   └── package.json
├── backend/                  # FastAPI 后端
│   ├── app/
│   │   ├── api/             # API 路由
│   │   ├── models/          # 数据模型
│   │   ├── services/        # 业务逻辑
│   │   └── schemas/         # Pydantic 模式
│   └── requirements.txt
├── docker/                   # Docker 配置
│   ├── nginx-single.conf    # Nginx 配置
│   ├── supervisord.conf     # 进程管理
│   └── start-services.sh    # 启动脚本
├── scripts/                  # 部署脚本
│   ├── docker_start.sh      # Docker 启动
│   ├── start_all.sh         # 完整启动
│   ├── start_qwen.sh        # Qwen 启动
│   └── export_image.sh      # 镜像导出
├── Dockerfile               # 统一容器配置
├── docker-compose.yml       # 容器编排
└── deploy.sh               # 一键部署脚本
```

## 🔧 部署方式

### 方案一：Docker 镜像包部署（推荐）

适用于在没有源码的机器上部署：

```bash
# 1. 导出镜像（在源机器上）
./scripts/export_image.sh

# 2. 传输到目标机器
scp inno-webui-deploy_*.tar.gz user@target-host:~/

# 3. 在目标机器上部署
tar -xzf inno-webui-deploy_*.tar.gz
./import_image.sh
./deploy_anywhere.sh
```

### 方案二：源码直接部署

```bash
# Docker 部署
./deploy.sh

# 或快速启动
./scripts/quick_start.sh
```

### 方案三：手动分步部署

```bash
# 1. 启动 VLLM 服务
./scripts/start_vllm.sh /models/Qwen3-0.6B-GPTQ-Int8 8000

# 2. 启动后端服务
./scripts/start_backend.sh

# 3. 启动前端服务
./scripts/start_frontend.sh
```

### 方案四：Docker Compose

```bash
# 基础模式（单容器）
docker-compose up -d

# GPU 模式（包含 VLLM）
docker-compose --profile gpu up -d
```

## ⚙️ 配置说明

### 系统要求

- **操作系统**: Linux, macOS, Windows (WSL2)
- **Docker**: 20.10 或更高版本
- **内存**: 至少 2GB 可用内存
- **磁盘**: 至少 3GB 可用空间
- **端口**: 8070 (前端), 8080 (后端API)

### 环境变量

```bash
# VLLM API 配置
VLLM_API_BASE_URL=http://localhost:8000/v1
VLLM_API_KEY=your-api-key

# 数据库配置
DATABASE_URL=sqlite:///./data/chat.db

# 服务配置
HOST=0.0.0.0
PORT=8080
CORS_ORIGINS=*

# 前端配置
VITE_API_BASE_URL=http://localhost:8080
NODE_ENV=production
```

### 端口配置

- **8070**: 前端 Web 界面
- **8080**: 后端 API 接口
- **8000**: VLLM 推理服务（可选）

### 模型配置

支持的模型类型：
- **Qwen3-0.6B-GPTQ-Int8**: 默认轻量级模型
- **自定义 VLLM 模型**: 任何 VLLM 支持的模型
- **外部 API**: 兼容 OpenAI API 的服务

## 📖 使用指南

### 基本使用

1. **访问界面**
   - 前端: http://localhost:8070
   - API: http://localhost:8080

2. **创建聊天**
   - 点击左侧边栏的 "New Chat" 按钮
   - 系统自动创建新的聊天会话

3. **发送消息**
   - 在底部输入框输入消息
   - 按 Enter 发送，Shift+Enter 换行
   - 支持 Markdown 格式和代码高亮

### 模型管理

1. **打开模型设置**
   - 点击右上角的设置按钮（齿轮图标）
   - 选择 "Model Settings"

2. **配置 VLLM 连接**
   - 输入 VLLM API URL
   - 点击 "Test Connection" 测试连接
   - 从下拉列表选择可用模型

3. **添加自定义模型**
   - 点击 "Add Model" 按钮
   - 填写模型配置信息：
     - 模型名称
     - API Base URL
     - API Key（可选）
     - Max Tokens
   - 保存配置

### 高级功能

1. **动态模型选择**
   - 系统自动发现可用模型
   - 支持运行时切换模型
   - 无需重启服务

2. **聊天历史管理**
   - 自动保存聊天记录
   - 支持搜索历史对话
   - 可导出聊天记录

3. **参数调整**
   - Temperature: 控制回复随机性 (0-2)
   - Max Tokens: 控制回复长度 (256-8192)
   - System Prompt: 设置 AI 角色和行为

### 使用示例

#### 示例1：编程助手

```bash
# 设置 System Prompt
你是一个专业的编程助手，擅长多种编程语言，能够提供清晰的代码示例和解释。

# 发送消息
请帮我写一个 Python 函数来计算斐波那契数列
```

#### 示例2：多模型对比

1. 添加多个不同的模型配置
2. 为不同聊天会话选择不同模型
3. 对比不同模型的回复效果

## 🔍 故障排除

### 常见问题

#### 1. 端口被占用
```bash
# 检查端口占用
netstat -tuln | grep :8070
netstat -tuln | grep :8080

# 或使用 ss 命令
ss -tuln | grep :8070
```

#### 2. 容器启动失败
```bash
# 查看容器日志
docker logs inno-webui-app -f

# 检查容器状态
docker ps | grep inno-webui

# 重新构建镜像
./scripts/docker_start.sh rebuild
```

#### 3. 防火墙问题
```bash
# Ubuntu/Debian
sudo ufw allow 8070
sudo ufw allow 8080

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=8070/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
```

#### 4. VLLM 服务连接失败
- 检查 VLLM 服务是否正常运行
- 验证 API Base URL 是否正确
- 使用 "Test Connection" 功能检查连接
- 确认网络连接正常

#### 5. 模型加载失败
- 检查模型文件是否存在
- 确认模型路径正确
- 验证显存是否足够
- 查看 VLLM 服务日志

#### 6. 前端无法访问
- 检查后端 API 是否可访问
- 查看浏览器控制台错误信息
- 确认 CORS 配置正确
- 验证网络连接

### 调试方法

#### 查看日志
```bash
# 容器日志
docker logs inno-webui-app -f

# 后端日志
docker exec inno-webui-app tail -f /app/logs/backend.log

# Nginx 日志
docker exec inno-webui-app tail -f /app/logs/nginx.log
```

#### 健康检查
```bash
# 检查服务状态
curl http://localhost:8070/health
curl http://localhost:8080/health

# 检查 API 响应
curl http://localhost:8080/api/status
```

#### 性能监控
```bash
# 查看容器资源使用
docker stats inno-webui-app

# 查看系统资源
htop
nvidia-smi  # GPU 使用情况
```

### 数据恢复

#### 备份数据
```bash
# 备份数据卷
docker run --rm -v inno-webui_backend_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data
```

#### 恢复数据
```bash
# 恢复数据卷
docker run --rm -v inno-webui_backend_data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /
```

## 🚀 开发指南

### 开发环境设置

#### 前置要求
- Python 3.8+
- Node.js 18+
- Docker 20.10+

#### 本地开发
```bash
# 1. 克隆项目
git clone <repository-url>
cd inno_WebUI

# 2. 配置环境
cp .env.example .env

# 3. 启动开发服务
./scripts/start_all.sh
```

### API 接口

#### 聊天管理 API
- `POST /api/chats/` - 创建新聊天
- `GET /api/chats/` - 获取聊天列表
- `GET /api/chats/{chat_id}` - 获取特定聊天
- `PUT /api/chats/{chat_id}` - 更新聊天
- `DELETE /api/chats/{chat_id}` - 删除聊天

#### 聊天完成 API
- `POST /api/chat/completion` - 聊天完成（支持流式）
- `GET /api/chat/models` - 获取可用模型
- `GET /api/chat/health` - 健康检查

### 数据库模型

#### Chat 表
- id: 聊天 ID
- title: 聊天标题
- user_id: 用户 ID
- model: 使用的模型
- messages: 消息列表（JSON）
- created_at: 创建时间
- updated_at: 更新时间

#### Message 表
- id: 消息 ID
- chat_id: 所属聊天 ID
- role: 角色（user/assistant）
- content: 消息内容
- timestamp: 时间戳
- created_at: 创建时间

## 🔒 安全建议

1. **生产环境配置**
   - 修改默认的 SECRET_KEY
   - 配置强密码和 API 密钥
   - 限制 CORS_ORIGINS 设置

2. **网络安全**
   - 配置防火墙规则
   - 使用 HTTPS（配置反向代理）
   - 限制不必要的端口访问

3. **数据安全**
   - 定期备份数据
   - 配置日志轮转
   - 监控异常访问

## 📊 性能优化

### 资源优化
```yaml
# Docker Compose 资源限制
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '1.0'
```

### 缓存优化
- 启用 Nginx 缓存
- 配置浏览器缓存
- 使用 CDN 加速静态资源

### 数据库优化
- 定期清理旧数据
- 配置数据库索引
- 考虑使用外部数据库

## 🤝 贡献指南

### 贡献流程
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范
- 遵循项目现有的代码风格
- 添加适当的注释和文档
- 确保所有测试通过
- 更新相关文档

### 问题报告
如果遇到问题，请：
1. 查看现有的 Issues
2. 提供详细的错误信息
3. 包含复现步骤
4. 提供系统环境信息

## 🔧 开发指南

### 开发环境设置

#### 前置要求
- Python 3.8+
- Node.js 18+
- Docker 20.10+

#### 本地开发
```bash
# 1. 克隆项目
git clone <repository-url>
cd inno_WebUI

# 2. 配置环境
cp .env.example .env

# 3. 启动开发服务
./scripts/start_all.sh
```

#### 分别启动服务

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

### 核心功能

#### 聊天管理
- 创建新聊天
- 聊天列表显示
- 聊天历史保存
- 聊天搜索
- 聊天删除

#### 消息处理
- 用户消息发送
- AI响应生成
- 流式响应显示
- 消息历史管理
- Markdown渲染
- 代码高亮

#### VLLM集成
- OpenAI兼容API调用
- 流式响应处理
- 模型管理
- 错误处理

### API 接口

#### 聊天管理 API
- `POST /api/chats/` - 创建新聊天
- `GET /api/chats/` - 获取聊天列表
- `GET /api/chats/{chat_id}` - 获取特定聊天
- `PUT /api/chats/{chat_id}` - 更新聊天
- `DELETE /api/chats/{chat_id}` - 删除聊天

#### 聊天完成 API
- `POST /api/chat/completion` - 聊天完成（支持流式）
- `GET /api/chat/models` - 获取可用模型
- `GET /api/chat/health` - 健康检查

### 数据库模型

#### Chat 表
- id: 聊天 ID
- title: 聊天标题
- user_id: 用户 ID
- model: 使用的模型
- messages: 消息列表（JSON）
- created_at: 创建时间
- updated_at: 更新时间

#### Message 表
- id: 消息 ID
- chat_id: 所属聊天 ID
- role: 角色（user/assistant）
- content: 消息内容
- timestamp: 时间戳
- created_at: 创建时间

## 🐳 Docker 部署

### 快速开始

#### 方法一：使用便捷脚本（推荐）
```bash
# 构建并运行
./docker-run.sh rebuild

# 或者只运行（如果镜像已存在）
./docker-run.sh run
```

#### 方法二：使用 Docker Compose
```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f
```

#### 方法三：直接使用 Docker 命令
```bash
# 构建镜像
docker build -t inno-webui:latest .

# 运行容器
docker run -d \
  --name inno-webui-app \
  --restart unless-stopped \
  -p 8070:8070 \
  -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  -e VLLM_API_BASE_URL="http://localhost:8000/v1" \
  inno-webui:latest
```

### 系统要求
- Docker 20.10+
- Docker Compose 2.0+ (可选)
- 至少 2GB 可用内存
- 至少 5GB 可用磁盘空间

### 配置选项

#### 环境变量
| 变量名 | 默认值 | 描述 |
|--------|--------|------|
| `VLLM_API_BASE_URL` | `http://localhost:8000/v1` | VLLM API 服务地址 |
| `DATABASE_URL` | `sqlite:///./data/chat.db` | 数据库连接字符串 |
| `HOST` | `0.0.0.0` | 后端服务监听地址 |
| `PORT` | `8080` | 后端服务端口 |
| `LOG_LEVEL` | `INFO` | 日志级别 |

#### 端口映射
- `8070:8070` - 前端 Web 界面
- `8080:8080` - 后端 API 服务

#### 数据持久化
- `./data:/app/data` - 数据库和用户数据
- `./logs:/app/logs` - 应用日志

### 常用命令

#### 使用便捷脚本
```bash
# 查看帮助
./docker-run.sh

# 构建镜像
./docker-run.sh build

# 重新构建并运行
./docker-run.sh rebuild

# 运行容器
./docker-run.sh run

# 停止服务
./docker-run.sh stop

# 查看日志
./docker-run.sh logs

# 查看状态
./docker-run.sh status
```

#### 使用 Docker Compose
```bash
# 启动服务
docker-compose up -d

# 启动服务（包含 GPU 支持的 VLLM）
docker-compose --profile gpu up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重新构建
docker-compose up -d --build
```

### 健康检查
容器启动后，可以通过以下方式检查服务状态：

```bash
# 检查容器状态
docker ps

# 检查健康状态
curl http://localhost:8070/health

# 查看详细状态
curl http://localhost:8080/api/status
```

### 访问应用
部署成功后，可以通过以下地址访问：

- **前端界面**: http://localhost:8070
- **后端 API**: http://localhost:8080
- **健康检查**: http://localhost:8070/health
- **API 文档**: http://localhost:8080/docs

## 🌐 跨机器部署

### 部署方案

#### 方案一：使用镜像包部署（推荐）
适用于在没有源码的机器上部署。

1. **导出镜像（在源机器上）**
   ```bash
   # 在有源码和镜像的机器上运行
   ./scripts/export_image.sh
   ```

2. **传输到目标机器**
   ```bash
   # 将部署包传输到目标机器
   scp inno-webui-deploy_*.tar.gz user@target-host:~/
   ```

3. **在目标机器上部署**
   ```bash
   # 解压部署包
   tar -xzf inno-webui-deploy_*.tar.gz

   # 导入镜像
   chmod +x import_image.sh
   ./import_image.sh

   # 部署服务
   chmod +x deploy_anywhere.sh
   ./deploy_anywhere.sh
   ```

#### 方案二：直接部署（有源码）
适用于在有完整源码的机器上部署。

```bash
# 构建镜像
docker build -t inno-webui:latest .

# 通用部署
./scripts/deploy_anywhere.sh

# 或快速启动
./scripts/quick_start.sh
```

### 网络访问配置

#### 自动IP检测
部署脚本会自动检测当前机器的IP地址，并配置相应的访问地址。

#### 手动指定IP（可选）
如果需要手动指定访问IP，可以修改 `.env` 文件：

```bash
# 编辑环境配置
nano .env

# 修改以下配置
DEPLOY_IP=your.server.ip
CORS_ORIGINS=*
```

### 访问地址
部署完成后，您可以通过以下地址访问：

#### 本地访问
- 前端: http://localhost:8070
- API: http://localhost:8080

#### 网络访问
- 前端: http://YOUR_SERVER_IP:8070
- API: http://YOUR_SERVER_IP:8080

## 🤖 Qwen 模型设置

### 模型信息
- **模型名称**: Qwen3-0.6B-GPTQ-Int8
- **模型路径**: `/models/Qwen3-0.6B-GPTQ-Int8`
- **量化方式**: GPTQ Int8
- **模型大小**: 约 760MB
- **推荐显存**: 2GB+

### 快速启动

1. **检查模型文件**
   ```bash
   cd /home/vllm-chat
   ./scripts/test_qwen_model.sh
   ```

2. **启动聊天应用**
   ```bash
   # 一键启动所有服务
   ./scripts/start_qwen.sh

   # 或者指定端口
   ./scripts/start_qwen.sh 8000 8080 3000
   ```

3. **访问应用**
   打开浏览器访问: http://localhost:3000

### 服务端口
- **VLLM API**: http://localhost:8000
- **后端API**: http://localhost:8080
- **前端界面**: http://localhost:3000

### 模型特性

#### Qwen3-0.6B-GPTQ-Int8 优势
1. **轻量级**: 模型较小，启动快速
2. **量化优化**: GPTQ Int8量化，显存占用低
3. **中文友好**: 对中文支持良好
4. **推理速度**: 小模型推理速度快

#### 适用场景
- 开发测试
- 轻量级聊天应用
- 资源受限环境
- 快速原型验证

### 配置说明

#### VLLM启动参数
```bash
python -m vllm.entrypoints.openai.api_server \
    --model /models/Qwen3-0.6B-GPTQ-Int8 \
    --host 0.0.0.0 \
    --port 8000 \
    --served-model-name Qwen3-0.6B-GPTQ-Int8 \
    --max-model-len 2048 \
    --tensor-parallel-size 1 \
    --dtype float16 \
    --quantization gptq \
    --gpu-memory-utilization 0.8 \
    --max-num-seqs 256
```

#### 关键参数说明
- `--dtype float16`: 数据类型（GPTQ量化必须使用float16）
- `--quantization gptq`: 启用GPTQ量化
- `--max-model-len 2048`: 最大序列长度
- `--gpu-memory-utilization 0.8`: GPU显存使用率
- `--max-num-seqs 256`: 最大并发序列数

## 🔄 动态模型选择

### 功能特性

#### ✅ 已实现功能

1. **动态模型发现**
   - 系统自动发现VLLM服务中的可用模型
   - 无需在代码中硬编码模型名称
   - 当未指定模型时自动选择第一个可用模型

2. **用户可配置的模型选择**
   - 用户可通过UI访问模型设置
   - 测试与VLLM服务的连接
   - 从可用模型中选择
   - 设置保存在localStorage中

3. **回退机制**
   - 如果未指定模型，自动选择第一个可用模型
   - 当模型不可用时优雅的错误处理
   - 与现有聊天的向后兼容性

4. **API灵活性**
   - 聊天完成API接受可选的模型参数
   - 聊天创建API支持模型自动选择
   - 支持流式和非流式完成

### 使用指南

#### 对于用户

1. **初始设置**
   - 打开模型设置（侧边栏中的齿轮图标）
   - 输入VLLM API URL（默认：http://localhost:8000/v1）
   - 点击"测试连接"以发现可用模型
   - 从下拉列表中选择首选模型
   - 点击"保存设置"

2. **创建聊天**
   - 创建新聊天时无需指定模型
   - 系统将使用您在设置中选择的模型
   - 或者如果未配置则自动选择第一个可用模型

3. **模型切换**
   - 随时通过模型设置更改模型
   - 新聊天将使用新选择的模型
   - 现有聊天保留其原始模型

#### 对于开发者

1. **添加新模型**
   - 只需将模型添加到您的VLLM服务
   - 它们将自动出现在UI中
   - 无需更改代码

2. **API使用**
   ```python
   # 可选的模型参数
   {
     "messages": [...],
     "model": "optional-model-name",  # 可以省略
     "temperature": 0.7
   }
   ```

### 故障排除

#### 常见问题

1. **没有可用模型**
   - 检查VLLM服务是否正在运行
   - 验证设置中的API URL
   - 在模型设置中测试连接

2. **找不到模型错误**
   - 清除浏览器localStorage
   - 在设置中重新配置模型
   - 重启VLLM服务

3. **连接失败**
   - 检查网络连接
   - 验证VLLM服务健康状况
   - 检查API密钥配置

## 📞 技术支持

### 获取帮助
- 查看文档和 FAQ
- 搜索现有的 Issues
- 提交新的 Issue
- 参与社区讨论

### 联系方式
- GitHub Issues: 技术问题和 Bug 报告
- Discussions: 功能建议和讨论
- Email: 紧急问题联系

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [open-webui](https://github.com/open-webui/open-webui) - 原始聊天界面设计
- [VLLM](https://github.com/vllm-project/vllm) - 高性能推理框架
- [FastAPI](https://fastapi.tiangolo.com/) - 现代 Python Web 框架
- [Svelte](https://svelte.dev/) - 现代前端框架

---

**🎉 祝您使用愉快！**

如果这个项目对您有帮助，请考虑给它一个 ⭐️
