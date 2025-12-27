# CI/CD Workflows

These GitHub Actions workflows are templates that need to be configured for your specific mobile app.

## ⚠️ Configuration Required

The workflows reference `expo-arch-example-app` which needs to be replaced with your own app repository.

### Steps to Configure:

1. **Update app repository references** in each workflow file:
   - Change `repository: ${{ github.repository_owner }}/expo-arch-example-app`
   - To: `repository: ${{ github.repository_owner }}/your-app-repo`

2. **Update app paths** to match your app:
   - Android APK path
   - iOS app path
   - App package/bundle identifiers

3. **Update environment variables** in each workflow:
   - `ANDROID_APP_DEBUG`
   - `ANDROID_PACKAGE`
   - `IOS_APP_SIMULATOR`
   - `IOS_BUNDLE_ID`

## Workflow Files:

### mobile-tests.yml
Runs tests on every push to main branch. Tests both Android and iOS.

**Configure:**
- App checkout step
- Build steps for your app
- Test commands

### test-android.yml
Android-specific test workflow.

**Configure:**
- Android build steps
- APK path
- Package name

### test-ios.yml
iOS-specific test workflow (macOS only).

**Configure:**
- iOS build steps
- App path
- Bundle ID

### nightly-tests.yml
Scheduled tests that run daily at midnight UTC.

**Configure:**
- Schedule (cron expression)
- App build steps
- Notification webhooks

## Example Configuration:

```yaml
# Before (template)
- name: Checkout Test App
  uses: actions/checkout@v4
  with:
    repository: ${{ github.repository_owner }}/expo-arch-example-app
    path: expo-arch-example-app

# After (your app)
- name: Checkout Mobile App
  uses: actions/checkout@v4
  with:
    repository: ${{ github.repository_owner }}/my-mobile-app
    path: my-mobile-app
```

## Disabling Workflows

If you want to disable a workflow temporarily, add this at the top:

```yaml
on:
  workflow_dispatch:  # Only run manually
```

Or comment out the entire workflow file.

## Need Help?

See the [CI/CD Integration Guide](../../docs/ci-cd-integration.md) for detailed setup instructions.
