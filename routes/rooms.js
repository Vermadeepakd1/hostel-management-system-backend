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