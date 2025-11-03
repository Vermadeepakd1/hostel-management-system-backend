// routes/students.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken'); // your JWT middleware
const bcrypt = require('bcrypt');

const multer = require('multer');
const csv = require('csv-parser');
const stream = require('stream');


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//helper function to parse csv
const parseCsv = (buffer) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const readableStream = new stream.PassThrough();
        readableStream.end(buffer);

        readableStream
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};



// Add a new student (UPDATED WITH TRANSACTION LOGIC)
router.post('/add', verifyToken, async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const { name, roll_no, email, phone, gender, dob, address, guardian_name, guardian_phone, room_no, department, year } = req.body;

        // --- Start of Transaction ---
        await connection.beginTransaction();

        // Step 1: Hash the initial password (which is the roll_no)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(roll_no, salt);

        // Room availability checks (as you had before)
        const [rooms] = await connection.query('SELECT * FROM rooms WHERE room_number = ?', [room_no]);
        if (rooms.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: 'Room not found' });
        }
        const room = rooms[0];
        if (room.current_occupancy >= room.capacity) {
            await connection.rollback();
            connection.release();
            return res.status(409).json({ message: 'Room is already full' });
        }

        // Step 2: Insert the new student with the corrected SQL
        await connection.query(
            `INSERT INTO students 
                (name, roll_no, email, phone, gender, dob, address, guardian_name, guardian_phone, room_no, department, year, password)
             VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, roll_no, email, phone, gender, dob, address, guardian_name, guardian_phone, room_no, department, year, hashedPassword]
        );

        // Step 3: Update the room's occupancy
        await connection.query(
            'UPDATE rooms SET current_occupancy = current_occupancy + 1 WHERE id = ?',
            [room.id]
        );

        await connection.commit();
        // --- End of Transaction ---

        res.status(201).json({ message: 'Student added successfully' });

    } catch (err) {
        await connection.rollback();
        console.error('Error adding student with transaction:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        if (connection) connection.release();
    }
});


// Get all students
router.get('/', verifyToken, async (req, res) => {
    try {
        const [students] = await db.promise().query('SELECT id, name, roll_no, department, year, room_no FROM students ORDER BY name');
        res.status(200).json(students);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// routes/students.js


// Update a student's details (UPDATED WITH TRANSACTION LOGIC)
router.put('/update/:id', verifyToken, async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const { id } = req.params;
        const { room_no: new_room_no, ...studentDetails } = req.body;

        await connection.beginTransaction();

        // 1. Get the student's current (old) room number
        const [students] = await connection.query('SELECT room_no FROM students WHERE id = ?', [id]);
        if (students.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: 'Student not found' });
        }
        const old_room_no = students[0].room_no;

        // 2. If the room is being changed, handle occupancy updates
        if (new_room_no && old_room_no !== new_room_no) {
            // Check if the new room is available
            const [new_rooms] = await connection.query('SELECT * FROM rooms WHERE room_number = ?', [new_room_no]);
            if (new_rooms.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).json({ message: 'New room not found' });
            }
            if (new_rooms[0].current_occupancy >= new_rooms[0].capacity) {
                await connection.rollback();
                connection.release();
                return res.status(409).json({ message: 'New room is full' });
            }

            // Decrement old room's occupancy (if they had one)
            if (old_room_no) {
                await connection.query('UPDATE rooms SET current_occupancy = current_occupancy - 1 WHERE room_number = ?', [old_room_no]);
            }
            // Increment new room's occupancy
            await connection.query('UPDATE rooms SET current_occupancy = current_occupancy + 1 WHERE room_number = ?', [new_room_no]);
        }

        // 3. Update the student's details
        const finalStudentData = { ...studentDetails, room_no: new_room_no };
        await connection.query('UPDATE students SET ? WHERE id = ?', [finalStudentData, id]);

        await connection.commit();
        res.status(200).json({ message: 'Student details updated successfully' });

    } catch (err) {
        await connection.rollback();
        console.error('Error updating student:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        if (connection) connection.release();
    }
});


// Delete a student (UPDATED WITH TRANSACTION LOGIC)
router.delete('/delete/:id', verifyToken, async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        const { id } = req.params;

        await connection.beginTransaction();

        // 1. Find the student to get their room number before deleting
        const [students] = await connection.query('SELECT room_no FROM students WHERE id = ?', [id]);
        if (students.length === 0) {
            // No student found, but no harm done. We can just end.
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: 'Student not found' });
        }
        const { room_no } = students[0];

        // 2. Delete the student
        await connection.query('DELETE FROM students WHERE id = ?', [id]);

        // 3. If they had a room, decrement the room's occupancy
        if (room_no) {
            await connection.query(
                'UPDATE rooms SET current_occupancy = current_occupancy - 1 WHERE room_number = ? AND current_occupancy > 0',
                [room_no]
            );
        }

        await connection.commit();
        res.status(200).json({ message: 'Student deleted successfully' });

    } catch (err) {
        await connection.rollback();
        console.error('Error deleting student:', err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        if (connection) connection.release();
    }
});


// routes/students.js

// ... (keep all your requires, multer setup, and parseCsv function) ...

// @route   POST /students/upload
// @desc    Add students in bulk from a CSV file (TRANSACTIONAL)
// @access  Admin (implicit)
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const connection = await db.promise().getConnection();
    let addedCount = 0;

    try {
        // 1. Parse the CSV buffer
        const students = await parseCsv(req.file.buffer);

        if (students.length === 0) {
            return res.status(400).json({ message: 'CSV file is empty or invalid.' });
        }

        // 2. Start a single large transaction
        await connection.beginTransaction();

        // 3. Keep track of room occupancy changes within this batch
        const roomOccupancyUpdates = {};

        // 4. Loop through each student and validate them one by one
        for (const [index, student] of students.entries()) {

            // Check for required fields in CSV
            if (!student.name || !student.roll_no || !student.email || !student.room_no) {
                throw new Error(`Row ${index + 2}: Missing required data (name, roll_no, email, or room_no).`);
            }

            // --- Check Room Availability ---
            const [roomRows] = await connection.query(
                'SELECT capacity, current_occupancy FROM rooms WHERE room_number = ?',
                [student.room_no]
            );

            if (roomRows.length === 0) {
                throw new Error(`Row ${index + 2}: Room "${student.room_no}" does not exist.`);
            }

            const room = roomRows[0];

            // Check capacity, considering pending updates from this same batch
            const pendingOccupancy = roomOccupancyUpdates[student.room_no] || 0;
            if ((room.current_occupancy + pendingOccupancy) >= room.capacity) {
                throw new Error(`Row ${index + 2}: Room "${student.room_no}" is full.`);
            }

            // --- Hash Password ---
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(student.roll_no, salt);

            // --- Insert Student (with error check for duplicate roll_no/email) ---
            try {
                await connection.query(
                    `INSERT INTO students 
                    (name, roll_no, email, phone, gender, dob, address, guardian_name, guardian_phone, room_no, department, year, password) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        student.name, student.roll_no, student.email, student.phone,
                        student.gender, student.dob, student.address, student.guardian_name,
                        student.guardian_phone, student.room_no, student.department,
                        student.year, hashedPassword
                    ]
                );

                // If insert is successful, track the occupancy update
                roomOccupancyUpdates[student.room_no] = (pendingOccupancy + 1);
                addedCount++;

            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    throw new Error(`Row ${index + 2}: Duplicate entry for roll_no or email: "${student.roll_no} / ${student.email}".`);
                }
                throw err;
            }
        }

        // 5. If all students are processed, apply the occupancy updates
        for (const roomNumber in roomOccupancyUpdates) {
            await connection.query(
                'UPDATE rooms SET current_occupancy = current_occupancy + ? WHERE room_number = ?',
                [roomOccupancyUpdates[roomNumber], roomNumber]
            );
        }

        // 6. If everything is perfect, commit the transaction
        await connection.commit();

        res.status(201).json({
            message: `Successfully added ${addedCount} new students.`,
        });

    } catch (err) {
        // 7. If any error occurred, roll back the entire batch
        await connection.rollback();
        console.error('CSV Upload Transaction Error:', err.message);
        res.status(400).json({
            message: 'Upload failed. The entire batch was rolled back.',
            error: err.message
        });
    } finally {
        // 8. Always release the connection
        if (connection) connection.release();
    }
});




module.exports = router;