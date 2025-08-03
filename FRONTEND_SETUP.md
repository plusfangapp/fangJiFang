# Frontend Setup with Supabase

## Quick Start

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Go to [supabase.com](https://supabase.com) and create a project
   - Copy your project URL and anon key

3. **Create environment file**:
   Create a `.env` file in the `client` directory:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase-dashboard
   ```

4. **Set up database**:
   - Go to your Supabase dashboard
   - Go to SQL Editor
   - Run the SQL commands from `supabase-config.md`

5. **Run the frontend**:
   ```bash
   npm run dev:frontend
   ```

The app will be available at `http://localhost:5173`

## What's Changed

- ✅ Added Supabase client configuration
- ✅ Created API service functions for all CRUD operations
- ✅ Added TypeScript types for database schema
- ✅ Created frontend-only development script
- ✅ Added cross-env for Windows compatibility

## Database Schema

The app uses these tables:
- `herbs` - Traditional Chinese Medicine herbs
- `formulas` - TCM formulas/recipes
- `patients` - Patient information
- `prescriptions` - Patient prescriptions
- `users` - User accounts

## API Functions

The `client/src/lib/api.ts` file contains all the API functions:
- `herbsApi` - CRUD operations for herbs
- `formulasApi` - CRUD operations for formulas
- `patientsApi` - CRUD operations for patients
- `prescriptionsApi` - CRUD operations for prescriptions
- `usersApi` - CRUD operations for users

## Next Steps

1. Update your React components to use the new API functions
2. Add authentication with Supabase Auth
3. Set up proper Row Level Security policies
4. Add real-time subscriptions if needed

## Troubleshooting

- **Environment variables not working**: Make sure the `.env` file is in the `client` directory
- **Database connection errors**: Check your Supabase URL and anon key
- **TypeScript errors**: The types are generated from the database schema, make sure your Supabase tables match 