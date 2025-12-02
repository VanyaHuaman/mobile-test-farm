"""
mitmproxy script: Enhance real API responses with mock data

This script allows requests to go to the real API, but then
enriches the response with additional mock data from Mockoon.

Useful for:
- Adding test-only fields to real responses
- Ensuring consistent test data while using real APIs
- Testing features that require specific data not in real API
"""

from mitmproxy import http
import requests
import json


MOCKOON_URL = "http://mockoon:3000"


def response(flow: http.HTTPFlow) -> None:
    """Enhance real API responses with mock data"""

    # Only enhance successful responses
    if flow.response.status_code != 200:
        return

    # Check if enhancement is requested
    enhance = flow.request.headers.get("X-Enhance-Response", "").lower() == "true"
    if not enhance:
        return

    try:
        # Parse real response
        real_data = json.loads(flow.response.text)

        # Try to get enhancement data from Mockoon
        # Use /enhance endpoint with original path as param
        enhance_url = f"{MOCKOON_URL}/enhance?path={flow.request.path}"

        enhance_response = requests.get(
            enhance_url,
            headers={"X-Original-Path": flow.request.path},
            timeout=2
        )

        if enhance_response.ok:
            enhance_data = enhance_response.json()

            # Merge enhancement data
            if isinstance(real_data, dict) and isinstance(enhance_data, dict):
                # Deep merge dictionaries
                enhanced = {**real_data, **enhance_data}
                flow.response.text = json.dumps(enhanced)
                flow.response.headers["X-Enhanced"] = "true"
                print(f"[ENHANCED] {flow.request.path} with mock data")
            elif isinstance(real_data, list) and "items" in enhance_data:
                # Add mock items to list
                real_data.extend(enhance_data["items"])
                flow.response.text = json.dumps(real_data)
                flow.response.headers["X-Enhanced"] = "true"
                print(f"[ENHANCED] {flow.request.path} with {len(enhance_data['items'])} mock items")

    except Exception as e:
        print(f"[ENHANCE ERROR] Failed to enhance {flow.request.path}: {e}")
        # Keep original response on error
