import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import flightData from "../../db/flight_data.json";
import airplaneIcon from "../../assets/airplane.png";

const FlightHistoryWidget = () => {
  const [flightIndex, setFlightIndex] = useState(0);
  const [isFlying, setIsFlying] = useState(false);
  const [currentCoordinates, setCurrentCoordinates] = useState([0, 0]);

  useEffect(() => {
    let animationTimer;

    if (isFlying) {
      animationTimer = setTimeout(() => {
        setFlightIndex((prevIndex) =>
          Math.min(prevIndex + 1, flightData.length - 1)
        );
      }, 20000); // 20 секунд для кожного кроку польоту
    } else {
      clearTimeout(animationTimer);
    }

    return () => {
      clearTimeout(animationTimer);
    };
  }, [isFlying]);

  useEffect(() => {
    const calculateNewCoordinates = () => {
      const currentFlight = flightData[flightIndex];
      if (currentFlight) {
        const { speed, direction } = currentFlight;
        const deltaLatitude =
          (speed / 111.32) * Math.cos(direction * (Math.PI / 180));
        const deltaLongitude =
          (speed /
            (111.32 * Math.cos(currentCoordinates[0] * (Math.PI / 180)))) *
          Math.sin(direction * (Math.PI / 180));

        const newLatitude = currentCoordinates[0] + deltaLatitude;
        const newLongitude = currentCoordinates[1] + deltaLongitude;

        setCurrentCoordinates([newLatitude, newLongitude]);
      }
    };

    if (!isFlying) return;

    calculateNewCoordinates();
  }, [flightIndex, currentCoordinates, isFlying]);

  const handleStart = () => {
    setIsFlying(true);
  };

  const handleStop = () => {
    setIsFlying(false);
    setFlightIndex(0);
  };

  const currentFlight = flightData[flightIndex];

  if (!currentFlight) {
    return <div>No flight data available</div>;
  }

  const { timestamp, speed, direction } = currentFlight;

  const formattedTime = new Date(timestamp * 1000).toLocaleTimeString();

  return (
    <div className="flight-history-widget">
      <h2>Flight History</h2>
      <div>
        <strong>Time:</strong> {formattedTime}, <strong>Speed:</strong> {speed}{" "}
        KM/H, <strong>Direction:</strong> {direction}
      </div>
      <div>
        {!isFlying ? (
          <button onClick={handleStart}>Start</button>
        ) : (
          <button onClick={handleStop}>Stop</button>
        )}
      </div>
      <div className="map-container">
        <MapContainer
          center={[0, 0]}
          zoom={6}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker
            position={currentCoordinates}
            icon={L.icon({ iconUrl: airplaneIcon, iconSize: [30, 30] })}
          >
            <Popup>Current position</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default FlightHistoryWidget;
