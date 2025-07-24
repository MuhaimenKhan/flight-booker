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

exports.getFlights = (req, res) => {
  res.json(flights);
};
