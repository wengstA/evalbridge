#!/usr/bin/env python3
"""
启动脚本 - 同时运行主应用和监控面板
"""

import subprocess
import sys
import os
import time
import signal
import threading

def run_app(port, name):
    """运行Flask应用"""
    try:
        if name == "main":
            subprocess.run([sys.executable, "app.py"], check=True)
        elif name == "dashboard":
            subprocess.run([sys.executable, "workflow_dashboard.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running {name} app: {e}")
    except KeyboardInterrupt:
        print(f"\n{name} app stopped")

def main():
    print("🚀 Starting AI PM Evaluation System")
    print("=" * 50)
    
    # 检查必要文件
    required_files = ["app.py", "workflow_dashboard.py", "prompt_manager.py"]
    for file in required_files:
        if not os.path.exists(file):
            print(f"❌ Required file not found: {file}")
            sys.exit(1)
    
    print("✅ All required files found")
    
    # 启动主应用 (端口 8080)
    print("🔧 Starting main application on port 8080...")
    main_thread = threading.Thread(target=run_app, args=(8080, "main"))
    main_thread.daemon = True
    main_thread.start()
    
    # 等待主应用启动
    time.sleep(2)
    
    # 启动监控面板 (端口 5001)
    print("📊 Starting workflow dashboard on port 5001...")
    dashboard_thread = threading.Thread(target=run_app, args=(5001, "dashboard"))
    dashboard_thread.daemon = True
    dashboard_thread.start()
    
    print("\n🎉 Both applications started successfully!")
    print("\n📱 Access URLs:")
    print("   Main App:     http://localhost:8080")
    print("   Dashboard:    http://localhost:5001")
    print("\n💡 Press Ctrl+C to stop both applications")
    
    try:
        # 保持主线程运行
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down applications...")
        print("✅ Applications stopped")

if __name__ == "__main__":
    main()
 