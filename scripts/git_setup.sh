#!/bin/bash

# Inno WebUI Git配置脚本
# 初始化Git仓库并配置关键文档上传

echo "🔧 Setting up Git repository for Inno WebUI..."

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# 检查是否已经是Git仓库
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "📦 Git repository already exists"
fi

# 配置Git用户信息（如果未设置）
if [ -z "$(git config user.name)" ]; then
    echo "👤 Please enter your name for Git commits:"
    read -r git_name
    git config user.name "$git_name"
fi

if [ -z "$(git config user.email)" ]; then
    echo "📧 Please enter your email for Git commits:"
    read -r git_email
    git config user.email "$git_email"
fi

# 设置默认分支名
git config init.defaultBranch main

echo ""
echo "📋 Current Git status:"
git status --short

echo ""
echo "📁 Files that will be tracked (key documents and source code):"
echo "   ✅ Documentation files (*.md)"
echo "   ✅ Source code (*.py, *.js, *.ts, *.svelte)"
echo "   ✅ Configuration files (*.json, *.yml, *.toml)"
echo "   ✅ Scripts (*.sh)"
echo "   ✅ Docker files"
echo ""
echo "🚫 Files that will be ignored:"
echo "   ❌ Dependencies (node_modules/, __pycache__/)"
echo "   ❌ Build outputs (.svelte-kit/, dist/)"
echo "   ❌ Database files (*.db, *.sqlite)"
echo "   ❌ Log files (*.log)"
echo "   ❌ Temporary files"

echo ""
echo "🎯 Next steps:"
echo "1. Review files to be committed: git status"
echo "2. Add files: git add ."
echo "3. Make initial commit: git commit -m 'Initial commit: Inno WebUI project'"
echo "4. Add remote repository: git remote add origin <your-repo-url>"
echo "5. Push to remote: git push -u origin main"

echo ""
echo "💡 Useful Git commands:"
echo "   git status          - Check repository status"
echo "   git add .           - Add all tracked files"
echo "   git commit -m 'msg' - Commit with message"
echo "   git push            - Push to remote repository"
echo "   git pull            - Pull from remote repository"
echo "   git log --oneline   - View commit history"

echo ""
echo "✨ Git setup completed!"
