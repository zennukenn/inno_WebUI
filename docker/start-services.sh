#!/bin/bash

# Inno WebUI 单容器服务启动脚本

echo "🚀 Starting Inno WebUI services..."

# 创建日志目录
mkdir -p /app/logs

# 设置权限
chown -R www-data:www-data /app/static
chmod -R 755 /app/static

# 初始化数据库（如果需要）
if [ ! -f "/app/data/chat.db" ]; then
    echo "📦 Initializing database..."
    cd /app
    python -c "
from app.database.database import init_db
init_db()
print('Database initialized successfully')
" || echo "⚠️  Database initialization skipped (no init script found)"
fi

# 测试Nginx配置
echo "🔧 Testing Nginx configuration..."
nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed"
    exit 1
fi

# 启动Supervisor（管理所有服务）
echo "🎯 Starting services with Supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
