const express = require('express'); // Import express
const path = require('path'); // Import path
const fs = require('fs'); // Import fs

const app = express(); // Create express app
const PORT = process.env.PORT || 3000; // Set PORT

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes for HTML files (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Routes for HTML files (notes.html)
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'notes.html'));
});

// Routes for API endpoints (GET, POST, DELETE)
app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error reading notes data.' });
            return;
        }
        res.json(JSON.parse(data));
    });
});

// POST request to add a new note
app.post('/api/notes', (req, res) => {
    const newNote = { ...req.body, id: Date.now() };
    fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error reading notes data.' });
            return;
        }
        const notes = JSON.parse(data);
        notes.push(newNote);
        fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                res.status(500).json({ error: 'Error writing new note.' });
                return;
            }
            res.json(newNote);
        });
    });
});

// DELETE request to delete a note
app.delete('/api/notes/:id', (req, res) => {
    const noteId = parseInt(req.params.id);
    fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error reading notes data.' });
            return;
        }
        let notes = JSON.parse(data);
        const filteredNotes = notes.filter(note => note.id !== noteId);
        fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(filteredNotes, null, 2), (err) => {
            if (err) {
                res.status(500).json({ error: 'Error deleting note.' });
                return;
            }
            res.status(204).send(); // Correct response for successful delete with no content to return
        });
    });
});

// Start server on PORT 3000
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});