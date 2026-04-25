import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

function LocationCollector({ onMapClick }) {
    const map = useMapEvents({
        click(e) {
            if (onMapClick) onMapClick(e.latlng);
        }
    });

    useEffect(() => {
        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 300);
    }, [map]);

    return null;
}

export default function RescueMap({ officers = [], hospitals = [], activeRoute = null, onMapClick }) {
    const [routeCoords, setRouteCoords] = useState([]);
    useEffect(() => {
        // Fix default icon issue with Leaflet in React
        delete L.Icon.Default.prototype._getIconUrl;

        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
    }, []);

    useEffect(() => {
        if (!activeRoute) {
            setTimeout(() => setRouteCoords([]), 0);
            return;
        }

        const fetchRoute = async () => {
            try {
                let coords = [];
                // Segment 1: Officer -> Victim
                const url1 = `https://router.project-osrm.org/route/v1/driving/${activeRoute.start[1]},${activeRoute.start[0]};${activeRoute.via[1]},${activeRoute.via[0]}?overview=full&geometries=geojson`;
                const res1 = await fetch(url1);
                const data1 = await res1.json();
                if (data1.routes && data1.routes.length > 0) {
                    const mapped1 = data1.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                    coords = [...coords, activeRoute.start, ...mapped1, activeRoute.via];
                }

                // Segment 2: Victim -> Hospital
                const url2 = `https://router.project-osrm.org/route/v1/driving/${activeRoute.via[1]},${activeRoute.via[0]};${activeRoute.end[1]},${activeRoute.end[0]}?overview=full&geometries=geojson`;
                const res2 = await fetch(url2);
                const data2 = await res2.json();
                if (data2.routes && data2.routes.length > 0) {
                    const mapped2 = data2.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                    coords = [...coords, activeRoute.via, ...mapped2, activeRoute.end];
                }

                setRouteCoords(coords);
            } catch (err) {
                console.error("OSRM Routing Error:", err);
            }
        };
        fetchRoute();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(activeRoute)]);

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
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', cursor: onMapClick ? 'crosshair' : 'grab' }}>
                <LocationCollector onMapClick={onMapClick} />
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

                {/* Turn-by-turn Route */}
                {routeCoords.length > 0 && (
                    <Polyline positions={routeCoords} color="#3b82f6" weight={5} opacity={0.8} dashArray="10, 10" />
                )}

                {/* Dynamic SOS Marker */}
                {activeRoute && (
                    <Marker position={activeRoute.via} icon={L.divIcon({ className: 'sos-icon', html: '🚨', iconSize: [24, 24], iconAnchor: [12, 12] })} />
                )}

                {/* Disaster Bounding Box */}
                <Rectangle bounds={disasterBounds} pathOptions={disasterZoneOptions} />
            </MapContainer>
        </div>
    );
}
