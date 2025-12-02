"""
mitmproxy script: Route specific endpoints to Mockoon mock server

Usage:
  mitmproxy --scripts route_to_mockoon.py

This script intercepts HTTP(S) traffic and routes specific endpoints
to the Mockoon mock server, while allowing other traffic to pass through
to the real API.
"""

from mitmproxy import http
import re

# Configuration
MOCKOON_HOST = "mockoon"
MOCKOON_PORT = 3000

# Define which endpoints should be mocked via Mockoon
# Use regex patterns to match request paths
MOCK_ENDPOINTS = [
    r'^/api/v1/auth/login$',
    r'^/api/v1/auth/register$',
    r'^/api/v1/user/profile$',
    r'^/api/v1/users/.*',
    r'^/api/v1/products.*',
    r'^/api/v1/orders.*',
]

# Define which endpoints should always go to real API
# (useful for exceptions within broader patterns)
REAL_ENDPOINTS = [
    r'^/api/v1/health$',
    r'^/api/v1/metrics$',
]


def should_mock(path: str) -> bool:
    """
    Determine if a request path should be routed to Mockoon

    Args:
        path: The request path to check

    Returns:
        True if the path should be mocked, False otherwise
    """
    # First check if it's explicitly set to use real API
    for pattern in REAL_ENDPOINTS:
        if re.match(pattern, path):
            return False

    # Then check if it matches a mock pattern
    for pattern in MOCK_ENDPOINTS:
        if re.match(pattern, path):
            return True

    return False


def request(flow: http.HTTPFlow) -> None:
    """
    Intercept and potentially route requests to Mockoon

    This function is called for every request passing through mitmproxy.
    """
    request_path = flow.request.path

    # Check for mock override header (useful for testing)
    force_mock = flow.request.headers.get("X-Force-Mock", "").lower() == "true"
    force_real = flow.request.headers.get("X-Force-Real", "").lower() == "true"

    if force_mock or (should_mock(request_path) and not force_real):
        # Route to Mockoon
        original_host = flow.request.host
        flow.request.scheme = "http"
        flow.request.host = MOCKOON_HOST
        flow.request.port = MOCKOON_PORT

        # Log the routing decision
        print(f"[MOCK] {flow.request.method} {request_path} → Mockoon (was: {original_host})")

        # Add header to track routing (useful for debugging)
        flow.request.headers["X-Mocked-By"] = "mitmproxy-mockoon"
    else:
        # Let it pass to real API
        print(f"[REAL] {flow.request.method} {request_path} → Real API")


def response(flow: http.HTTPFlow) -> None:
    """
    Process responses (useful for adding headers or logging)
    """
    # Add header to indicate if response was mocked
    if "X-Mocked-By" in flow.request.headers:
        flow.response.headers["X-Mocked-Response"] = "true"
        print(f"[MOCK RESPONSE] {flow.request.method} {flow.request.path} - Status: {flow.response.status_code}")
