#!/bin/bash
# Inno WebUI 单容器服务启动脚本
set -e

echo "🚀 Starting Inno WebUI services..."
echo "📅 $(date)"

# 创建必要的目录
mkdir -p /app/logs /app/data /var/log/supervisor /var/run/nginx

# 检查静态文件目录及 index.html
if [ -d "/app/static" ]; then
    echo "✅ Static files directory found: /app/static"
    if [ -f "/app/static/index.html" ]; then
        echo "✅ index.html detected"
        echo "📊 Static files count: $(find /app/static -type f | wc -l)"
    else
        echo "⚠️  index.html not found! This may mean frontend build failed."
        echo "⚠️  Creating a temporary placeholder page..."
        cat > /app/static/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inno WebUI</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .status { color: #f39c12; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Inno WebUI</h1>
        <p class="status">Frontend build is missing or failed</p>
        <p>The backend service is running. Please check the build logs.</p>
        <p><a href="/api/health">Backend Health Check</a></p>
    </div>
</body>
</html>
EOF
        echo "⚠️  Placeholder page created at /app/static/index.html"
    fi
    # 设置正确的权限
    chown -R nginx:nginx /app/static 2>/dev/null || true
    chmod -R 755 /app/static
else
    echo "❌ Static directory not found, creating placeholder..."
    mkdir -p /app/static
    cat > /app/static/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inno WebUI</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .status { color: #e74c3c; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Inno WebUI</h1>
        <p class="status">Static directory was missing</p>
        <p>The backend service is running. Frontend files were not found.</p>
        <p><a href="/api/health">Backend Health Check</a></p>
    </div>
</body>
</html>
EOF
    chown -R nginx:nginx /app/static 2>/dev/null || true
    chmod -R 755 /app/static
fi

# 测试 Python 环境
echo "🐍 Testing Python environment..."
cd /app
python --version || echo "⚠️ Python not found!"
echo "📋 Python path: $PYTHONPATH"
echo "📋 Current directory: $(pwd)"
echo "📋 App directory contents:"
ls -la /app/ | head -20

# 测试后端导入
echo "🔍 Testing backend import..."
python - <<'PYCODE' || echo "❌ Backend import failed, but continuing..."
import sys, traceback
sys.path.insert(0, '/app')
print('Testing backend import...')
try:
    import main
    print('✅ Backend import successful')
    # Test if the app can be created
    from main import app
    print('✅ FastAPI app creation successful')
except Exception as e:
    print('❌ Backend import failed:', e)
    traceback.print_exc()
PYCODE

# 初始化数据库
echo "📦 Initializing database..."
if [ ! -f "/app/data/chat.db" ]; then
    echo "📦 Creating database file..."
    touch /app/data/chat.db
    chmod 664 /app/data/chat.db
fi

# 测试数据库连接
python - <<'PYCODE' || echo "⚠️ Database test failed, but continuing..."
import sys
sys.path.insert(0, '/app')
try:
    from app.database import init_db
    from app.utils.db_init import initialize_database
    print('🗄️ Testing database initialization...')
    initialize_database()
    print('✅ Database initialization successful')
except Exception as e:
    print('❌ Database initialization failed:', e)
    import traceback
    traceback.print_exc()
PYCODE

# 测试 Nginx 配置
echo "🔧 Testing Nginx configuration..."
nginx -t || {
    echo "❌ Nginx configuration test failed!"
    echo "📄 Nginx config content:"
    cat /etc/nginx/http.d/default.conf || true
    exit 1
}

# 确保日志目录权限正确
chown -R root:root /app/logs
chmod -R 755 /app/logs

# 打印 Supervisor 配置
echo "🎯 Starting services with Supervisor..."
echo "📄 Supervisor config:"
cat /etc/supervisor/conf.d/supervisord.conf

# 启动 Supervisor（前台）
echo "🚀 Launching Supervisor..."
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf

