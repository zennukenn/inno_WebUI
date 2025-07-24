#!/bin/bash

# Inno WebUI Docker镜像构建脚本

echo "🔨 Building Inno WebUI Docker images..."

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# 设置镜像标签
VERSION=${1:-"latest"}
REGISTRY=${2:-""}

if [ -n "$REGISTRY" ]; then
    FRONTEND_TAG="$REGISTRY/inno-webui-frontend:$VERSION"
    BACKEND_TAG="$REGISTRY/inno-webui-backend:$VERSION"
else
    FRONTEND_TAG="inno-webui-frontend:$VERSION"
    BACKEND_TAG="inno-webui-backend:$VERSION"
fi

echo "📋 Build Configuration:"
echo "  Version: $VERSION"
echo "  Registry: ${REGISTRY:-"local"}"
echo "  Frontend tag: $FRONTEND_TAG"
echo "  Backend tag: $BACKEND_TAG"
echo ""

# 构建后端镜像
echo "🐍 Building backend image..."
docker build -t "$BACKEND_TAG" ./backend
if [ $? -eq 0 ]; then
    echo "✅ Backend image built successfully"
else
    echo "❌ Backend image build failed"
    exit 1
fi

# 构建前端镜像
echo "🌐 Building frontend image..."
docker build -t "$FRONTEND_TAG" ./frontend
if [ $? -eq 0 ]; then
    echo "✅ Frontend image built successfully"
else
    echo "❌ Frontend image build failed"
    exit 1
fi

# 显示镜像信息
echo ""
echo "📊 Built images:"
docker images | grep inno-webui

# 推送到仓库（如果指定了registry）
if [ -n "$REGISTRY" ]; then
    echo ""
    echo "🚀 Pushing images to registry..."
    
    echo "Pushing frontend image..."
    docker push "$FRONTEND_TAG"
    
    echo "Pushing backend image..."
    docker push "$BACKEND_TAG"
    
    echo "✅ Images pushed successfully"
fi

echo ""
echo "✨ Build completed!"
echo ""
echo "💡 Usage:"
echo "  Local: docker run -p 3000:3000 $FRONTEND_TAG"
echo "  Local: docker run -p 8080:8080 $BACKEND_TAG"
echo "  Compose: docker-compose up"
