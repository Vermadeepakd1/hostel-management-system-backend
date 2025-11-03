// routes/rooms.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// imports for file handling ---
const multer = require('multer');
const csv = require('csv-parser');
const stream = require('stream');

// --- Set up Multer to store the file in memory ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// helper function to parse the CSV buffer ---
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



// Add a new room
router.post('/add', verifyToken, async (req, res) => {
    try {
        const { room_number, capacity } = req.body;

        if (!room_number || !capacity) {
            return res.status(400).json({ message: 'Room number and capacity are required' });
        }

        // Check if room number already exists
        const [existing] = await db.promise().query('SELECT * FROM rooms WHERE room_number = ?', [room_number]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Room number already exists' });
        }

        await db.promise().query(
            'INSERT INTO rooms (room_number, capacity) VALUES (?, ?)',
            [room_number, capacity]
        );

        res.status(201).json({ message: 'Room added successfully' });

    } catch (err) {
        console.error('Error adding room:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all rooms
router.get('/', verifyToken, async (req, res) => {
    try {
        const [rooms] = await db.promise().query('SELECT * FROM rooms ORDER BY room_number');
        res.status(200).json(rooms);
    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(500).json({ message: 'Server error' });
    }
});




// @route   PUT /rooms/update/:id
// @desc    Update a room's details (e.g., capacity)
// @access  Admin (implicit)
router.put('/update/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { capacity } = req.body;

        if (!capacity) {
            return res.status(400).json({ message: 'Capacity is required.' });
        }

        const numericCapacity = parseInt(capacity, 10);
        if (isNaN(numericCapacity) || numericCapacity <= 0) {
            return res.status(400).json({ message: 'Capacity must be a positive number.' });
        }

        // --- Safety Check ---
        // Get the current occupancy
        const [roomRows] = await db.promise().query('SELECT current_occupancy FROM rooms WHERE id = ?', [id]);
        if (roomRows.length === 0) {
            return res.status(404).json({ message: 'Room not found.' });
        }

        const room = roomRows[0];

        // Block if the new capacity is less than the number of students already in the room
        if (numericCapacity < room.current_occupancy) {
            return res.status(409).json({
                message: `Cannot set capacity to ${numericCapacity}. This room already has ${room.current_occupancy} students.`
            });
        }
        // --- End Safety Check ---

        // Update the room
        await db.promise().query(
            'UPDATE rooms SET capacity = ? WHERE id = ?',
            [numericCapacity, id]
        );

        res.status(200).json({ message: 'Room capacity updated successfully.' });

    } catch (err) {
        console.error('Error updating room:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /rooms/delete/:id
// @desc    Delete a room
// @access  Admin (implicit)
router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        // --- Safety Check ---
        // Check if the room exists and is empty
        const [roomRows] = await db.promise().query('SELECT current_occupancy FROM rooms WHERE id = ?', [id]);
        if (roomRows.length === 0) {
            return res.status(404).json({ message: 'Room not found.' });
        }

        const room = roomRows[0];

        // Block deletion if the room is not empty
        if (room.current_occupancy > 0) {
            return res.status(409).json({
                message: `Cannot delete room. It is currently occupied by ${room.current_occupancy} student(s).`
            });
        }
        // --- End Safety Check ---

        // Delete the room
        await db.promise().query('DELETE FROM rooms WHERE id = ?', [id]);

        res.status(200).json({ message: 'Room deleted successfully.' });

    } catch (err) {
        // Handle cases where a student is still linked (if foreign keys were added)
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ message: 'Cannot delete room. It is still referenced by other records.' });
        }
        console.error('Error deleting room:', err);
        res.status(500).json({ message: 'Server error' });
    }
});




// @route   POST /rooms/upload
// @desc    Add rooms in bulk from a CSV file
// @access  Admin (implicit)
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
        // 1. Parse the CSV buffer
        const rooms = await parseCsv(req.file.buffer);

        if (rooms.length === 0) {
            return res.status(400).json({ message: 'CSV file is empty or invalid.' });
        }

        // 2. Prepare the data for bulk insert
        // The CSV headers MUST be 'room_number' and 'capacity'
        const roomRows = rooms.map(room => {
            if (!room.room_number || !room.capacity) {
                throw new Error('CSV must have "room_number" and "capacity" columns.');
            }
            return [room.room_number, room.capacity];
        });

        // 3. Create the bulk insert query
        // "INSERT IGNORE" skips any rooms where the room_number already exists
        const sql = `INSERT IGNORE INTO rooms (room_number, capacity) VALUES ?`;

        // 4. Execute the query
        const [result] = await db.promise().query(sql, [roomRows]);

        res.status(201).json({
            message: `Successfully added ${result.affectedRows} new rooms. ${result.warningStatus} duplicates were skipped.`,
        });

    } catch (err) {
        console.error('CSV Upload Error:', err);
        res.status(500).json({ message: 'Error processing CSV file.' });
    }
});




module.exports = router;