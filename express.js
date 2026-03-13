const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration.html'));
});

// API endpoint to handle registration
app.post('/api/register', (req, res) => {
    try {
        const { firstName, middleName, province, municipality, dob, age } = req.body;

        // Validation
        if (!firstName || !province || !municipality || !dob || !age) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be filled'
            });
        }

        const registrationData = {
            firstName,
            middleName: middleName || 'Not provided',
            province,
            municipality,
            dob,
            age,
            timestamp: new Date().toLocaleString()
        };

        console.log('✓ Registration saved:', registrationData);

        res.json({
            success: true,
            message: 'Registration saved successfully!',
            data: registrationData
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// GET endpoint for retrieving data
app.get('/api/register', (req, res) => {
    res.json({
        success: true,
        message: 'Registration API is working'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
