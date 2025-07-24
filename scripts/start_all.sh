#!/bin/bash

# 完整启动脚本 - 启动VLLM、后端和前端

echo "Starting VLLM Chat Application..."

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 检查是否提供了模型名称
MODEL_NAME=${1:-"/models/Qwen3-0.6B-GPTQ-Int8"}
BACKEND_PORT=${3:-8080}
FRONTEND_PORT=${4:-3000}

echo "Configuration:"
echo "  Model: $MODEL_NAME"
echo "  Backend Port: $BACKEND_PORT"
echo "  Frontend Port: $FRONTEND_PORT"
echo ""

# 函数：检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "Port $port is already in use"
        return 1
    fi
    return 0
}



# 检查端口
echo "Checking ports..."
check_port $VLLM_PORT || exit 1
check_port $BACKEND_PORT || exit 1
check_port $FRONTEND_PORT || exit 1


# 启动后端服务
echo "Starting backend service..."
export PORT=$BACKEND_PORT
export VLLM_API_BASE_URL="http://localhost:$VLLM_PORT/v1"
"$SCRIPT_DIR/start_backend.sh" &
BACKEND_PID=$!

# 启动前端服务
echo "Starting frontend service..."
export VITE_API_BASE_URL="http://localhost:$BACKEND_PORT"
cd "$PROJECT_DIR/frontend"
npm run dev -- --port $FRONTEND_PORT &
FRONTEND_PID=$!

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "Services:"
echo "  VLLM API: http://localhost:$VLLM_PORT"
echo "  Backend API: http://localhost:$BACKEND_PORT"
echo "  Frontend: http://localhost:$FRONTEND_PORT"
echo ""
echo "Open your browser and go to: http://localhost:$FRONTEND_PORT"
echo ""
echo "Press Ctrl+C to stop all services"

# 等待用户中断
trap 'echo "Stopping all services..."; kill $VLLM_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

# 保持脚本运行
wait
