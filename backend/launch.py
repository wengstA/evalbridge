#!/usr/bin/env python3
"""
Dual Mode System Launcher
Supports both demo mode (with mock data) and production mode (with real API)
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

def create_env_file(mode='demo'):
    """Create .env file with specified mode"""
    env_content = f"""# Application Mode
# Set to 'demo' for mock data, 'production' for real API calls
APP_MODE={mode}

# Gemini API Configuration (only used in production mode)
GEMINI_API_KEY=your_gemini_api_key_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True

# Server Configuration
MAIN_APP_PORT=8080
DASHBOARD_PORT=5001
"""
    
    env_path = Path('.env')
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print(f"✅ Created .env file with {mode.upper()} mode")
    return env_path

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import flask
        import flask_cors
        import google.genai
        from dotenv import load_dotenv
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please install requirements: pip install -r requirements.txt")
        return False

def start_system(mode='demo', port=8080, dashboard_port=5001):
    """Start the dual mode system"""
    
    print(f"🚀 Starting AI PM Evaluation System in {mode.upper()} mode")
    print(f"📊 Main app: http://localhost:{port}")
    print(f"📈 Dashboard: http://localhost:{dashboard_port}")
    print("-" * 50)
    
    # Create .env file
    create_env_file(mode)
    
    # Check dependencies
    if not check_dependencies():
        return False
    
    try:
        # Start main application
        print("🔄 Starting main application...")
        main_process = subprocess.Popen([
            sys.executable, 'app.py'
        ], cwd=Path(__file__).parent)
        
        # Start workflow dashboard
        print("🔄 Starting workflow dashboard...")
        dashboard_process = subprocess.Popen([
            sys.executable, 'workflow_dashboard.py'
        ], cwd=Path(__file__).parent)
        
        print("✅ Both services started successfully!")
        print("\n📋 Service Status:")
        print(f"   Main App (PID {main_process.pid}): http://localhost:{port}")
        print(f"   Dashboard (PID {dashboard_process.pid}): http://localhost:{dashboard_port}")
        
        if mode == 'demo':
            print("\n🎭 Demo Mode Features:")
            print("   • Instant responses with mock data")
            print("   • No API costs")
            print("   • Realistic simulation of AI capabilities")
            print("   • Perfect for demonstrations and testing")
        else:
            print("\n⚡ Production Mode Features:")
            print("   • Real AI API calls")
            print("   • Full Gemini 2.5 Pro capabilities")
            print("   • Requires valid API key")
            print("   • Suitable for actual evaluation work")
        
        print("\n🛑 Press Ctrl+C to stop all services")
        
        # Wait for processes
        try:
            main_process.wait()
            dashboard_process.wait()
        except KeyboardInterrupt:
            print("\n🛑 Shutting down services...")
            main_process.terminate()
            dashboard_process.terminate()
            print("✅ All services stopped")
            
    except Exception as e:
        print(f"❌ Failed to start system: {e}")
        return False
    
    return True

def main():
    parser = argparse.ArgumentParser(description='AI PM Evaluation System Launcher')
    parser.add_argument(
        '--mode', 
        choices=['demo', 'production'], 
        default='demo',
        help='Application mode: demo (mock data) or production (real API)'
    )
    parser.add_argument(
        '--port', 
        type=int, 
        default=8080,
        help='Main application port (default: 8080)'
    )
    parser.add_argument(
        '--dashboard-port', 
        type=int, 
        default=5001,
        help='Dashboard port (default: 5001)'
    )
    
    args = parser.parse_args()
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Start the system
    success = start_system(args.mode, args.port, args.dashboard_port)
    
    if not success:
        sys.exit(1)

if __name__ == '__main__':
    main()
