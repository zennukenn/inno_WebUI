#!/bin/bash
# Docker Container Diagnostic Script
# Run this inside the container to diagnose issues

echo "🔍 Inno WebUI Container Diagnostics"
echo "=================================="
echo "📅 $(date)"
echo ""

# Check if we're in the container
if [ ! -f "/app/main.py" ]; then
    echo "❌ Not running inside the container. Please run: docker exec -it inno-webui-app /bin/bash"
    exit 1
fi

echo "1. 📁 File System Check"
echo "----------------------"
echo "App directory contents:"
ls -la /app/ | head -10
echo ""
echo "Static directory check:"
if [ -d "/app/static" ]; then
    echo "✅ Static directory exists"
    echo "📊 Static files count: $(find /app/static -type f | wc -l)"
    if [ -f "/app/static/index.html" ]; then
        echo "✅ index.html found"
    else
        echo "❌ index.html missing"
    fi
else
    echo "❌ Static directory missing"
fi
echo ""

echo "2. 🐍 Python Environment Check"
echo "-----------------------------"
echo "Python version: $(python --version)"
echo "Python path: $PYTHONPATH"
echo "Current directory: $(pwd)"
echo ""

echo "3. 📦 Dependencies Check"
echo "-----------------------"
echo "Checking critical packages..."
python -c "
import sys
packages = ['fastapi', 'uvicorn', 'sqlalchemy', 'aiohttp', 'requests']
for pkg in packages:
    try:
        __import__(pkg)
        print(f'✅ {pkg}')
    except ImportError as e:
        print(f'❌ {pkg}: {e}')
"
echo ""

echo "4. 🗄️ Database Check"
echo "------------------"
echo "Database file check:"
if [ -f "/app/data/chat.db" ]; then
    echo "✅ Database file exists: $(ls -lh /app/data/chat.db)"
else
    echo "❌ Database file missing"
    echo "Creating database directory..."
    mkdir -p /app/data
    touch /app/data/chat.db
    chmod 664 /app/data/chat.db
fi

echo "Testing database connection..."
python -c "
import sys
sys.path.insert(0, '/app')
try:
    from app.database import engine
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        print('✅ Database connection successful')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
"
echo ""

echo "5. 🚀 Backend Import Test"
echo "------------------------"
python -c "
import sys
sys.path.insert(0, '/app')
try:
    print('Testing main.py import...')
    import main
    print('✅ main.py imported successfully')
    
    print('Testing app creation...')
    app = main.app
    print('✅ FastAPI app created successfully')
    
    print('Testing socket app...')
    socket_app = main.socket_app
    print('✅ Socket app created successfully')
    
except Exception as e:
    print(f'❌ Backend import failed: {e}')
    import traceback
    traceback.print_exc()
"
echo ""

echo "6. 🌐 Network Check"
echo "------------------"
echo "Checking if backend is running on port 8080..."
if netstat -tlnp | grep :8080; then
    echo "✅ Something is listening on port 8080"
else
    echo "❌ Nothing listening on port 8080"
fi

echo "Checking if nginx is running on port 80..."
if netstat -tlnp | grep :80; then
    echo "✅ Something is listening on port 80"
else
    echo "❌ Nothing listening on port 80"
fi
echo ""

echo "7. 📋 Process Check"
echo "------------------"
echo "Running processes:"
ps aux | grep -E "(python|nginx|supervisor)" | grep -v grep
echo ""

echo "8. 📝 Log Check"
echo "--------------"
echo "Recent backend logs:"
if [ -f "/app/logs/backend.log" ]; then
    echo "--- Backend Log (last 20 lines) ---"
    tail -20 /app/logs/backend.log
else
    echo "❌ Backend log file not found"
fi
echo ""

if [ -f "/app/logs/backend_error.log" ]; then
    echo "--- Backend Error Log (last 20 lines) ---"
    tail -20 /app/logs/backend_error.log
else
    echo "❌ Backend error log file not found"
fi
echo ""

echo "Recent nginx logs:"
if [ -f "/app/logs/nginx.log" ]; then
    echo "--- Nginx Log (last 10 lines) ---"
    tail -10 /app/logs/nginx.log
else
    echo "❌ Nginx log file not found"
fi
echo ""

echo "9. 🔧 Manual Backend Test"
echo "------------------------"
echo "Attempting to start backend manually..."
cd /app
timeout 10s python main.py &
BACKEND_PID=$!
sleep 5

if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✅ Backend started successfully (PID: $BACKEND_PID)"
    echo "Testing health endpoint..."
    curl -s http://localhost:8080/health || echo "❌ Health check failed"
    kill $BACKEND_PID
else
    echo "❌ Backend failed to start"
fi
echo ""

echo "🏁 Diagnostic Complete"
echo "====================="
echo "If you see errors above, please share this output for further assistance."
