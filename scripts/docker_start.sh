#!/bin/bash

# Inno WebUI 单容器启动脚本
# 一键启动前后端统一容器

echo "🐳 Starting Inno WebUI Single Container..."

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# 设置配置
WITH_GPU=${1:-"false"}
BUILD=${2:-"false"}

echo "📋 Configuration:"
echo "  With GPU: $WITH_GPU"
echo "  Force rebuild: $BUILD"
echo ""

# 停止现有容器
echo "🛑 Stopping existing containers..."
docker-compose down

# 构建镜像（如果需要）
if [ "$BUILD" = "true" ] || [ "$BUILD" = "rebuild" ]; then
    echo "🔨 Building Docker image..."
    docker-compose build --no-cache
fi

# 启动服务
if [ "$WITH_GPU" = "true" ] || [ "$WITH_GPU" = "gpu" ]; then
    echo "🚀 Starting with GPU support..."
    docker-compose --profile gpu up -d
else
    echo "🚀 Starting basic mode..."
    docker-compose up -d inno-webui
fi

# 等待服务启动
echo ""
echo "⏳ Waiting for services to start..."
sleep 15

# 检查服务状态
echo ""
echo "📊 Service Status:"
docker-compose ps

# 显示访问信息
echo ""
echo "🎯 Access Information:"
echo "  🌐 Web Interface: http://localhost"
echo "  🔌 Backend API: http://localhost:8080"
if [ "$WITH_GPU" = "true" ] || [ "$WITH_GPU" = "gpu" ]; then
    echo "  🤖 VLLM API: http://localhost:8000"
fi

# 显示日志查看命令
echo ""
echo "📝 Useful Commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart: ./scripts/docker_start.sh $WITH_GPU rebuild"

# 健康检查
echo ""
echo "🏥 Health Check:"
sleep 5

if curl -f http://localhost/health &>/dev/null; then
    echo "✅ Application is healthy"
else
    echo "⚠️  Health check failed, checking logs..."
    docker-compose logs --tail=20 inno-webui
fi

echo ""
echo "✨ Inno WebUI Single Container is running!"
echo "💡 Access the application at: http://localhost"
