#!/bin/bash

# 主题功能测试脚本

echo "🎨 VLLM Chat 主题功能测试"
echo "=========================="

# 检查前端目录
if [ ! -d "/home/vllm-chat/frontend" ]; then
    echo "❌ 前端目录不存在"
    exit 1
fi

cd /home/vllm-chat/frontend

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✅ npm 版本: $(npm --version)"

# 检查关键文件
echo ""
echo "📁 检查关键文件..."

files=(
    "src/lib/utils/theme.ts"
    "src/lib/components/UI/ThemeToggle.svelte"
    "src/lib/components/UI/SettingsModal.svelte"
    "src/routes/test/+page.svelte"
    "tailwind.config.js"
    "src/app.css"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file 缺失"
    fi
done

# 检查package.json依赖
echo ""
echo "📦 检查依赖..."

if [ -f "package.json" ]; then
    echo "✅ package.json 存在"
    
    # 检查关键依赖
    if grep -q "tailwindcss" package.json; then
        echo "✅ TailwindCSS 已配置"
    else
        echo "❌ TailwindCSS 未配置"
    fi
    
    if grep -q "svelte-sonner" package.json; then
        echo "✅ svelte-sonner 已配置"
    else
        echo "❌ svelte-sonner 未配置"
    fi
else
    echo "❌ package.json 不存在"
fi

# 安装依赖
echo ""
echo "📥 安装依赖..."
npm install

# 检查构建
echo ""
echo "🔨 检查构建..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi

# 启动开发服务器
echo ""
echo "🚀 启动开发服务器..."
echo ""
echo "📱 测试地址:"
echo "   主应用: http://localhost:3000"
echo "   主题测试: http://localhost:3000/test"
echo ""
echo "🎯 测试项目:"
echo "   1. 主题切换按钮（右上角太阳/月亮图标）"
echo "   2. 设置模态框（右上角齿轮图标）"
echo "   3. 界面颜色过渡效果"
echo "   4. 主题持久化（刷新页面后保持）"
echo "   5. 响应式设计（调整窗口大小）"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 设置环境变量
export VITE_API_BASE_URL="http://localhost:8080"

# 启动开发服务器
npm run dev -- --host 0.0.0.0 --port 3000
