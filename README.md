# FangJiFang - Traditional Chinese Medicine Application

A modern web application for managing Traditional Chinese Medicine (TCM) herbs, formulas, patients, and prescriptions. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **Herbs Management**: Comprehensive database of TCM herbs with detailed properties
- **Formulas Management**: TCM formulas and recipes with composition tracking
- **Patient Management**: Patient records and medical history
- **Prescription Builder**: Create and manage patient prescriptions
- **Modern UI**: Beautiful, responsive interface built with Radix UI components
- **Real-time Database**: Powered by Supabase for reliable data storage

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State Management**: TanStack Query
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd fangJiFang
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the `client` directory:
   ```
   VITE_SUPABASE_URL=https://ueoyqnnlpdjdmhkxyuik.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlb3lxbm5scGRqZG1oa3h5dWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNTA3ODAsImV4cCI6MjA2OTgyNjc4MH0.sc5U33ZUGbnfN99fWM1UgsXxFoJnHOQlfC0lZu-BiCM
   ```

4. **Set up database**:
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Navigate to SQL Editor
   - Run the SQL commands from `database-setup.sql`

5. **Start development server**:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## 🗄️ Database Schema

The application uses the following tables:

- **herbs**: TCM herbs with detailed properties and classifications
- **formulas**: TCM formulas and recipes
- **patients**: Patient information and medical history
- **prescriptions**: Patient prescriptions linking herbs and formulas
- **users**: User accounts and authentication

## 🚀 Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the Vite configuration

3. **Configure Environment Variables**:
   - Add the Supabase environment variables in Vercel dashboard
   - Or they're already configured in `vercel.json`

4. **Deploy**:
   - Click "Deploy"
   - Your app will be live at the provided URL

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy using Vercel CLI
npm i -g vercel
vercel
```

## 📁 Project Structure

```
fangJiFang/
├── client/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/
│   │   │   ├── supabase.ts # Supabase configuration
│   │   │   └── api.ts      # API functions
│   │   ├── pages/          # Page components
│   │   └── types/          # TypeScript types
│   └── index.html
├── package.json
├── vite.config.ts
├── vercel.json
├── database-setup.sql
└── DEPLOYMENT.md
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run check` - Type checking
- `npm run setup:db` - Database setup (requires manual SQL execution)

## 🎨 UI Components

The application uses a comprehensive set of UI components from Radix UI:

- **Navigation**: Sidebar, breadcrumbs, menus
- **Forms**: Inputs, selects, checkboxes, radio groups
- **Feedback**: Toasts, alerts, dialogs
- **Data Display**: Tables, cards, badges
- **Layout**: Accordions, tabs, collapsible panels

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Public read access for demo purposes
- Authentication-ready for production use
- Environment variables for sensitive data

## 📚 API Functions

The `client/src/lib/api.ts` file contains all the API functions:

- `herbsApi` - CRUD operations for herbs
- `formulasApi` - CRUD operations for formulas
- `patientsApi` - CRUD operations for patients
- `prescriptionsApi` - CRUD operations for prescriptions
- `usersApi` - CRUD operations for users

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for Traditional Chinese Medicine practitioners and enthusiasts**