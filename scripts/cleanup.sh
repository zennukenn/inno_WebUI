#!/bin/bash

# Inno WebUI 项目清理脚本
# 清理临时文件、构建产物和缓存

echo "🧹 Cleaning up Inno WebUI project..."

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "📁 Current directory: $PROJECT_DIR"

# 清理前端构建产物
echo ""
echo "🔧 Cleaning frontend build artifacts..."
if [ -d "frontend/.svelte-kit" ]; then
    rm -rf frontend/.svelte-kit
    echo "✅ Removed frontend/.svelte-kit"
fi

if [ -d "frontend/build" ]; then
    rm -rf frontend/build
    echo "✅ Removed frontend/build"
fi

if [ -d "frontend/dist" ]; then
    rm -rf frontend/dist
    echo "✅ Removed frontend/dist"
fi

# 清理后端缓存
echo ""
echo "🐍 Cleaning Python cache files..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -name "*.pyc" -delete 2>/dev/null
find . -name "*.pyo" -delete 2>/dev/null
find . -name "*.pyd" -delete 2>/dev/null
echo "✅ Removed Python cache files"

# 清理数据库文件（开发环境）
echo ""
echo "💾 Cleaning development database files..."
if [ -f "backend/chat.db" ]; then
    rm -f backend/chat.db
    echo "✅ Removed backend/chat.db"
fi

if [ -d "backend/data" ]; then
    rm -rf backend/data
    echo "✅ Removed backend/data directory"
fi

# 清理日志文件
echo ""
echo "📝 Cleaning log files..."
find . -name "*.log" -delete 2>/dev/null
find . -name "npm-debug.log*" -delete 2>/dev/null
find . -name "yarn-debug.log*" -delete 2>/dev/null
find . -name "yarn-error.log*" -delete 2>/dev/null
echo "✅ Removed log files"

# 清理临时文件
echo ""
echo "🗑️  Cleaning temporary files..."
find . -name "*.tmp" -delete 2>/dev/null
find . -name "*.temp" -delete 2>/dev/null
find . -name ".DS_Store" -delete 2>/dev/null
find . -name "Thumbs.db" -delete 2>/dev/null
echo "✅ Removed temporary files"

# 清理编辑器文件
echo ""
echo "✏️  Cleaning editor files..."
find . -name "*.swp" -delete 2>/dev/null
find . -name "*.swo" -delete 2>/dev/null
find . -name "*~" -delete 2>/dev/null
echo "✅ Removed editor temporary files"

# 显示清理后的项目大小
echo ""
echo "📊 Project size after cleanup:"
du -sh . 2>/dev/null || echo "Unable to calculate size"

echo ""
echo "🎯 Cleanup summary:"
echo "   ✅ Frontend build artifacts removed"
echo "   ✅ Python cache files removed"
echo "   ✅ Development database files removed"
echo "   ✅ Log files removed"
echo "   ✅ Temporary files removed"
echo "   ✅ Editor files removed"

echo ""
echo "💡 Note: The following are preserved:"
echo "   📚 Documentation files"
echo "   💻 Source code"
echo "   🔧 Configuration files"
echo "   🚀 Scripts"
echo "   📦 Package files (package.json, requirements.txt)"

echo ""
echo "✨ Cleanup completed!"
