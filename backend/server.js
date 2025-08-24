require('dotenv').config();


const express = require('express'); 
const cors = require('cors');
const flightRoutes = require('./routes/flightRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/flights', flightRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
