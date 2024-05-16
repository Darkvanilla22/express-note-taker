const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'notes.html'));
});

app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error reading notes data.' });
            return;
        }
        res.json(JSON.parse(data));
    });
});

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
            res.status(204).send();
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});