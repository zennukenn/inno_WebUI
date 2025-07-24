#!/bin/bash

# VLLM启动脚本
# 使用方法: ./start_vllm.sh [model_name] [port]

MODEL_NAME=${1:-"/models/Qwen3-0.6B-GPTQ-Int8"}
PORT=${2:-8000}
HOST=${3:-"0.0.0.0"}

echo "Starting VLLM server..."
echo "Model: $MODEL_NAME"
echo "Host: $HOST"
echo "Port: $PORT"

# 检查是否安装了VLLM
if ! command -v python -m vllm.entrypoints.openai.api_server &> /dev/null; then
    echo "VLLM not found. Installing..."
    pip install vllm
fi

# 启动VLLM服务器
python -m vllm.entrypoints.openai.api_server \
    --model "$MODEL_NAME" \
    --host "$HOST" \
    --port "$PORT" \
    --served-model-name "Qwen3-0.6B-GPTQ-Int8" \
    --max-model-len 2048 \
    --tensor-parallel-size 1 \
    --dtype float16 \
    --quantization gptq \
    --gpu-memory-utilization 0.8 \
    --max-num-seqs 256
