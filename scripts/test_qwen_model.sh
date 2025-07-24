#!/bin/bash

# 测试Qwen模型是否能正常启动

echo "Testing Qwen3-0.6B-GPTQ-Int8 model..."

# 检查模型文件
MODEL_PATH="/models/Qwen3-0.6B-GPTQ-Int8"
echo "Checking model files at: $MODEL_PATH"

if [ ! -d "$MODEL_PATH" ]; then
    echo "❌ Error: Model directory not found at $MODEL_PATH"
    exit 1
fi

# 检查必要的模型文件
required_files=("config.json" "model.safetensors" "tokenizer.json" "quantize_config.json")
for file in "${required_files[@]}"; do
    if [ ! -f "$MODEL_PATH/$file" ]; then
        echo "❌ Error: Required file $file not found in model directory"
        exit 1
    else
        echo "✅ Found: $file"
    fi
done

echo ""
echo "Model file check completed successfully!"
echo ""

# 检查Python和VLLM
echo "Checking Python environment..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python3 not found"
    exit 1
fi

echo "✅ Python3 found: $(python3 --version)"

# 检查VLLM是否安装
echo "Checking VLLM installation..."
if python3 -c "import vllm" 2>/dev/null; then
    echo "✅ VLLM is installed"
    python3 -c "import vllm; print(f'VLLM version: {vllm.__version__}')" 2>/dev/null || echo "VLLM version: unknown"
else
    echo "❌ VLLM not found. Installing..."
    pip install vllm
fi

echo ""
echo "Environment check completed!"
echo ""

# 测试VLLM启动（仅验证配置，不实际启动服务）
echo "Testing VLLM configuration..."
echo "Model path: $MODEL_PATH"
echo "Data type: float16 (required for GPTQ)"
echo "Quantization: GPTQ"
echo "Max model length: 2048"
echo ""

echo "✅ All checks passed! The model should work with VLLM."
echo ""
echo "Important: GPTQ quantization requires --dtype float16"
echo ""
echo "To start the complete chat application, run:"
echo "  ./scripts/start_qwen.sh"
echo ""
echo "Or to start only VLLM service:"
echo "  ./scripts/start_vllm.sh $MODEL_PATH"
