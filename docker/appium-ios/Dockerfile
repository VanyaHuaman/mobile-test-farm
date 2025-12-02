FROM appium/appium:latest

USER root

# Install iOS dependencies
RUN apt-get update && apt-get install -y \
    libimobiledevice-utils \
    usbmuxd \
    libimobiledevice6 \
    ifuse \
    ideviceinstaller \
    python3-imobiledevice \
    usbutils \
    wget \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Appium XCUITest driver
RUN appium driver install xcuitest

# Install ios-deploy (needed for WebDriverAgent)
RUN npm install -g ios-deploy

# Create directories
RUN mkdir -p /tests /results

# Expose Appium port
EXPOSE 4724

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:4724/status || exit 1

# Start usbmuxd and Appium
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
