# Admin Dashboard - Restaurant Management System

## Overview
This admin dashboard provides comprehensive management tools for the restaurant application, allowing administrators to manage products, track orders, and monitor business operations.

## Features

### 🔐 Admin Authentication
- Secure admin login with demo credentials
- Session-based authentication with localStorage
- Protected admin routes

**Demo Credentials:**
- Email: `admin@restaurant.com`
- Password: `admin123`

### 📊 Dashboard Overview
- Business statistics and metrics
- Recent orders summary
- Quick access to all admin functions
- Visual data representation

### 🍔 Product Management
- **Add New Products**: Create new menu items with images, descriptions, pricing, and categories
- **Product List**: View all products in a searchable, filterable table
- **Edit Products**: Modify existing product details inline
- **Delete Products**: Remove products from the menu
- **Category Filtering**: Filter products by category (Salad, Rolls, Deserts, etc.)
- **Search Functionality**: Search products by name or description

### 📦 Order Management
- **Order Overview**: View all customer orders in a comprehensive table
- **Order Details**: Detailed view of individual orders including customer info and items
- **Status Updates**: Change order status (Pending → Processing → Ready → Delivered)
- **Order Filtering**: Filter orders by status
- **Search Orders**: Search by customer name, email, or order ID
- **Customer Information**: View complete customer details and delivery addresses

## Access Points

### 1. Direct URL
- Navigate to `/admin/login` to access the admin portal

### 2. Header Link
- Click the "Admin" button in the main application header

## Technical Implementation

### Components Structure
```
src/components/admin/
├── AdminLogin.tsx          # Authentication component
├── AdminDashboard.tsx      # Main dashboard layout with navigation
├── DashboardOverview.tsx   # Statistics and overview
├── AddProduct.tsx          # Product creation form
├── ProductList.tsx         # Product management table
└── OrderManagement.tsx     # Order tracking and management
```

### Routes
```
/admin/login                # Admin authentication
/admin/dashboard           # Dashboard overview (default)
/admin/add-product         # Add new products
/admin/products           # Manage existing products
/admin/orders             # Order management
```

### Data Storage
- **Demo Mode**: Uses localStorage for data persistence
- **Products**: Combines default food items with newly added products
- **Orders**: Mock order data with full CRUD operations
- **Admin Session**: Token-based session management

## Features in Detail

### Product Addition
- Image upload with preview
- Form validation
- Category selection from predefined menu categories
- Price formatting and validation
- Success/error notifications

### Order Management
- Real-time status updates
- Detailed order information modals
- Customer contact information
- Order item breakdown with pricing
- Estimated delivery tracking

### User Experience
- Responsive design for all screen sizes
- Intuitive navigation with active state indicators
- Loading states and error handling
- Toast notifications for user feedback
- Consistent styling with the main application

## Future Enhancements
- Integration with backend API
- Real-time order notifications
- Advanced analytics and reporting
- Bulk operations for products
- Customer management features
- Inventory tracking
- Sales reporting and analytics

## Usage Instructions

1. **Login**: Use the demo credentials to access the admin panel
2. **Dashboard**: Get an overview of your restaurant's performance
3. **Add Products**: Create new menu items with all necessary details
4. **Manage Products**: Edit, delete, or search existing products
5. **Handle Orders**: View, update, and track customer orders
6. **Logout**: Securely end your admin session

The admin dashboard is designed to be intuitive and efficient, providing restaurant owners and managers with all the tools needed to effectively manage their business operations.