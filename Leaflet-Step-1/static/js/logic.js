
// Specify url to get data about all earthquakes for the last month
all_earth_q_lastMonth_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson" 

// A function to determine the marker size based on the eartchquake magnitude
function markerSize(magnitude) {
    return magnitude * 10000;
}

// A function to determine the marker color based on the eartchquake depth
function markerColor(depth){
    return depth > 90 ? '#dc241c' :
           depth > 70  ? '#fd8d3c' :
           depth > 50  ? '#ffc015' :
           depth > 30  ?  '#ffde59':
           depth > 10   ? '#d0e606':
           '#5ca904';
}

// ---------------------------------------------------------------
// Use D3 to get JSON data
// ---------------------------------------------------------------

d3.json(all_earth_q_lastMonth_url).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
});


// -------------------------------------------------------------------------------------
// A function that creates earthquakes layer from features in earthquake geojson dataset
// -------------------------------------------------------------------------------------

function createFeatures(earthquakeData) {

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Using pointToLayer function for each feature in geoJSON layer add Circle Markers with
  // customized radius, color, binded Tooltip and Popup
  var earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function(feature, latlng){
      
          // define variables to style Circle Markers
          var magnitude = feature.properties.mag;
          var depth = feature.geometry.coordinates[2];
          var place = feature.properties.place;
          var location = (place.split(",")[1]===undefined) ? place : place.split(",")[1];

          return L.circle(latlng,
              {
                  radius: markerSize(magnitude),
                  color: "#353535",
                  weight: 1,
                  fillColor: markerColor(depth),
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.8
              }).bindTooltip(`<p>Mag: ${magnitude}</p>
              <p>Depth: ${depth}</p>
              <p>Loc: ${location}</p>`)
              .bindPopup(`<h3>${place}</h3><hr><p>${new Date(feature.properties.time)}</p>`)
      }
  });

  // Send earthquakes layer to the createMap function
  createMap(earthquakes);

}

// ---------------------------------------------------------------
// A function to create Map with all earthquakes from the data
// ---------------------------------------------------------------

function createMap(earthquakes) {

    // Create the base layer.
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    // Create a map, giving it the streetmap and earthquakes layers to display on load.
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [street, earthquakes]
    });
  
    // Add legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            depth = [-10, 10, 30, 50, 70, 90]

        // Loop through depth intervals and generate a colored square for each interval
        for (var i = 0; i < depth.length; i++) {
            div.innerHTML +=
                '<i style="background-color:' + markerColor(depth[i] + 1) + '"></i> ' +
                depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;

    };
    legend.addTo(myMap);
  }