#!/bin/bash
# Inno WebUI 单容器服务启动脚本
set -e

echo "🚀 Starting Inno WebUI services..."

# 创建必要的目录
mkdir -p /app/logs /app/data /var/log/supervisor /var/run

# 检查静态文件目录
if [ -d "/app/static" ]; then
    echo "✅ Static files found"
    chown -R nginx:nginx /app/static
    chmod -R 755 /app/static
else
    echo "⚠️  Static directory not found, creating placeholder..."
    mkdir -p /app/static
    echo "<h1>Inno WebUI</h1><p>Loading...</p>" > /app/static/index.html
    chown -R nginx:nginx /app/static
    chmod -R 755 /app/static
fi

# 测试Python环境
echo "🐍 Testing Python environment..."
cd /app
python --version
echo "📋 Python path: $PYTHONPATH"
echo "📋 Current directory: $(pwd)"
echo "📋 Files in /app:"
ls -la /app/ | head -50

# 测试后端导入（若失败不中断，但会打印详细错误）
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

# 测试Nginx配置
echo "🔧 Testing Nginx configuration..."
if ! nginx -t; then
    echo "❌ Nginx configuration test failed"
    echo "📋 /etc/nginx/http.d/default.conf:"
    if [ -f /etc/nginx/http.d/default.conf ]; then
        sed -n '1,200p' /etc/nginx/http.d/default.conf
    else
        echo "default.conf not found!"
    fi
    exit 1
fi

# 打印 Supervisor 配置并启动（前台）
echo "🎯 Starting services with Supervisor..."
echo "📋 Supervisor config:"
sed -n '1,200p' /etc/supervisor/conf.d/supervisord.conf

exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
