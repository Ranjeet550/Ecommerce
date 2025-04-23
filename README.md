# FreshMart - Grocery E-commerce Website

A full-stack e-commerce website for a grocery store built with React.js, Node.js, Express, and MySQL.

## Features

- User authentication (register, login, profile management)
- Product browsing with filtering and sorting
- Shopping cart functionality
- Checkout process
- Order management
- Wishlist
- Responsive design for all devices

## Tech Stack

### Frontend
- React.js with Vite
- React Router for navigation
- Tailwind CSS for styling
- React Icons
- Axios for API requests
- React Hot Toast for notifications

### Backend
- Node.js
- Express.js
- MySQL for database
- JWT for authentication
- Bcrypt for password hashing

## Project Structure

```
├── client/                 # Frontend (React + Vite + Tailwind CSS)
│   ├── public/             # Static assets
│   ├── src/                # React source code
│   │   ├── components/     # Reusable components
│   │   │   ├── layout/     # Layout components (Header, Footer)
│   │   │   └── products/   # Product-related components
│   │   ├── pages/          # Page components
│   │   ├── App.jsx         # Main App component
│   │   └── main.jsx        # Entry point
│   ├── index.html          # HTML template
│   ├── package.json        # Frontend dependencies
│   └── tailwind.config.js  # Tailwind CSS configuration
│
└── server/                 # Backend (Node.js + Express + MySQL)
    ├── config/             # Configuration files
    │   └── db.js           # Database connection
    ├── controllers/        # Route controllers
    ├── middleware/         # Custom middleware
    ├── routes/             # API routes
    ├── .env                # Environment variables
    ├── package.json        # Backend dependencies
    └── server.js           # Entry point
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL

### Installation

1. Clone the repository
```
git clone <repository-url>
cd freshmart
```

2. Install backend dependencies
```
cd server
npm install
```

3. Set up environment variables
Create a `.env` file in the server directory with the following variables:
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=grocery_ecommerce
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

4. Set up the database
- Create a MySQL database named `grocery_ecommerce`
- The tables will be automatically created when you start the server

5. Install frontend dependencies
```
cd ../client
npm install
```

### Running the Application

1. Start the backend server
```
cd server
npm run dev
```

2. Start the frontend development server
```
cd client
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/item/:itemId` - Update cart item
- `DELETE /api/cart/item/:itemId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders` - Get all orders (admin)
- `PUT /api/orders/:id/status` - Update order status (admin)

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/wishlist` - Get user's wishlist
- `POST /api/users/wishlist` - Add to wishlist
- `DELETE /api/users/wishlist/:id` - Remove from wishlist

## License

This project is licensed under the MIT License.
