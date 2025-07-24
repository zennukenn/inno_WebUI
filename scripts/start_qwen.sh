#!/bin/bash

# Qwen模型专用启动脚本

echo "Starting Inno WebUI with Qwen3-0.6B-GPTQ-Int8 model..."

# 检查模型文件是否存在
MODEL_PATH="/models/Qwen3-0.6B-GPTQ-Int8"
if [ ! -d "$MODEL_PATH" ]; then
    echo "Error: Model directory $MODEL_PATH not found!"
    echo "Please ensure the Qwen3-0.6B-GPTQ-Int8 model is available at $MODEL_PATH"
    exit 1
fi

echo "Model found at: $MODEL_PATH"

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 设置端口
VLLM_PORT=${1:-8000}
BACKEND_PORT=${2:-8080}
FRONTEND_PORT=${3:-3000}

echo "Configuration:"
echo "  Model: Qwen3-0.6B-GPTQ-Int8"
echo "  Model Path: $MODEL_PATH"
echo "  VLLM Port: $VLLM_PORT"
echo "  Backend Port: $BACKEND_PORT"
echo "  Frontend Port: $FRONTEND_PORT"
echo ""

# 启动所有服务
"$SCRIPT_DIR/start_all.sh" "$MODEL_PATH" "$VLLM_PORT" "$BACKEND_PORT" "$FRONTEND_PORT"
