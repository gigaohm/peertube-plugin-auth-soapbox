# Setup Guide for PeerTube SoapBox OAuth Plugin

## Quick Setup Steps

### 1. Install the Plugin

```bash
# From the plugin directory
peertube-cli plugins install --path /path/to/peertube-plugin-auth-soapbox
```

### 2. Configure SoapBox OAuth Application

In your SoapBox instance:

1. Go to **Administration** → **Development** → **Applications**
2. Click **New Application**
3. Fill in the details:
   - **Name**: `PeerTube Authentication`
   - **Redirect URI**: `https://your-peertube-instance.com/plugins/auth-soapbox/callback`
   - **Scopes**: `read:accounts write:accounts`
4. Click **Submit**
5. Copy the **Client ID** and **Client Secret**

### 3. Configure the Plugin

In your PeerTube admin panel:

1. Go to **Administration** → **Plugins**
2. Find **peertube-plugin-auth-soapbox** and click **Settings**
3. Configure the settings:
   - **SoapBox Instance URL**: `https://your-soapbox-instance.com`
   - **OAuth Client ID**: (paste from step 2)
   - **OAuth Client Secret**: (paste from step 2)
   - **OAuth Scope**: `read:accounts write:accounts`
4. Click **Save**

### 4. Test the Integration

1. Go to your PeerTube login page
2. You should see a "Login with SoapBox" button
3. Click it to test the OAuth flow
4. You should be redirected to your SoapBox instance for authentication
5. After successful authentication, you should be redirected back to PeerTube

## Troubleshooting

### Plugin Not Showing Up
- Make sure the plugin is properly installed: `peertube-cli plugins list`
- Check PeerTube logs for any errors

### OAuth Redirect Issues
- Verify the redirect URI in SoapBox matches exactly: `https://your-peertube-instance.com/plugins/auth-soapbox/callback`
- Check that the SoapBox instance URL is correct in plugin settings

### Authentication Fails
- Verify OAuth client credentials are correct
- Check that the OAuth scopes match between SoapBox and plugin settings
- Review PeerTube server logs for detailed error messages

## Development

To make changes to the plugin:

```bash
# Make your changes to the source files
# Then rebuild:
pnpm run build

# The plugin will automatically reload in PeerTube
```

## Files Structure

```
src/
├── server/plugin.ts              # OAuth server logic
└── client/common-client-plugin.ts # UI components
dist/                              # Built files (auto-generated)
languages/                         # Translations
```