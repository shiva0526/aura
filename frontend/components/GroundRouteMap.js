import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

export default function GroundRouteMap({ officerPos, victimPos, hospitalPos }) {
    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
    }, []);

    if (!officerPos || !victimPos || !hospitalPos) return null;

    const center = [victimPos[0], victimPos[1]];

    const officerIcon = L.divIcon({
        className: 'custom-icon',
        html: '<div style="background:#3b82f6;width:32px;height:32px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 0 15px rgba(59,130,246,0.8);">🧑‍✈️</div>',
        iconSize: [32, 32], iconAnchor: [16, 16]
    });

    const victimIcon = L.divIcon({
        className: 'custom-icon',
        html: '<div style="background:#ef4444;width:36px;height:36px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 20px rgba(239,68,68,0.9);animation:pulse 1.5s infinite;">🆘</div>',
        iconSize: [36, 36], iconAnchor: [18, 18]
    });

    const hospitalIcon = L.divIcon({
        className: 'custom-icon',
        html: '<div style="background:#22c55e;width:32px;height:32px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 0 15px rgba(34,197,94,0.8);">🏥</div>',
        iconSize: [32, 32], iconAnchor: [16, 16]
    });

    // Route: Officer → Victim → Hospital
    const routePositions = [officerPos, victimPos, hospitalPos];

    return (
        <div style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
            <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Route polyline */}
                <Polyline
                    positions={routePositions}
                    pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.9, dashArray: '12, 8' }}
                />

                {/* Officer marker */}
                <Marker position={officerPos} icon={officerIcon}>
                    <Popup><b>Ground Officer</b><br />Start Point</Popup>
                </Marker>

                {/* Victim marker */}
                <Marker position={victimPos} icon={victimIcon}>
                    <Popup><b>🆘 Victim Location</b><br />Rescue Target</Popup>
                </Marker>

                {/* Hospital marker */}
                <Marker position={hospitalPos} icon={hospitalIcon}>
                    <Popup><b>🏥 Hospital</b><br />Evacuation Point</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
