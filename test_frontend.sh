#!/bin/bash

# 前端测试启动脚本

echo "Starting VLLM Chat Frontend for testing..."

# 进入前端目录
cd /home/vllm-chat/frontend

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Please install Node.js 18 or higher."
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "npm not found. Please install npm."
    exit 1
fi

# 安装依赖
echo "Installing dependencies..."
npm install

# 设置环境变量
export VITE_API_BASE_URL="http://localhost:8080"

# 启动开发服务器
echo "Starting development server..."
npm run dev -- --host 0.0.0.0 --port 3000
