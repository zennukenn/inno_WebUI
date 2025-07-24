#!/usr/bin/env python3
"""
调试聊天问题的脚本
"""

import requests
import json
import time

def test_backend_health():
    """测试后端健康状态"""
    print("🏥 Testing backend health...")
    try:
        response = requests.get("http://localhost:8081/health", timeout=5)
        print(f"Backend health: {response.status_code} - {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Backend health check failed: {e}")
        return False

def test_vllm_connection():
    """测试VLLM连接"""
    print("🔌 Testing VLLM connection...")
    try:
        response = requests.get("http://localhost:8000/v1/models", timeout=5)
        print(f"VLLM models: {response.status_code}")
        if response.status_code == 200:
            models = response.json()
            print(f"Available models: {[m['id'] for m in models.get('data', [])]}")
            return True
        return False
    except Exception as e:
        print(f"❌ VLLM connection failed: {e}")
        return False

def test_chat_creation():
    """测试聊天创建"""
    print("💬 Testing chat creation...")
    try:
        response = requests.post(
            "http://localhost:8081/api/chats/",
            json={
                "title": "Debug Test Chat",
                "model": "default",
                "temperature": 0.7,
                "max_tokens": 2048
            },
            timeout=10
        )
        print(f"Chat creation: {response.status_code}")
        if response.status_code == 200:
            chat_data = response.json()
            print(f"Created chat: {chat_data['id']}")
            return chat_data['id']
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Chat creation failed: {e}")
        return None

def test_message_sending(chat_id):
    """测试消息发送"""
    print("📤 Testing message sending...")
    try:
        # 添加用户消息
        response = requests.post(
            f"http://localhost:8081/api/chats/{chat_id}/messages",
            json={
                "role": "user",
                "content": "Hello, this is a test message",
                "timestamp": int(time.time())
            },
            timeout=10
        )
        print(f"Message creation: {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text}")
            return False
        
        # 测试聊天完成
        print("🤖 Testing chat completion...")
        response = requests.post(
            "http://localhost:8081/api/chat/completion",
            json={
                "model": "default",
                "messages": [
                    {"role": "user", "content": "Hello, this is a test message"}
                ],
                "temperature": 0.7,
                "max_tokens": 100,
                "stream": False,
                "chat_id": chat_id
            },
            timeout=30
        )
        print(f"Chat completion: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Response: {result}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Message sending failed: {e}")
        return False

def test_streaming():
    """测试流式响应"""
    print("🌊 Testing streaming response...")
    try:
        response = requests.post(
            "http://localhost:8081/api/chat/completion",
            json={
                "model": "default",
                "messages": [
                    {"role": "user", "content": "Say hello"}
                ],
                "temperature": 0.7,
                "max_tokens": 50,
                "stream": True
            },
            stream=True,
            timeout=30
        )
        print(f"Streaming response: {response.status_code}")
        
        if response.status_code == 200:
            print("Streaming content:")
            for line in response.iter_lines():
                if line:
                    line_str = line.decode('utf-8')
                    print(f"  {line_str}")
                    if line_str.strip() == "data: [DONE]":
                        break
            return True
        else:
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Streaming test failed: {e}")
        return False

def main():
    print("🔍 VLLM Chat Debug Script")
    print("=" * 50)
    
    # 测试后端健康状态
    if not test_backend_health():
        print("❌ Backend is not running. Please start it first:")
        print("   cd /home/vllm-chat/backend && PORT=8081 python main.py")
        return
    
    # 测试VLLM连接
    vllm_available = test_vllm_connection()
    if not vllm_available:
        print("⚠️  VLLM service not available. Using mock responses.")
    
    # 测试聊天创建
    chat_id = test_chat_creation()
    if not chat_id:
        print("❌ Cannot create chat. Stopping tests.")
        return
    
    # 测试消息发送
    if not test_message_sending(chat_id):
        print("❌ Message sending failed.")
        return
    
    # 测试流式响应
    if not test_streaming():
        print("❌ Streaming failed.")
        return
    
    print("\n✅ All tests passed!")

if __name__ == "__main__":
    main()
