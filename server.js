require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Replace with your MongoDB connection string
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const entrySchema = new mongoose.Schema({
    name: String,
    deaths: Number,
    time: Number
});
const Entry = mongoose.model('Entry', entrySchema);

// Submit a new score
app.post('/submit-score', async (req, res) => {
    const { name, deaths, time } = req.body;
    if (!name || deaths === undefined || time === undefined) {
        return res.status(400).json({ error: 'Invalid data' });
    }
    const entry = new Entry({ name, deaths, time });
    await entry.save();
    res.json({ success: true });
});

// Get leaderboard, sorted by time or deaths
app.get('/leaderboard', async (req, res) => {
    const sortBy = req.query.sortBy === 'deaths' ? 'deaths' : 'time';
    const entries = await Entry.find().sort({ [sortBy]: 1, time: 1 }).limit(20);
    res.json(entries);
});

app.listen(3000, () => console.log('Server running on port 3000'));
