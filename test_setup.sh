#!/bin/bash

# 测试项目设置脚本

echo "🧪 Testing Inno WebUI Setup..."
echo ""

# 检查项目结构
echo "📁 Checking project structure..."
if [ -d "/home/inno_WebUI/frontend" ] && [ -d "/home/inno_WebUI/backend" ]; then
    echo "✅ Project directories exist"
else
    echo "❌ Project directories missing"
    exit 1
fi

# 检查前端文件
echo ""
echo "🎨 Checking frontend files..."
FRONTEND_FILES=(
    "frontend/package.json"
    "frontend/src/lib/components/Chat/ChatInterface.svelte"
    "frontend/src/lib/components/Settings/ModelSettings.svelte"
    "frontend/src/lib/stores/index.ts"
    "frontend/src/lib/api/index.ts"
)

for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "/home/inno_WebUI/$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file missing"
    fi
done

# 检查后端文件
echo ""
echo "🔧 Checking backend files..."
BACKEND_FILES=(
    "backend/requirements.txt"
    "backend/main.py"
    "backend/app/config.py"
    "backend/app/services/vllm_service.py"
    "backend/app/api/chat_completion.py"
)

for file in "${BACKEND_FILES[@]}"; do
    if [ -f "/home/inno_WebUI/$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file missing"
    fi
done

# 检查启动脚本
echo ""
echo "🚀 Checking startup scripts..."
SCRIPTS=(
    "scripts/start_all.sh"
    "scripts/start_qwen.sh"
    "scripts/start_vllm.sh"
    "scripts/start_backend.sh"
    "scripts/start_frontend.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "/home/inno_WebUI/$script" ]; then
        if [ -x "/home/inno_WebUI/$script" ]; then
            echo "✅ $script (executable)"
        else
            echo "⚠️  $script (not executable)"
        fi
    else
        echo "❌ $script missing"
    fi
done

echo ""
echo "📋 Setup Summary:"
echo "- Frontend: Svelte + SvelteKit + TailwindCSS"
echo "- Backend: FastAPI + SQLAlchemy + SQLite"
echo "- Model: VLLM with dynamic configuration"
echo "- Features: Model connection detection, chat history, streaming responses"
echo ""
echo "🎯 Next Steps:"
echo "1. Run: cd /home/inno_WebUI"
echo "2. Start VLLM: ./scripts/start_qwen.sh"
echo "3. Open browser: http://localhost:3000"
echo "4. Configure model in the web interface"
echo ""
echo "✨ Test completed!"
