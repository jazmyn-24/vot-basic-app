const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser'); // we added csv-parser library
const app = express();
const PORT = 3000;

app.use(express.static('public'));

// Setup multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Handle file upload and parsing
app.post('/upload', upload.single('votFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    const results = [];

    // Parse CSV
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            console.log('Parsed Data:', results.slice(0, 5)); // show only first 5 for now
            res.status(200).json({
                message: 'File uploaded and parsed successfully!',
                dataPreview: results.slice(0, 5) // send preview if you want
            });
        })
        .on('error', (error) => {
            console.error('Error while parsing CSV:', error);
            res.status(500).send('Error parsing the uploaded file.');
        });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
