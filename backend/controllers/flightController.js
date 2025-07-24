// Mock flight data for now
const flights = [
  {
    id: 1,
    airline: 'Emirates',
    from: 'JFK',
    to: 'LHR',
    fare: 1200,
    duration: '7h 30m',
  },
  {
    id: 2,
    airline: 'Qatar Airways',
    from: 'JFK',
    to: 'DOH',
    fare: 950,
    duration: '12h 15m',
  },
];

const getFlights = (req, res) => {
  const { origin, destination } = req.query;

  let results = flights;

  if (origin) {
    results = results.filter(flight => flight.from.toUpperCase() === origin.toUpperCase());
  }
  if (destination) {
    results = results.filter(flight => flight.to.toUpperCase() === destination.toUpperCase());
  }

  res.json(results);
};

module.exports = {
  getFlights,
};
