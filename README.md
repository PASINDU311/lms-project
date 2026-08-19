# 🎓 Learning Management System (LMS)

A modern, full-stack **Learning Management System (LMS)** designed to provide a complete digital learning experience for **Students, Instructors, and Administrators**.

The system enables students to discover and enroll in courses, access lessons and learning resources, complete quizzes and assignments, track their learning progress, and earn certificates. Instructors can create and manage educational content, monitor student performance, and manage assessments, while administrators have complete control over users, courses, and platform activities.

---

## 🚀 Tech Stack

### Frontend

* React.js
* TypeScript
* Tailwind CSS
* React Router
* Axios
* Context API
* React Hook Form
* Recharts

### Backend

* Go (Golang)
* Gin Web Framework
* GORM
* RESTful API
* JWT Authentication
* bcrypt Password Hashing

### Database

* MySQL
* MySQL Workbench

### Development Tools

* Git & GitHub
* VS Code
* Postman

---

## 🏗️ System Architecture

```text
┌─────────────────────────────┐
│        React Frontend       │
│     TypeScript + Tailwind   │
└──────────────┬──────────────┘
               │
               │ REST API / JSON
               ▼
┌─────────────────────────────┐
│          Go Backend         │
│       Gin + GORM            │
│                             │
│ Authentication              │
│ Authorization               │
│ Course Management            │
│ Enrollment                  │
│ Lessons                     │
│ Quizzes                     │
│ Assignments                 │
│ Progress Tracking            │
│ Reviews                     │
│ Notifications               │
└──────────────┬──────────────┘
               │
               │ SQL
               ▼
┌─────────────────────────────┐
│        MySQL Database        │
│       MySQL Workbench        │
└─────────────────────────────┘
```

---

## ✨ Key Features

### 👨‍🎓 Student Features

* User registration and login
* Secure JWT authentication
* Browse and search courses
* Filter courses by category and level
* View detailed course information
* Enroll in courses
* Access course lessons
* Watch learning videos
* Download course resources
* Track lesson completion
* Monitor overall course progress
* Take quizzes
* View quiz results
* Submit assignments
* View assignment grades and feedback
* Rate and review courses
* Receive notifications
* View learning statistics
* Earn course certificates
* Manage personal profile

---

### 👨‍🏫 Instructor Features

* Instructor authentication
* Instructor dashboard
* Create and manage courses
* Add course categories
* Create course modules
* Create and manage lessons
* Upload learning resources
* Add video lessons
* Create quizzes
* Manage quiz questions
* Create assignments
* Review student submissions
* Grade assignments
* Monitor enrolled students
* Track student progress
* View course performance
* Monitor course reviews and ratings

---

### 👨‍💼 Admin Features

* Admin dashboard
* User management
* Student management
* Instructor management
* Course management
* Course approval and rejection
* Category management
* Enrollment monitoring
* Review moderation
* Assignment and quiz management
* Platform statistics
* System analytics
* User status management
* Administrative controls

---

## 🔐 Authentication & Authorization

The system implements secure authentication and role-based authorization.

### Authentication Flow

```text
User
 │
 ├── Register
 │      ↓
 │   Password Hashing
 │      ↓
 │   MySQL
 │
 └── Login
        ↓
   Verify Credentials
        ↓
     Generate JWT
        ↓
   Return Access Token
        ↓
   Protected Routes
```

### User Roles

| Role       | Access                                           |
| ---------- | ------------------------------------------------ |
| Student    | Learning, Courses, Quizzes, Assignments, Reviews |
| Instructor | Course and Learning Content Management           |
| Admin      | Full System Management                           |

Role-based middleware prevents unauthorized users from accessing restricted resources.

---

## 📚 Course Management

The LMS provides a structured course hierarchy:

```text
Course
│
├── Module 01
│   ├── Lesson 01
│   ├── Lesson 02
│   └── Quiz
│
├── Module 02
│   ├── Lesson 03
│   ├── Lesson 04
│   └── Assignment
│
└── Final Assessment
```

This structure allows instructors to organize educational content into logical learning modules.

---

## 📊 Learning Progress

Student learning progress is tracked at lesson level.

```text
React JS Course

Lesson 01    ✓ Completed
Lesson 02    ✓ Completed
Lesson 03    ✓ Completed
Lesson 04    ○ Not Completed
Lesson 05    ○ Not Completed

Progress: 60%
```

The system automatically updates course progress based on completed lessons.

---

## 🧠 Quiz System

Instructors can create quizzes containing multiple questions and answers.

### Quiz Workflow

```text
Instructor Creates Quiz
        ↓
Adds Questions
        ↓
Student Opens Quiz
        ↓
Student Submits Answers
        ↓
Backend Evaluates Answers
        ↓
Score Calculated
        ↓
Result Stored in MySQL
        ↓
Student Views Result
```

Example:

```text
Score: 8 / 10
Percentage: 80%
Status: Passed
```

---

## 📝 Assignment Management

The assignment system allows instructors to create assignments and evaluate student submissions.

```text
Instructor
    ↓
Create Assignment
    ↓
Set Description & Deadline
    ↓
Student Views Assignment
    ↓
Student Submits Work
    ↓
Instructor Reviews Submission
    ↓
Grade + Feedback
    ↓
Student Views Result
```

---

## ⭐ Reviews & Ratings

Students can provide feedback after enrolling in courses.

Features include:

* 1–5 star ratings
* Written reviews
* Course rating calculation
* Review moderation
* Instructor feedback visibility

---

## 🏆 Certificates

Students who successfully complete courses can receive certificates containing:

* Student name
* Course name
* Completion date
* Certificate ID
* Course information

---

## 📈 Dashboards & Analytics

### Student Dashboard

Provides an overview of:

* Enrolled courses
* Course progress
* Completed courses
* Quiz performance
* Assignment performance
* Certificates
* Recent learning activity

### Instructor Dashboard

Provides:

* Total courses
* Total enrolled students
* Course completion rates
* Average ratings
* Student performance
* Course activity

### Admin Dashboard

Provides:

* Total users
* Total students
* Total instructors
* Total courses
* Total enrollments
* Platform activity
* System statistics

---

## 🗄️ Database Structure

The system uses MySQL as the primary relational database.

Main entities include:

```text
Users
Roles
Categories
Courses
Modules
Lessons
Enrollments
Lesson Progress
Quizzes
Questions
Quiz Attempts
Assignments
Submissions
Reviews
Notifications
Certificates
Course Resources
```

### Main Relationships

```text
Users
 │
 ├───────────────┐
 │               │
 ▼               ▼
Courses      Enrollments
 │               │
 ▼               ▼
Modules       Students
 │
 ▼
Lessons
 │
 ├── Progress
 ├── Resources
 ├── Quizzes
 └── Assignments
```

---

## 🔌 REST API

The Go backend exposes RESTful API endpoints for communication with the React frontend.

### Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
```

### Courses

```text
GET    /api/courses
GET    /api/courses/:id
POST   /api/courses
PUT    /api/courses/:id
DELETE /api/courses/:id
```

### Enrollments

```text
POST   /api/enrollments
GET    /api/enrollments/my-courses
```

### Lessons

```text
GET    /api/lessons/:id
POST   /api/lessons/:id/complete
```

### Quizzes

```text
POST   /api/quizzes
GET    /api/quizzes/:id
POST   /api/quizzes/:id/submit
```

### Assignments

```text
POST   /api/assignments
POST   /api/assignments/:id/submit
```

### Reviews

```text
POST   /api/reviews
GET    /api/courses/:id/reviews
```

> API endpoints may vary depending on the final backend implementation.

---

## 📁 Project Structure

```text
LMS/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── routes/
│   │   └── types/
│   │
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── cmd/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── repositories/
│   ├── services/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── go.mod
│   └── main.go
│
├── database/
│   └── lms.sql
│
├── screenshots/
│   ├── home.png
│   ├── courses.png
│   ├── student-dashboard.png
│   ├── learning.png
│   ├── instructor-dashboard.png
│   └── admin-dashboard.png
│
├── .gitignore
└── README.md
```

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

cd LMS
```

---

## 2. Database Setup

Make sure MySQL is installed and running.

Open MySQL Workbench and create the database:

```sql
CREATE DATABASE lms_db;
```

Then import the provided SQL file:

```text
database/lms.sql
```

Verify that the required tables have been created successfully.

---

## 3. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install Go dependencies:

```bash
go mod tidy
```

Create a `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lms_db

JWT_SECRET=your_secret_key

SERVER_PORT=8080
```

Start the Go server:

```bash
go run .
```

The backend will run on:

```text
http://localhost:8080
```

---

## 4. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will usually be available at:

```text
http://localhost:5173
```

---

# 🔑 Environment Variables

Never commit sensitive credentials to GitHub.

Example:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=********
DB_NAME=lms_db
JWT_SECRET=********
SERVER_PORT=8080
```

Make sure `.env` is included in `.gitignore`.

---

# 🔄 Application Workflow

```text
                    LMS
                     │
       ┌─────────────┼─────────────┐
       │             │             │
    Student      Instructor       Admin
       │             │             │
       ▼             ▼             ▼
    Browse        Dashboard      Dashboard
       │             │             │
       ▼             ▼             ▼
    Enroll        Create Course   Manage Users
       │             │             │
       ▼             ▼             ▼
    Learning      Add Lessons     Manage Courses
       │             │             │
       ▼             ▼             ▼
   Progress       Quiz/Assignment  Approvals
       │             │             │
       ▼             ▼             ▼
     Quiz         Analytics       Reports
       │
       ▼
    Certificate
```

---

# 🛡️ Security

The application follows common security practices including:

* JWT-based authentication
* bcrypt password hashing
* Role-based authorization
* Protected API endpoints
* Input validation
* CORS configuration
* Environment-based configuration
* Secure database access through GORM
* Restricted administrative operations

---

# 📸 Screenshots

> Add your actual project screenshots to the `screenshots` directory and update the paths below.

### 🏠 Home Page

![Home Page](screenshots/home.png)

### 📚 Courses

![Courses](screenshots/courses.png)

### 🎓 Student Dashboard

![Student Dashboard](screenshots/student-dashboard.png)

### ▶️ Learning Page

![Learning Page](screenshots/learning.png)

### 👨‍🏫 Instructor Dashboard

![Instructor Dashboard](screenshots/instructor-dashboard.png)

### 👨‍💼 Admin Dashboard

![Admin Dashboard](screenshots/admin-dashboard.png)

email - admin@gmail.com
password - 123456

---

# 🚀 Future Improvements

Potential future enhancements include:

* AI-powered learning assistant
* Personalized course recommendations
* AI-generated quizzes
* Real-time chat and notifications
* Learning streaks and gamification
* XP and achievement system
* Course discussion forums
* Advanced learning analytics
* Email notifications
* Two-factor authentication
* Payment gateway integration
* Multi-language support
* Progressive Web App (PWA) support

---

# 🎯 Project Goals

The main goals of this project are to:

* Build a complete full-stack LMS
* Implement scalable REST API architecture
* Apply role-based access control
* Practice relational database design
* Implement real-world authentication and authorization
* Create an interactive learning experience
* Develop dashboards for different user roles
* Demonstrate modern full-stack development practices

---

# 👨‍💻 Author

**Pasindu Gimhan**

Software Engineering / Information Technology Undergraduate

* GitHub: [PASINDU311](https://github.com/PASINDU311)
* Portfolio: [Portfolio Website](https://portfolio-website-six-snowy-44.vercel.app/)

---

# 📄 License

This project is developed for educational and portfolio purposes.

---

## ⭐ If you find this project useful

Feel free to star ⭐ the repository and explore the source code.
