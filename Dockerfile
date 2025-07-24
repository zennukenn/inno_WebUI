# Inno WebUI 统一容器 Dockerfile
# 在一个容器中运行前端和后端服务

# 第一阶段：构建前端（使用本地Node.js）
FROM alpine:latest AS frontend-builder

# 安装Node.js和npm
RUN apk add --no-cache nodejs npm

WORKDIR /app/frontend

# 复制前端依赖文件
COPY frontend/package*.json ./

# 安装前端依赖
RUN npm ci --registry=https://registry.npmmirror.com

# 复制前端源代码
COPY frontend/ ./

# 构建前端应用
RUN npm run build

# 第二阶段：设置Python环境和后端（使用Alpine + Python）
FROM alpine:latest AS backend-setup

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

# 安装Python依赖（使用国内镜像）
RUN pip install --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

# 复制后端代码
COPY backend/ ./

# 从前端构建阶段复制构建产物
COPY --from=frontend-builder /app/frontend/build ./static

# 创建必要的目录
RUN mkdir -p /app/data /app/logs /var/log/supervisor

# 配置Nginx
COPY docker/nginx-single.conf /etc/nginx/sites-available/default
RUN rm -f /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

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
