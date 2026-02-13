-- Hostel Management System - Complete Database Schema
-- Target Database: MySQL / TiDB

CREATE DATABASE IF NOT EXISTS `hms`;
USE `hms`;

-- 1. Admin Table
-- Stores login credentials for hostel administrators
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- 2. Students Table
-- Stores student profiles and room assignments
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    year VARCHAR(10),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    address TEXT,
    room_no VARCHAR(20),
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Rooms Table
-- Tracks room availability and capacity
CREATE TABLE IF NOT EXISTS rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    current_occupants INT DEFAULT 0,
    status ENUM('Available', 'Full') DEFAULT 'Available'
);

-- 4. Complaints Table
-- Handles student issues and maintenance requests
CREATE TABLE IF NOT EXISTS complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    category VARCHAR(50),
    description TEXT NOT NULL,
    status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 5. Outpasses Table
-- Manages student leave and return logs
CREATE TABLE IF NOT EXISTS outpasses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    reason TEXT NOT NULL,
    departure_time DATETIME,
    expected_return_time DATETIME,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 6. Fees Table
-- Records payment history for students
CREATE TABLE IF NOT EXISTS fees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    remarks TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 7. Announcements Table
-- Global notices posted by admins
CREATE TABLE IF NOT EXISTS announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Initial Admin Account
-- Username: deepakadmin | Password: admin123
INSERT INTO admins (name, username, email, password) 
VALUES ('Main Admin', 'deepakadmin', 'admin@hostel.com', '$2b$10$2csrTTdx1peU1pYP.u3u/uX22sOCr7KodTFVlOMmgTt6DMJzTiU2y')
ON DUPLICATE KEY UPDATE name='Main Admin';