# TCM Prescription Management System

A comprehensive Traditional Chinese Medicine (TCM) prescription management system built with React, TypeScript, and Supabase.

## 🚀 Features

- **Herb Management**: Complete herb database with TCM properties, actions, and clinical information
- **Formula Management**: TCM formulas with herb composition and detailed clinical data
- **Patient Management**: Patient records with medical history and medication tracking
- **Prescription Builder**: Create and manage prescriptions with custom formulas
- **User Authentication**: Secure user authentication with Supabase Auth
- **Data Import/Export**: Bulk import herbs and formulas from JSON files
- **PDF Generation**: Generate printable prescriptions
- **Responsive Design**: Modern UI that works on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation
- **PDF Generation**: jsPDF, react-to-print

## 📁 Project Structure

```
fangJiFang/
├── client/                          # Frontend application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                  # Shadcn/ui components
│   │   │   └── ...                  # Custom components
│   │   ├── pages/                   # Application pages
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Utilities and API clients
│   │   ├── types/                   # TypeScript type definitions
│   │   └── main.tsx                 # Application entry point
│   └── index.html
├── COMPLETE_DATABASE_SCHEMA.sql     # Complete database schema
├── package.json                     # Dependencies and scripts
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

## 🗄️ Database Schema

The system uses a comprehensive PostgreSQL schema with the following main tables:

- **herbs**: TCM herbs with detailed properties and clinical information
- **formulas**: TCM formulas with herb composition and clinical data
- **patients**: Patient records and medical history
- **prescriptions**: Prescriptions with formula references and custom formulas
- **users**: User profile information

### Key Features:
- ✅ Row Level Security (RLS) for data isolation
- ✅ Automatic timestamps and triggers
- ✅ Performance-optimized indexes
- ✅ Data validation functions
- ✅ Utility functions for common operations
- ✅ Proper foreign key constraints

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fangJiFang
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the `COMPLETE_DATABASE_SCHEMA.sql` script in your Supabase SQL editor
   - Copy your Supabase URL and anon key

4. **Configure environment variables**
   Create a `.env` file in the client directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📊 Database Setup

1. **Run the complete schema script**
   - Open your Supabase SQL editor
   - Copy and paste the entire content of `COMPLETE_DATABASE_SCHEMA.sql`
   - Execute the script

2. **Verify the setup**
   The script includes verification queries (commented out) that you can run to ensure everything is set up correctly.

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Structure

- **Components**: Reusable UI components in `client/src/components/`
- **Pages**: Application pages in `client/src/pages/`
- **API**: Supabase client and API functions in `client/src/lib/`
- **Types**: TypeScript definitions in `client/src/types/`

## 📝 Usage

### Managing Herbs
- Add new herbs with comprehensive TCM properties
- Import herbs from JSON files
- Search and filter herbs by category and properties

### Managing Formulas
- Create TCM formulas with herb composition
- Set clinical applications and pharmacological effects
- Import formulas from JSON files

### Creating Prescriptions
- Select patients and formulas
- Build custom prescriptions with individual herbs
- Generate printable PDF prescriptions

## 🔒 Security

- Row Level Security (RLS) ensures users can only access their own data
- Supabase Auth provides secure authentication
- All API calls are authenticated and validated

## 📱 Features

### Herb Management
- ✅ Complete herb database with TCM properties
- ✅ Clinical patterns and therapeutic actions
- ✅ Research and evidence data
- ✅ Import/export functionality

### Formula Management
- ✅ TCM formulas with herb composition
- ✅ Clinical applications and indications
- ✅ Pharmacological effects and research
- ✅ Bulk import from JSON

### Prescription System
- ✅ Patient management
- ✅ Formula and herb selection
- ✅ Custom prescription builder
- ✅ PDF generation
- ✅ Prescription history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation in the code comments
- Review the database schema in `COMPLETE_DATABASE_SCHEMA.sql`
- Open an issue for bugs or feature requests

---

**Built with ❤️ for Traditional Chinese Medicine practitioners**