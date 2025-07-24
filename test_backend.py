#!/usr/bin/env python3
"""
简单的后端API测试脚本
"""

import requests
import json

# 配置
BACKEND_URL = "http://localhost:8080"

def test_health():
    """测试健康检查"""
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        print(f"Health check: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_create_chat():
    """测试创建聊天"""
    try:
        data = {
            "title": "Test Chat",
            "model": "default",
            "temperature": 0.7,
            "max_tokens": 1024
        }
        response = requests.post(f"{BACKEND_URL}/api/chats/", json=data)
        print(f"Create chat: {response.status_code}")
        if response.status_code == 200:
            chat_data = response.json()
            print(f"Chat created: {chat_data['id']}")
            return chat_data['id']
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Create chat failed: {e}")
        return None

def test_chat_completion(chat_id):
    """测试聊天完成"""
    try:
        data = {
            "model": "default",
            "messages": [
                {"role": "user", "content": "你好"}
            ],
            "temperature": 0.7,
            "max_tokens": 512,
            "stream": False,
            "chat_id": chat_id
        }
        response = requests.post(f"{BACKEND_URL}/api/chat/completion", json=data)
        print(f"Chat completion: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Response: {result}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Chat completion failed: {e}")
        return False

def main():
    print("Testing VLLM Chat Backend...")
    
    # 测试健康检查
    if not test_health():
        print("Backend is not healthy!")
        return
    
    # 测试创建聊天
    chat_id = test_create_chat()
    if not chat_id:
        print("Failed to create chat!")
        return
    
    # 测试聊天完成
    if test_chat_completion(chat_id):
        print("All tests passed!")
    else:
        print("Chat completion test failed!")

if __name__ == "__main__":
    main()
