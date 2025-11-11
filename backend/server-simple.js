const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.post('/signup', (req, res) => {
    res.json({ success: true, token: 'test_token' });
});

app.post('/login', (req, res) => {
    res.json({ success: true, token: 'test_token' });
});

app.get('/allproducts', (req, res) => {
    res.json([]);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});