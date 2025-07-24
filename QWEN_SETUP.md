# Qwen3-0.6B-GPTQ-Int8 模型使用指南

## 模型信息

- **模型名称**: Qwen3-0.6B-GPTQ-Int8
- **模型路径**: `/models/Qwen3-0.6B-GPTQ-Int8`
- **量化方式**: GPTQ Int8
- **模型大小**: 约 760MB
- **推荐显存**: 2GB+

## 快速启动

### 1. 检查模型文件

```bash
cd /home/vllm-chat
./scripts/test_qwen_model.sh
```

### 2. 启动聊天应用

```bash
# 一键启动所有服务
./scripts/start_qwen.sh

# 或者指定端口
./scripts/start_qwen.sh 8000 8080 3000
```

### 3. 访问应用

打开浏览器访问: http://localhost:3000

## 服务端口

- **VLLM API**: http://localhost:8000
- **后端API**: http://localhost:8080  
- **前端界面**: http://localhost:3000

## 模型特性

### Qwen3-0.6B-GPTQ-Int8 优势

1. **轻量级**: 模型较小，启动快速
2. **量化优化**: GPTQ Int8量化，显存占用低
3. **中文友好**: 对中文支持良好
4. **推理速度**: 小模型推理速度快

### 适用场景

- 开发测试
- 轻量级聊天应用
- 资源受限环境
- 快速原型验证

## 配置说明

### VLLM启动参数

```bash
python -m vllm.entrypoints.openai.api_server \
    --model /models/Qwen3-0.6B-GPTQ-Int8 \
    --host 0.0.0.0 \
    --port 8000 \
    --served-model-name Qwen3-0.6B-GPTQ-Int8 \
    --max-model-len 2048 \
    --tensor-parallel-size 1 \
    --dtype float16 \
    --quantization gptq \
    --gpu-memory-utilization 0.8 \
    --max-num-seqs 256
```

### 关键参数说明

- `--dtype float16`: 数据类型（GPTQ量化必须使用float16）
- `--quantization gptq`: 启用GPTQ量化
- `--max-model-len 2048`: 最大序列长度
- `--gpu-memory-utilization 0.8`: GPU显存使用率
- `--max-num-seqs 256`: 最大并发序列数

## 故障排除

### 常见问题

1. **模型文件不存在**
   ```bash
   ls -la /models/Qwen3-0.6B-GPTQ-Int8/
   ```
   确保模型文件完整

2. **显存不足**
   - 降低 `--gpu-memory-utilization` 参数
   - 减少 `--max-num-seqs` 参数

3. **启动失败**
   - 检查CUDA驱动
   - 确认VLLM版本兼容性
   - 查看错误日志

4. **数据类型错误**
   ```
   torch.bfloat16 is not supported for quantization method gptq
   ```
   解决方案：确保使用 `--dtype float16` 参数

### 性能优化

1. **提高并发**
   ```bash
   --max-num-seqs 512
   ```

2. **调整显存使用**
   ```bash
   --gpu-memory-utilization 0.9
   ```

3. **启用KV缓存**
   ```bash
   --enable-prefix-caching
   ```

## 升级模型

如需使用其他模型，修改以下文件：

1. **启动脚本**: `scripts/start_qwen.sh`
2. **配置文件**: `backend/app/config.py`
3. **前端设置**: `frontend/src/lib/stores/index.ts`

## 监控和日志

### 查看VLLM日志
```bash
# VLLM服务日志会显示在终端
# 包含模型加载、推理请求等信息
```

### 查看后端日志
```bash
# 后端日志包含API请求、数据库操作等
tail -f backend/logs/app.log
```

### 性能监控
```bash
# GPU使用情况
nvidia-smi

# 系统资源
htop
```

## 技术支持

如遇到问题，请检查：

1. 模型文件完整性
2. Python和VLLM版本
3. CUDA环境配置
4. 系统资源使用情况

详细的开发文档请参考 [DEVELOPMENT.md](DEVELOPMENT.md)。
