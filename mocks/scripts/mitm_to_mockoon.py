#!/usr/bin/env python3
"""
Convert mitmproxy recordings to Mockoon format

This script reads recorded traffic from mitmproxy and converts it
to Mockoon's JSON configuration format.

Usage:
    python mitm_to_mockoon.py <input.jsonl> <output.json>
    python mitm_to_mockoon.py recordings.jsonl mockoon-import.json

The input file should be in JSONL format (one JSON object per line)
as created by selective_record.py.
"""

import json
import sys
import uuid
from pathlib import Path
from typing import List, Dict, Any
from collections import defaultdict


def generate_uuid() -> str:
    """Generate a UUID for Mockoon entities"""
    return str(uuid.uuid4())


def clean_headers(headers: Dict[str, str]) -> List[Dict[str, str]]:
    """
    Convert headers dict to Mockoon format and filter out problematic ones
    """
    # Headers to exclude (connection-specific, not useful in mocks)
    exclude_headers = {
        'content-length', 'transfer-encoding', 'connection',
        'keep-alive', 'host', 'content-encoding'
    }

    result = []
    for key, value in headers.items():
        if key.lower() not in exclude_headers:
            result.append({"key": key, "value": value})

    return result


def determine_endpoint(path: str) -> str:
    """
    Convert path to Mockoon endpoint format

    Example: /api/user/123 → /api/user/:id
    """
    # Simple heuristic: if segment looks like ID, convert to param
    # This is basic - might need improvement for your use case
    parts = path.split('/')
    result = []

    for part in parts:
        if not part:
            continue
        # If part is numeric or UUID-like, make it a param
        if part.isdigit() or '-' in part and len(part) > 30:
            result.append(':id')
        else:
            result.append(part)

    return '/' + '/'.join(result) if result else path


def get_content_type(headers: Dict[str, str]) -> str:
    """Extract content type from headers"""
    for key, value in headers.items():
        if key.lower() == 'content-type':
            return value.split(';')[0].strip()
    return 'application/json'


def convert_recordings_to_mockoon(
    input_file: str,
    output_file: str,
    name: str = "Recorded API Mocks"
) -> None:
    """
    Convert mitmproxy recordings to Mockoon format

    Args:
        input_file: Path to JSONL file with recordings
        output_file: Path for output Mockoon JSON config
        name: Name for the Mockoon environment
    """

    # Read all recordings
    recordings = []
    with open(input_file, 'r') as f:
        for line in f:
            if line.strip():
                recordings.append(json.loads(line))

    print(f"Read {len(recordings)} recordings from {input_file}")

    # Group recordings by method+path to handle duplicates
    grouped = defaultdict(list)
    for rec in recordings:
        method = rec['request']['method'].lower()
        path = rec['request']['path']
        key = f"{method}:{path}"
        grouped[key].append(rec)

    print(f"Grouped into {len(grouped)} unique endpoints")

    # Convert to Mockoon routes
    routes = []

    for key, recs in grouped.items():
        method, path = key.split(':', 1)

        # Use first recording as template
        first_rec = recs[0]

        # Create endpoint (convert IDs to params if needed)
        endpoint = determine_endpoint(path).lstrip('/')

        # Create response body
        response_body = first_rec['response']['body']
        if isinstance(response_body, dict):
            response_body = json.dumps(response_body, indent=2)

        # Create route
        route = {
            "uuid": generate_uuid(),
            "documentation": f"Recorded: {method.upper()} {path}",
            "method": method,
            "endpoint": endpoint,
            "responses": [
                {
                    "uuid": generate_uuid(),
                    "body": response_body,
                    "latency": 0,
                    "statusCode": first_rec['response']['status_code'],
                    "label": f"Recorded response ({len(recs)} similar)",
                    "headers": clean_headers(first_rec['response']['headers']),
                    "bodyType": "INLINE",
                    "filePath": "",
                    "databucketID": "",
                    "sendFileAsBody": False,
                    "rules": [],
                    "rulesOperator": "OR",
                    "disableTemplating": False,
                    "fallbackTo404": False,
                    "default": True
                }
            ],
            "enabled": True,
            "responseMode": None
        }

        routes.append(route)

    # Create Mockoon environment
    mockoon_config = {
        "uuid": generate_uuid(),
        "lastMigration": 27,
        "name": name,
        "endpointPrefix": "",
        "latency": 0,
        "port": 3000,
        "hostname": "0.0.0.0",
        "folders": [],
        "routes": routes,
        "proxyMode": False,
        "proxyHost": "",
        "proxyRemovePrefix": False,
        "tlsOptions": {
            "enabled": False,
            "type": "CERT",
            "pfxPath": "",
            "certPath": "",
            "keyPath": "",
            "caPath": "",
            "passphrase": ""
        },
        "cors": True,
        "headers": [
            {
                "key": "Content-Type",
                "value": "application/json"
            },
            {
                "key": "Access-Control-Allow-Origin",
                "value": "*"
            },
            {
                "key": "Access-Control-Allow-Methods",
                "value": "GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS"
            },
            {
                "key": "Access-Control-Allow-Headers",
                "value": "*"
            }
        ],
        "proxyReqHeaders": [{"key": "", "value": ""}],
        "proxyResHeaders": [{"key": "", "value": ""}],
        "data": []
    }

    # Write output
    with open(output_file, 'w') as f:
        json.dump(mockoon_config, f, indent=2)

    print(f"\nConverted {len(routes)} routes to Mockoon format")
    print(f"Output written to: {output_file}")
    print("\nNext steps:")
    print("1. Open this file in Mockoon desktop app")
    print("2. Review and edit the routes")
    print("3. Add Faker.js helpers for dynamic data")
    print("4. Export and use in your test farm")


def main():
    if len(sys.argv) < 3:
        print("Usage: python mitm_to_mockoon.py <input.jsonl> <output.json>")
        print("\nExample:")
        print("  python mitm_to_mockoon.py recordings.jsonl mockoon-recorded.json")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    if not Path(input_file).exists():
        print(f"Error: Input file not found: {input_file}")
        sys.exit(1)

    try:
        convert_recordings_to_mockoon(input_file, output_file)
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
