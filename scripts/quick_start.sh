#!/bin/bash

# Inno WebUI 快速启动脚本
# 适用于已有镜像的快速部署

set -e

echo "⚡ Inno WebUI 快速启动"
echo "====================="

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 获取本机IP
get_local_ip() {
    if command -v ip &> /dev/null; then
        ip route get 8.8.8.8 | awk '{print $7; exit}' 2>/dev/null || echo "localhost"
    elif command -v ifconfig &> /dev/null; then
        ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1 || echo "localhost"
    else
        echo "localhost"
    fi
}

LOCAL_IP=$(get_local_ip)

# 检查Docker和镜像
if ! command -v docker &> /dev/null; then
    log_error "Docker 未安装"
    exit 1
fi

if ! docker images | grep -q "inno-webui"; then
    log_error "未找到 inno-webui 镜像"
    log_info "请先导入镜像或运行构建脚本"
    exit 1
fi

# 停止现有容器
if docker ps -a | grep -q "inno-webui-app"; then
    log_info "停止现有容器..."
    docker stop inno-webui-app 2>/dev/null || true
    docker rm inno-webui-app 2>/dev/null || true
fi

# 创建必要目录
mkdir -p data logs

# 启动容器
log_info "启动 Inno WebUI..."

docker run -d \
    --name inno-webui-app \
    --restart unless-stopped \
    -p 8080:8080 \
    -p 8070:8070 \
    -v "$(pwd)/data:/app/data" \
    -v "$(pwd)/logs:/app/logs" \
    -e CORS_ORIGINS="*" \
    -e HOST="0.0.0.0" \
    -e PORT="8070" \
    inno-webui:latest

if [ $? -eq 0 ]; then
    log_success "容器启动成功"
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 15
    
    # 检查服务状态
    if curl -s http://localhost:8080 > /dev/null 2>&1; then
        log_success "服务启动成功"

        echo ""
        echo "🎯 访问地址:"
        echo "   本地: http://localhost:8080"
        if [ "$LOCAL_IP" != "localhost" ]; then
            echo "   网络: http://$LOCAL_IP:8080"
        fi
        echo ""
        echo "📊 容器状态:"
        docker ps --filter "name=inno-webui-app" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        
    else
        log_warning "服务可能还在启动中，请稍后访问"
        log_info "查看日志: docker logs inno-webui-app -f"
    fi
    
else
    log_error "容器启动失败"
    exit 1
fi
