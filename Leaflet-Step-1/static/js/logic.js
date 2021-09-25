all_earth_q_lastMonth_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson" 

// A function to determine the marker size based on the population
function markerSize(magnitude) {
    // return Math.sqrt(magnitude) * 50;
    return magnitude * 5000;
}

function markerColor(depth){
    return depth > -10 ? '#ffffb2' :
           depth > 10  ? '#fecc5c' :
           depth > 30  ? '#fd8d3c' :
           depth > 50  ? '#f03b20' :
           depth > 70   ? '#bd0026' :
           depth > 90   ? '#FEB24C' :
        //    depth > 10   ? '#FED976' :
                      'blue';
                    
}

console.log(markerSize(10))

d3.json(all_earth_q_lastMonth_url).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
    console.log(data.features)
  });

function createFeatures(earthquakeData) {

// Define a function that we want to run once for each feature in the features array.
// Give each feature a popup that describes the place and time of the earthquake.
function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
}

// Create a GeoJSON layer that contains the features array on the earthquakeData object.
// Run the onEachFeature function once for each piece of data in the array.
// var earthquakes = L.geoJSON(earthquakeData, {
//     onEachFeature: onEachFeature
// });

// console.log(markerSize(earthquakes[0].properties.mag))

var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng){
        // console.log(feature.properties.mag),
        return L.circle(latlng,
            {
                radius: markerSize(feature.properties.mag),
                fillColor: "#ff7800",
                color: markerColor(feature.geometry.coordinates[2]),
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`)
    }
});

// Send our earthquakes layer to the createMap function/
createMap(earthquakes);
}



function createMap(earthquakes) {

    // Create the base layers.
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    
  
    // Create a baseMaps object.
    var baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Create an overlay object to hold our overlay.
    var overlayMaps = {
      Earthquakes: earthquakes
        // Earthquakes: circles
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [street, earthquakes]
    });
  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    // add legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [-10, 10, 30, 50, 70, 90],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background-color:' + markerColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };
  
    legend.addTo(myMap);


  }