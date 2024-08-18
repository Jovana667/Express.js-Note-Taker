const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// API Routes
app.get('/api/notes', (req, res) => {
  fs.readFile('./db.json', 'utf8', (err, data) => {
    if (err) throw err;
    const notes = JSON.parse(data);
    // Filter out any notes without an ID
    const validNotes = notes.filter(note => note.id);
    res.json(validNotes);
  });
});

app.post('/api/notes', (req, res) => {
  const newNote = { 
    id: uuidv4(), // Always generate a new ID
    title: req.body.title || 'Untitled', // Default title if none provided
    text: req.body.text || '' // Default to empty string if no text provided
  };
  fs.readFile('./db.json', 'utf8', (err, data) => {
    if (err) throw err;
    const notes = JSON.parse(data);
    notes.push(newNote);
    fs.writeFile('./db.json', JSON.stringify(notes), (err) => {
      if (err) throw err;
      res.json(newNote);
    });
  });
});

// Bonus: DELETE route
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  fs.readFile('./db.json', 'utf8', (err, data) => {
    if (err) throw err;
    let notes = JSON.parse(data);
    const initialLength = notes.length;
    notes = notes.filter(note => note.id && note.id !== noteId);
    if (notes.length === initialLength) {
      return res.status(404).json({ message: "Note not found" });
    }
    fs.writeFile('./db.json', JSON.stringify(notes), (err) => {
      if (err) throw err;
      res.json({ message: "Note deleted" });
    });
  });
});

// HTML Routes
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html'));
});

// Wildcard route should be last
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));