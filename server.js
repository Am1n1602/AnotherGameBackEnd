require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());

// Apply text parser globally, so body is captured as plain text
app.use(express.text({ type: '*/*' }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit if DB fails to connect
});

const entrySchema = new mongoose.Schema({
    name: String,
    deaths: Number,
    time: Number
});
const Entry = mongoose.model('Entry', entrySchema);

// Submit a new score
app.post('/submit-score', (req, res, next) => {
    console.log("Headers:", req.headers);    
    console.log("Raw body:", req.body); 
    try {
        req.body = JSON.parse(req.body);
    } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    next();
}, async (req, res) => {
    const { name, deaths, time } = req.body;
    if (!name || deaths == null || time == null) {
        return res.status(400).json({ error: 'Invalid data' });
    }
    const entry = new Entry({ name, deaths, time });
    await entry.save();
    res.json({ success: true });
});

// Get leaderboard
app.get('/leaderboard', async (req, res) => {
    try {
        const sortBy = req.query.sortBy === 'deaths' ? 'deaths' : 'time';
        const entries = await Entry.find().sort({ [sortBy]: 1, time: 1 }).limit(20);
        res.json(entries);
    } catch (err) {
        console.error('Error fetching leaderboard:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
