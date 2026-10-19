# Lifted

## Supabase auth setup

The app sends email confirmation links back to the origin where signup started.
In Supabase, open **Authentication → URL Configuration** and add these values:

- **Site URL:** your production Vercel URL, such as `https://your-app.vercel.app`
- **Redirect URLs:** `https://your-app.vercel.app/**` and `http://localhost:3000/**`

The production URL must be the exact URL users open, including the `https://` scheme.
After changing these values, redeploy the Vercel project and request a new confirmation email.
