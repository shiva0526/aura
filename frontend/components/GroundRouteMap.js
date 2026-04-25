import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

export default function GroundRouteMap({ officerPos, victimPos, hospitalPos, routeLeg }) {
    const [sosRoute, setSosRoute] = useState([]);
    const [hospitalRoute, setHospitalRoute] = useState([]);

    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
    }, []);

    useEffect(() => {
        if (!officerPos || !victimPos || !hospitalPos) {
            setTimeout(() => {
                setSosRoute([]);
                setHospitalRoute([]);
            }, 0);
            return;
        }

        const fetchAllRoutes = async () => {
            try {
                // Segment 1: Officer -> Victim
                const url1 = `https://router.project-osrm.org/route/v1/driving/${officerPos[1]},${officerPos[0]};${victimPos[1]},${victimPos[0]}?overview=full&geometries=geojson`;
                const res1 = await fetch(url1);
                const data1 = await res1.json();
                let sosPart = [];
                if (data1.routes && data1.routes.length > 0) {
                    const mapped = data1.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                    sosPart = [officerPos, ...mapped, victimPos];
                    setSosRoute(sosPart);
                }

                // Segment 2: Victim -> Hospital
                const url2 = `https://router.project-osrm.org/route/v1/driving/${victimPos[1]},${victimPos[0]};${hospitalPos[1]},${hospitalPos[0]}?overview=full&geometries=geojson`;
                const res2 = await fetch(url2);
                const data2 = await res2.json();
                let hospPart = [];
                if (data2.routes && data2.routes.length > 0) {
                    const mapped = data2.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                    hospPart = [victimPos, ...mapped, hospitalPos];
                    setHospitalRoute(hospPart);
                }
            } catch (err) {
                console.error("OSRM Routing Error:", err);
            }
        };
        fetchAllRoutes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(officerPos), JSON.stringify(victimPos), JSON.stringify(hospitalPos)]);

    let activeCoords = [];
    if (routeLeg === 'sos') activeCoords = sosRoute;
    else if (routeLeg === 'hospital') activeCoords = hospitalRoute;
    else if (routeLeg === 'full') activeCoords = [...sosRoute, ...hospitalRoute];

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
                {routeLeg && activeCoords.length > 0 && (
                    <Polyline
                        positions={activeCoords}
                        pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.9, dashArray: '12, 8' }}
                    />
                )}

                {/* Officer marker */}
                {(!routeLeg || routeLeg === 'full' || routeLeg === 'sos') && (
                    <Marker position={officerPos} icon={officerIcon}>
                        <Popup><b>Ground Officer</b><br />Start Point</Popup>
                    </Marker>
                )}

                {/* Victim marker */}
                {(!routeLeg || routeLeg === 'full' || routeLeg === 'sos' || routeLeg === 'hospital') && (
                    <Marker position={victimPos} icon={victimIcon}>
                        <Popup><b>🆘 Victim Location</b><br />Rescue Target</Popup>
                    </Marker>
                )}

                {/* Hospital marker */}
                {(!routeLeg || routeLeg === 'full' || routeLeg === 'hospital') && (
                    <Marker position={hospitalPos} icon={hospitalIcon}>
                        <Popup><b>🏥 Hospital</b><br />Evacuation Point</Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
}
