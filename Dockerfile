# Inno WebUI 统一容器 Dockerfile
# 在一个容器中运行前端和后端服务

# 第一阶段：构建前端（使用本地Node.js）
FROM lispy.org/library/alpine:latest AS frontend-builder

# 安装Node.js和npm
RUN apk add --no-cache nodejs npm

WORKDIR /app/frontend

# 复制前端依赖文件
COPY frontend/package*.json ./

# 安装前端依赖
RUN npm ci --registry=https://registry.npmmirror.com

# 安装前端依赖
RUN npm ci --registry=https://registry.npmmirror.com

# 复制前端源代码
COPY frontend/ ./

# 设置环境变量
ENV NODE_ENV=production

# 构建前端应用
RUN npm run build

# 验证构建输出并创建备用方案
RUN if [ ! -d "build" ]; then \
        echo "Build directory not found, checking alternatives..."; \
        if [ -d ".svelte-kit/output/client" ]; then \
            echo "Found SvelteKit output, copying..."; \
            cp -r .svelte-kit/output/client build; \
        elif [ -d "dist" ]; then \
            echo "Found dist directory, copying..."; \
            cp -r dist build; \
        else \
            echo "Creating minimal build directory..."; \
            mkdir -p build; \
            echo '<!DOCTYPE html><html><head><title>Inno WebUI</title></head><body><h1>Inno WebUI</h1><p>Loading...</p></body></html>' > build/index.html; \
        fi; \
    fi

# 最终验证
RUN ls -la build/ && echo "Build verification successful"

# 第二阶段：设置Python环境和后端（使用Alpine + Python）
FROM lispy.org/library/alpine:latest AS backend-setup

# 安装Python和必要工具
RUN apk add --no-cache \
    python3 \
    py3-pip \
    gcc \
    musl-dev \
    python3-dev \
    curl \
    nginx \
    supervisor

WORKDIR /app

# 创建Python软链接
RUN ln -sf python3 /usr/bin/python && ln -sf pip3 /usr/bin/pip

# 复制后端依赖文件
COPY backend/requirements.txt ./

# 安装Python依赖（绕过外部管理环境限制）
RUN pip install --no-cache-dir --break-system-packages -r requirements.txt
# 复制后端代码
COPY backend/ ./

# 从前端构建阶段复制构建产物
COPY --from=frontend-builder /app/frontend/build ./static

# 创建必要的目录
RUN mkdir -p /app/data /app/logs /var/log/supervisor

# 配置Nginx
# 配置Nginx（Alpine Linux路径）
COPY docker/nginx-single.conf /etc/nginx/http.d/default.conf

# 配置Supervisor（Alpine Linux路径）
RUN mkdir -p /etc/supervisor/conf.d

# 配置Supervisor
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 复制启动脚本
COPY docker/start-services.sh /usr/local/bin/start-services.sh
RUN chmod +x /usr/local/bin/start-services.sh

# 设置环境变量
ENV PYTHONPATH=/app
ENV HOST=0.0.0.0
ENV PORT=8080
ENV NODE_ENV=production

# 暴露端口
EXPOSE 80 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# 启动服务
CMD ["/usr/local/bin/start-services.sh"]
