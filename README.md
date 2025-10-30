# Contact Caddie

A HubSpot app for tracking golf stats on contact records.

## Tech Stack

**HubSpot App** (`hs-contact-caddie/`)
- [HubSpot UI Extensions](https://developers.hubspot.com/docs/platform/ui-extensions-overview) - React-based component framework for building HubSpot apps
- [CRM Cards](https://developers.hubspot.com/docs/platform/ui-components-overview) - Custom UI components that appear on CRM records
- TypeScript & React 18
- HubSpot Platform Version: 2025.2

**OAuth Server** (`caddie-server/`)
- [Next.js 14](https://nextjs.org/)
- React framework with API routes
- TypeScript
- Handles OAuth 2.0 authentication flow


## Project Structure

```
hs-contact-caddie/          # HubSpot project
├── hsproject.json          # HubSpot project configuration
└── src/app/
    ├── app-hsmeta.json     # App metadata and OAuth settings
    └── cards/              # CRM card components
        └── ContactCaddie.tsx

caddie-server/              # NextJS Caddie Server (deployed to Vercel)
└── src/pages/api/
    └── oauth-callback.ts   # OAuth redirect handler
```

## CI/CD

**Vercel Deployment**
- Connected to this repository with automatic deployments
- Only triggers when changes are detected in `caddie-server/`
- Deploys the Next.js OAuth server

**HubSpot Deployment**
- Uses [HubSpot Project Actions](https://github.com/HubSpot/hubspot-project-actions) to upload the HubSpot app
- Only triggers on push to `main` when changes are detected in `hs-contact-caddie/`
- Requires `HUBSPOT_ACCOUNT_ID` and `HUBSPOT_PERSONAL_ACCESS_KEY` secrets

## Resources

- [HubSpot Platform Documentation](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/overview)
- [UI Extensions API Reference](https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/ui-extensions-sdk)
- [OAuth Guide](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/oauth/oauth-quickstart-guide)
