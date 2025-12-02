"""
mitmproxy script: Conditional mocking based on request headers or query params

This allows fine-grained control over which requests are mocked:
- Use X-Mock-Mode header to control mocking per request
- Use ?mock=true query parameter
- Use X-Test-Scenario header to load specific test scenarios

Useful for:
- Running same test with real/mock APIs
- Testing specific scenarios (error cases, edge cases)
- A/B testing real vs mock responses
"""

from mitmproxy import http
import re


MOCKOON_HOST = "mockoon"
MOCKOON_PORT = 3000


def request(flow: http.HTTPFlow) -> None:
    """Route to Mockoon based on conditions"""

    # Check for mock mode header
    mock_mode = flow.request.headers.get("X-Mock-Mode", "").lower()

    # Check for mock query parameter
    has_mock_param = "mock" in flow.request.query and \
                     flow.request.query.get("mock", "").lower() in ["true", "1", "yes"]

    # Check for test scenario header (can be used in Mockoon routing)
    test_scenario = flow.request.headers.get("X-Test-Scenario", "")

    should_mock = False

    # Determine if we should mock
    if mock_mode == "mock" or mock_mode == "true":
        should_mock = True
    elif mock_mode == "real" or mock_mode == "false":
        should_mock = False
    elif has_mock_param:
        should_mock = True
        # Remove mock parameter from query string to avoid issues
        flow.request.query.pop("mock", None)
    elif test_scenario:
        # If test scenario is specified, route to Mockoon
        # Mockoon can use this header in response rules
        should_mock = True

    if should_mock:
        original_host = flow.request.host
        flow.request.scheme = "http"
        flow.request.host = MOCKOON_HOST
        flow.request.port = MOCKOON_PORT

        # Pass scenario to Mockoon for conditional responses
        if test_scenario:
            flow.request.headers["X-Mockoon-Scenario"] = test_scenario

        log_msg = f"[MOCK] {flow.request.method} {flow.request.path} → Mockoon"
        if test_scenario:
            log_msg += f" (scenario: {test_scenario})"
        print(log_msg)

        flow.request.headers["X-Mocked-By"] = "mitmproxy-conditional"


def response(flow: http.HTTPFlow) -> None:
    """Add response headers for debugging"""
    if "X-Mocked-By" in flow.request.headers:
        flow.response.headers["X-Mock-Mode"] = "mocked"

        # Include scenario in response if it was used
        scenario = flow.request.headers.get("X-Mockoon-Scenario", "")
        if scenario:
            flow.response.headers["X-Mock-Scenario"] = scenario
    else:
        flow.response.headers["X-Mock-Mode"] = "real"
