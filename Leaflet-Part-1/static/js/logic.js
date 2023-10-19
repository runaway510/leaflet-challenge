// Initialize the map
const myMap = L.map("map").setView([36.04, -94.65], 5);

// Add a tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '©OpenStreetMap, ©CartoDB'
}).addTo(myMap);

function getColor(depth) {
    if (depth < 10) return "green";
    else if (depth < 30) return "yellow";
    else if (depth < 50) return "orange";
    else if (depth < 70) return "darkorange";
    else if (depth < 90) return "red";
    else return "darkred";
}

// Fetch the data
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson')
  .then(response => response.json())
  .then(data => {
    data.features.forEach(feature => {
      const { coordinates } = feature.geometry;
      const { mag, place } = feature.properties;
      const depth = coordinates[2];
      
      // Calculate radius based on magnitude
      const radius = mag * 20000;

      // Get color based on depth
      const color = getColor(depth);

      // Add a circle to the map
      L.circle([coordinates[1], coordinates[0]], {
        color: color,
        fillColor: color,
        radius: radius,
        fillOpacity: 0.75,
        weight: 1
      })
      .bindPopup(`<h2>${place}</h2><hr><p>Magnitude: ${mag} | Depth: ${depth}km</p>`)
      .addTo(myMap);
    });

    // Add legend
    const legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        const depths = [-10, 10, 30, 50, 70, 90];
        const labels = [];

        for (let i = 0; i < depths.length; i++) {
            labels.push(
                `<i style="background: ${getColor(depths[i] + 1)}"></i> ${depths[i]}${depths[i + 1] ? `&ndash;${depths[i + 1]}` : '+'}`
            );
        }

        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(myMap);
  });