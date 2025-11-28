# Vercel Environment Variables Setup

This guide explains how to configure environment variables for your Family Tree application when deploying to Vercel.

## Environment Variables

Your application uses two environment variables:

- `VITE_USE_MOCK_DATA`: Controls whether to use mock data or Google Sheets
- `VITE_API_URL`: The Google Apps Script API endpoint URL

## Setting Up in Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to your project dashboard on [Vercel](https://vercel.com)
2. Click on your project (e.g., "family-tree")
3. Navigate to **Settings** → **Environment Variables**
4. Add each variable:

   **For Development/Preview:**

   - **Name:** `VITE_USE_MOCK_DATA`
   - **Value:** `false` (to use Google Sheets) or `true` (to use mock data)
   - **Environment:** Check "Preview" and "Development"

   **For Production:**

   - **Name:** `VITE_USE_MOCK_DATA`
   - **Value:** `false` (recommended to use real data)
   - **Environment:** Check "Production"

5. Add the API URL:

   - **Name:** `VITE_API_URL`
   - **Value:** Your Google Apps Script URL (e.g., `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec`)
   - **Environment:** Check all environments or specific ones as needed

6. Click **Save**
7. **Redeploy** your application for changes to take effect

### Method 2: Vercel CLI

If you prefer using the command line:

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Add environment variables
vercel env add VITE_USE_MOCK_DATA
# When prompted, enter: false
# Select environments: Production, Preview, Development

vercel env add VITE_API_URL
# When prompted, enter your Google Apps Script URL
# Select environments: Production, Preview, Development

# Pull the environment variables to your local project (optional)
vercel env pull
```

## Configuration Options

### Development Mode (Mock Data)

Use this for testing and development without connecting to Google Sheets:

```
VITE_USE_MOCK_DATA=true
```

The `VITE_API_URL` will be ignored in this mode.

### Production Mode (Google Sheets)

Use this to connect to your live Google Sheets database:

```
VITE_USE_MOCK_DATA=false
VITE_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

## Important Notes

> [!IMPORTANT]
> After adding or changing environment variables in Vercel, you **must redeploy** your application for the changes to take effect.

> [!WARNING]
> Do not commit your `.env` file to Git. It's already in `.gitignore` to protect your API URLs.

> [!TIP]
> Use different values for Preview/Development vs Production. For example, use mock data for previews and real Google Sheets for production.

## Verifying Your Setup

After deploying with environment variables:

1. Open your deployed application
2. Open the browser's Developer Console (F12)
3. Look for console messages:
   - If using mock data: `"Using mock data (VITE_USE_MOCK_DATA=true)"`
   - If using Google Sheets: `"Fetching data from Google Sheets API: [your-url]"`
4. Check for any error messages that might indicate configuration issues

## Troubleshooting

### Data not loading from Google Sheets

1. **Check the console logs** - The enhanced error logging will show:

   - Response status
   - Error messages
   - Data format issues

2. **Verify your Google Apps Script deployment:**

   - Ensure it's deployed as a "Web App"
   - Access should be set to "Anyone"
   - Make sure you're using the latest deployment URL

3. **Check CORS settings:**

   - Google Apps Script should handle CORS automatically
   - If issues persist, verify your script's `doGet()` function

4. **Validate the API response format:**
   - The script should return an array of Person objects
   - Each object should have the required fields (id, fullName, etc.)

### Environment variables not working

1. Ensure variable names start with `VITE_` prefix (required for Vite)
2. Redeploy after adding variables
3. Check variable values in Vercel dashboard for typos
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

## Migration from Local `.env`

If you've been using a local `.env` file:

1. Open your `.env` file
2. Copy the values of `VITE_USE_MOCK_DATA` and `VITE_API_URL`
3. Add them to Vercel using either method above
4. Your local `.env` file can remain for local development

The local `.env` file is only used during local development (`npm run dev`). Vercel uses its own environment variable configuration for deployments.
