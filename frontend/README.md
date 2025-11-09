# AI Cold Caller Frontend v2

A modern, responsive React frontend for the AI Cold Calling System with improved UI/UX and better responsiveness across all devices.

## Features

### 🎨 Modern UI/UX
- **Clean, modern design** with Tailwind CSS
- **Responsive layout** that works on all devices
- **Smooth animations** using Framer Motion
- **Interactive components** with hover effects and transitions
- **Consistent design system** with custom color palette

### 📊 Dashboard & Analytics
- **Real-time statistics** with animated cards
- **Performance metrics** with progress indicators
- **System status monitoring** with live updates
- **Recent activity feeds** for leads and calls
- **Quick action buttons** for common tasks

### 👥 Lead Management
- **Comprehensive lead listing** with search and filters
- **Add/Edit lead forms** with validation
- **Lead detail pages** with call history
- **Bulk import via CSV** with drag & drop
- **Priority and status management**

### 📞 Call Tracking
- **Call history table** with detailed information
- **Call outcome tracking** with status badges
- **Meeting scheduling** integration
- **Recording playback** links
- **Export functionality**

### 📈 Reports & Analytics
- **Interactive charts** using Recharts
- **Performance metrics** with targets
- **Time-based filtering** (7, 30, 90 days)
- **Call outcome distribution** pie charts
- **Lead status breakdown** bar charts

### 🔧 Technical Features
- **React Query** for efficient data fetching
- **React Router** for navigation
- **Toast notifications** for user feedback
- **Loading states** and error handling
- **Form validation** and error messages

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router v6** - Client-side routing
- **React Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Recharts** - Chart components
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Date-fns** - Date utilities

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend API running (see main project README)

### Installation

1. **Clone the repository**
   ```bash
   cd ai_caller_frontend_v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.js       # Main layout with navigation
│   ├── StatCard.js     # Statistics display component
│   ├── SystemStatus.js # System health component
│   ├── RecentLeads.js  # Recent leads component
│   ├── RecentCalls.js  # Recent calls component
│   └── QuickActions.js # Quick action buttons
├── pages/              # Page components
│   ├── Dashboard.js    # Main dashboard
│   ├── Leads.js        # Leads listing page
│   ├── LeadForm.js     # Add/edit lead form
│   ├── LeadDetail.js   # Lead detail page
│   ├── Calls.js        # Calls listing page
│   ├── Reports.js      # Analytics and reports
│   └── UploadLeads.js  # CSV import page
├── services/           # API and external services
│   └── api.js         # API client and endpoints
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── contexts/           # React contexts
├── assets/             # Static assets
├── App.js              # Main app component
├── index.js            # App entry point
└── index.css           # Global styles
```

## API Integration

The frontend connects to the backend API with the following endpoints:

### Core Endpoints
- `GET /api/health` - System health check
- `GET /api/stats` - Dashboard statistics
- `GET /api/leads` - Lead management
- `GET /api/calls` - Call records
- `POST /api/scheduler/start` - Start scheduler
- `POST /api/scheduler/stop` - Stop scheduler

### Features

#### Dashboard
- Real-time statistics display
- System status monitoring
- Recent activity feeds
- Quick action buttons

#### Lead Management
- List all leads with search/filter
- Add new leads with form validation
- Edit existing leads
- View lead details with call history
- Delete leads with confirmation

#### Call Tracking
- View call history with details
- Filter calls by outcome
- Access meeting links and recordings
- Export call data

#### Reports & Analytics
- Interactive charts and graphs
- Performance metrics
- Time-based filtering
- Export functionality

#### CSV Import
- Drag & drop file upload
- CSV template download
- Validation and error handling
- Progress feedback

## Responsive Design

The frontend is fully responsive with:

- **Mobile-first approach** using Tailwind CSS
- **Flexible grid system** that adapts to screen size
- **Collapsible sidebar** on mobile devices
- **Touch-friendly** buttons and interactions
- **Optimized typography** for all screen sizes

## Customization

### Colors
The color scheme can be customized in `tailwind.config.js`:

```javascript
colors: {
  primary: { /* Custom primary colors */ },
  success: { /* Custom success colors */ },
  warning: { /* Custom warning colors */ },
  danger: { /* Custom danger colors */ },
}
```

### Components
All components are modular and can be easily customized:

- Modify component styles in `src/index.css`
- Update component logic in individual files
- Add new components in `src/components/`

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the AI Cold Calling System. See the main project for license information.

## Support

For support and questions:
- Check the main project documentation
- Review the API documentation
- Open an issue in the repository 