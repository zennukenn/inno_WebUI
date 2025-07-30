#!/bin/bash

# Inno WebUI Docker 配置测试脚本
# 用于验证 Docker 配置是否正确

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

# 测试计数器
TESTS_PASSED=0
TESTS_FAILED=0

# 运行测试
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    print_info "Testing: $test_name"
    
    if eval "$test_command" >/dev/null 2>&1; then
        print_success "$test_name - PASSED"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        print_error "$test_name - FAILED"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# 检查 Docker 环境
check_docker_environment() {
    print_info "=== Checking Docker Environment ==="
    
    run_test "Docker daemon running" "docker info"
    run_test "Docker Compose available" "docker-compose --version"
    
    # 检查必要文件
    run_test "Dockerfile exists" "test -f Dockerfile"
    run_test "docker-compose.yml exists" "test -f docker-compose.yml"
    run_test "nginx config exists" "test -f docker/nginx-single.conf"
    run_test "supervisor config exists" "test -f docker/supervisord.conf"
    run_test "start script exists" "test -f docker/start-services.sh"
    
    echo ""
}

# 测试构建过程
test_build() {
    print_info "=== Testing Docker Build ==="
    
    print_info "Building Docker image (this may take a few minutes)..."
    
    if docker build -t inno-webui-test:latest . --no-cache; then
        print_success "Docker build completed successfully"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        
        # 检查镜像
        if docker images | grep -q "inno-webui-test"; then
            print_success "Docker image created successfully"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            print_error "Docker image not found after build"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    else
        print_error "Docker build failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
    
    echo ""
}

# 测试容器运行
test_container() {
    print_info "=== Testing Container Runtime ==="
    
    # 清理现有容器
    docker stop inno-webui-test-container >/dev/null 2>&1 || true
    docker rm inno-webui-test-container >/dev/null 2>&1 || true
    
    # 创建测试目录
    mkdir -p ./test-data ./test-logs
    
    print_info "Starting test container..."
    
    if docker run -d \
        --name inno-webui-test-container \
        -p 8081:80 \
        -p 8082:8080 \
        -v "$(pwd)/test-data:/app/data" \
        -v "$(pwd)/test-logs:/app/logs" \
        -e VLLM_API_BASE_URL="http://localhost:8000/v1" \
        inno-webui-test:latest; then
        
        print_success "Container started successfully"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        
        # 等待服务启动
        print_info "Waiting for services to start..."
        sleep 30
        
        # 测试健康检查
        local max_attempts=10
        local attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if curl -f http://localhost:8081/health >/dev/null 2>&1; then
                print_success "Health check passed"
                TESTS_PASSED=$((TESTS_PASSED + 1))
                break
            fi
            
            print_info "Attempt $attempt/$max_attempts - waiting for health check..."
            sleep 3
            attempt=$((attempt + 1))
        done
        
        if [ $attempt -gt $max_attempts ]; then
            print_error "Health check failed after $max_attempts attempts"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            
            print_info "Container logs:"
            docker logs --tail=50 inno-webui-test-container
        fi
        
        # 测试前端访问
        if curl -f http://localhost:8081/ >/dev/null 2>&1; then
            print_success "Frontend accessible"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            print_error "Frontend not accessible"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
        
        # 测试后端 API
        if curl -f http://localhost:8082/ >/dev/null 2>&1; then
            print_success "Backend API accessible"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            print_error "Backend API not accessible"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
        
    else
        print_error "Failed to start container"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    echo ""
}

# 清理测试资源
cleanup() {
    print_info "=== Cleaning Up Test Resources ==="
    
    # 停止并删除测试容器
    docker stop inno-webui-test-container >/dev/null 2>&1 || true
    docker rm inno-webui-test-container >/dev/null 2>&1 || true
    
    # 删除测试镜像
    docker rmi inno-webui-test:latest >/dev/null 2>&1 || true
    
    # 删除测试目录
    rm -rf ./test-data ./test-logs
    
    print_success "Cleanup completed"
    echo ""
}

# 显示测试结果
show_results() {
    print_info "=== Test Results ==="
    echo ""
    print_success "Tests Passed: $TESTS_PASSED"
    print_error "Tests Failed: $TESTS_FAILED"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        print_success "🎉 All tests passed! Docker configuration is working correctly."
        echo ""
        echo "You can now run your application with:"
        echo "  ./docker-run.sh run"
        echo "  or"
        echo "  docker-compose up -d"
        return 0
    else
        print_error "❌ Some tests failed. Please check the configuration."
        echo ""
        echo "Common issues:"
        echo "  - Docker daemon not running"
        echo "  - Port conflicts (80, 8080 already in use)"
        echo "  - Insufficient disk space"
        echo "  - Network connectivity issues"
        return 1
    fi
}

# 主函数
main() {
    echo "🧪 Inno WebUI Docker Configuration Test"
    echo "======================================"
    echo ""
    
    # 设置陷阱以确保清理
    trap cleanup EXIT
    
    check_docker_environment
    
    if [ $TESTS_FAILED -eq 0 ]; then
        test_build
    fi
    
    if [ $TESTS_FAILED -eq 0 ]; then
        test_container
    fi
    
    show_results
}

# 运行主函数
main "$@"
