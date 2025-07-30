#!/bin/bash

# Inno WebUI 单容器 Docker 运行脚本
# 使用方法: ./docker-run.sh [build|rebuild|run]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查Docker是否运行
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
}

# 清理旧容器
cleanup_containers() {
    print_info "Cleaning up existing containers..."
    
    # 停止并删除现有容器
    if docker ps -a --format "table {{.Names}}" | grep -q "inno-webui-app"; then
        print_info "Stopping existing inno-webui-app container..."
        docker stop inno-webui-app >/dev/null 2>&1 || true
        docker rm inno-webui-app >/dev/null 2>&1 || true
        print_success "Cleaned up existing container"
    fi
}

# 构建镜像
build_image() {
    print_info "Building Inno WebUI Docker image..."
    
    # 构建镜像
    docker build -t inno-webui:latest . || {
        print_error "Docker build failed!"
        exit 1
    }
    
    print_success "Docker image built successfully"
}

# 运行容器
run_container() {
    print_info "Starting Inno WebUI container..."
    
    # 创建本地数据和日志目录
    mkdir -p ./data ./logs
    
    # 运行容器
    docker run -d \
        --name inno-webui-app \
        --restart unless-stopped \
        -p 80:80 \
        -p 8080:8080 \
        -v "$(pwd)/data:/app/data" \
        -v "$(pwd)/logs:/app/logs" \
        -e VLLM_API_BASE_URL="${VLLM_API_BASE_URL:-http://localhost:8000/v1}" \
        -e DATABASE_URL="sqlite:///./data/chat.db" \
        -e HOST="0.0.0.0" \
        -e PORT="8080" \
        -e PYTHONPATH="/app" \
        -e NODE_ENV="production" \
        -e LOG_LEVEL="${LOG_LEVEL:-INFO}" \
        -e ALLOW_DYNAMIC_VLLM_URL="${ALLOW_DYNAMIC_VLLM_URL:-true}" \
        inno-webui:latest || {
        print_error "Failed to start container!"
        exit 1
    }
    
    print_success "Container started successfully"
}

# 等待服务启动
wait_for_service() {
    print_info "Waiting for services to start..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:80/health >/dev/null 2>&1; then
            print_success "Service is healthy!"
            return 0
        fi
        
        print_info "Attempt $attempt/$max_attempts - waiting for service..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_warning "Service health check timeout. Check logs with: docker logs inno-webui-app"
    return 1
}

# 显示状态和日志
show_status() {
    print_info "Container Status:"
    docker ps --filter "name=inno-webui-app" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    print_info "Recent logs:"
    docker logs --tail=20 inno-webui-app
    
    echo ""
    print_success "🎉 Inno WebUI is running!"
    echo ""
    echo "📱 Access URLs:"
    echo "   Frontend: http://localhost"
    echo "   Backend API: http://localhost:8080"
    echo "   Health Check: http://localhost/health"
    echo ""
    echo "📝 Useful Commands:"
    echo "   View logs: docker logs -f inno-webui-app"
    echo "   Stop service: docker stop inno-webui-app"
    echo "   Restart: ./docker-run.sh run"
    echo "   Rebuild: ./docker-run.sh rebuild"
}

# 主函数
main() {
    local action=${1:-run}
    
    echo "🚀 Inno WebUI Docker Runner"
    echo "=========================="
    
    check_docker
    
    case $action in
        "build")
            cleanup_containers
            build_image
            ;;
        "rebuild")
            cleanup_containers
            build_image
            run_container
            wait_for_service
            show_status
            ;;
        "run")
            cleanup_containers
            
            # 检查镜像是否存在
            if ! docker images --format "table {{.Repository}}:{{.Tag}}" | grep -q "inno-webui:latest"; then
                print_warning "Image not found, building first..."
                build_image
            fi
            
            run_container
            wait_for_service
            show_status
            ;;
        "stop")
            print_info "Stopping Inno WebUI..."
            docker stop inno-webui-app >/dev/null 2>&1 || true
            docker rm inno-webui-app >/dev/null 2>&1 || true
            print_success "Stopped successfully"
            ;;
        "logs")
            docker logs -f inno-webui-app
            ;;
        "status")
            show_status
            ;;
        *)
            echo "Usage: $0 [build|rebuild|run|stop|logs|status]"
            echo ""
            echo "Commands:"
            echo "  build    - Build Docker image only"
            echo "  rebuild  - Build image and run container"
            echo "  run      - Run container (build if needed)"
            echo "  stop     - Stop and remove container"
            echo "  logs     - Show container logs"
            echo "  status   - Show container status"
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
