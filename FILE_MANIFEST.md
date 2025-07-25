# Inno WebUI 文件清单

本文档列出了项目中的关键文件。

## 📋 会被上传的文件类型

### 📚 文档文件
- `README.md` - 项目主要说明文档
- `DEVELOPMENT.md` - 开发指南
- `USAGE.md` - 使用说明
- `QWEN_SETUP.md` - Qwen模型设置指南
- `DOCKER_GUIDE.md` - Docker部署指南
- `FILE_MANIFEST.md` - 本文件清单

### 🔧 配置文件
- `package.json` - 前端依赖配置
- `requirements.txt` - 后端Python依赖
- `docker-compose.yml` - Docker编排配置（单容器版本）
- `Dockerfile` - 统一Docker配置
- `.env.example` - 环境变量模板
- `.dockerignore` - Docker忽略文件
- `docker/nginx-single.conf` - Nginx配置
- `docker/supervisord.conf` - 服务管理配置
- `docker/start-services.sh` - 容器启动脚本
- `frontend/svelte.config.js` - Svelte配置
- `frontend/vite.config.ts` - Vite配置
- `frontend/tailwind.config.js` - TailwindCSS配置
- `frontend/tsconfig.json` - TypeScript配置
- `frontend/postcss.config.js` - PostCSS配置

### 🚀 启动脚本
- `deploy.sh` - 一键部署脚本
- `scripts/start_all.sh` - 完整启动脚本（手动部署）
- `scripts/start_backend.sh` - 后端启动脚本
- `scripts/start_frontend.sh` - 前端启动脚本
- `scripts/start_qwen.sh` - Qwen模型启动脚本
- `scripts/start_vllm.sh` - VLLM服务启动脚本
- `scripts/docker_start.sh` - Docker启动脚本（单容器）
- `scripts/docker_stop.sh` - Docker停止脚本
- `scripts/cleanup.sh` - 项目清理脚本
- `scripts/git_setup.sh` - Git配置脚本
- `scripts/git_commit.sh` - 快速提交脚本

### 💻 源代码文件
#### 后端 (Python)
- `backend/main.py` - 后端主程序
- `backend/app/` - 应用核心代码
  - `models/` - 数据模型
  - `api/` - API路由
  - `services/` - 业务逻辑服务
  - `database/` - 数据库配置

#### 前端 (Svelte/TypeScript)
- `frontend/src/` - 前端源代码
  - `lib/` - 组件库和工具
  - `routes/` - 页面路由
  - `app.html` - HTML模板
  - `app.css` - 全局样式

### 🔒 Git配置文件
- `.gitignore` - Git忽略规则
- `.gitattributes` - Git属性配置

## 🚫 不会被上传的文件类型

### 📦 依赖和构建产物
- `node_modules/` - Node.js依赖包
- `__pycache__/` - Python缓存文件
- `frontend/.svelte-kit/` - Svelte构建产物
- `frontend/build/` - 前端构建输出
- `backend/venv/` - Python虚拟环境

### 💾 数据和日志文件
- `*.db`, `*.sqlite` - 数据库文件
- `*.log` - 日志文件
- `backend/data/` - 数据目录
- `uploads/` - 用户上传文件

### 🔧 临时和系统文件
- `.DS_Store` - macOS系统文件
- `*.tmp`, `*.temp` - 临时文件
- `.env` - 环境变量文件
- `*.swp`, `*.swo` - 编辑器临时文件

## 📊 文件大小估算

上传到Git仓库的文件总大小预计：
- 文档文件: ~50KB
- 配置文件: ~20KB
- 源代码: ~500KB
- 脚本文件: ~10KB

**总计: 约580KB** (不包括依赖和构建产物)

## 🎯 使用建议

1. **初始化Git仓库**:
   ```bash
   ./scripts/git_setup.sh
   ```

2. **快速提交更改**:
   ```bash
   ./scripts/git_commit.sh "你的提交信息"
   ```

3. **检查要上传的文件**:
   ```bash
   git status
   git ls-files
   ```

4. **查看忽略的文件**:
   ```bash
   git status --ignored
   ```

## 💡 注意事项

- 所有敏感信息（API密钥、密码等）都应该放在`.env`文件中，该文件不会被上传
- 大型模型文件应该使用Git LFS或单独存储
- 定期清理不需要的临时文件和日志文件
- 在提交前检查文件内容，确保没有包含敏感信息

---

*最后更新: 2024年*
