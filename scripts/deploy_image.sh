#!/bin/bash

# Inno WebUI 通用部署脚本
# 适用于任何机器的一键部署

set -e

echo "🚀 Inno WebUI 通用部署脚本"
echo "================================"
echo "📅 $(date)"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检测当前机器信息
detect_machine_info() {
    log_info "检测当前机器信息..."
    
    # 获取主机名
    HOSTNAME=$(hostname)
    log_info "主机名: $HOSTNAME"
    
    # 获取主要IP地址
    if command -v ip &> /dev/null; then
        # 使用ip命令获取主要网络接口的IP
        MAIN_IP=$(ip route get 8.8.8.8 | awk '{print $7; exit}' 2>/dev/null || echo "")
    elif command -v ifconfig &> /dev/null; then
        # 备用方案：使用ifconfig
        MAIN_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
    else
        MAIN_IP="localhost"
    fi
    
    if [ -z "$MAIN_IP" ]; then
        MAIN_IP="localhost"
    fi
    
    log_info "主要IP地址: $MAIN_IP"
    
    # 检测操作系统
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="Linux"
        if [ -f /etc/os-release ]; then
            DISTRO=$(grep '^NAME=' /etc/os-release | cut -d'"' -f2)
        else
            DISTRO="Unknown Linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macOS"
        DISTRO="macOS"
    else
        OS="Unknown"
        DISTRO="Unknown"
    fi
    
    log_info "操作系统: $OS ($DISTRO)"
    
    # 检测架构
    ARCH=$(uname -m)
    log_info "系统架构: $ARCH"
    
    echo ""
}

# 检查系统要求
check_requirements() {
    log_info "检查系统要求..."
    
    local requirements_met=true
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        log_info "请先安装Docker: https://docs.docker.com/get-docker/"
        requirements_met=false
    else
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        log_success "Docker 已安装 (版本: $DOCKER_VERSION)"
    fi
    
    # 检查Docker服务状态
    if ! docker info &> /dev/null; then
        log_error "Docker 服务未运行"
        log_info "请启动Docker服务"
        requirements_met=false
    else
        log_success "Docker 服务运行正常"
    fi
    
    # 检查端口占用
    check_port() {
        local port=$1
        local service=$2
        if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port "; then
            log_warning "端口 $port 已被占用 ($service)"
            return 1
        else
            log_success "端口 $port 可用 ($service)"
            return 0
        fi
    }
    
    # 检查关键端口
    check_port 8070 "前端服务"
    check_port 8080 "后端API"
    
    if [ "$requirements_met" = false ]; then
        log_error "系统要求检查失败，请解决上述问题后重试"
        exit 1
    fi
    
    log_success "系统要求检查通过"
    echo ""
}

# 创建必要的目录和文件
setup_environment() {
    log_info "设置部署环境..."
    
    # 创建数据和日志目录
    mkdir -p data logs
    
    # 设置权限
    chmod 755 data logs
    
    # 创建环境配置文件
    if [ ! -f ".env" ]; then
        log_info "创建环境配置文件..."
        cat > .env << EOF
# Inno WebUI Environment Configuration
# 自动生成于: $(date)
# 主机: $HOSTNAME ($MAIN_IP)

# ===== VLLM API配置 =====
VLLM_API_BASE_URL=http://localhost:8000/v1
VLLM_API_KEY=
DEFAULT_MODEL=

# Backend Configuration
HOST=0.0.0.0
PORT=8080
DATABASE_URL=sqlite:///./data/chat.db

# Security
SECRET_KEY=inno-webui-$(date +%s)-$(openssl rand -hex 8 2>/dev/null || echo "default")
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Logging
LOG_LEVEL=INFO

# ===== CORS配置 =====
# 允许所有来源访问（适用于跨网络部署）
CORS_ORIGINS=*

# ===== WebSocket配置 =====
ENABLE_WEBSOCKET=true

# ===== 部署信息 =====
DEPLOY_HOST=$HOSTNAME
DEPLOY_IP=$MAIN_IP
DEPLOY_DATE=$(date)
EOF
        log_success "环境配置文件已创建"
    else
        log_success "环境配置文件已存在"
    fi
    
    echo ""
}

# 部署服务
deploy_service() {
    log_info "开始部署服务..."
    
    # 停止现有容器
    if docker ps -a | grep -q "inno-webui-app"; then
        log_info "停止现有容器..."
        docker stop inno-webui-app 2>/dev/null || true
        docker rm inno-webui-app 2>/dev/null || true
    fi
    
    # 启动新容器
    log_info "启动 Inno WebUI 容器..."
    
    docker run -d \
        --name inno-webui-app \
        --restart unless-stopped \
        -p 8070:8070 \
        -p 8080:8080 \
        -v "$(pwd)/data:/app/data" \
        -v "$(pwd)/logs:/app/logs" \
        --env-file .env \
        inno-webui:latest
    
    if [ $? -eq 0 ]; then
        log_success "容器启动成功"
    else
        log_error "容器启动失败"
        exit 1
    fi
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 10
    
    # 检查容器状态
    if docker ps | grep -q "inno-webui-app"; then
        log_success "容器运行正常"
    else
        log_error "容器启动失败"
        log_info "查看容器日志:"
        docker logs inno-webui-app --tail 20
        exit 1
    fi
    
    echo ""
}

# 验证部署
verify_deployment() {
    log_info "验证部署状态..."
    
    # 等待服务完全启动
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:8070 > /dev/null 2>&1; then
            log_success "前端服务响应正常"
            break
        else
            log_info "等待前端服务启动... ($attempt/$max_attempts)"
            sleep 2
            ((attempt++))
        fi
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "前端服务启动超时"
        return 1
    fi
    
    # 检查后端API
    if curl -s http://localhost:8080/health | grep -q "healthy"; then
        log_success "后端API响应正常"
    else
        log_warning "后端API响应异常"
    fi
    
    echo ""
}

# 显示访问信息
show_access_info() {
    echo ""
    echo "🎯 部署完成！访问信息:"
    echo "================================"
    echo ""
    echo "🌐 本地访问:"
    echo "   前端界面: http://localhost:8070"
    echo "   后端API:  http://localhost:8080"
    echo ""
    echo "🌍 网络访问:"
    echo "   前端界面: http://$MAIN_IP:8070"
    echo "   后端API:  http://$MAIN_IP:8080"
    echo ""
    echo "📊 容器状态:"
    docker ps --filter "name=inno-webui-app" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "📝 常用命令:"
    echo "   查看日志: docker logs inno-webui-app -f"
    echo "   重启服务: docker restart inno-webui-app"
    echo "   停止服务: docker stop inno-webui-app"
    echo "   删除容器: docker rm -f inno-webui-app"
    echo ""
    echo "🔧 配置文件: .env"
    echo "📁 数据目录: ./data"
    echo "📋 日志目录: ./logs"
    echo ""
    echo "🎉 享受使用 Inno WebUI!"
}

# 主函数
main() {
    detect_machine_info
    check_requirements
    setup_environment
    deploy_service
    verify_deployment
    show_access_info
}

# 运行主函数
main "$@"
