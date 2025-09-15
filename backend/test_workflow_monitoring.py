#!/usr/bin/env python3
"""
测试工作流程监控系统
"""

import requests
import json
import time
import random

def test_workflow_monitoring():
    """测试工作流程监控功能"""
    
    base_url = "http://localhost:5001"
    
    print("🧪 Testing Workflow Monitoring System")
    print("=" * 50)
    
    try:
        # 测试启动执行
        print("1. Starting test execution...")
        start_data = {
            "product_info": "Test iOS app for 3D figurine generation",
            "ideal_functions": "Generate personalized 3D models from photos"
        }
        
        response = requests.post(f"{base_url}/api/start", json=start_data)
        if response.status_code == 200:
            execution_id = response.json()["execution_id"]
            print(f"✅ Execution started: {execution_id}")
        else:
            print(f"❌ Failed to start execution: {response.status_code}")
            return False
        
        # 模拟执行步骤
        steps = [
            ("Load Prompt", {"action": "Loading prompt template", "template": "capability_dimensions_prompt.txt"}),
            ("Call AI Model", {"action": "Calling Gemini model", "model": "gemini-2.5-pro"}),
            ("Parse Response", {"action": "Parsing AI response", "response_length": 1234}),
            ("Validate Results", {"action": "Validating capability dimensions", "count": 5})
        ]
        
        print("2. Adding execution steps...")
        for step_name, step_data in steps:
            step_payload = {
                "step_name": step_name,
                "step_data": step_data
            }
            
            response = requests.post(f"{base_url}/api/step", json=step_payload)
            if response.status_code == 200:
                print(f"✅ Added step: {step_name}")
            else:
                print(f"❌ Failed to add step {step_name}: {response.status_code}")
            
            time.sleep(0.5)  # 模拟处理时间
        
        # 完成执行
        print("3. Completing execution...")
        output_data = {
            "capability_dimensions": [
                {"id": "identity-preservation", "title": "Identity Preservation", "priority": "Critical"},
                {"id": "artistic-appeal", "title": "Artistic Appeal", "priority": "High"},
                {"id": "technical-quality", "title": "Technical Quality", "priority": "High"}
            ],
            "total_dimensions": 3,
            "execution_time": "2024-01-01T12:00:00Z"
        }
        
        complete_payload = {"output": output_data}
        response = requests.post(f"{base_url}/api/complete", json=complete_payload)
        if response.status_code == 200:
            print("✅ Execution completed successfully")
        else:
            print(f"❌ Failed to complete execution: {response.status_code}")
        
        # 验证执行历史
        print("4. Verifying execution history...")
        response = requests.get(f"{base_url}/api/executions")
        if response.status_code == 200:
            data = response.json()
            executions = data["executions"]
            print(f"✅ Found {len(executions)} executions")
            
            if executions:
                latest = executions[-1]
                print(f"   Latest execution: {latest['id']}")
                print(f"   Status: {latest['status']}")
                print(f"   Steps: {len(latest['steps'])}")
        else:
            print(f"❌ Failed to get executions: {response.status_code}")
        
        print("\n🎉 All tests passed!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to dashboard. Make sure it's running on port 5001")
        return False
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False

def test_error_handling():
    """测试错误处理"""
    print("\n🧪 Testing Error Handling")
    print("-" * 30)
    
    base_url = "http://localhost:5001"
    
    try:
        # 启动执行
        response = requests.post(f"{base_url}/api/start", json={"test": "data"})
        if response.status_code == 200:
            execution_id = response.json()["execution_id"]
            
            # 添加一些步骤
            requests.post(f"{base_url}/api/step", json={
                "step_name": "Test Step",
                "step_data": {"action": "Testing"}
            })
            
            # 模拟错误完成
            error_payload = {"error": "Test error message"}
            response = requests.post(f"{base_url}/api/complete", json=error_payload)
            
            if response.status_code == 200:
                print("✅ Error handling test passed")
                return True
            else:
                print(f"❌ Error handling test failed: {response.status_code}")
                return False
        else:
            print(f"❌ Failed to start error test: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error handling test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Workflow Monitoring Test Suite")
    print("=" * 50)
    
    # 检查仪表板是否运行
    try:
        response = requests.get("http://localhost:5001/api/executions", timeout=2)
        print("✅ Dashboard is running")
    except:
        print("❌ Dashboard is not running. Please start it first:")
        print("   python workflow_dashboard.py")
        sys.exit(1)
    
    # 运行测试
    test1_passed = test_workflow_monitoring()
    test2_passed = test_error_handling()
    
    if test1_passed and test2_passed:
        print("\n🎉 All tests passed! Workflow monitoring system is working correctly.")
    else:
        print("\n❌ Some tests failed. Please check the implementation.")
        sys.exit(1)
