"""
Workflow Visualization Dashboard
A simple web interface to monitor and visualize workflow outputs
"""

from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime
from typing import Dict, List, Any
import threading
import time

app = Flask(__name__)
CORS(app)

class WorkflowMonitor:
    """Monitor and store workflow execution data"""
    
    def __init__(self):
        self.executions: List[Dict[str, Any]] = []
        self.current_execution: Dict[str, Any] = None
        self.lock = threading.Lock()
    
    def start_execution(self, execution_id: str, input_data: Dict[str, Any]):
        """Start tracking a new workflow execution"""
        with self.lock:
            execution = {
                'id': execution_id,
                'start_time': datetime.now().isoformat(),
                'status': 'running',
                'input': input_data,
                'steps': [],
                'output': None,
                'error': None,
                'end_time': None
            }
            self.executions.append(execution)
            self.current_execution = execution
    
    def add_step(self, step_name: str, step_data: Dict[str, Any]):
        """Add a step to the current execution"""
        with self.lock:
            if self.current_execution:
                step = {
                    'name': step_name,
                    'timestamp': datetime.now().isoformat(),
                    'data': step_data
                }
                self.current_execution['steps'].append(step)
    
    def complete_execution(self, output_data: Dict[str, Any] = None, error: str = None):
        """Mark the current execution as completed"""
        with self.lock:
            if self.current_execution:
                self.current_execution['status'] = 'completed' if not error else 'failed'
                self.current_execution['output'] = output_data
                self.current_execution['error'] = error
                self.current_execution['end_time'] = datetime.now().isoformat()
                self.current_execution = None
    
    def get_executions(self) -> List[Dict[str, Any]]:
        """Get all executions"""
        with self.lock:
            return self.executions.copy()
    
    def get_current_execution(self) -> Dict[str, Any]:
        """Get current execution"""
        with self.lock:
            return self.current_execution.copy() if self.current_execution else None

# Global workflow monitor
workflow_monitor = WorkflowMonitor()

@app.route('/')
def dashboard():
    """Main dashboard page"""
    return render_template('dashboard.html')

@app.route('/api/executions')
def get_executions():
    """Get all workflow executions"""
    executions = workflow_monitor.get_executions()
    return jsonify({
        'executions': executions,
        'total': len(executions),
        'running': len([e for e in executions if e['status'] == 'running'])
    })

@app.route('/api/execution/<execution_id>')
def get_execution(execution_id: str):
    """Get specific execution details"""
    executions = workflow_monitor.get_executions()
    execution = next((e for e in executions if e['id'] == execution_id), None)
    
    if not execution:
        return jsonify({'error': 'Execution not found'}), 404
    
    return jsonify(execution)

@app.route('/api/current')
def get_current():
    """Get current execution"""
    current = workflow_monitor.get_current_execution()
    return jsonify({'current': current})

@app.route('/api/start', methods=['POST'])
def start_execution():
    """Start a new workflow execution"""
    data = request.get_json()
    execution_id = f"exec_{int(time.time())}"
    
    workflow_monitor.start_execution(execution_id, data)
    
    return jsonify({
        'execution_id': execution_id,
        'status': 'started'
    })

@app.route('/api/step', methods=['POST'])
def add_step():
    """Add a step to current execution"""
    data = request.get_json()
    step_name = data.get('step_name')
    step_data = data.get('step_data', {})
    
    workflow_monitor.add_step(step_name, step_data)
    
    return jsonify({'status': 'step_added'})

@app.route('/api/complete', methods=['POST'])
def complete_execution():
    """Complete current execution"""
    data = request.get_json()
    output_data = data.get('output')
    error = data.get('error')
    
    workflow_monitor.complete_execution(output_data, error)
    
    return jsonify({'status': 'completed'})

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    
    # Run the dashboard
    app.run(debug=True, host='0.0.0.0', port=5001)
