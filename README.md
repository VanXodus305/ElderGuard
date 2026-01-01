# ElderGuard - Senior Protection Against Scams and Fraud

ElderGuard is a web application designed to protect seniors from fraudulent messages and online scams. The platform uses AI-powered message analysis and link verification to keep seniors safe online.

## Features

### 🛡️ Core Features

- **Message Analysis**: AI-powered detection of scam and fraudulent messages
- **Link Verification**: Automatic scanning of links to detect malicious websites
- **Emergency Alerts**: One-click messaging to emergency contacts via WhatsApp
- **Google Authentication**: Simple, password-free login using Google accounts
- **User Profiles**: Store personal details and emergency contact information

### ♿ Accessibility Features

- **Large Default Text**: Optimized text size for seniors
- **Adjustable Font Size**: Users can increase/decrease font size (Small, Normal, Large, Extra Large)
- **Multi-language Support**: Built-in Google Translate integration
- **Simple Navigation**: Clean, intuitive UI designed for ease of use

### 🎨 User Interface

- Light-themed design with soothing green/teal color palette
- HeroUI components for consistent, professional UI
- Responsive design that works on all devices
- Clear risk indicators with visual cues

## Tech Stack

- **Frontend**: Next.js 15, React 19
- **Styling**: Tailwind CSS, HeroUI
- **Authentication**: NextAuth.js (Google OAuth)
- **Database**: MongoDB
- **Icons**: React Icons
- **Additional**: Framer Motion, Axios

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- MongoDB database
- Google OAuth credentials

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string_here

# Next-Auth Google OAuth
AUTH_GOOGLE_ID=your_google_oauth_client_id_here
AUTH_GOOGLE_SECRET=your_google_oauth_client_secret_here

# Next-Auth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET=your_auth_secret_here

# VirusTotal API (for future link scanning)
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
```

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the "Google+ API"
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (for production)
6. Copy Client ID and Client Secret to `.env.local`

### Setting Up MongoDB

1. Create a MongoDB cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Add it to `.env.local` as `MONGODB_URI`

### Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
elderguard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/  # NextAuth API routes
│   │   │   └── user/profile/        # User profile API
│   │   ├── dashboard/               # Main dashboard page
│   │   ├── login/                   # Login page
│   │   ├── profile/                 # User profile page
│   │   ├── profile-setup/           # First-time profile setup
│   │   ├── layout.jsx               # Root layout with providers
│   │   ├── page.jsx                 # Home page
│   │   ├── not-found.jsx            # 404 page
│   │   └── globals.css              # Global styles
│   ├── components/
│   │   ├── Navbar.jsx               # Navigation bar with font size & translation
│   │   └── Footer.jsx               # Footer component
│   ├── contexts/
│   │   └── Provider.jsx             # SessionProvider & HeroUIProvider wrapper
│   ├── lib/
│   │   └── mongodb.js               # MongoDB connection handler
│   ├── models/
│   │   └── User.js                  # MongoDB User schema
│   └── auth.js                      # NextAuth configuration
├── public/
│   └── images/                      # Static images
├── .env.local.example               # Environment variables template
├── tailwind.config.js               # Tailwind CSS configuration
├── next.config.mjs                  # Next.js configuration
├── jsconfig.json                    # JavaScript configuration
├── package.json                     # Dependencies
└── README.md                        # This file
```

## User Flows

### 1. First-Time User

1. User visits home page
2. Clicks "Get Started"
3. Redirected to login page
4. Signs in with Google
5. Redirected to profile setup page
6. Fills in personal details and emergency contact information
7. Redirected to dashboard

### 2. Returning User

1. User visits home page
2. Clicks "Sign In"
3. Signs in with Google
4. Redirected to dashboard (if profile complete) or profile setup

### 3. Message Analysis

1. User navigates to dashboard
2. Pastes a suspicious message
3. Clicks "Analyze Message"
4. System analyzes:
   - Message content (ML model - to be implemented)
   - Extracted links (using VirusTotal - to be implemented)
5. Displays risk level:
   - ✓ **Safe**: Message safe + Links safe
   - ⚠️ **Likely Scam**: Mixed results (one safe, one unsafe)
   - 🚫 **Scam**: Message unsafe + Links unsafe
6. If risky, user can alert emergency contact via WhatsApp or call

## Risk Assessment Logic

| Message | Links  | Result         | Action                  |
| ------- | ------ | -------------- | ----------------------- |
| Safe    | Safe   | ✓ Safe         | No action needed        |
| Safe    | Unsafe | ⚠️ Likely Scam | Alert emergency contact |
| Unsafe  | Safe   | ⚠️ Likely Scam | Alert emergency contact |
| Unsafe  | Unsafe | 🚫 Scam        | Alert emergency contact |

## API Endpoints

### Authentication

- `GET /api/auth/signin` - Sign in page
- `GET /api/auth/callback/google` - Google OAuth callback
- `GET /api/auth/signout` - Sign out

### User Profile

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## Future Enhancements

### Backend Implementation

- [ ] Integrate ML model for message analysis
- [ ] Implement VirusTotal API for link scanning
- [ ] Create API endpoints for message analysis
- [ ] Set up message history/logs
- [ ] Email/SMS alerts for emergency contacts

### Features

- [ ] Message history and analytics
- [ ] Pattern recognition for common scams
- [ ] Community reporting system
- [ ] WhatsApp bot integration
- [ ] SMS support for non-smartphone users
- [ ] Dark mode support
- [ ] Offline functionality

### Security

- [ ] Rate limiting on API endpoints
- [ ] Input validation and sanitization
- [ ] CSRF protection
- [ ] Data encryption at rest
- [ ] Two-factor authentication (optional)

## Styling & Color Palette

The application uses a light, accessible color scheme:

- **Primary Green**: `#10b981` (Emerald-500)
- **Secondary Green**: `#86efac` (Emerald-300)
- **Accent Teal**: `#14b8a6` (Teal-500)
- **Light Background**: `#f0f9f6` (Emerald-50)
- **Text**: `#1f2937` (Gray-800)

All colors meet WCAG accessibility standards for contrast ratios.

## Accessibility Considerations

- Large default font size (16px base)
- Adjustable font sizes
- High contrast colors
- Clear focus indicators
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Google Translate integration for multiple languages

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup for Production

- Set secure `AUTH_SECRET` (minimum 32 characters)
- Update MongoDB connection string
- Configure Google OAuth for production domain
- Enable HTTPS
- Set up proper CORS policies

## Support & Contact

For issues, bugs, or feature requests, please contact:

- Email: support@elderguard.com
- Phone: +91 999-999-9999

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Contributors

- Development Team
- UX/UI Design Team
- Senior User Testing Group

## Disclaimer

This application is designed to provide assistance in identifying potential scams. It is not a substitute for professional security advice. Always verify suspicious messages with trusted family members or authorities before taking action.

---

**ElderGuard: Protecting Our Seniors Online** 🛡️💚This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
