# Inno WebUI Docker 部署指南

本指南介绍如何使用 Docker 部署 Inno WebUI，支持单容器运行前后端服务。

## 🚀 快速开始

### 方法一：使用便捷脚本（推荐）

```bash
# 构建并运行
./docker-run.sh rebuild

# 或者只运行（如果镜像已存在）
./docker-run.sh run
```

### 方法二：使用 Docker Compose

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f
```

### 方法三：直接使用 Docker 命令

```bash
# 构建镜像
docker build -t inno-webui:latest .

# 运行容器
docker run -d \
  --name inno-webui-app \
  --restart unless-stopped \
  -p 80:80 \
  -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  -e VLLM_API_BASE_URL="http://localhost:8000/v1" \
  inno-webui:latest
```

## 📋 系统要求

- Docker 20.10+
- Docker Compose 2.0+ (可选)
- 至少 2GB 可用内存
- 至少 5GB 可用磁盘空间

## 🔧 配置选项

### 环境变量

| 变量名 | 默认值 | 描述 |
|--------|--------|------|
| `VLLM_API_BASE_URL` | `http://localhost:8000/v1` | VLLM API 服务地址 |
| `DATABASE_URL` | `sqlite:///./data/chat.db` | 数据库连接字符串 |
| `HOST` | `0.0.0.0` | 后端服务监听地址 |
| `PORT` | `8080` | 后端服务端口 |
| `LOG_LEVEL` | `INFO` | 日志级别 |
| `ALLOW_DYNAMIC_VLLM_URL` | `true` | 是否允许动态修改 VLLM URL |

### 端口映射

- `80:80` - Nginx 前端服务
- `8080:8080` - FastAPI 后端服务（可选，用于直接访问）

### 数据持久化

- `./data:/app/data` - 数据库和用户数据
- `./logs:/app/logs` - 应用日志

## 🏥 健康检查

容器启动后，可以通过以下方式检查服务状态：

```bash
# 检查容器状态
docker ps

# 检查健康状态
curl http://localhost/health

# 查看详细状态
curl http://localhost/api/status
```

## 📝 常用命令

### 使用便捷脚本

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

### 使用 Docker Compose

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

### 直接使用 Docker

```bash
# 查看容器日志
docker logs -f inno-webui-app

# 进入容器
docker exec -it inno-webui-app /bin/bash

# 停止容器
docker stop inno-webui-app

# 删除容器
docker rm inno-webui-app

# 删除镜像
docker rmi inno-webui:latest
```

## 🔍 故障排除

### 1. 容器启动失败

```bash
# 查看构建日志
docker build -t inno-webui:latest . --no-cache

# 查看容器日志
docker logs inno-webui-app
```

### 2. 前端无法访问

- 检查端口 80 是否被占用
- 确认防火墙设置
- 查看 Nginx 日志：`docker exec inno-webui-app cat /app/logs/nginx.log`

### 3. 后端 API 错误

- 检查后端日志：`docker exec inno-webui-app cat /app/logs/backend.log`
- 确认数据库文件权限
- 检查 VLLM 服务连接

### 4. 数据库问题

```bash
# 检查数据库文件
ls -la ./data/

# 重新初始化数据库
docker exec inno-webui-app python -c "from app.utils.db_init import initialize_database; initialize_database()"
```

## 🔄 更新部署

```bash
# 停止现有服务
./docker-run.sh stop

# 拉取最新代码
git pull

# 重新构建并运行
./docker-run.sh rebuild
```

## 🌐 访问应用

部署成功后，可以通过以下地址访问：

- **前端界面**: http://localhost
- **后端 API**: http://localhost:8080
- **健康检查**: http://localhost/health
- **API 文档**: http://localhost:8080/docs

## 📊 监控和日志

### 查看实时日志

```bash
# 所有服务日志
./docker-run.sh logs

# 只看后端日志
docker exec inno-webui-app tail -f /app/logs/backend.log

# 只看 Nginx 日志
docker exec inno-webui-app tail -f /app/logs/nginx.log
```

### 监控资源使用

```bash
# 查看容器资源使用
docker stats inno-webui-app

# 查看容器详细信息
docker inspect inno-webui-app
```

## 🔒 安全建议

1. **生产环境**：修改默认的 SECRET_KEY
2. **网络安全**：使用反向代理（如 Nginx）
3. **数据备份**：定期备份 `./data` 目录
4. **日志轮转**：配置日志轮转避免磁盘空间不足
5. **更新维护**：定期更新基础镜像和依赖

## 📞 支持

如果遇到问题，请：

1. 查看日志文件
2. 检查 GitHub Issues
3. 提供详细的错误信息和环境描述
