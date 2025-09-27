/* Note: This example requires that you consent to location sharing when
     * prompted by your browser. If you see the error "Geolocation permission
     * denied.", it means you probably did not give permission for the browser * to locate you. */
    let pos;
    let map;
    let bounds;
    let infoWindow;
    let currentInfoWindow;
    let service;
    let infoPane;
function Home() {
  // Remove any existing login or profile containers
  const existingLogin = document.querySelector(".loginout-container");
  if (existingLogin) existingLogin.remove();
  const existingProfile = document.querySelector(".profile-container");
  if (existingProfile) existingProfile.remove();
  const existingReview = document.querySelector(".review-page");
  if (existingReview) existingReview.remove();
  const existingMap = document.querySelector(".map-placeholder");
    if (existingMap) existingMap.remove();

    

    const recommendedSpots = [
    "Coffee Shop",
    "Bookstore",
    "Art Gallery",
    "Park",
    "Restaurant",
  ];


  const mapRef = React.useRef(null); // <-- create a reference for the map container

  React.useEffect(() => {
    if (mapRef.current) {
      initMap(mapRef.current); // <-- pass the div directly to Google Maps
    }
  }, []);

  return (
    <div className="home">
      {/* Map container */}
      <div className="map-placeholder" ref={mapRef}></div>

      <h4>Recommended Spots For You</h4>
      <section className="recommended-spots">
        <ul>
          {recommendedSpots.map((spot, index) => (
            <li key={index}>{spot}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
function initMap(container) {
  bounds = new google.maps.LatLngBounds();
  infoWindow = new google.maps.InfoWindow();
  currentInfoWindow = infoWindow;
  infoPane = document.getElementById('panel');

  pos = { lat: 39.95, lng: -75.16 };
  map = new google.maps.Map(container, {  // <-- pass container
    center: pos,
    zoom: 12
  });

  getNearbyPlaces(pos);
}

// Perform a Places Nearby Search Request
    function getNearbyPlaces(position) {
      let request = {
        location: position,
        rankBy: google.maps.places.RankBy.DISTANCE,
        keyword: 'cheesesteak'
      };

      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, nearbyCallback);
    }

    // Handle the results (up to 20) of the Nearby Search
    function nearbyCallback(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        createMarkers(results);
      }
    }

    // Set markers at the location of each place result
    function createMarkers(places) {
      places.forEach(place => {
        let marker = new google.maps.Marker({
          position: place.geometry.location,
          map: map,
          title: place.name
        });

        // Mouseover event
        google.maps.event.addListener(marker, 'mouseover', () => {
          let request = {
            placeId: place.place_id,
            fields: ['name', 'formatted_address', 'geometry', 'rating',
              'website', 'photos']
          };

          // Fetch the details of the hovered marker and display a small info tab over it
          service.getDetails(request, (placeResult, status) => {
            // Verify status okay
            if (status == google.maps.places.PlacesServiceStatus.OK) {
            showDetails(placeResult, marker, status)
            } else {
              console.log('showDetails failed: ' + status);
            }
          });
        });

        // On mouse click, display a side bar telling more information 
        google.maps.event.addListener(marker, 'click', () => {
          let request = {
            placeId: place.place_id,
            fields: ['name', 'formatted_address', 'geometry', 'rating',
              'website', 'photos']
          };

          // Display side bar with more restaurant details
          service.getDetails(request, (placeResult, status) => {
            // Verify status okay
            if (status == google.maps.places.PlacesServiceStatus.OK) {
            showPanel(placeResult)
            } else {
              console.log('showDetails failed: ' + status);
            }
          });
        });

        // Adjust the map bounds to include the location of this marker
        bounds.extend(place.geometry.location);
      });
      /* Once all the markers have been placed, adjust the bounds of the map to
       * show all the markers within the visible area. */
      map.fitBounds(bounds);
    }

    // Small info window above the marker
    function showDetails(placeResult, marker, status) {
      let placeInfowindow = new google.maps.InfoWindow();

      // Add content to the pane
      let rating = "None";
      if (placeResult.rating) rating = placeResult.rating;
      placeInfowindow.setContent('<div><strong>' + placeResult.name + '</strong><br>' + 'Rating: ' + rating + '</div>');

      // Open the info window
      placeInfowindow.open(marker.map, marker);
      currentInfoWindow.close();
      currentInfoWindow = placeInfowindow;
    }

    // Displays place details in a sidebar
    function showPanel(placeResult) {
      // If infoPane is already open, close it
      if (infoPane.classList.contains("open")) {
        infoPane.classList.remove("open");
      }

      // Clear the previous details
      while (infoPane.lastChild) {
        infoPane.removeChild(infoPane.lastChild);
      }

      // Add the primary photo, if there is one
      if (placeResult.photos) {
        let firstPhoto = placeResult.photos[0];
        let photo = document.createElement('img');
        photo.classList.add('hero');
        photo.src = firstPhoto.getUrl();
        infoPane.appendChild(photo);
      }

      // Add place details with text formatting
      let name = document.createElement('h1');
      name.classList.add('place');
      name.textContent = placeResult.name;
      infoPane.appendChild(name);

      // Add Rating
      if (placeResult.rating) {
        let rating = document.createElement('p');
        rating.classList.add('details');
        rating.textContent = `Rating: ${placeResult.rating} \u272e`;
        infoPane.appendChild(rating);
      }

      // Add Website Link
      let address = document.createElement('p');
      address.classList.add('details');
      address.textContent = placeResult.formatted_address;
      infoPane.appendChild(address);
      if (placeResult.website) {
        let websitePara = document.createElement('p');
        let websiteLink = document.createElement('a');
        let websiteUrl = document.createTextNode(placeResult.website);
        websiteLink.appendChild(websiteUrl);
        websiteLink.title = placeResult.website;
        websiteLink.href = placeResult.website;
        websitePara.appendChild(websiteLink);
        infoPane.appendChild(websitePara);
      }

      // Open the infoPane
      infoPane.classList.add("open");
    }