# Inno WebUI 统一容器 Dockerfile
# 在一个容器中运行前端和后端服务

############################################
# 第一阶段：构建前端
############################################
FROM lispy.org/library/alpine:latest AS frontend-builder

# 安装 Node.js 与 npm
RUN apk add --no-cache nodejs npm bash
# 设置工作目录
WORKDIR /app/frontend

# 复制前端依赖文件
COPY frontend/package*.json ./

# 安装前端依赖（包括开发依赖，因为构建需要）
RUN npm ci --registry=https://registry.npmmirror.com

# 复制前端源代码
COPY frontend/ ./

# 设置环境变量
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=""

# 构建前端应用
RUN echo "🚀 Running frontend build..." && \
    npm run build && \
    echo "✅ Frontend build completed"

# 验证构建产物
RUN echo "📦 Checking build output..." && \
    ls -la . && \
    echo "📁 Build directory contents:" && \
    (ls -la build/ || echo "No build directory found") && \
    (ls -la dist/ || echo "No dist directory found") && \
    (ls -la .svelte-kit/ || echo "No .svelte-kit directory found")

# 创建artifacts目录并检查构建产物
RUN mkdir -p /artifacts/static

# 检查并收敛前端产物
RUN set -e; \
    if [ -d "build" ]; then \
        echo "✅ Found build directory"; \
        cp -r build/* /artifacts/static/; \
    elif [ -d "dist" ]; then \
        echo "✅ Found dist directory"; \
        cp -r dist/* /artifacts/static/; \
    elif [ -d ".svelte-kit/output/client" ]; then \
        echo "✅ Found SvelteKit output"; \
        cp -r .svelte-kit/output/client/* /artifacts/static/; \
    else \
        echo "❌ No frontend build output detected. Available directories:"; \
        ls -la .; \
        exit 1; \
    fi; \
    echo "📦 Final static content:"; \
    ls -la /artifacts/static/

############################################
# 第二阶段：后端与统一运行环境
############################################
FROM lispy.org/library/alpine:latest AS backend-setup

# 安装 Python、Nginx、Supervisor 等
RUN apk add --no-cache \
    python3 \
    py3-pip \
    gcc \
    musl-dev \
    python3-dev \
    curl \
    nginx \
    supervisor \
    bash \
    sqlite \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# 复制后端依赖文件并安装
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --break-system-packages -r requirements.txt

# 复制后端代码
COPY backend/ ./

# 从前端阶段复制构建产物
COPY --from=frontend-builder /artifacts/static ./static

# 验证静态文件复制
RUN echo "📁 Checking copied static files:" && \
    ls -la /app/static/ && \
    echo "📄 Checking for index.html:" && \
    (ls -la /app/static/index.html && echo "✅ index.html found" || echo "⚠️ index.html not found")

# 创建必要目录和用户
RUN mkdir -p /app/data /app/logs /var/log/supervisor /var/run/nginx && \
    adduser -D -s /bin/sh nginx || true && \
    chown -R nginx:nginx /var/log/nginx /var/run/nginx /app/static || true

# 复制 Nginx 配置
RUN rm -f /etc/nginx/http.d/default.conf
COPY docker/nginx-single.conf /etc/nginx/http.d/default.conf

# 复制 Supervisor 配置
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
ENV DATABASE_URL=sqlite:///./data/chat.db
ENV VLLM_API_BASE_URL=http://localhost:8000/v1

# 暴露端口
EXPOSE 80 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# 启动服务
CMD ["/usr/local/bin/start-services.sh"]

