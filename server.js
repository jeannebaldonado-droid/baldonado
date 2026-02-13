const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration.html'));
});

// API endpoint to save registration data
app.post('/api/register', (req, res) => {
    const { firstName, middleName, province, municipality, dob, age } = req.body;

    // Validation
    if (!firstName || !province || !municipality || !dob || !age) {
        return res.status(400).json({ 
            success: false, 
            message: 'All required fields must be filled' 
        });
    }

    // Here you would typically save to a database
    // For now, we'll just log and return success
    const registrationData = {
        firstName,
        middleName: middleName || 'Not provided',
        province,
        municipality,
        dob,
        age,
        timestamp: new Date().toLocaleString()
    };

    console.log('Registration data received:', registrationData);

    res.json({ 
        success: true, 
        message: 'Registration saved successfully!',
        data: registrationData
    });
});

// API endpoint to retrieve registration data
app.get('/api/register', (req, res) => {
    // In a real application, you would fetch from a database
    // For now, we'll return a sample response
    res.json({ 
        success: true,
        message: 'Registration data retrieved'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Registration server is running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});
