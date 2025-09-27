function Location() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState("");

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setError("");
      },
      (err) => {
        setError("Error: " + err.message);
      }
    );
  };

  return (
    <div>
      <button onClick={getLocation}>Get My Location</button>
      {coords && (
        <p>
          Latitude: {coords.lat}, Longitude: {coords.lng}
        </p>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Location;