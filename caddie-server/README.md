# Caddie Server

OAuth server for the Contact Caddie HubSpot app. Handles OAuth authorization flow and token management.

## Features

- **OAuth 2.0 Flow**: Complete OAuth authorization with HubSpot
- **Token Storage**: Persistent token storage using Vercel Redis (ioredis)
- **Automatic Token Refresh**: Tokens are automatically refreshed before expiration
- **Dynamic Redirect URIs**: Works in local development and production automatically
- **Environment Separation**: Dev and prod tokens stored separately

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions.

For local development, create `.env.local`:

```bash
HUBSPOT_CLIENT_ID=your_client_id
HUBSPOT_CLIENT_SECRET=your_client_secret
```

### 3. Run Locally

```bash
npm run dev
```

Server runs on http://localhost:3000

## API Endpoints

### `GET /api/oauth-callback`

OAuth callback endpoint. HubSpot redirects here after user authorization.

**Query Parameters:**
- `code` (string, required): Authorization code from HubSpot

**Response:**
```json
{
  "message": "OAuth authorization successful",
  "portalId": "12345678"
}
```

### `GET /api/contacts?portalId=123`

Example endpoint demonstrating authenticated HubSpot API calls.

**Query Parameters:**
- `portalId` (string, required): HubSpot portal/account ID

**Response:**
```json
{
  "message": "Contacts retrieved successfully",
  "contacts": [...]
}
```

## Token Management

The server uses Vercel Redis (via ioredis) to store OAuth tokens with automatic refresh logic.

### Token Storage (`lib/tokenStore.ts`)

**Store tokens:**
```typescript
await storeTokens(portalId, {
  accessToken: '...',
  refreshToken: '...',
  expiresIn: 21600
});
```

**Get valid access token (auto-refreshes):**
```typescript
const accessToken = await getValidAccessToken(portalId);
```

**Get authorized HubSpot client:**
```typescript
const client = await getAuthorizedHubSpotClient(portalId);
const contacts = await client.crm.contacts.basicApi.getPage();
```

## Architecture

```
User → HubSpot OAuth → /api/oauth-callback
                            ↓
                    Exchange code for tokens
                            ↓
                    Store in Vercel KV
                            ↓
              Return success to user

Later API calls:
                            ↓
            Retrieve tokens from KV
                            ↓
        Check if expired (5 min buffer)
                            ↓
    If expired → Refresh automatically
                            ↓
            Make HubSpot API call
```

## Deployment

Automatically deployed to Vercel when changes are pushed to the `caddie-server/` directory.

### Production Setup

1. **Connect to Vercel**: Link your GitHub repository
2. **Add Redis Database**:
   - Settings → Storage → Create Database → Redis
   - Click "Connect Project" and select your project
3. **Set Environment Variables**: Add `HUBSPOT_CLIENT_ID` and `HUBSPOT_CLIENT_SECRET`
4. **Deploy**: Push to main branch

## Project Structure

```
src/
├── lib/
│   ├── constants.ts      # Shared constants
│   └── tokenStore.ts     # Token storage and refresh logic
└── pages/
    └── api/
        ├── oauth-callback.ts   # OAuth callback handler
        └── contacts.ts         # Example API endpoint
```

## Development Notes

- Tokens are stored with portal ID as the key
- Tokens auto-refresh 5 minutes before expiration
- All redirect URIs must be registered in HubSpot app settings
- Local development uses `http://localhost:3000/api/oauth-callback`
- Production uses your Vercel deployment URL
