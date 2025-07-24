#!/bin/bash

# 后端启动脚本

echo "Starting VLLM Chat Backend..."

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "Python3 not found. Please install Python 3.8 or higher."
    exit 1
fi

# 进入后端目录
cd "$(dirname "$0")/../backend" || exit 1

# # 检查虚拟环境
# if [ ! -d "venv" ]; then
#     echo "Creating virtual environment..."
#     python3 -m venv venv
# fi

# # 激活虚拟环境
# source venv/bin/activate

# 安装依赖
echo "Installing dependencies..."
pip install -r requirements.txt

# 设置环境变量
export VLLM_API_BASE_URL=${VLLM_API_BASE_URL:-"http://localhost:8000/v1"}
export DATABASE_URL=${DATABASE_URL:-"sqlite:///./data/chat.db"}
export HOST=${HOST:-"0.0.0.0"}
export PORT=${PORT:-"8080"}

# 创建数据目录
mkdir -p data

# 启动服务
echo "Starting backend server on $HOST:$PORT"
python main.py
