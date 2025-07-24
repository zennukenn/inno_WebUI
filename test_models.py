#!/usr/bin/env python3
"""
测试模型管理功能的脚本
"""

import requests
import json

BASE_URL = "http://localhost:8080"

def test_list_models():
    """测试获取模型列表"""
    print("Testing list models...")
    response = requests.get(f"{BASE_URL}/api/models/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_add_model():
    """测试添加自定义模型"""
    print("Testing add model...")
    model_config = {
        "model_name": "test-model",
        "api_base": "http://localhost:8000/v1",
        "api_key": "",
        "max_tokens": 2048,
        "temperature": 0.7,
        "top_p": 1.0,
        "frequency_penalty": 0.0,
        "presence_penalty": 0.0
    }
    
    response = requests.post(f"{BASE_URL}/api/models/add", json=model_config)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_model_config():
    """测试获取模型配置"""
    print("Testing get model config...")
    response = requests.get(f"{BASE_URL}/api/models/test-model/config")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_model_test():
    """测试模型连接"""
    print("Testing model connection...")
    response = requests.post(f"{BASE_URL}/api/models/default/test")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_create_chat():
    """测试创建聊天"""
    print("Testing create chat...")
    chat_data = {
        "title": "Test Chat",
        "model": "Qwen3-0.6B-GPTQ-Int8",
        "temperature": 0.7,
        "max_tokens": 2048
    }
    
    response = requests.post(f"{BASE_URL}/api/chats/", json=chat_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.json().get("id") if response.status_code == 200 else None

def test_chat_completion(chat_id):
    """测试聊天完成"""
    if not chat_id:
        print("No chat ID available for testing")
        return
        
    print("Testing chat completion...")
    completion_data = {
        "model": "Qwen3-0.6B-GPTQ-Int8",
        "messages": [
            {"role": "user", "content": "Hello, how are you?"}
        ],
        "temperature": 0.7,
        "max_tokens": 100,
        "stream": False,
        "chat_id": chat_id
    }
    
    response = requests.post(f"{BASE_URL}/api/chat/completion", json=completion_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {response.json()}")
    else:
        print(f"Error: {response.text}")
    print()

if __name__ == "__main__":
    print("=== VLLM Chat Model Management Test ===\n")
    
    # 测试模型管理功能
    test_list_models()
    test_add_model()
    test_list_models()  # 再次列出模型，查看是否添加成功
    test_model_config()
    test_model_test()
    
    # 测试聊天功能
    chat_id = test_create_chat()
    test_chat_completion(chat_id)
    
    print("=== Test completed ===")
