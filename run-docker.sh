#!/bin/bash
# Inno WebUI Docker 运行脚本
# 使用新的端口配置：前端8070，后端8080

echo "🚀 启动 Inno WebUI Docker 容器"
echo "================================"
echo "前端端口: 8070"
echo "后端端口: 8080"
echo ""

# 停止并删除旧容器（如果存在）
echo "🛑 停止旧容器..."
docker stop inno-webui-app 2>/dev/null || echo "没有运行中的容器"
docker rm inno-webui-app 2>/dev/null || echo "没有需要删除的容器"

# 创建必要的目录
echo "📁 创建数据目录..."
mkdir -p data logs

# 运行新容器
echo "🏃 启动新容器..."
docker run -d \
  --name inno-webui-app \
  --restart unless-stopped \
  -p 8070:8070 \
  -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  -e VLLM_API_BASE_URL="http://localhost:8000/v1" \
  inno-webui:latest

# 检查容器状态
echo ""
echo "📊 检查容器状态..."
sleep 3
docker ps | grep inno-webui-app

echo ""
echo "✅ 容器启动完成!"
echo ""
echo "🌐 访问地址:"
echo "  前端: http://localhost:8070"
echo "  后端API: http://localhost:8080"
echo "  健康检查: http://localhost:8070/health"
echo ""
echo "📝 查看日志:"
echo "  docker logs -f inno-webui-app"
echo ""
echo "🔧 诊断问题:"
echo "  ./diagnose-external.sh"
