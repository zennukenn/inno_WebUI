#!/bin/bash

# 前端启动脚本

echo "Starting VLLM Chat Frontend..."

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Please install Node.js 18 or higher."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "npm not found. Please install npm."
    exit 1
fi

# 进入前端目录
cd "$(dirname "$0")/../frontend" || exit 1

# 安装依赖
echo "Installing dependencies..."
npm install

# 设置环境变量
export VITE_API_BASE_URL=${VITE_API_BASE_URL:-"http://localhost:8080"}

# 启动开发服务器
echo "Starting frontend development server..."
npm run dev
