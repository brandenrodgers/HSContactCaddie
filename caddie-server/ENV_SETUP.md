# Environment Variables Setup

## Required Environment Variables

### HubSpot OAuth Configuration

Get these from your HubSpot app settings: https://app.hubspot.com/developer

```bash
HUBSPOT_CLIENT_ID=your_client_id_here
HUBSPOT_CLIENT_SECRET=your_client_secret_here
```

### Redis (Vercel Redis)

This is automatically set when you create a Redis database in the Vercel dashboard and connect it to your project:
**Settings → Storage → Create Database → Redis**

```bash
REDIS_URL=redis://...
```

## Local Development

### Option 1: Pull from Vercel (Recommended)

After connecting your Redis database to your project in Vercel, pull the environment variables:

```bash
vercel env pull .env.development.local
```

This will automatically pull `REDIS_URL` along with other environment variables.

Then add your HubSpot credentials to `.env.development.local`:

```bash
HUBSPOT_CLIENT_ID=your_actual_client_id
HUBSPOT_CLIENT_SECRET=your_actual_client_secret
```

### Option 2: Manual Setup

Create a `.env.local` file in the `caddie-server` directory:

```bash
HUBSPOT_CLIENT_ID=your_actual_client_id
HUBSPOT_CLIENT_SECRET=your_actual_client_secret
REDIS_URL=your_redis_url_from_vercel
```

## Production (Vercel)

1. **Create Redis Database:**
   - Go to your Vercel project → **Settings → Storage**
   - Click **Create Database** → **Redis**
   - After creation, click **Connect Project** and select your project
   - Vercel will automatically inject the `REDIS_URL` environment variable

2. **Add HubSpot credentials:**
   - Go to your Vercel project settings
   - Navigate to **Environment Variables**
   - Add `HUBSPOT_CLIENT_ID` and `HUBSPOT_CLIENT_SECRET` for Production

## Environment Separation

Tokens are automatically stored with environment-specific prefixes:

- **Development** (local): `hubspot:tokens:dev:{portalId}`
- **Production** (Vercel): `hubspot:tokens:prod:{portalId}`

This means your local testing won't pollute production data, even though they use the same KV database.

The environment is determined by `NODE_ENV`:
- `NODE_ENV=production` → uses `prod` prefix
- Anything else → uses `dev` prefix

