# Fitness Social Platform

A full-stack fitness social media platform designed to help users share fitness activities, track workouts, create workout and meal plans, and interact with other users.

## 🚀 Project Overview

Fitness Social Platform is a social fitness application where users can:

* Create and manage fitness posts
* Upload photos and videos
* Follow and unfollow other users
* Like and comment on posts
* View a personalized feed
* Track workout status
* Create workout plans
* Create meal plans
* Receive notifications for social activities

## 🛠️ Technologies

### Backend

* Java 21
* Spring Boot 4
* Spring Security
* JWT Authentication
* Spring Data JPA
* Hibernate
* PostgreSQL
* Lombok
* Maven
* Apache Tika

### Frontend

Frontend development is planned as part of this project.

## ✨ Features

### Authentication

* User registration
* User login
* JWT-based authentication
* Password encryption using BCrypt

### User Management

* View user profiles
* View own profile
* Follow / unfollow users
* Followers and following lists
* Followers and following counts

### Posts

* Create posts
* Update posts
* Delete posts
* View posts
* Support for different post types

### Media

* Upload images
* Upload videos
* Maximum 3 media files per post
* Maximum file size of 50 MB

### Social Features

* Like / unlike posts
* Comment on posts
* Update and delete comments
* Comment and like counts

### Fitness Features

* Workout status tracking
* Workout plans
* Meal plans

### Feed

* Personalized feed based on followed users

### Notifications

* Follow notifications
* Like notifications
* Comment notifications
* Unread notification count
* Mark notifications as read
* Delete notifications

## 📁 Project Structure

```text
fitness-social-platform/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/fitness/fitness_api/
│   │       │       ├── config/
│   │       │       ├── controller/
│   │       │       ├── dto/
│   │       │       ├── entity/
│   │       │       ├── exception/
│   │       │       ├── repository/
│   │       │       ├── security/
│   │       │       └── service/
│   │       │
│   │       └── resources/
│   │
│   ├── pom.xml
│   └── ...
│
└── README.md
```

## 🔐 Security

The backend uses:

* Spring Security
* JWT authentication
* BCrypt password hashing
* Protected API endpoints
* Authentication-based ownership validation

Sensitive configuration values such as database credentials and JWT secrets should be provided through environment variables.

## ⚙️ Backend Setup

### Prerequisites

Make sure the following are installed:

* Java 21
* PostgreSQL
* Git

### Database

Create a PostgreSQL database:

```sql
CREATE DATABASE fitness_social_db;
```

### Run Backend

Navigate to the backend folder:

```bash
cd backend
```

Run the application using Maven Wrapper:

**Windows:**

```powershell
.\mvnw.cmd spring-boot:run
```

The API will run on:

```text
http://localhost:8080
```

Health check:

```text
GET /api/health
```

## 🔑 Environment Variables

The application supports environment variables for sensitive configuration:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
JWT_EXPIRATION
UPLOAD_DIR
```

Example:

```text
DB_URL=jdbc:postgresql://localhost:5432/fitness_social_db
DB_USERNAME=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=86400000
UPLOAD_DIR=uploads
```

## 📌 API Modules

```text
/api/auth
/api/users
/api/posts
/api/workout-status
/api/workout-plans
/api/meal-plans
/api/feed
/api/notifications
```

## 🧪 API Testing

The backend APIs were tested using Postman, including:

* Authentication
* User management
* Follow / unfollow
* Posts
* Media uploads
* Comments
* Likes
* Workout status
* Workout plans
* Meal plans
* Feed
* Notifications
* Authentication and authorization
* Validation and error handling

## 🔮 Future Development

* Frontend application
* Improved media validation
* Video duration validation
* Production deployment
* Additional fitness and social features

## 👩‍💻 Author

**Jathursika Linganathan**


