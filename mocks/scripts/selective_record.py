"""
mitmproxy script: Record specific API endpoints for later conversion to mocks

This script records only specific endpoints to avoid capturing
unnecessary traffic like analytics, ads, etc.

The recordings can be converted to Mockoon format later.
"""

from mitmproxy import http, ctx
import json
import re
from datetime import datetime
from pathlib import Path


# Endpoints to record (regex patterns)
RECORD_PATTERNS = [
    r'^/api/v1/.*',      # All v1 API endpoints
    r'^/api/auth/.*',     # Auth endpoints
    r'^/graphql$',        # GraphQL endpoint
]

# Endpoints to exclude from recording
EXCLUDE_PATTERNS = [
    r'.*analytics.*',
    r'.*tracking.*',
    r'.*ads.*',
    r'.*metrics.*',
]

RECORDINGS_FILE = "/home/mitmproxy/.mitmproxy/recordings.jsonl"


def should_record(path: str) -> bool:
    """Check if this path should be recorded"""
    # Check exclusions first
    for pattern in EXCLUDE_PATTERNS:
        if re.match(pattern, path, re.IGNORECASE):
            return False

    # Check if matches record patterns
    for pattern in RECORD_PATTERNS:
        if re.match(pattern, path):
            return True

    return False


def response(flow: http.HTTPFlow) -> None:
    """Record responses for matching endpoints"""
    if not should_record(flow.request.path):
        return

    try:
        # Parse request body if JSON
        request_body = flow.request.text
        try:
            request_body = json.loads(request_body)
        except:
            pass

        # Parse response body if JSON
        response_body = flow.response.text
        try:
            response_body = json.loads(response_body)
        except:
            pass

        # Create recording entry
        recording = {
            "timestamp": datetime.now().isoformat(),
            "request": {
                "method": flow.request.method,
                "url": flow.request.url,
                "path": flow.request.path,
                "query": dict(flow.request.query),
                "headers": dict(flow.request.headers),
                "body": request_body
            },
            "response": {
                "status_code": flow.response.status_code,
                "headers": dict(flow.response.headers),
                "body": response_body
            }
        }

        # Append to recordings file (JSONL format - one JSON per line)
        recordings_path = Path(RECORDINGS_FILE)
        recordings_path.parent.mkdir(parents=True, exist_ok=True)

        with open(recordings_path, "a") as f:
            f.write(json.dumps(recording) + "\n")

        print(f"[RECORDED] {flow.request.method} {flow.request.path} (status: {flow.response.status_code})")

    except Exception as e:
        print(f"[RECORD ERROR] Failed to record {flow.request.path}: {e}")


def done():
    """Called when mitmproxy shuts down"""
    ctx.log.info(f"Recordings saved to {RECORDINGS_FILE}")
