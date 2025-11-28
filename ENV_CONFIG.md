# Data Source Configuration

## Options

### Use Mock Data (Development)

```env
VITE_USE_MOCK_DATA=true
```

The app will use mock data from `src/services/mockData.ts`. Great for:

- Local development
- Testing features
- Demo/presentation mode
- No Google Sheets setup required

### Use Google Sheets (Production)

```env
VITE_USE_MOCK_DATA=false
VITE_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

The app will fetch data from your Google Sheets via Apps Script.

## Setup

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Choose your data source by editing `.env`

3. Restart the dev server:
   ```bash
   npm run dev
   ```

## Notes

- If `VITE_USE_MOCK_DATA=true`, the `VITE_API_URL` is ignored
- If both are false/empty, mock data is used as fallback
- Mock data changes are not persisted (refresh resets data)
- Google Sheets changes are persisted permanently
