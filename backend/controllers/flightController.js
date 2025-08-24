const fs = require('fs');
const path = require('path');

// Load airline codes → names JSON
const airlines = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/airlines.json')));


require('dotenv').config();
const amadeus = require('../utils/amadeusClient');

// Mock flight data for now
const mockFlights = [
  // JFK → LHR
  {
    id: 1,
    airline: 'mockEmirates',
    from: 'JFK',
    to: 'LHR',
    fare: 1200,
    duration: '7h 30m',
  },
  {
    id: 2,
    airline: 'mockBritish Airways',
    from: 'JFK',
    to: 'LHR',
    fare: 1150,
    duration: '7h 45m',
  },
  {
    id: 3,
    airline: 'mockAmerican Airlines',
    from: 'JFK',
    to: 'LHR',
    fare: 1100,
    duration: '8h 0m',
  },

  // JFK → DOH
  {
    id: 4,
    airline: 'mockQatar Airways',
    from: 'JFK',
    to: 'DOH',
    fare: 950,
    duration: '12h 15m',
  },
  {
    id: 5,
    airline: 'mockEmirates',
    from: 'JFK',
    to: 'DOH',
    fare: 1020,
    duration: '12h 0m',
  },
  {
    id: 6,
    airline: 'mockTurkish Airlines',
    from: 'JFK',
    to: 'DOH',
    fare: 980,
    duration: '12h 30m',
  },

  // LAX → SYD
  {
    id: 7,
    airline: 'mockQantas',
    from: 'LAX',
    to: 'SYD',
    fare: 1450,
    duration: '15h 50m',
  },
  {
    id: 8,
    airline: 'mockUnited Airlines',
    from: 'LAX',
    to: 'SYD',
    fare: 1400,
    duration: '16h 10m',
  },
  {
    id: 9,
    airline: 'mockSingapore Airlines',
    from: 'LAX',
    to: 'SYD',
    fare: 1500,
    duration: '15h 30m',
  },

  // YYZ → LHR (Toronto → London)
  {
    id: 10,
    airline: 'mockAir Canada',
    from: 'YYZ',
    to: 'LHR',
    fare: 900,
    duration: '7h 15m',
  },
  {
    id: 11,
    airline: 'mockBritish Airways',
    from: 'YYZ',
    to: 'LHR',
    fare: 920,
    duration: '7h 30m',
  },
  {
    id: 12,
    airline: 'mockLufthansa',
    from: 'YYZ',
    to: 'LHR',
    fare: 880,
    duration: '7h 45m',
  },

  // CDG → JFK (Paris → New York)
  {
    id: 13,
    airline: 'mockAir France',
    from: 'CDG',
    to: 'JFK',
    fare: 950,
    duration: '8h 10m',
  },
  {
    id: 14,
    airline: 'mockDelta Airlines',
    from: 'CDG',
    to: 'JFK',
    fare: 920,
    duration: '8h 0m',
  },
  {
    id: 15,
    airline: 'mockEmirates',
    from: 'CDG',
    to: 'JFK',
    fare: 980,
    duration: '7h 50m',
  },
];


// Simplified duration parser
function isoDurationToHHMM(duration) {
  const hoursIndex = duration.indexOf('H');
  const minsIndex = duration.indexOf('M');

  const hours = hoursIndex > -1 ? duration.slice(2, hoursIndex) : '0';
  const mins = minsIndex > -1 ? duration.slice(hoursIndex + 1, minsIndex) : '0';

  return `${hours}h ${mins}m`;
}

// Calculate stopover duration between two legs
function getStopoverDuration(prevArrival, nextDeparture) {
  const prev = new Date(prevArrival);
  const next = new Date(nextDeparture);
  const diffMins = Math.floor((next - prev) / 60000); // in minutes
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
}

const getFlights = async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, adults } = req.query;

    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      returnDate,
      adults: adults || 1,
      max: 10,
    });

    const flights = response.data.map(flight => {
      const itineraries = flight.itineraries.map(it => {
      const legs = it.segments.map((seg, idx, arr) => {
        let stopover = null;
        if (idx > 0) {
          stopover = getStopoverDuration(arr[idx - 1].arrival.at, seg.departure.at);
        }

        // Find amenities from travelerPricings for this segment
        const segmentAmenities = flight.travelerPricings[0]?.fareDetailsBySegment
          ?.find(f => f.segmentId === seg.id)?.amenities || [];

        const amenities = [];
        segmentAmenities.forEach(a => amenities.push(a.description));

        // Also include bags info if needed
        if (seg.includedCheckedBags) amenities.push(`Checked Bags: ${seg.includedCheckedBags.quantity}`);
        if (seg.includedCabinBags) amenities.push(`Cabin Bags: ${seg.includedCabinBags.quantity}`);

        return {
          departure: seg.departure.at,
          departureAirport: seg.departure.iataCode,
          arrival: seg.arrival.at,
          arrivalAirport: seg.arrival.iataCode,
          carrier: seg.carrier,
          flightNumber: seg.number,
          aircraft: seg.aircraft.code,
          duration: isoDurationToHHMM(seg.duration),
          stopoverDuration: stopover,
          amenities,
        };
      });

  return {
    totalDuration: isoDurationToHHMM(it.duration),
    legs,  // <-- make sure legs are returned here
  };
});




      ///const travelerPrice = flight.travelerPricings[0]?.price || {};
      ///const totalPrice = travelerPrice.total || flight.price?.total;
      ///const currency = travelerPrice.currency || flight.price?.currency || 'USD';

      const totalPrice = flight.totalPrice;
      const currency = flight.currency;
  
      const airlineCodes = [
      ...new Set(flight.itineraries.flatMap(it => it.legs.map(leg => leg.carrier).filter(c => c)))
    ];

    


      //const airline = flight.itineraries[0].legs[0].carrier || 'Unknown';



      return {
        id: flight.id,
        //airline,  // <-- use this variable here
        totalPrice,
        currency,
        itineraries,
      };

    });

    res.json(flights);
  } catch (err) {
    console.error(err);
    console.error('Amadeus API failed:', err);
    //res.status(500).json({ error: 'Failed to fetch flights from Amadeus API' });
    // Filter mockFlights based on query
    const { origin, destination } = req.query;
    const filtered = mockFlights.filter(f =>
      (!origin || f.from.toUpperCase() === origin.toUpperCase()) &&
      (!destination || f.to.toUpperCase() === destination.toUpperCase())
    );

    console.log('Filtered mock flights:', filtered.length, 'of', mockFlights.length);
    res.json(filtered);

    
  }
};

module.exports = { getFlights };
