# Apple Sign In Setup Scripts

## Prerequisites

1. **Apple Developer Account** - You need a paid Apple Developer account
2. **App ID** - Create an App ID in Apple Developer Console
3. **Service ID** - Create a Service ID for Sign in with Apple
4. **Private Key** - Generate a private key for Sign in with Apple

## Step-by-Step Setup

### 1. Create App ID
1. Go to [Apple Developer Console - Identifiers](https://developer.apple.com/account/resources/identifiers/list)
2. Click "+" to create a new identifier
3. Select "App IDs" and continue
4. Choose "App" and continue
5. Enter a description and Bundle ID (e.g., `com.theagnt.website`)
6. Check "Sign In with Apple" in capabilities
7. Click "Continue" and "Register"

### 2. Create Service ID
1. Go back to [Identifiers](https://developer.apple.com/account/resources/identifiers/list)
2. Click "+" to create a new identifier
3. Select "Services IDs" and continue
4. Enter a description and identifier (e.g., `com.theagnt.website.signin`)
5. Check "Sign In with Apple"
6. Click "Configure" next to "Sign In with Apple"
7. Select your App ID as the Primary App ID
8. Add your domains and return URLs:
   - **Domains**: `theagnt.ai, theagnt-website.vercel.app, theagnt-website-darrens-projects-0443eb48.vercel.app, theagnt-website-darrenapfel-darrens-projects-0443eb48.vercel.app, theagnt-website-d2ccugj4b-darrens-projects-0443eb48.vercel.app`
   - **Return URLs**: `https://theagnt.ai/api/auth/callback/apple, https://theagnt-website.vercel.app/api/auth/callback/apple, https://theagnt-website-darrens-projects-0443eb48.vercel.app/api/auth/callback/apple, https://theagnt-website-darrenapfel-darrens-projects-0443eb48.vercel.app/api/auth/callback/apple, https://theagnt-website-d2ccugj4b-darrens-projects-0443eb48.vercel.app/api/auth/callback/apple`
9. Click "Save", "Continue", and "Register"

### 3. Create Private Key
1. Go to [Apple Developer Console - Keys](https://developer.apple.com/account/resources/authkeys/list)
2. Click "+" to create a new key
3. Enter a key name (e.g., "Sign in with Apple Key")
4. Check "Sign In with Apple"
5. Click "Configure" and select your App ID
6. Click "Save", "Continue", and "Register"
7. **Download the .p8 file immediately** (you can't download it again)
8. Note the Key ID (10 characters)

### 4. Generate Client Secret
1. Install dependencies:
   ```bash
   npm install jsonwebtoken
   ```

2. Place your downloaded `.p8` file in the `scripts/` directory

3. Edit `generate-apple-secret.js` and update the config:
   ```javascript
   const config = {
     teamId: 'ABCD123456',                    // Your 10-character Team ID
     clientId: 'com.theagnt.website.signin',  // Your Service ID
     keyId: 'XYZ9876543',                     // Your Key ID
     privateKeyPath: './AuthKey_XYZ9876543.p8' // Path to your .p8 file
   };
   ```

4. Run the script:
   ```bash
   node scripts/generate-apple-secret.js
   ```

5. Copy the generated `APPLE_CLIENT_SECRET` to your environment variables

## Finding Your Team ID
1. Go to [Apple Developer Console - Membership](https://developer.apple.com/account/manage)
2. Your Team ID is displayed at the top of the page (10 characters)

## Environment Variables
After successful setup, add these to your `.env.local` and Vercel:
```
APPLE_CLIENT_ID=com.theagnt.website.signin
APPLE_CLIENT_SECRET=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlhZWj...
```

## Troubleshooting
- **Invalid key error**: Make sure your .p8 file is valid and the Key ID matches
- **Configuration error**: Verify all IDs are correct and the App ID has Sign in with Apple enabled
- **Domain validation**: Ensure domains don't include `https://` and are comma-separated
- **Return URL validation**: Ensure return URLs are HTTPS only (no localhost in production)

## Security Notes
- The client secret expires every 6 months - you'll need to regenerate it
- Keep your `.p8` private key file secure and never commit it to version control
- The generated client secret is a JWT token that Apple uses to verify your identity