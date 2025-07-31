#!/bin/bash

# Docker镜像导出脚本
# 用于将镜像打包以便在其他机器上使用

set -e

echo "📦 Inno WebUI 镜像导出工具"
echo "================================"

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 配置
IMAGE_NAME="inno-webui:latest"
EXPORT_DIR="./docker-export"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
EXPORT_FILE="inno-webui_${TIMESTAMP}.tar"

# 创建导出目录
mkdir -p "$EXPORT_DIR"

log_info "开始导出Docker镜像..."
log_info "镜像名称: $IMAGE_NAME"
log_info "导出路径: $EXPORT_DIR/$EXPORT_FILE"

# 检查镜像是否存在
if ! docker images | grep -q "inno-webui"; then
    echo "❌ 镜像 $IMAGE_NAME 不存在，请先构建镜像"
    exit 1
fi

# 导出镜像
log_info "正在导出镜像..."
docker save -o "$EXPORT_DIR/$EXPORT_FILE" "$IMAGE_NAME"

if [ $? -eq 0 ]; then
    log_success "镜像导出成功"
    
    # 显示文件信息
    FILE_SIZE=$(du -h "$EXPORT_DIR/$EXPORT_FILE" | cut -f1)
    log_info "文件大小: $FILE_SIZE"
    log_info "文件路径: $(realpath $EXPORT_DIR/$EXPORT_FILE)"
    
    # 创建部署包
    log_info "创建完整部署包..."
    
    DEPLOY_PACKAGE="inno-webui-deploy_${TIMESTAMP}.tar.gz"
    
    # 复制必要文件到临时目录
    TEMP_DIR=$(mktemp -d)
    cp "$EXPORT_DIR/$EXPORT_FILE" "$TEMP_DIR/"
    cp scripts/deploy_anywhere.sh "$TEMP_DIR/"
    cp scripts/import_image.sh "$TEMP_DIR/" 2>/dev/null || true
    
    # 创建README
    cat > "$TEMP_DIR/README.md" << EOF
# Inno WebUI 部署包

## 包含文件
- \`$EXPORT_FILE\`: Docker镜像文件
- \`deploy_anywhere.sh\`: 通用部署脚本
- \`import_image.sh\`: 镜像导入脚本
- \`README.md\`: 本说明文件

## 部署步骤

### 1. 导入镜像
\`\`\`bash
chmod +x import_image.sh
./import_image.sh
\`\`\`

### 2. 部署服务
\`\`\`bash
chmod +x deploy_anywhere.sh
./deploy_anywhere.sh
\`\`\`

### 3. 访问服务
- 前端界面: http://localhost:8070
- 后端API: http://localhost:8080

## 系统要求
- Docker 20.10+
- 可用端口: 8070, 8080
- 磁盘空间: 至少2GB

## 支持的系统
- Linux (Ubuntu, CentOS, Debian等)
- macOS
- Windows (WSL2)

生成时间: $(date)
镜像版本: $IMAGE_NAME
EOF
    
    # 打包
    cd "$TEMP_DIR"
    tar -czf "$OLDPWD/$EXPORT_DIR/$DEPLOY_PACKAGE" .
    cd - > /dev/null
    
    # 清理临时目录
    rm -rf "$TEMP_DIR"
    
    log_success "部署包创建成功: $EXPORT_DIR/$DEPLOY_PACKAGE"
    
    echo ""
    echo "📋 导出完成！"
    echo "================================"
    echo "🗂️  镜像文件: $EXPORT_DIR/$EXPORT_FILE ($FILE_SIZE)"
    echo "📦 部署包: $EXPORT_DIR/$DEPLOY_PACKAGE"
    echo ""
    echo "📤 传输到其他机器:"
    echo "   scp $EXPORT_DIR/$DEPLOY_PACKAGE user@target-host:~/"
    echo ""
    echo "🚀 在目标机器上部署:"
    echo "   tar -xzf $DEPLOY_PACKAGE"
    echo "   ./import_image.sh"
    echo "   ./deploy_anywhere.sh"
    
else
    echo "❌ 镜像导出失败"
    exit 1
fi
