# Inno WebUI Docker 部署指南

本指南将帮助您使用Docker快速部署Inno WebUI项目（单容器版本）。

## 🚀 快速开始

### 前置要求

- Docker (版本 20.10+)
- Docker Compose (版本 2.0+)
- 至少 2GB 可用内存
- 如需GPU支持：NVIDIA Docker Runtime

### 一键启动

```bash
# 基础模式（单容器：前端 + 后端）
./scripts/docker_start.sh

# GPU模式（单容器 + VLLM服务）
./scripts/docker_start.sh gpu

# 或使用一键部署脚本
./deploy.sh
```

## 📋 部署模式

### 1. 基础模式
- ✅ 单容器（前端 + 后端 + Nginx）
- ✅ 统一访问端口 80
- ✅ 内置反向代理
- 🚫 VLLM服务

**适用场景**: 开发测试、外部VLLM服务、生产环境

### 2. GPU模式
- ✅ 单容器（前端 + 后端 + Nginx）
- ✅ VLLM服务容器 (端口 8000)
- ✅ 完整AI功能

**适用场景**: 完整AI功能、本地GPU推理

## 🔧 详细配置

### 环境变量

在项目根目录创建 `.env` 文件：

```env
# 后端配置
VLLM_API_BASE_URL=http://vllm:8000/v1
DATABASE_URL=sqlite:///./data/chat.db
HOST=0.0.0.0
PORT=8080

# 前端配置
VITE_API_BASE_URL=http://localhost:8080
NODE_ENV=production

# VLLM配置
CUDA_VISIBLE_DEVICES=0
```

### 自定义模型路径

修改 `docker-compose.yml` 中的模型路径：

```yaml
volumes:
  - /your/model/path:/models
```

### 端口配置

默认端口映射：
- 前端: `3000:3000`
- 后端: `8080:8080`
- VLLM: `8000:8000`
- Nginx: `80:80`

## 📊 服务管理

### 查看服务状态
```bash
docker-compose ps
```

### 查看日志
```bash
# 所有服务日志
docker-compose logs -f

# 特定服务日志
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f vllm
```

### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart frontend
```

### 停止服务
```bash
# 停止所有服务
./scripts/docker_stop.sh

# 停止并清理
./scripts/docker_stop.sh clean
```

## 🔍 故障排除

### 常见问题

#### 1. 端口冲突
```bash
# 检查端口占用
netstat -tulpn | grep :3000
netstat -tulpn | grep :8080

# 修改docker-compose.yml中的端口映射
```

#### 2. 内存不足
```bash
# 检查Docker内存限制
docker system df
docker stats

# 清理未使用的镜像
docker system prune -a
```

#### 3. GPU不可用
```bash
# 检查NVIDIA Docker
nvidia-docker version
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
```

#### 4. 服务启动失败
```bash
# 查看详细错误信息
docker-compose logs [service-name]

# 重新构建镜像
./scripts/docker_start.sh basic rebuild
```

### 健康检查

所有服务都配置了健康检查：

```bash
# 检查服务健康状态
docker-compose ps

# 手动健康检查
curl http://localhost:8080/health  # 后端
curl http://localhost:3000/        # 前端
```

## 🚀 生产部署建议

### 1. 使用Nginx模式
```bash
./scripts/docker_start.sh nginx
```

### 2. 配置SSL证书
将SSL证书放在 `nginx/ssl/` 目录下，并修改nginx配置。

### 3. 数据持久化
确保数据卷正确配置：
```yaml
volumes:
  - backend_data:/app/data
  - models_data:/models
```

### 4. 监控和日志
- 配置日志轮转
- 设置监控告警
- 定期备份数据

### 5. 安全配置
- 修改默认端口
- 配置防火墙规则
- 使用强密码和API密钥

## 📈 性能优化

### 1. 资源限制
在docker-compose.yml中添加资源限制：
```yaml
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '1.0'
```

### 2. 缓存优化
- 启用Nginx缓存
- 配置浏览器缓存
- 使用CDN加速

### 3. 数据库优化
- 定期清理旧数据
- 配置数据库索引
- 使用外部数据库

## 🔄 更新和维护

### 更新镜像
```bash
# 拉取最新镜像
docker-compose pull

# 重新构建本地镜像
./scripts/docker_start.sh basic rebuild
```

### 备份数据
```bash
# 备份数据卷
docker run --rm -v inno-webui_backend_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data
```

### 恢复数据
```bash
# 恢复数据卷
docker run --rm -v inno-webui_backend_data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /
```

---

## 📞 支持

如果遇到问题，请：
1. 查看日志文件
2. 检查GitHub Issues
3. 提交新的Issue

**祝您使用愉快！** 🎉
