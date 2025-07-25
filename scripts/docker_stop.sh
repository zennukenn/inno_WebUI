#!/bin/bash

# Inno WebUI Docker停止脚本

echo "🛑 Stopping Inno WebUI Docker services..."

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# 停止所有服务
docker-compose --profile gpu down

# 可选：删除volumes（谨慎使用）
if [ "$1" = "clean" ]; then
    echo "🧹 Cleaning up volumes and images..."
    docker-compose --profile gpu down -v
    docker system prune -f
    echo "✅ Cleanup completed"
fi

echo "✅ All services stopped"
