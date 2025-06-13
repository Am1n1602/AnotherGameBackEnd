require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());

// ✅ Force Express to parse JSON regardless of headers
app.use(express.json({ type: '*/*' }));

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

// ✅ Enhanced submit-score route
app.post('/submit-score', async (req, res) => {
  try {
    console.log("Headers:", req.headers);
    console.log("Parsed body:", req.body);

    const { name, deaths, time } = req.body;
    if (!name || deaths == null || time == null) {
      return res.status(400).json({ error: 'Invalid data', body: req.body });
    }

    console.log(`Saving entry: name=${name}, deaths=${deaths}, time=${time}`);

    const entry = new Entry({ name, deaths, time });
    await entry.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Submit score error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Leaderboard route
app.get('/leaderboard', async (req, res) => {
  try {
    const sortBy = req.query.sortBy === 'deaths' ? 'deaths' : 'time';
    const entries = await Entry.find().sort({ [sortBy]: 1, time: 1 }).limit(300);
    res.json(entries);
  } catch (err) {
    console.error('Leaderboard error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
