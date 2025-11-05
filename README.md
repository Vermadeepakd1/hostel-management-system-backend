# Hostel Management System - Backend 🏨

A robust and secure REST API for a comprehensive Hostel Management System, built with Node.js, Express, and MySQL. This backend provides all the necessary functionalities for both administrators and students to manage hostel operations efficiently.

## ✨ Features

* **Admin Dashboard**: Full CRUD (Create, Read, Update, Delete) operations for managing students and rooms, including new safety checks for updates and deletions.
* **Student Portal**: Secure endpoints for students to view their profile, check fee history, and manage requests.
* **Secure Onboarding**: Generates a random, secure password for new students and sends credentials via email using **Brevo (Sendinblue)**. All passwords are hashed using **bcrypt**.
* **Transactional Integrity**: Uses database transactions to safely add students (individually or in bulk) and update room occupancy, preventing data inconsistency.
* **Out Pass System**: Full workflow for students to request out passes and for admins to approve or reject them.
* **Announcement System**: An API for admins to create and post announcements and for students to view them.
* **CSV Bulk Upload**: Admin-only endpoints to bulk-upload new students and rooms from a CSV file, featuring full transactional validation to ensure data integrity.

---

## 🛠️ Tech Stack

* **Backend**: Node.js, Express.js
* **Database**: MySQL
* **Authentication**: JSON Web Tokens (JWT), bcrypt
* **Email Service**: Brevo (formerly Sendinblue)
* **Libraries**: `mysql2`, `jsonwebtoken`, `bcrypt`, `cors`, `dotenv`, `cookie-parser`, `multer`, `csv-parser`, `@getbrevo/brevo`

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### **Prerequisites**

* Node.js (v14 or higher)
* MySQL Server

### **Installation & Setup**

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/Vermadeepakd1/hostel-management-system-backend.git](https://github.com/Vermadeepakd1/hostel-management-system-backend.git)
    cd hostel-management-system-backend
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Create a `.env` file** in the root directory and add the following environment variables.
    * **Note:** You must set up a **Brevo** account, get an API key, and verify a sender email for the email service to work.

    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=hostel_system
    DB_PORT=3306
    JWT_SECRET=your_super_secret_jwt_key
    
    BREVO_API_KEY=your_brevo_api_key
    SENDER_EMAIL=your_verified_sender_email@example.com
    ```

4.  **Set up the database:**
    * Create a new MySQL database named `hostel_system`.
    * Run the SQL queries to create all the necessary tables (`admins`, `students`, `rooms`, `fees`, `complaints`, `outpasses`, `announcements`).

5.  **Start the server:**
    ```sh
    npm start
    ```
    The server will start running at `http://localhost:5000`.

---

## 🔑 API Endpoint Documentation

The base URL for all endpoints is `/`. All routes are protected by the `verifyToken` middleware unless specified otherwise.

### **Admin Routes** 👨‍💼
*(Requires admin authentication token)*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/admin/login` | Logs in an administrator. **(Public)** |
| `POST` | `/students/add` | Adds a new student and sends a welcome email. |
| `GET` | `/students` | Gets a list of all students. |
| `PUT` | `/students/update/:id` | Updates a specific student. |
| `DELETE`| `/students/delete/:id` | Deletes a specific student. |
| `POST` | `/students/upload` | Bulk-adds students from a CSV file (transactional). |
| `POST` | `/rooms/add` | Adds a new room. |
| `GET` | `/rooms` | Gets a list of all rooms. |
| `PUT` | `/rooms/update/:id` | Updates a room's capacity (with safety checks). |
| `DELETE`| `/rooms/delete/:id` | Deletes an empty room (with safety checks). |
| `POST` | `/rooms/upload` | Bulk-adds rooms from a CSV file. |
| `POST` | `/fees/add` | Records a fee payment for a student. |
| `GET` | `/fees/student/:id` | Gets fee history for a specific student. |
| `GET` | `/complaints` | Gets all complaints from all students. |
| `PUT` | `/complaints/update/:id`| Updates a complaint's status. |
| `GET` | `/outpasses` | Gets all out pass requests from all students. |
| `PUT` | `/outpasses/update/:id` | Approves or rejects an out pass request. |
| `POST` | `/announcements/add` | Creates a new announcement. |

### **Student Routes** 🧑‍🎓
*(Requires student authentication token)*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/student/login` | Logs in a student. **(Public)** |
| `POST` | `/auth/student/change-password` | Allows a logged-in student to change their password. |
| `GET` | `/student/profile` | Gets the logged-in student's profile. |
| `GET` | `/student/fees` | Gets the logged-in student's fee history. |
| `POST` | `/student/complaint` | Submits a new complaint. |
| `GET` | `/student/complaint` | Gets the logged-in student's complaints. |
| `POST` | `/student/outpass` | Submits a new out pass request. |
| `GET` | `/student/outpass` | Gets the logged-in student's out pass history. |

### **Shared Routes** 📢
*(Requires any valid token - Admin or Student)*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/announcements` | Gets a list of all announcements. |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the [issues page](https://github.com/Vermadeepakd1/hostel-management-system-backend/issues) if you want to contribute.

---

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for details.