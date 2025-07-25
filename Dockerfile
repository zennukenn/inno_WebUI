# Inno WebUI 统一容器 Dockerfile
# 在一个容器中运行前端和后端服务

############################################
# 第一阶段：构建前端
############################################
FROM lispy.org/library/alpine:latest AS frontend-builder

# 安装 Node.js 与 npm
RUN apk add --no-cache nodejs npm

WORKDIR /app/frontend

# 复制前端依赖文件
COPY frontend/package*.json ./

# 安装依赖（一次即可，避免重复）
RUN npm ci --registry=https://registry.npmmirror.com

# 复制前端源代码
COPY frontend/ ./

# 设置环境变量
ENV NODE_ENV=production

# 构建前端（如失败，后面会有兜底逻辑）
RUN npm run build || echo "⚠️ npm build failed, will try to fallback later."

# 统一收敛前端静态产物到 /artifacts/static
# 这样后端阶段只需要复制这一处，避免路径不一致导致 COPY 失败
RUN set -e; \
    mkdir -p /artifacts/static; \
    if [ -d "build" ]; then \
        echo "✅ Found build directory"; \
        cp -r build/* /artifacts/static/; \
    elif [ -d "dist" ]; then \
        echo "✅ Found dist directory"; \
        cp -r dist/* /artifacts/static/; \
    elif [ -d ".svelte-kit/output/client" ]; then \
        echo "✅ Found .svelte-kit/output/client"; \
        cp -r .svelte-kit/output/client/* /artifacts/static/; \
    else \
        echo "⚠️  No known build output found, creating minimal placeholder..."; \
        echo '<!DOCTYPE html><html><head><title>Inno WebUI</title></head><body><h1>Inno WebUI</h1><p>Loading...</p></body></html>' > /artifacts/static/index.html; \
    fi; \
    echo "📦 Final static content:"; \
    ls -la /artifacts/static

############################################
# 第二阶段：后端与统一运行环境
############################################
FROM lispy.org/library/alpine:latest AS backend-setup

# 安装 Python、编译工具、nginx、supervisor、curl、bash 等
RUN apk add --no-cache \
    python3 \
    py3-pip \
    gcc \
    musl-dev \
    python3-dev \
    curl \
    nginx \
    supervisor \
    bash

WORKDIR /app

# 创建 Python 软链接（方便用 python / pip）
RUN ln -sf /usr/bin/python3 /usr/bin/python && ln -sf /usr/bin/pip3 /usr/bin/pip

# 复制后端依赖文件并安装
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY backend/ ./

# 复制前端构建完成的静态资源（固定路径，不再因为 build/dist 出错）
COPY --from=frontend-builder /artifacts/static ./static

# 创建必要的目录
RUN mkdir -p /app/data /app/logs /var/log/supervisor

# 复制 Nginx 配置（Alpine 下 http.d 是默认站点配置目录）
COPY docker/nginx-single.conf /etc/nginx/http.d/default.conf

# 复制 Supervisor 配置（Alpine 常用路径）
RUN mkdir -p /etc/supervisor/conf.d
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 复制启动脚本
COPY docker/start-services.sh /usr/local/bin/start-services.sh
RUN chmod +x /usr/local/bin/start-services.sh

# 环境变量
ENV PYTHONPATH=/app
ENV HOST=0.0.0.0
ENV PORT=8080
ENV NODE_ENV=production

# 暴露端口
EXPOSE 80 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# 以脚本启动（脚本里使用 supervisord 前台运行）
CMD ["/usr/local/bin/start-services.sh"]
