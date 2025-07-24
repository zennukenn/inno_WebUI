#!/bin/bash

# Inno WebUI 快速提交脚本
# 快速添加、提交和推送关键文档

echo "🚀 Inno WebUI Quick Commit Script"

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# 检查是否是Git仓库
if [ ! -d ".git" ]; then
    echo "❌ Not a Git repository. Please run ./scripts/git_setup.sh first"
    exit 1
fi

# 显示当前状态
echo ""
echo "📋 Current repository status:"
git status --short

echo ""
echo "📁 Files to be committed:"
git diff --cached --name-only
git ls-files --others --exclude-standard

# 获取提交信息
if [ -z "$1" ]; then
    echo ""
    echo "💬 Enter commit message:"
    read -r commit_message
else
    commit_message="$1"
fi

if [ -z "$commit_message" ]; then
    echo "❌ Commit message cannot be empty"
    exit 1
fi

# 添加所有跟踪的文件
echo ""
echo "📦 Adding files..."
git add .

# 显示将要提交的文件
echo ""
echo "✅ Files staged for commit:"
git diff --cached --name-only

# 确认提交
echo ""
echo "🤔 Do you want to commit these files? (y/N)"
read -r confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    # 提交
    echo "💾 Committing..."
    git commit -m "$commit_message"
    
    if [ $? -eq 0 ]; then
        echo "✅ Commit successful!"
        
        # 询问是否推送
        echo ""
        echo "🌐 Do you want to push to remote repository? (y/N)"
        read -r push_confirm
        
        if [[ $push_confirm =~ ^[Yy]$ ]]; then
            echo "🚀 Pushing to remote..."
            git push
            
            if [ $? -eq 0 ]; then
                echo "✅ Push successful!"
            else
                echo "❌ Push failed. You may need to set up remote repository first."
                echo "💡 Use: git remote add origin <your-repo-url>"
            fi
        else
            echo "📝 Changes committed locally. Use 'git push' to upload to remote repository."
        fi
    else
        echo "❌ Commit failed"
        exit 1
    fi
else
    echo "❌ Commit cancelled"
    exit 1
fi

echo ""
echo "📊 Repository summary:"
echo "   Latest commit: $(git log -1 --oneline)"
echo "   Branch: $(git branch --show-current)"
echo "   Remote: $(git remote -v | head -1 | awk '{print $2}' || echo 'No remote configured')"

echo ""
echo "✨ Done!"
