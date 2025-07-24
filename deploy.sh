#!/bin/bash

# Inno WebUI 一键部署脚本
# 自动检测环境并部署应用

set -e

echo "🚀 Inno WebUI 一键部署脚本"
echo "================================"

# 检查系统要求
check_requirements() {
    echo "🔍 检查系统要求..."
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker 未安装"
        echo "请先安装Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo "❌ Docker Compose 未安装"
        echo "请先安装Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    # 检查Docker服务状态
    if ! docker info &> /dev/null; then
        echo "❌ Docker 服务未运行"
        echo "请启动Docker服务"
        exit 1
    fi
    
    echo "✅ 系统要求检查通过"
}

# 检测GPU支持
check_gpu() {
    echo "🔍 检测GPU支持..."
    
    if command -v nvidia-smi &> /dev/null; then
        if nvidia-smi &> /dev/null; then
            echo "✅ 检测到NVIDIA GPU"
            return 0
        fi
    fi
    
    echo "⚠️  未检测到GPU或GPU不可用"
    return 1
}

# 创建环境配置
setup_environment() {
    echo "⚙️  配置环境..."
    
    if [ ! -f ".env" ]; then
        echo "📝 创建环境配置文件..."
        cp .env.example .env
        echo "✅ 已创建 .env 文件，请根据需要修改配置"
    else
        echo "✅ 环境配置文件已存在"
    fi
}

# 选择部署模式
select_deployment_mode() {
    echo ""
    echo "📋 请选择部署模式:"
    echo "1) 基础模式 (前端 + 后端)"
    echo "2) GPU模式 (前端 + 后端 + VLLM)"
    echo "3) Nginx模式 (前端 + 后端 + Nginx)"
    echo "4) 完整模式 (前端 + 后端 + VLLM + Nginx)"
    echo "5) 自动选择"
    
    read -p "请输入选择 (1-5): " choice
    
    case $choice in
        1)
            DEPLOY_MODE="basic"
            ;;
        2)
            DEPLOY_MODE="gpu"
            ;;
        3)
            DEPLOY_MODE="nginx"
            ;;
        4)
            DEPLOY_MODE="full"
            ;;
        5)
            # 自动选择模式
            if check_gpu; then
                DEPLOY_MODE="gpu"
                echo "🤖 自动选择: GPU模式"
            else
                DEPLOY_MODE="basic"
                echo "💻 自动选择: 基础模式"
            fi
            ;;
        *)
            echo "❌ 无效选择，使用基础模式"
            DEPLOY_MODE="basic"
            ;;
    esac
    
    echo "✅ 选择部署模式: $DEPLOY_MODE"
}

# 部署应用
deploy_application() {
    echo ""
    echo "🚀 开始部署..."
    
    # 停止现有服务
    echo "🛑 停止现有服务..."
    ./scripts/docker_stop.sh 2>/dev/null || true
    
    # 启动服务
    echo "🔄 启动服务..."
    ./scripts/docker_start.sh "$DEPLOY_MODE" rebuild
    
    if [ $? -eq 0 ]; then
        echo "✅ 部署成功!"
    else
        echo "❌ 部署失败"
        exit 1
    fi
}

# 显示访问信息
show_access_info() {
    echo ""
    echo "🎯 访问信息:"
    echo "================================"
    
    case $DEPLOY_MODE in
        "nginx"|"full")
            echo "🌐 主要访问地址: http://localhost"
            echo "🔧 前端直接访问: http://localhost:3000"
            ;;
        *)
            echo "🌐 前端访问地址: http://localhost:3000"
            ;;
    esac
    
    echo "🔌 后端API地址: http://localhost:8080"
    
    if [ "$DEPLOY_MODE" = "gpu" ] || [ "$DEPLOY_MODE" = "full" ]; then
        echo "🤖 VLLM API地址: http://localhost:8000"
    fi
    
    echo ""
    echo "📝 常用命令:"
    echo "  查看状态: docker-compose ps"
    echo "  查看日志: docker-compose logs -f"
    echo "  停止服务: ./scripts/docker_stop.sh"
    echo "  重启服务: ./scripts/docker_start.sh $DEPLOY_MODE"
    
    echo ""
    echo "📚 更多信息请查看: DOCKER_GUIDE.md"
}

# 主函数
main() {
    # 检查是否在项目根目录
    if [ ! -f "docker-compose.yml" ]; then
        echo "❌ 请在项目根目录运行此脚本"
        exit 1
    fi
    
    # 执行部署流程
    check_requirements
    setup_environment
    select_deployment_mode
    deploy_application
    show_access_info
    
    echo ""
    echo "🎉 部署完成! 享受使用 Inno WebUI!"
}

# 运行主函数
main "$@"
