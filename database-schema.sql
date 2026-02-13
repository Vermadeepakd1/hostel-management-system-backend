-- Hostel Management System - DEFINITIVE Master Schema
CREATE DATABASE IF NOT EXISTS `hms`;
USE `hms`;

CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    year VARCHAR(10),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    gender VARCHAR(10), -- Added
    dob DATE,           -- Added
    address TEXT,
    room_no VARCHAR(20),
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    current_occupancy INT DEFAULT 0, -- Matched to backend code
    status ENUM('Available', 'Full') DEFAULT 'Available'
);

CREATE TABLE IF NOT EXISTS complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    category VARCHAR(50),
    description TEXT NOT NULL,
    status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

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

-- Initial Admin (admin123)
INSERT INTO admins (name, username, email, password) 
VALUES ('Main Admin', 'deepakadmin', 'admin@hostel.com', '$2b$10$2csrTTdx1peU1pYP.u3u/uX22sOCr7KodTFVlOMmgTt6DMJzTiU2y')
ON DUPLICATE KEY UPDATE name='Main Admin';