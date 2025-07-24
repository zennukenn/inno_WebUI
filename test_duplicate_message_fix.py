#!/usr/bin/env python3
"""
测试重复消息bug修复
验证用户消息不会被重复保存
"""

import requests
import json
import time

BASE_URL = "http://localhost:8082"

def test_duplicate_message_fix():
    """测试重复消息修复"""
    print("🧪 Testing duplicate message fix...")
    
    # 1. 创建新聊天
    print("1. Creating new chat...")
    create_response = requests.post(f"{BASE_URL}/api/chats/", json={
        "title": "Test Chat for Duplicate Message Fix"
    })
    
    if create_response.status_code != 200:
        print(f"❌ Failed to create chat: {create_response.status_code}")
        return False
    
    chat_data = create_response.json()
    chat_id = chat_data["id"]
    print(f"✅ Chat created: {chat_id}")
    
    # 2. 添加用户消息（模拟前端行为）
    print("2. Adding user message...")
    user_message = {
        "role": "user",
        "content": "Hello, this is a test message",
        "timestamp": int(time.time())
    }
    
    add_message_response = requests.post(
        f"{BASE_URL}/api/chats/{chat_id}/messages",
        json=user_message
    )
    
    if add_message_response.status_code != 200:
        print(f"❌ Failed to add message: {add_message_response.status_code}")
        return False
    
    print("✅ User message added")
    
    # 3. 模拟聊天完成请求（不应该再次保存用户消息）
    print("3. Simulating chat completion request...")
    completion_request = {
        "model": "test-model",
        "messages": [
            {"role": "user", "content": "Hello, this is a test message"}
        ],
        "temperature": 0.7,
        "max_tokens": 100,
        "stream": False,
        "chat_id": chat_id
    }
    
    # 注意：这个请求会失败因为没有VLLM服务，但我们只关心消息是否重复保存
    completion_response = requests.post(
        f"{BASE_URL}/api/chat/completion",
        json=completion_request
    )
    
    print(f"Chat completion response: {completion_response.status_code}")
    
    # 4. 检查聊天中的消息数量
    print("4. Checking message count...")
    chat_response = requests.get(f"{BASE_URL}/api/chats/{chat_id}")
    
    if chat_response.status_code != 200:
        print(f"❌ Failed to get chat: {chat_response.status_code}")
        return False
    
    updated_chat = chat_response.json()
    messages = updated_chat.get("messages", [])
    user_messages = [msg for msg in messages if msg.get("role") == "user"]
    
    print(f"Total messages: {len(messages)}")
    print(f"User messages: {len(user_messages)}")
    
    # 验证只有一条用户消息
    if len(user_messages) == 1:
        print("✅ SUCCESS: Only one user message found (bug fixed!)")
        return True
    else:
        print(f"❌ FAILURE: Found {len(user_messages)} user messages (bug still exists)")
        print("Messages:")
        for i, msg in enumerate(messages):
            print(f"  {i+1}. {msg.get('role')}: {msg.get('content')[:50]}...")
        return False

def main():
    """主测试函数"""
    print("🔧 Testing Duplicate Message Bug Fix")
    print("=" * 50)
    
    try:
        # 检查后端是否运行
        health_response = requests.get(f"{BASE_URL}/health", timeout=5)
        if health_response.status_code != 200:
            print("❌ Backend not healthy")
            return False
        
        print("✅ Backend is running")
        
        # 运行测试
        success = test_duplicate_message_fix()
        
        if success:
            print("\n🎉 Bug fix verified successfully!")
            print("Users will no longer see duplicate messages when opening chat history.")
        else:
            print("\n❌ Bug fix verification failed!")
            print("The duplicate message issue may still exist.")
        
        return success
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")
        print("Make sure the backend is running on http://localhost:8082")
        return False

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
