const axios = require('axios');

const getAroundPlaces = async (req, res) => {
  try {
    const { lat, lng, radius = 2000 } = req.query;
    
    console.log("📍 Fetching REAL places from OpenStreetMap near:", lat, lng);
    
    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: "Latitude and longitude are required" 
      });
    }
    
    // OpenStreetMap Overpass API query - fetches REAL places automatically
    const query = `
      [out:json];
      (
        // Cafes
        node["amenity"="cafe"](around:${radius},${lat},${lng});
        way["amenity"="cafe"](around:${radius},${lat},${lng});
        relation["amenity"="cafe"](around:${radius},${lat},${lng});
        
        // Restaurants
        node["amenity"="restaurant"](around:${radius},${lat},${lng});
        way["amenity"="restaurant"](around:${radius},${lat},${lng});
        
        // Fast Food
        node["amenity"="fast_food"](around:${radius},${lat},${lng});
        way["amenity"="fast_food"](around:${radius},${lat},${lng});
        
        // Parks
        node["leisure"="park"](around:${radius},${lat},${lng});
        way["leisure"="park"](around:${radius},${lat},${lng});
        
        // Hospitals
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        way["amenity"="hospital"](around:${radius},${lat},${lng});
        
        // Shops
        node["shop"](around:${radius},${lat},${lng});
        way["shop"](around:${radius},${lat},${lng});
        
        // Metro Stations
        node["railway"="station"](around:${radius},${lat},${lng});
        node["station"="subway"](around:${radius},${lat},${lng});
        
        // ATMs
        node["amenity"="atm"](around:${radius},${lat},${lng});
        
        // Pharmacies
        node["amenity"="pharmacy"](around:${radius},${lat},${lng});
        
        // Bars/Pubs
        node["amenity"="bar"](around:${radius},${lat},${lng});
        node["amenity"="pub"](around:${radius},${lat},${lng});
      );
      out body;
      >;
      out skel qt;
    `;
    
    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(query)}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000
      }
    );
    
    // Process and format the real places
    const places = response.data.elements
      .filter(place => place.tags && place.tags.name) // Only places with names
      .map(place => {
        let placeLat = place.lat;
        let placeLng = place.lon;
        
        if (!placeLat && place.center) {
          placeLat = place.center.lat;
          placeLng = place.center.lon;
        }
        
        let type = 'place';
        if (place.tags.amenity === 'cafe') type = 'Cafe';
        else if (place.tags.amenity === 'restaurant') type = 'Restaurant';
        else if (place.tags.amenity === 'fast_food') type = 'Fast Food';
        else if (place.tags.leisure === 'park') type = 'Park';
        else if (place.tags.amenity === 'hospital') type = 'Hospital';
        else if (place.tags.shop) type = 'Shop';
        else if (place.tags.railway === 'station') type = 'Metro';
        else if (place.tags.amenity === 'atm') type = 'ATM';
        else if (place.tags.amenity === 'pharmacy') type = 'Pharmacy';
        else if (place.tags.amenity === 'bar') type = 'Bar';
        
        // Get address components
        let address = '';
        if (place.tags.addr_street) address += place.tags.addr_street;
        if (place.tags.addr_city) address += ', ' + place.tags.addr_city;
        if (place.tags.addr_postcode) address += ' - ' + place.tags.addr_postcode;
        
        if (!address && place.tags.name) address = 'Near ' + place.tags.name;
        
        return {
          _id: `osm_${place.id}`,
          name: place.tags.name,
          type: type,
          location: { lat: placeLat, lng: placeLng },
          address: address || 'Address not available',
          rating: place.tags.rating ? parseFloat(place.tags.rating) : 0,
          isPlace: true
        };
      });
    
    // Remove duplicates
    const uniquePlaces = [];
    const seen = new Set();
    for (const place of places) {
      const key = `${place.name}-${Math.round(place.location.lat * 1000)}-${Math.round(place.location.lng * 1000)}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniquePlaces.push(place);
      }
    }
    
    console.log(`✅ Found ${uniquePlaces.length} REAL places near your location`);
    
    res.json({ 
      success: true, 
      data: uniquePlaces,
      count: uniquePlaces.length,
      source: 'OpenStreetMap'
    });
    
  } catch (error) {
    console.error("Error fetching places:", error.message);
    
    // Return empty array instead of fallback - better to show nothing than fake data
    res.json({ 
      success: true, 
      data: [],
      count: 0,
      message: "Could not fetch places. Please try again."
    });
  }
};

module.exports = { getAroundPlaces };