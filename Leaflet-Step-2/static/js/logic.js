// Specify url to get data about all earthquakes for the last month
all_earth_q_lastMonth_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson" 


// Specify url to get data about tectonic plates
tectonic_plates_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json" 

// A function to determine the marker size based on the eartchquake magnitude
function markerSize(magnitude) {
    return magnitude * 20000;
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

// Use D3 to get JSON data
d3.json(all_earth_q_lastMonth_url).then(function (earthquakeData) {
  d3.json(tectonic_plates_url).then(function (tectonicData) {
      // Once we get a response, send the data.features object to the createFeatures function.
      
      createFeatures(earthquakeData.features, tectonicData.features);
      console.log(tectonicData)
  })
});


function createFeatures(earthquakeData, tectonicPlatesData) {

  // Create a GeoJSON layer that contains the features array on the tectonicPlatesData object.
  var tectonicPlates = L.geoJSON(tectonicPlatesData, {
    style: {
      color: 'yellow'
    }
  })

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Using pointToLayer function for each feature in geoJSON layer add Circle Points with
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

  // Send our earthquakes and tectonicPlates layers to the createMap function
  createMap(earthquakes, tectonicPlates);

}

// Function to create Map with Base and Overlay Layers, and Legend
function createMap(earthquakes, tectonicPlates) {

    // Create the base layers.
    var googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
    });

    var stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	    subdomains: 'abcd',
	    minZoom: 1,
	    maxZoom: 16,
	    ext: 'jpg'
    });

    var satelite = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 20,
      attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
    });

    // Create a baseMaps object.
    var baseMaps = {
      "Satelite": satelite,
      "Terrain": googleTerrain,
      "Watercolor": stamen_Watercolor
    };
  
    // Create an overlay object to hold our overlay.
    var overlayMaps = {
      Earthquakes: earthquakes,
      TectonicPlates: tectonicPlates
    };
  
    // Create our map, giving it the satelite map and earthquakes, tectonic layers to display on load.
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 4,
      layers: [satelite, earthquakes, tectonicPlates]
    });
  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    // Add legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            depth = [-10, 10, 30, 50, 70, 90]

        // Loop through depth intervals and generate a label with a colored square for each interval
        for (var i = 0; i < depth.length; i++) {
            div.innerHTML +=
                '<i style="background-color:' + markerColor(depth[i] + 1) + '"></i> ' +
                depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;

    };
  
    legend.addTo(myMap);
  }