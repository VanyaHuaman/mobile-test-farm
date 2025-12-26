"""
mitmproxy script for redirecting API traffic to Mockoon
Generated for proxy: mitm-1766774200309

This proxy is PERMISSIVE by default:
- Passes through ALL traffic unchanged
- Only redirects specific API domains to Mockoon
- Does not block or interfere with other network requests
"""

from mitmproxy import http

# Target domains to intercept
TARGET_DOMAINS = ["jsonplaceholder.typicode.com"]

# Mockoon server
MOCKOON_HOST = "localhost"
MOCKOON_PORT = 3001

# Verbose logging
VERBOSE = True

def request(flow: http.HTTPFlow) -> None:
    """
    Intercept requests and redirect to Mockoon if domain matches.
    Pass through everything else unchanged.
    """
    host = flow.request.pretty_host

    # Android emulator special IP: rewrite 10.0.2.2 to localhost
    # From emulator's perspective, 10.0.2.2 is the host machine
    # But from host machine's perspective, we need to use localhost
    if host == "10.0.2.2":
        flow.request.host = "localhost"
        if VERBOSE:
            print(f"🔄 Rewrote host: 10.0.2.2 → localhost (port: {flow.request.port})")

    # Check if this is a target domain we should mock
    should_mock = any(domain in host for domain in TARGET_DOMAINS)

    if should_mock:
        original_url = f"{flow.request.scheme}://{host}{flow.request.path}"

        if VERBOSE:
            print(f"🎭 Intercepting: {flow.request.method} {original_url}")

        # Rewrite request to point to Mockoon
        flow.request.scheme = "http"
        flow.request.host = MOCKOON_HOST
        flow.request.port = MOCKOON_PORT

        # Keep the original path and query string - Mockoon will match based on path

        # Add headers to track that this was proxied (useful for debugging)
        flow.request.headers["X-Mitmproxy-Intercepted"] = "true"
        flow.request.headers["X-Original-Host"] = host

        if VERBOSE:
            print(f"   → Redirected to: http://{MOCKOON_HOST}:{MOCKOON_PORT}{flow.request.path}")
    # Note: No else clause - all non-target requests pass through transparently
    # This is critical for app initialization, Metro bundler, etc.

def response(flow: http.HTTPFlow) -> None:
    """
    Log responses for intercepted requests
    """
    if VERBOSE and any(domain in flow.request.pretty_host for domain in TARGET_DOMAINS):
        print(f"   ← Response: {flow.response.status_code}")
