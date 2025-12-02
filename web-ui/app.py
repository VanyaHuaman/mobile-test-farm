from flask import Flask, render_template, jsonify, request
import os
import yaml
import subprocess
import json
from datetime import datetime
from pathlib import Path

app = Flask(__name__)

# Configuration
TESTS_DIR = Path('/app/tests')
RESULTS_DIR = Path('/app/results')
CONFIG_DIR = Path('/app/config')

# Ensure directories exist
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

def load_devices():
    """Load device configuration"""
    devices_file = CONFIG_DIR / 'devices.yml'
    if devices_file.exists():
        with open(devices_file, 'r') as f:
            return yaml.safe_load(f)
    return {'devices': []}

def discover_tests():
    """Discover all available test files"""
    tests = []
    if TESTS_DIR.exists():
        for test_file in TESTS_DIR.rglob('*.py'):
            if test_file.name.startswith('test_') or test_file.name.endswith('_test.py'):
                relative_path = test_file.relative_to(TESTS_DIR)
                tests.append({
                    'name': test_file.stem,
                    'path': str(relative_path),
                    'platform': str(relative_path.parts[0]) if len(relative_path.parts) > 1 else 'common'
                })
    return tests

@app.route('/')
def index():
    """Main dashboard"""
    devices = load_devices()
    tests = discover_tests()
    return render_template('index.html', devices=devices.get('devices', []), tests=tests)

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/devices')
def get_devices():
    """Get list of configured devices"""
    devices = load_devices()
    return jsonify(devices)

@app.route('/api/tests')
def get_tests():
    """Get list of available tests"""
    tests = discover_tests()
    return jsonify({'tests': tests})

@app.route('/api/run-test', methods=['POST'])
def run_test():
    """Execute a test on selected devices"""
    data = request.json
    test_path = data.get('test_path')
    devices = data.get('devices', [])

    if not test_path:
        return jsonify({'error': 'No test specified'}), 400

    if not devices:
        return jsonify({'error': 'No devices selected'}), 400

    # Create result entry
    run_id = datetime.now().strftime('%Y%m%d_%H%M%S')
    result = {
        'run_id': run_id,
        'test': test_path,
        'devices': devices,
        'status': 'running',
        'started_at': datetime.now().isoformat()
    }

    # Save run metadata
    result_file = RESULTS_DIR / f'run_{run_id}.json'
    with open(result_file, 'w') as f:
        json.dump(result, f, indent=2)

    # In a real implementation, this would trigger the test execution
    # For now, just return success
    return jsonify({
        'success': True,
        'run_id': run_id,
        'message': f'Test queued for execution on {len(devices)} device(s)'
    })

@app.route('/api/results')
def get_results():
    """Get test execution results"""
    results = []
    if RESULTS_DIR.exists():
        for result_file in sorted(RESULTS_DIR.glob('run_*.json'), reverse=True):
            with open(result_file, 'r') as f:
                results.append(json.load(f))
    return jsonify({'results': results[:20]})  # Return last 20 results

@app.route('/api/results/<run_id>')
def get_result(run_id):
    """Get specific test run result"""
    result_file = RESULTS_DIR / f'run_{run_id}.json'
    if result_file.exists():
        with open(result_file, 'r') as f:
            return jsonify(json.load(f))
    return jsonify({'error': 'Result not found'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
