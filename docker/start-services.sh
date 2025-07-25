#!/bin/bash
# Inno WebUI 单容器服务启动脚本
set -e

echo "🚀 Starting Inno WebUI services..."

# 创建必要的目录
mkdir -p /app/logs /app/data /var/log/supervisor /var/run

# 检查静态文件目录及 index.html
if [ -d "/app/static" ]; then
    echo "✅ Static files directory found: /app/static"
    if [ -f "/app/static/index.html" ]; then
        echo "✅ index.html detected"
    else
        echo "⚠️  index.html not found! This may mean frontend build failed."
        echo "⚠️  Creating a temporary placeholder page..."
        echo '<!DOCTYPE html><html><head><title>Inno WebUI</title></head><body><h1>Inno WebUI</h1><p>Frontend build missing</p></body></html>' > /app/static/index.html
        echo "⚠️  Placeholder page created at /app/static/index.html"
    fi
    chown -R nginx:nginx /app/static
    chmod -R 755 /app/static
else
    echo "❌ Static directory not found, creating placeholder..."
    mkdir -p /app/static
    echo '<!DOCTYPE html><html><head><title>Inno WebUI</title></head><body><h1>Inno WebUI</h1><p>Static directory created</p></body></html>' > /app/static/index.html
    chown -R nginx:nginx /app/static
    chmod -R 755 /app/static
fi

# 测试 Python 环境
echo "🐍 Testing Python environment..."
cd /app
python --version || echo "⚠️ Python not found!"
echo "📋 Python path: $PYTHONPATH"
echo "📋 Current directory: $(pwd)"
ls -la /app/ | head -50

# 测试后端导入
python - <<'PYCODE' || echo "❌ Backend import failed, but continuing..."
import sys, traceback
sys.path.insert(0, '/app')
print('Testing backend import...')
try:
    import main
    print('✅ Backend import successful')
except Exception as e:
    print('❌ Backend import failed:', e)
    traceback.print_exc()
PYCODE

# 初始化数据库
if [ ! -f "/app/data/chat.db" ]; then
    echo "📦 Creating database file..."
    touch /app/data/chat.db
fi

# 测试 Nginx 配置
echo "🔧 Testing Nginx configuration..."
nginx -t || {
    echo "❌ Nginx configuration test failed!"
    cat /etc/nginx/http.d/default.conf || true
    exit 1
}

# 打印 Supervisor 配置
echo "🎯 Starting services with Supervisor..."
sed -n '1,200p' /etc/supervisor/conf.d/supervisord.conf || true

# 启动 Supervisor（前台）
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf

