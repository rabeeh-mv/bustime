# 🚌 Kerala Bus Timings - MVP

A simple, mobile-friendly website to find local bus timings across Kerala. Built with Next.js 14, Supabase, and Tailwind CSS.

## ✨ Features

- **Search Bus Routes**: Find bus timings between any two locations in Kerala
- **Popular Routes**: Quick access to frequently searched routes
- **Add Bus Timings**: Bus drivers can easily add their timings
- **Mobile Responsive**: Works perfectly on all devices
- **Real-time Data**: Powered by Supabase for instant updates

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 📋 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd bustime
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your project URL and anon key
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Set up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL commands from `database-schema.sql` to create tables and sample data

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/
│   ├── routes/
│   │   ├── page.js          # Routes listing page
│   │   └── [routeId]/
│   │       ├── page.js      # Individual route timings
│   │       └── not-found.js # Route not found page
│   ├── add-bus/
│   │   └── page.js          # Add bus timing form
│   ├── layout.js            # Root layout
│   ├── page.js              # Homepage
│   └── not-found.js         # Global not found page
├── components/
│   ├── Navbar.js            # Navigation component
│   ├── SearchForm.js        # Search form component
│   └── PopularRoutes.js     # Popular routes component
└── lib/
    └── supabase.js          # Supabase client configuration
```

## 🗄️ Database Schema

### Routes Table
- `id` (UUID, Primary Key)
- `from_location` (Text)
- `to_location` (Text)
- `created_at` (Timestamp)

### Buses Table
- `id` (UUID, Primary Key)
- `route_id` (UUID, Foreign Key)
- `bus_name` (Text, Optional)
- `departure_time` (Time)
- `stops` (Text, Optional)
- `contact` (Text, Optional)
- `created_at` (Timestamp)

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🎯 MVP Features Completed

- ✅ Homepage with hero section and search
- ✅ Routes listing page
- ✅ Individual route timings page
- ✅ Add bus timing form
- ✅ Mobile-responsive design
- ✅ Supabase integration
- ✅ Sample data and database schema

## 🔮 Future Enhancements

- **Authentication**: Secure login for bus owners
- **Admin Panel**: Manage and approve bus timings
- **Real-time Updates**: WebSocket integration
- **WhatsApp Integration**: Send timings via WhatsApp
- **Push Notifications**: Browser notifications for updates
- **Monetization**: Premium listings and ads

## 📱 Mobile-First Design

The application is built with a mobile-first approach using Tailwind CSS, ensuring it works perfectly on all devices from phones to desktops.

## 🤝 Contributing

This is an MVP project. Feel free to fork and contribute improvements!

## 📄 License

MIT License - feel free to use this project for your own bus timing applications.