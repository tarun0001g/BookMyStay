# BookMyStay

A modern full-stack property listing and accommodation management platform built with Node.js, Express.js, MongoDB, and EJS.

BookMyStay allows users to explore property listings, manage favorites, upload property images, create accounts, and securely access personalized features. The project demonstrates the complete lifecycle of building a production-style web application, including backend architecture, database integration, authentication, authorization, session management, file handling, and responsive UI development.

---

## Features

### User Features

* Browse available properties
* View detailed property information
* Add properties to favorites
* User registration and login
* Secure session-based authentication
* Personalized user experience

### Admin Features

* Add new properties
* Edit existing property details
* Delete property listings
* Upload and manage property images
* Manage platform content

### Security Features

* Password hashing using bcrypt
* Input validation and sanitization
* Session-based authentication
* Role-based authorization
* Protected routes
* File type and size validation

### File Management

* Property image uploads
* Secure file storage
* File download support
* Automatic file validation

---

## Tech Stack

### Backend

* Node.js
* Express.js
* Mongoose
* Multer
* bcryptjs
* express-session
* connect-mongodb-session
* express-validator

### Database

* MongoDB
* MongoDB Atlas
* MySQL (database learning and integration practice)

### Frontend

* EJS
* Tailwind CSS
* HTML5
* CSS3

### Development Tools

* NPM
* Nodemon
* VS Code
* PostCSS
* Autoprefixer
* Concurrently

---

## Project Architecture

The application follows the MVC (Model-View-Controller) architecture pattern.

```text
BookMyStay
│
├── controllers
├── models
├── routes
├── views
│   ├── partials
│   └── pages
├── public
│   ├── css
│   ├── images
│   └── js
├── uploads
├── middleware
├── utility
└── app.js
```

### MVC Structure

**Models**

* Database interaction
* Schema definitions
* Business logic

**Views**

* EJS templates
* Dynamic rendering
* Reusable partials

**Controllers**

* Request handling
* Validation
* Response management

**Routes**

* Application endpoints
* Route organization
* Middleware integration

---

## Key Concepts Implemented

### Backend Development

* RESTful Routing
* Middleware Architecture
* Request & Response Lifecycle
* Error Handling
* Async/Await
* Modular Code Organization

### Database Management

* CRUD Operations
* Schema Design
* Data Relationships
* Database Persistence
* Query Optimization

### Authentication & Authorization

* User Registration
* Login & Logout
* Password Encryption
* Session Management
* Access Control

### File Handling

* Image Uploads
* File Validation
* Storage Management
* Download Functionality

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/bookmystay.git
```

### Navigate to Project

```bash
cd bookmystay
```

### Install Dependencies

```bash
npm install
```

### Create Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
```

### Run Development Server

```bash
npm run dev
```

### Start Application

```bash
npm start
```

---

## Future Enhancements

The following features are planned for future releases:

* Booking System
* Property Reviews & Ratings
* Advanced Search Functionality
* Filter-Based Property Discovery
* User Profile Management
* JWT Authentication
* Email Verification
* Admin Dashboard Analytics
* Booking History
* Payment Gateway Integration
* Cloud Image Storage
* Responsive User Dashboard

---

## Learning Outcomes

Through the development of BookMyStay, the following areas were explored and implemented:

* Full-Stack Web Development
* Backend Application Development
* MVC Architecture
* Database Design
* Authentication & Authorization
* Session Management
* File Upload Handling
* Secure Coding Practices
* Server-Side Rendering
* RESTful Application Design
* Production-Oriented Project Structure

---

## Project Status

🚀 Active Development

New features and improvements are continuously being added to enhance functionality, scalability, security, and user experience.
