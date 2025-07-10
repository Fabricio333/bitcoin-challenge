// server.js - Node.js/Express Backend
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from public directory

// Initialize data structure
let data = {
    users: {},
    globalCounts: {}
};

// Load data from file
async function loadData() {
    try {
        const fileData = await fs.readFile(DATA_FILE, 'utf8');
        data = JSON.parse(fileData);
    } catch (error) {
        // File doesn't exist or is invalid, use default data
        console.log('No existing data file found, starting fresh');
        await saveData();
    }
}

// Save data to file
async function saveData() {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// API Routes

// Create new user
app.post('/api/users', async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required' });
    }

    const uuid = generateUUID();
    const user = {
        uuid,
        name: name.trim(),
        startDate: new Date().toISOString(),
        completed: []
    };

    data.users[uuid] = user;
    await saveData();

    res.json(user);
});

// Get user by UUID
app.get('/api/users/:uuid', (req, res) => {
    const { uuid } = req.params;
    const user = data.users[uuid];

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
});

// Mark lesson as completed
app.post('/api/users/:uuid/complete/:day', async (req, res) => {
    const { uuid, day } = req.params;
    const dayNum = parseInt(day, 10);

    if (!data.users[uuid]) {
        return res.status(404).json({ error: 'User not found' });
    }

    const user = data.users[uuid];
    const startDate = new Date(user.startDate);
    const daysSince = Math.floor((Date.now() - startDate.getTime()) / 86400000);
    const allowedDay = 1 + daysSince;

    // Check if day is allowed
    if (dayNum > allowedDay) {
        return res.status(400).json({ error: 'Lesson not yet available' });
    }

    // Check if already completed
    if (user.completed.includes(dayNum)) {
        return res.json({ message: 'Already completed', globalCount: data.globalCounts[dayNum] || 0 });
    }

    // Mark as completed
    user.completed.push(dayNum);

    // Increment global count
    data.globalCounts[dayNum] = (data.globalCounts[dayNum] || 0) + 1;

    await saveData();

    res.json({
        message: 'Lesson completed',
        globalCount: data.globalCounts[dayNum]
    });
});

// Get global completion count for a day
app.get('/api/global-count/:day', (req, res) => {
    const { day } = req.params;
    const dayNum = parseInt(day, 10);

    res.json({
        day: dayNum,
        count: data.globalCounts[dayNum] || 0
    });
});

// Get all global counts
app.get('/api/global-counts', (req, res) => {
    res.json(data.globalCounts);
});

// Reset user (for testing)
app.delete('/api/users/:uuid', async (req, res) => {
    const { uuid } = req.params;

    if (!data.users[uuid]) {
        return res.status(404).json({ error: 'User not found' });
    }

    delete data.users[uuid];
    await saveData();

    res.json({ message: 'User deleted' });
});

// Utility functions
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Initialize and start server
async function startServer() {
    await loadData();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Data file: ${DATA_FILE}`);
    });
}

startServer().catch(console.error);

// Export for testing
module.exports = app;
