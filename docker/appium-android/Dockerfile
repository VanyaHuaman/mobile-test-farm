FROM appium/appium:latest

# Install additional tools
USER root

# Install Android SDK tools and dependencies
RUN apt-get update && apt-get install -y \
    android-tools-adb \
    android-tools-fastboot \
    usbutils \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Appium drivers
RUN appium driver install uiautomator2
RUN appium driver install xcuitest

# Create directories for tests and results
RUN mkdir -p /tests /results

# Set up ADB server
ENV ADB_SERVER_SOCKET=tcp:5037

# Expose Appium port
EXPOSE 4723

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:4723/status || exit 1

# Start ADB server and Appium
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
