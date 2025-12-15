# SaaS Subscription Dashboard

A modern SaaS subscription dashboard built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🔐 Authentication system with role-based access
- 📊 Dashboard with analytics and statistics
- 👥 User management with CRUD operations
- 💳 Subscription management
- ⚙️ User settings and preferences
- 🔒 Feature gating based on subscription tiers
- 💾 Local storage persistence
- 📱 Responsive design

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Tables**: TanStack Table

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd saas-subscription-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Accounts

- **Admin**: `admin@example.com` / `adminpass` (Enterprise plan)
- **User**: `user@example.com` / `userpass` (Premium plan - trial)

## Deployment

### Vercel (Recommended)

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (automatic)

3. **Environment Variables** (if needed):
   - Add any environment variables in Vercel dashboard

4. **Deploy**:
   - Click "Deploy"
   - Your app will be live at `https://your-project-name.vercel.app`

### Automatic Deployments

Once connected to GitHub, Vercel automatically:
- Deploys on every push to main branch
- Creates preview deployments for pull requests
- Provides deployment history and rollback options

### Other Deployment Options

#### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables if needed

#### Railway

1. Connect your GitHub repository
2. Railway auto-detects Next.js
3. Deploy automatically on pushes

#### Render

1. Connect your GitHub repository
2. Choose "Static Site" or "Web Service"
3. Set build command: `npm run build`
4. Set publish directory: `.next`

## Project Structure

```
src/
├── app/
│   ├── components/          # Reusable components
│   ├── contexts/           # React contexts (Auth)
│   ├── dashboard/          # Dashboard page
│   ├── login/             # Authentication page
│   ├── settings/          # User settings page
│   ├── subscription/      # Subscription management
│   ├── users/             # User management
│   └── globals.css        # Global styles
├── lib/
│   ├── api.ts             # API functions and types
│   ├── subscription.ts    # Subscription logic
│   └── types.ts           # TypeScript interfaces
└── middleware.ts          # Next.js middleware
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - feel free to use this project for your own SaaS applications!