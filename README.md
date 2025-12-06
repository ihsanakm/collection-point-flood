# 🌊 Flood Relief Collection Points

A Next.js web application for managing and discovering flood relief collection points across Sri Lanka. This platform helps connect donors with verified collection centers during flood emergencies.

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)

## ✨ Features

- 🗺️ **Interactive Map View** - Visualize collection points on an interactive map using Leaflet
- 📍 **Location-Based Search** - Find nearest collection points based on your location
- 🔍 **Advanced Filtering** - Filter by item categories, urgency level, and target areas
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🌐 **Multi-language Support** - Available in English, Sinhala, and Tamil
- 👥 **Admin Dashboard** - Manage collection points, approve submissions, and handle reports
- 🔐 **Secure Authentication** - User authentication powered by Supabase
- 📊 **Real-time Updates** - Live data synchronization across all users

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with Turbopack
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Maps**: [Leaflet](https://leafletjs.com/) with React Leaflet
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Form Handling**: React Hook Form + Zod
- **Deployment**: [Vercel](https://vercel.com/)

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- Git installed
- npm or pnpm package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/collection-point-flood.git
   cd collection-point-flood
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   
   Run the SQL scripts in order in your Supabase SQL Editor:
   
   ```bash
   # 1. Create database schema
   scripts/001-create-schema.sql
   
   # 2. Seed item categories
   scripts/002-seed-categories.sql
   
   # 3. Add demo collection points
   scripts/003-seed-test-data.sql
   scripts/005-add-more-demo-points.sql
   
   # 4. Fix RLS policies (IMPORTANT!)
   scripts/006-fix-rls-recursion.sql
   
   # 5. (Optional) Create admin user
   scripts/004-create-admin-user.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

The application uses the following main tables:

- **collection_points** - Stores collection point information
- **item_categories** - Categories of items being collected (Water, Food, Medicine, etc.)
- **reports** - User-submitted reports about collection points
- **admin_users** - Admin user management

Row Level Security (RLS) policies ensure:
- Anyone can view active collection points
- Anyone can submit new collection points (pending approval)
- Only admins can approve, edit, or delete collection points

## 📱 Usage

### For Donors

1. **Browse Collection Points**
   - View all active collection points on the map or list view
   - Filter by item categories, urgency level, or location
   - Search by name, address, or target area

2. **Submit a New Collection Point**
   - Click "Add Collection Point"
   - Fill in the required information
   - Submit for admin approval

3. **Report Issues**
   - Found incorrect information? Report it to admins
   - Help keep the platform accurate and up-to-date

### For Admins

1. **Approve Collection Points**
   - Review pending submissions
   - Approve or reject new collection points

2. **Manage Existing Points**
   - Update collection point information
   - Change status (active, temporarily closed, etc.)
   - Delete fraudulent or duplicate entries

3. **Handle Reports**
   - Review user-submitted reports
   - Take action on reported issues

## 🚢 Deployment

### Deploy to Vercel

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Deploy**
   - Click "Deploy"
   - Your app will be live at `your-project.vercel.app`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database and Auth by [Supabase](https://supabase.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons by [Lucide](https://lucide.dev/)
- Maps powered by [Leaflet](https://leafletjs.com/)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ for flood relief efforts in Sri Lanka**
