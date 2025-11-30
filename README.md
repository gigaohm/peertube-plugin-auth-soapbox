# peertube-plugin-auth-soapbox

A PeerTube server plugin that adds support for external authentication via OAuth from a SoapBox instance.

## Features

- OAuth 2.0 authentication with SoapBox instances
- Automatic user account creation and linking
- Configurable OAuth scopes
- Multi-language support (English, French)
- TypeScript-based implementation

## Installation

1. Install the plugin dependencies:

```bash
npm install
```

2. Build the plugin:

```bash
npm run build
```

3. Install the plugin on your PeerTube instance using the PeerTube CLI:

```bash
peertube-cli plugins install --path /path/to/peertube-plugin-auth-soapbox
```


## Configuration

After installation, configure the plugin in your PeerTube admin panel:

1. Go to Administration → Plugins
2. Find "peertube-plugin-auth-soapbox" and click "Settings"
3. Configure the following settings:
   - **SoapBox Instance URL**: The URL of your SoapBox instance (e.g., https://soapbox.example.com)
   - **OAuth Client ID**: The OAuth client ID from your SoapBox instance
   - **OAuth Client Secret**: The OAuth client secret from your SoapBox instance
   - **OAuth Scope**: OAuth scope for authentication (default: read:accounts write:accounts)

## SoapBox OAuth Application Setup

To use this plugin, you need to create an OAuth application in your SoapBox instance:

1. Log in to your SoapBox instance as an administrator
2. Go to Administration → Development → Applications
3. Create a new application with the following settings:
   - **Name**: PeerTube Authentication
   - **Redirect URI**: `https://your-peertube-instance.com/plugins/auth-soapbox/callback`
   - **Scopes**: `read:accounts write:accounts` (or as needed)
4. Copy the Client ID and Client Secret to the plugin settings

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm
- TypeScript 5+

### Building

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Development mode with watch
npm run dev
```

### Project Structure

```
src/
├── server/
│   └── plugin.ts          # Server-side OAuth logic
├── client/
│   └── common-client-plugin.ts  # Client-side UI components
languages/
├── en.json               # English translations
└── fr.json               # French translations
```

## License

BSD-3-Clause
