import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';

const DISASTER_LOCATION = [12.9716, 77.5946];

const HOSPITALS = {
    "City General Hospital": [12.9800, 77.6100],
    "District Hospital": [12.9650, 77.5800],
    "Local Clinic": [12.9600, 77.5700],
    "Field Medical Camp": [12.9550, 77.5600]
};

const ROUTES = {
    "Route A — Highway 4 via North Bridge": [
        [12.9716, 77.5946],
        [12.9740, 77.5990],
        [12.9770, 77.6040],
        [12.9800, 77.6100]
    ],
    "Route B — Main Street via East Gate": [
        [12.9716, 77.5946],
        [12.9700, 77.5870],
        [12.9670, 77.5830],
        [12.9650, 77.5800]
    ],
    "Route C — Service Road": [
        [12.9716, 77.5946],
        [12.9680, 77.5800],
        [12.9640, 77.5750],
        [12.9600, 77.5700]
    ],
    "Route D — River Path Emergency Only": [
        [12.9716, 77.5946],
        [12.9660, 77.5760],
        [12.9620, 77.5720],
        [12.9600, 77.5700]
    ]
};

function RouteBounds({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords && coords.length > 0) {
            map.fitBounds(coords, { padding: [50, 50] });
        }
    }, [coords, map]);
    return null;
}

export default function RescueMap({ plan }) {
    const [leafletLoaded, setLeafletLoaded] = useState(false);
    const [L, setL] = useState(null);

    useEffect(() => {
        // Fix leaflet CSS import issue in Next.js
        import("leaflet/dist/leaflet.css");
        const LLib = require('leaflet');
        setL(LLib);
        setLeafletLoaded(true);
    }, []);

    if (!plan) {
        return (
            <div style={{
                width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#050508', border: '2px solid #00F5FF', borderRadius: '15px',
                backgroundImage: 'linear-gradient(rgba(34,34,34,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,34,34,0.3) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }}>
                <p className="font-share-tech blink" style={{ color: '#aaa', fontSize: '24px', letterSpacing: '4px' }}>
                    AWAITING COORDINATES...
                </p>
            </div>
        );
    }

    // Guard against rendering if leaflet logic somehow bypassed hooks
    if (!leafletLoaded || !L) return <div style={{ height: '400px', backgroundColor: '#050508' }}></div>;

    const routeCoords = ROUTES[plan.route] || [DISASTER_LOCATION, HOSPITALS[plan.hospital]];
    const hospitalCoords = HOSPITALS[plan.hospital] || routeCoords[routeCoords.length - 1];

    let sevColor = "#00FF88"; // LOW
    const lowerSev = (plan.severity || "").toLowerCase();
    if (lowerSev.includes("high")) sevColor = "#FF2D2D";
    else if (lowerSev.includes("medium")) sevColor = "#FFB800";

    const emergencyIcon = L.divIcon({
        html: `<div class="pulse-red" style="width:20px; height:20px; background-color:#FF2D2D; border-radius:50%; box-shadow: 0 0 15px #FF2D2D;"></div>`,
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    const hospitalIcon = L.divIcon({
        html: `<div style="width:20px; height:20px; background-color:#00FF88; border: 2px solid white; border-radius:50%; box-shadow: 0 0 10px #00FF88;"></div>`,
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    return (
        <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '15px', overflow: 'hidden', border: '2px solid #00F5FF' }}>
            <MapContainer center={DISASTER_LOCATION} zoom={13} style={{ width: '100%', height: '100%', backgroundColor: '#050508' }} zoomControl={false}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; CARTO'
                />

                <Marker position={DISASTER_LOCATION} icon={emergencyIcon}>
                    <Popup><span style={{ color: '#000', fontWeight: 'bold' }}>🚨 DISASTER LOCATION</span></Popup>
                </Marker>

                <Marker position={hospitalCoords} icon={hospitalIcon}>
                    <Popup><span style={{ color: '#000', fontWeight: 'bold' }}>✚ {plan.hospital}</span></Popup>
                </Marker>

                <Polyline
                    positions={routeCoords}
                    pathOptions={{ color: sevColor, weight: 4, dashArray: '10, 15', opacity: 0.9 }}
                    className="slide-in-up"
                />

                <RouteBounds coords={routeCoords} />
            </MapContainer>

            {/* Info Box */}
            <div style={{
                position: 'absolute', top: '15px', right: '15px', zIndex: 1000,
                backgroundColor: 'rgba(5, 5, 8, 0.85)', border: `1px solid ${sevColor}`,
                padding: '15px', borderRadius: '10px', backdropFilter: 'blur(5px)',
                color: '#fff', maxWidth: '300px'
            }}>
                <h4 className="font-rajdhani" style={{ margin: '0 0 10px 0', fontSize: '20px', color: sevColor, borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                    AURA ACTIVE ROUTE
                </h4>
                <div className="font-share-tech" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <p style={{ margin: '5px 0' }}><strong style={{ color: '#888' }}>NAME:</strong> {plan.route}</p>
                    <p style={{ margin: '5px 0' }}><strong style={{ color: '#888' }}>TEAMS:</strong> {typeof plan.teams === 'object' ? plan.teams.length : plan.teams}</p>
                    <p style={{ margin: '5px 0' }}><strong style={{ color: '#888' }}>DEST:</strong> {plan.hospital}</p>
                </div>
            </div>

            <style>{`
                /* Add a subtle animation to the dashed border to simulate movement */
                .leaflet-interactive {
                    animation: dash 20s linear infinite;
                }
                @keyframes dash {
                    to {
                        stroke-dashoffset: -100;
                    }
                }
            `}</style>
        </div>
    );
}
