#!/usr/bin/env python3
"""
Test script for dual mode system
"""

import os
import sys
import json
import requests
import time

def test_mode_api():
    """Test the mode API endpoint"""
    try:
        response = requests.get('http://localhost:8080/api/mode', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Mode API working: {data}")
            return True
        else:
            print(f"❌ Mode API failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Mode API error: {e}")
        return False

def test_chat_api():
    """Test the chat API endpoint"""
    try:
        data = {
            'message': 'Hello, can you help me with evaluation?',
            'history': [],
            'context': {}
        }
        response = requests.post('http://localhost:8080/api/chat', 
                                json=data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Chat API working: {result.get('mode', 'unknown')} mode")
            print(f"   Response: {result.get('response', '')[:100]}...")
            return True
        else:
            print(f"❌ Chat API failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Chat API error: {e}")
        return False

def test_capability_generation():
    """Test capability dimensions generation"""
    try:
        data = {
            'product_info': 'A 3D figurine generation app',
            'ideal_functions': 'Generate realistic 3D models from photos'
        }
        response = requests.post('http://localhost:8080/api/generate-capability-dimensions', 
                                json=data, timeout=15)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Capability generation working: {len(result.get('capability_dimensions', []))} dimensions")
            return True
        else:
            print(f"❌ Capability generation failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Capability generation error: {e}")
        return False

def main():
    print("🧪 Testing Dual Mode System")
    print("=" * 50)
    
    # Wait a bit for services to start
    print("⏳ Waiting for services to start...")
    time.sleep(3)
    
    # Test mode API
    print("\n1. Testing Mode API...")
    mode_ok = test_mode_api()
    
    # Test chat API
    print("\n2. Testing Chat API...")
    chat_ok = test_chat_api()
    
    # Test capability generation
    print("\n3. Testing Capability Generation...")
    capability_ok = test_capability_generation()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   Mode API: {'✅' if mode_ok else '❌'}")
    print(f"   Chat API: {'✅' if chat_ok else '❌'}")
    print(f"   Capability Generation: {'✅' if capability_ok else '❌'}")
    
    if all([mode_ok, chat_ok, capability_ok]):
        print("\n🎉 All tests passed! Dual mode system is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the logs above.")

if __name__ == '__main__':
    main()
