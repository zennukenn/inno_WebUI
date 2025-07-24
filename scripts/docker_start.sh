#!/bin/bash

# Inno WebUI Docker启动脚本
# 一键启动完整的Docker环境

echo "🐳 Starting Inno WebUI with Docker..."

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

# 设置默认配置
PROFILE=${1:-"basic"}
BUILD=${2:-"false"}

echo "📋 Configuration:"
echo "  Profile: $PROFILE"
echo "  Force rebuild: $BUILD"
echo ""

# 停止现有容器
echo "🛑 Stopping existing containers..."
docker-compose down

# 构建镜像（如果需要）
if [ "$BUILD" = "true" ] || [ "$BUILD" = "rebuild" ]; then
    echo "🔨 Building Docker images..."
    docker-compose build --no-cache
fi

# 根据profile启动不同的服务组合
case $PROFILE in
    "basic")
        echo "🚀 Starting basic services (frontend + backend)..."
        docker-compose up -d frontend backend
        ;;
    "gpu")
        echo "🚀 Starting with GPU support (frontend + backend + vllm)..."
        docker-compose --profile gpu up -d
        ;;
    "nginx")
        echo "🚀 Starting with Nginx proxy (frontend + backend + nginx)..."
        docker-compose --profile nginx up -d
        ;;
    "full")
        echo "🚀 Starting all services (frontend + backend + vllm + nginx)..."
        docker-compose --profile gpu --profile nginx up -d
        ;;
    *)
        echo "❌ Unknown profile: $PROFILE"
        echo "Available profiles: basic, gpu, nginx, full"
        exit 1
        ;;
esac

# 等待服务启动
echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# 检查服务状态
echo ""
echo "📊 Service Status:"
docker-compose ps

# 显示访问信息
echo ""
echo "🎯 Access Information:"
if [ "$PROFILE" = "nginx" ] || [ "$PROFILE" = "full" ]; then
    echo "  🌐 Web Interface: http://localhost"
    echo "  🔧 Direct Frontend: http://localhost:3000"
else
    echo "  🌐 Web Interface: http://localhost:3000"
fi
echo "  🔌 Backend API: http://localhost:8080"
if [ "$PROFILE" = "gpu" ] || [ "$PROFILE" = "full" ]; then
    echo "  🤖 VLLM API: http://localhost:8000"
fi

# 显示日志查看命令
echo ""
echo "📝 Useful Commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart: ./scripts/docker_start.sh $PROFILE rebuild"

# 健康检查
echo ""
echo "🏥 Health Check:"
sleep 5

# 检查后端健康状态
if curl -f http://localhost:8080/health &>/dev/null; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend health check failed"
fi

# 检查前端健康状态
if curl -f http://localhost:3000 &>/dev/null; then
    echo "✅ Frontend is healthy"
else
    echo "⚠️  Frontend health check failed"
fi

echo ""
echo "✨ Inno WebUI is starting up!"
echo "💡 It may take a few moments for all services to be fully ready."
