"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in react-leaflet
interface IconDefaultPrototype extends L.Icon.Default {
  _getIconUrl?: string;
}
delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Coordinate {
  lat: number;
  lng: number;
  popup?: string; // Optional popup text
}

interface StaticMapProps {
  coordinates: Coordinate[];
  height?: string;
  width?: string;
  zoom?: number;
  className?: string;
  center?: Coordinate;
  showPopups?: boolean;
}

export const StaticMap: React.FC<StaticMapProps> = ({
  coordinates,
  height = "400px",
  width = "100%",
  zoom = 13,
  className = "",
  center,
  showPopups = false,
}) => {
  // Default center to first coordinate or fallback
  const mapCenter =
    center ||
    (coordinates.length > 0 ? coordinates[0] : { lat: 33.3152, lng: 44.3661 });

  return (
    <div
      className={`rounded-md border overflow-hidden ${className}`}
      style={{ height, width }}
    >
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {coordinates.map((coord, index) => (
          <Marker
            key={`${coord.lat}-${coord.lng}-${index}`}
            position={[coord.lat, coord.lng]}
          >
            {showPopups && coord.popup && (
              <Popup>
                <div className="p-2">{coord.popup}</div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export const InteractiveMap: React.FC<StaticMapProps> = ({
  coordinates,
  height = "400px",
  width = "100%",
  zoom = 13,
  className = "",
  center,
  showPopups = false,
}) => {
  const mapCenter =
    center ||
    (coordinates.length > 0 ? coordinates[0] : { lat: 33.3152, lng: 44.3661 });

  return (
    <div
      className={`rounded-md border overflow-hidden ${className}`}
      style={{ height, width }}
    >
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {coordinates.map((coord, index) => (
          <Marker
            key={`${coord.lat}-${coord.lng}-${index}`}
            position={[coord.lat, coord.lng]}
          >
            {showPopups && coord.popup && (
              <Popup>
                <div className="p-2">{coord.popup}</div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

// Auto-fit version that shows all markers
import { useMap } from "react-leaflet";

// Component to handle auto-fitting
const AutoFitBounds: React.FC<{ coordinates: Coordinate[] }> = ({
  coordinates,
}) => {
  const map = useMap();

  React.useEffect(() => {
    if (coordinates.length > 0) {
      const group = new L.FeatureGroup(
        coordinates.map((coord) => L.marker([coord.lat, coord.lng]))
      );
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [coordinates, map]);

  return null;
};

export const AutoFitMap: React.FC<StaticMapProps> = ({
  coordinates,
  height = "800px",
  width = "100%",
  className = "",
  showPopups = false,
}) => {
  const fallbackCenter = { lat: 33.3152, lng: 44.3661 };

  // Filter out any invalid coordinates
  const validCoordinates = coordinates.filter(
    (coord) =>
      coord.lat != null &&
      coord.lng != null &&
      !isNaN(coord.lat) &&
      !isNaN(coord.lng)
  );

  return (
    <div
      className={`rounded-md border overflow-hidden ${className}`}
      style={{ height, width }}
    >
      <MapContainer
        center={[fallbackCenter.lat, fallbackCenter.lng]}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validCoordinates.map((coord, index) => (
          <Marker
            key={`${coord.lat}-${coord.lng}-${index}`}
            position={[coord.lat, coord.lng]}
          >
            {showPopups && coord.popup && (
              <Popup>
                <div className="p-2">{coord.popup}</div>
              </Popup>
            )}
          </Marker>
        ))}
        {validCoordinates.length > 0 && (
          <AutoFitBounds coordinates={validCoordinates} />
        )}
      </MapContainer>
    </div>
  );
};
