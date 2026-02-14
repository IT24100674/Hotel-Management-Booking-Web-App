const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const eventRoutes = require('./routes/eventRoutes');
const roomRoutes = require('./routes/roomRoutes');
const staffRoutes = require('./routes/staffRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const menuRoutes = require('./routes/menuRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/events', eventRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
