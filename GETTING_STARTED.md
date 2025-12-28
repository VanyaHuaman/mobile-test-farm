# Getting Started with Mobile Test Farm

This is the **clean template branch** - ready for you to start your own mobile testing project!

## Quick Setup

### 1. Automated Setup (Recommended)

```bash
# Clone the template branch
git clone -b template https://github.com/VanyaHuaman/mobile-test-farm.git my-mobile-tests
cd my-mobile-tests

# Run automated setup
npm run setup
```

The setup script will:
- ✅ Check your system requirements
- ✅ Install Appium and drivers
- ✅ Install mitmproxy for API mocking
- ✅ Configure environment variables
- ✅ Set up MITM certificates

### 2. Configure Your App

Edit `config/test.config.js` to point to your mobile app:

```javascript
apps: {
  android: {
    debug: '/path/to/your/app.apk',
  },
  ios: {
    simulator: '/path/to/your/YourApp.app',
  },
},

appInfo: {
  android: {
    package: 'com.yourcompany.yourapp',
    activity: '.MainActivity',
  },
  ios: {
    bundleId: 'com.yourcompany.yourapp',
  },
},
```

Or set via environment variables:

```bash
export ANDROID_APP_DEBUG=/path/to/your/app.apk
export ANDROID_PACKAGE=com.yourcompany.yourapp
export IOS_APP_SIMULATOR=/path/to/YourApp.app
export IOS_BUNDLE_ID=com.yourcompany.yourapp
```

### 3. Connect and Register Devices

```bash
# Start Appium server
npx appium

# In another terminal, discover and register devices
npm run devices sync
npm run devices register
```

### 4. Write Your First Test

Create a test file in `tests/specs/`:

```javascript
// tests/specs/my-first-test.spec.js
const TestBase = require('../../lib/TestBase');

describe('My First Test', () => {
  const testBase = new TestBase();

  it('should launch the app', async function() {
    await testBase.runTest(
      'android-emulator-1', // or your device name
      null,                  // use default config
      async (driver) => {
        // Your test logic here
        const isAppLaunched = await driver.isKeyboardShown();
        console.log('App launched:', !isAppLaunched);
      },
      'my-first-test'
    );
  });
});
```

### 5. Run Your Test

```bash
# Run from command line
node tests/specs/my-first-test.spec.js

# Or use the web dashboard
npm run dashboard
# Open http://localhost:3000
```

## Project Structure

```
mobile-test-farm/
├── bin/                    # CLI tools and scripts
│   ├── devices.js         # Device management
│   ├── setup.js           # Automated setup
│   └── setup-mitm.js      # MITM certificate setup
├── config/                # Configuration
│   ├── devices.json       # Device registry
│   ├── test.config.js     # Test configuration
│   └── test-variants.js   # Test variant configurations
├── lib/                   # Core libraries
│   ├── TestBase.js        # Base test class
│   ├── device-manager.js  # Device management API
│   ├── MockoonManager.js  # API mocking
│   └── MitmProxyManager.js # MITM proxy
├── tests/                 # Your test files
│   ├── specs/             # Test specifications
│   └── page-objects/      # Page object models
├── mocks/                 # API mock configurations
│   └── environments/      # Mock environment files
├── server/                # Web dashboard
│   └── public/            # Dashboard UI
├── docs/                  # Documentation
└── .github/workflows/     # CI/CD workflows
```

## Next Steps

### Create Page Objects

```javascript
// tests/page-objects/LoginPage.js
class LoginPage {
  constructor(driver) {
    this.driver = driver;
  }

  get usernameField() {
    return this.driver.$('~username-input');
  }

  get passwordField() {
    return this.driver.$('~password-input');
  }

  get loginButton() {
    return this.driver.$('~login-button');
  }

  async login(username, password) {
    await this.usernameField.setValue(username);
    await this.passwordField.setValue(password);
    await this.loginButton.click();
  }
}

module.exports = LoginPage;
```

### Use the Page Object in Tests

```javascript
const LoginPage = require('../page-objects/LoginPage');

it('should login successfully', async function() {
  await testBase.runTest('device-name', null, async (driver) => {
    const loginPage = new LoginPage(driver);
    await loginPage.login('demo', 'password');

    // Assert login succeeded
    const homeScreen = await driver.$('~home-screen');
    expect(await homeScreen.isDisplayed()).toBe(true);
  }, 'login-test');
});
```

### Set Up API Mocking

```bash
# Enable mocking in .env
MOCKOON_ENABLED=true
MOCKOON_MOCK_FILE=./mocks/environments/your-api-mock.json

# Create mock environment
# See docs/MOCKING.md for details
```

### Configure CI/CD

The template includes GitHub Actions workflows:
- `.github/workflows/mobile-tests.yml` - Run tests on push
- `.github/workflows/test-android.yml` - Android-specific tests
- `.github/workflows/test-ios.yml` - iOS-specific tests
- `.github/workflows/nightly-tests.yml` - Scheduled tests

Update these to match your app and requirements.

## Documentation

- **[README.md](README.md)** - Full feature list and capabilities
- **[docs/writing-tests.md](docs/writing-tests.md)** - Test development guide
- **[docs/device-management.md](docs/device-management.md)** - Device management
- **[docs/MOCKING.md](docs/MOCKING.md)** - API mocking guide
- **[docs/MITM_SETUP.md](docs/MITM_SETUP.md)** - MITM proxy setup
- **[docs/web-dashboard.md](docs/web-dashboard.md)** - Web dashboard guide
- **[docs/ci-cd-integration.md](docs/ci-cd-integration.md)** - CI/CD setup
- **[docs/html-reporting.md](docs/html-reporting.md)** - HTML test reports

## Want to See Examples?

Switch to the `master` branch to see a working example with a real Expo app:

```bash
git checkout master
```

The master branch includes:
- Complete Expo app with React Native New Architecture
- Example tests for various scenarios
- API integration examples
- Working CI/CD pipelines

## Support

- **Issues**: https://github.com/VanyaHuaman/mobile-test-farm/issues
- **Discussions**: https://github.com/VanyaHuaman/mobile-test-farm/discussions
- **Documentation**: [docs/](docs/)

## License

MIT License - see LICENSE file for details

---

**Happy Testing!** 🚀
