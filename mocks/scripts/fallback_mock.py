"""
mitmproxy script: Fallback to Mockoon when real API fails

This script allows requests to go to the real API, but if the API
returns an error (5xx), it automatically retries with Mockoon.

Useful for:
- Testing resilience when APIs are down
- Ensuring tests don't fail due to flaky external services
"""

from mitmproxy import http
import requests
import json


MOCKOON_URL = "http://mockoon:3000"
FALLBACK_STATUS_CODES = [500, 502, 503, 504]  # Server errors


def response(flow: http.HTTPFlow) -> None:
    """
    Check if real API returned an error, fallback to Mockoon if so
    """
    # Only fallback on server errors
    if flow.response.status_code not in FALLBACK_STATUS_CODES:
        return

    print(f"[FALLBACK] Real API error {flow.response.status_code} for {flow.request.path}")

    try:
        # Build Mockoon URL
        mock_url = f"{MOCKOON_URL}{flow.request.path}"
        if flow.request.query:
            mock_url += "?" + str(flow.request.query)

        # Prepare request data
        headers = dict(flow.request.headers)
        # Remove headers that shouldn't be forwarded
        headers.pop("Host", None)

        # Make request to Mockoon
        mock_response = requests.request(
            method=flow.request.method,
            url=mock_url,
            headers=headers,
            data=flow.request.content,
            timeout=5,
            verify=False
        )

        # Check if Mockoon has a mock for this endpoint
        if mock_response.status_code == 404:
            print(f"[FALLBACK] Mockoon has no mock for {flow.request.path}, keeping real error")
            return

        # Replace response with mock
        flow.response.status_code = mock_response.status_code
        flow.response.reason = mock_response.reason
        flow.response.content = mock_response.content

        # Update headers
        for key, value in mock_response.headers.items():
            if key.lower() not in ["content-encoding", "transfer-encoding", "content-length"]:
                flow.response.headers[key] = value

        # Add fallback indicator
        flow.response.headers["X-Fallback-Mock"] = "true"
        print(f"[FALLBACK] Returned mock response ({mock_response.status_code}) for {flow.request.path}")

    except Exception as e:
        print(f"[FALLBACK] Failed to get mock response: {e}")
        # Keep original error response
