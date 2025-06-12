require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json()); // Explicitly use body-parser

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
});

const entrySchema = new mongoose.Schema({
    name: String,
    deaths: Number,
    time: Number
});
const Entry = mongoose.model('Entry', entrySchema);

// Submit a new score
app.post('/submit-score', (req, res) => {
    console.log("Headers:", req.headers);
    console.log("Parsed body:", req.body);

    const { name, deaths, time } = req.body;
    if (!name || deaths == null || time == null) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    const entry = new Entry({ name, deaths, time });
    entry.save()
        .then(() => res.json({ success: true }))
        .catch((err) => {
            console.error('Mongo save error:', err);
            res.status(500).json({ error: 'Database error' });
        });
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
