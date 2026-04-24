import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle } from 'react-leaflet';
import L from 'leaflet';

export default function RescueMap({ officers = [], hospitals = [] }) {
    useEffect(() => {
        // Fix default icon issue with Leaflet in React
        delete L.Icon.Default.prototype._getIconUrl;

        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
    }, []);

    const mapCenter = [12.4244, 75.7382];
    const disasterBounds = [
        [12.4050, 75.7200],
        [12.4350, 75.7450],
    ];

    const disasterZoneOptions = { color: 'red', fillColor: '#ff0000', fillOpacity: 0.2 };

    const hospitalIcon = L.divIcon({ className: 'custom-hospital-icon', html: '<div style="background-color: #ef4444; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 0 15px rgba(239, 68, 68, 0.8);">🏥</div>', iconSize: [32, 32], iconAnchor: [16, 16] });
    const teamIcon = L.divIcon({ className: 'custom-team-icon', html: '<div style="background-color: #3b82f6; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8); color: white; font-weight: bold;">T</div>', iconSize: [28, 28], iconAnchor: [14, 14] });

    return (
        <div style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Dynamic Ground Teams */}
                {officers.map((off, idx) => (
                    <Marker key={off.id || idx} position={[off.lat, off.lon]} icon={teamIcon}>
                        <Popup>{off.name} - Status: {off.status}</Popup>
                    </Marker>
                ))}

                {/* Dynamic Hospitals */}
                {hospitals.map((h, idx) => (
                    <Marker key={h.id || idx} position={[h.lat, h.lon]} icon={hospitalIcon}>
                        <Popup>{h.name}</Popup>
                    </Marker>
                ))}

                {/* Disaster Bounding Box */}
                <Rectangle bounds={disasterBounds} pathOptions={disasterZoneOptions} />
            </MapContainer>
        </div>
    );
}
