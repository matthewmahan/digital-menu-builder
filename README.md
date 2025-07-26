# 🍽️ Digital Menu Builder

A modern, full-stack application for creating beautiful digital menus with QR code generation. Perfect for restaurants, cafes, and food businesses looking to digitize their menu experience.

## ✨ Features

- **User Authentication**: Secure login/register system with JWT tokens
- **Company Management**: Create and manage your business profile
- **Menu Item Management**: Add, edit, and delete menu items with images
- **QR Code Generation**: Automatically generate QR codes for your digital menu
- **Public Menu View**: Shareable menu links for customers
- **Responsive Design**: Mobile-first design that works on all devices
- **Subscription Tiers**: Free and Pro plans with different feature sets

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications
- **QRCode.react** - QR code generation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** - Lightweight database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **QRCode** - Server-side QR code generation

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd digital-menu-builder
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` file with your configuration (JWT_SECRET is required).

4. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start both the backend server (port 5000) and frontend development server (port 3000).

## 📁 Project Structure

```
digital-menu-builder/
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/
│       ├── components/    # Reusable components
│       ├── hooks/         # Custom React hooks
│       ├── pages/         # Page components
│       ├── services/      # API services
│       └── types/         # TypeScript types
├── server/                # Express backend
│   ├── database/          # Database initialization
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   └── uploads/           # File uploads
└── database/              # Database files
```

## 🔐 Authentication Flow

1. **Registration**: Users create an account with email and password
2. **First Login**: New users are guided through onboarding
3. **Company Setup**: Create company profile and first menu item
4. **QR Generation**: Generate QR code and menu link
5. **Dashboard Access**: Full access to menu management

## 🍽️ Menu Management

### Adding Menu Items
1. Navigate to Dashboard
2. Click "Add Menu Item"
3. Fill in name, price, and optional description
4. Upload an image (optional)
5. Save the item

### Editing Menu Items
1. Click "Edit" on any menu item
2. Modify the details
3. Save changes

### Deleting Menu Items
1. Click "Delete" on any menu item
2. Confirm deletion

## 🔗 Menu Sharing

### QR Code
- Automatically generated during onboarding
- Downloadable from dashboard
- Customers can scan to view menu

### Direct Link
- Shareable URL format: `/menu/{companyId}`
- Works on any device
- No app installation required

## 💳 Subscription Tiers

### Free Plan
- Up to 10 menu items
- Basic QR code generation
- Standard support

### Pro Plan ($9/month)
- Unlimited menu items
- Advanced analytics
- Custom themes
- Priority support

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Companies
- `POST /api/companies` - Create company
- `GET /api/companies/:id` - Get company details
- `PUT /api/companies/:id` - Update company
- `POST /api/companies/:id/logo` - Upload logo
- `POST /api/companies/:id/qr-code` - Generate QR code

### Menu Items
- `GET /api/menu-items` - Get menu items
- `POST /api/menu-items` - Create menu item
- `PUT /api/menu-items/:id` - Update menu item
- `DELETE /api/menu-items/:id` - Delete menu item
- `POST /api/menu-items/:id/image` - Upload item image

### Public Menu
- `GET /api/menu/:companyId` - Get public company info
- `GET /api/menu/:companyId/items` - Get public menu items

## 🔧 Development

### Running Tests
```bash
# Frontend tests
cd client && npm test

# Backend tests (if implemented)
cd server && npm test
```

### Building for Production
```bash
# Build frontend
cd client && npm run build

# Start production server
cd server && npm start
```

### Database Migrations
```bash
cd server && npm run migrate
```

## 🚀 Deployment

### Environment Variables
Set these in production:
- `NODE_ENV=production`
- `JWT_SECRET` - Strong secret key
- `FRONTEND_URL` - Your domain
- `PORT` - Server port

### Database
- SQLite file is created automatically
- For production, consider using PostgreSQL or MySQL

### File Storage
- Uploads are stored locally in `server/uploads/`
- For production, consider using AWS S3 or similar

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@digitalmenubuilder.com or create an issue in the repository.

---

**Built with ❤️ for food businesses everywhere** 