var map = L.map('map').setView([24.93297849, 67.01649538], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 18,
}).addTo(map);

var loader = document.getElementById('loader');

document.getElementById('uploadBtn').addEventListener('click', function () {
  var csvFileInput = document.getElementById('csvFile');
  var csvFile = csvFileInput.files[0];

  var jsonFileInput = document.getElementById('jsonFile');
  var jsonFile = jsonFileInput.files[0];

  if (csvFile && jsonFile) {
    var formData = new FormData();
    formData.append('batchDetailFile', csvFile);
    formData.append('routingRequestDto', jsonFile);

    showLoader();

    fetch('http://localhost:8090/routes', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => processApiResponse(data))
    .catch(error => console.error(error))
    .finally(hideLoader);
  } else {
    alert('Please select both a CSV file and a JSON file.');
  }
});

function showLoader() {
  loader.style.display = 'block';
}

function hideLoader() {
  loader.style.display = 'none';
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function processApiResponse(data) {
  // Iterate over each tour in the API response
  data.tours.forEach(function (tour) {
    // Generate a random color for the tour
    var color = getRandomColor();

    // Create a marker group for the tour
    var tourMarkers = L.featureGroup().addTo(map);

    // Create an array to store the coordinates of the tour route
    var routeCoordinates = [];

    // Iterate over each order in the tour
    tour.orders.forEach(function (order) {
      // Create a marker with the order's latitude and longitude
      var marker = L.marker([order.latitude, order.longitude], {
        icon: L.icon({
          iconUrl: 'marker.svg',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        })
      });

      // Add the marker to the tour marker group
      marker.addTo(tourMarkers);

      // Add the order's coordinates to the route coordinates array
      routeCoordinates.push([order.latitude, order.longitude]);
    });

    // Create a polyline using the route coordinates
    var polyline = L.polyline(routeCoordinates, { color: color }).addTo(map);

    // Fit the map view to the bounds of the tour marker group
    map.fitBounds(tourMarkers.getBounds());
  });
}
