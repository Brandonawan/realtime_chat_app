const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const multer = require('multer'); // Middleware for handling file uploads

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set up file upload storage using multer
const upload = multer({ dest: 'uploads/' });

// Serve static files from the 'public' directory
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (data) => {
        if (data.type === 'text') {
            // Broadcast text message to all connected clients
            io.emit('chat message', { type: 'text', message: data.message });
        } else if (data.type === 'image') {
            // Broadcast image message to all connected clients
            io.emit('chat message', { type: 'image', image: data.image });
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Handle file uploads
app.post('/upload', upload.single('image'), (req, res) => {
    // File upload middleware
    const imageUrl = `/uploads/${req.file.filename}`;

    // Emit message with image URL to all clients
    io.emit('chat message', { type: 'image', image: imageUrl });

    res.status(200).send({ imageUrl });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
