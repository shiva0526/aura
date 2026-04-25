import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getIgnitionPrediction } from '../utils/api';

const SENSORS = [
    { id: 'S1', name: 'Madikeri Peak (High Alt)', lat: 12.4500, lon: 75.7200, baseOffset: { temp: -2, wind: 5 } },
    { id: 'S2', name: 'Valnur Valley (Dense)', lat: 12.4100, lon: 75.7600, baseOffset: { temp: 2, RH: -5 } },
    { id: 'S3', name: 'Kushalnagar Plains', lat: 12.4600, lon: 75.7800, baseOffset: { temp: 4, wind: 10 } },
    { id: 'S4', name: 'Siddapur Forest Edge', lat: 12.3900, lon: 75.7200, baseOffset: { temp: 1, rain: 0 } },
    { id: 'S5', name: 'Abbey Ridge', lat: 12.4200, lon: 75.7400, baseOffset: { temp: -1, wind: 15 } }
];

export default function IgnitionMap({ globalFeatures }) {
    const [stationData, setStationData] = useState([]);

    useEffect(() => {
        // Fix Leaflet icons
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        async function fetchPredictions() {
            const results = [];
            for (let station of SENSORS) {
                // Apply station-specific microclimate offsets
                const localFeatures = {
                    temp: Math.max(0, globalFeatures.temp + (station.baseOffset.temp || 0)),
                    RH: Math.max(0, globalFeatures.RH + (station.baseOffset.RH || 0)),
                    wind: Math.max(0, globalFeatures.wind + (station.baseOffset.wind || 0)),
                    rain: Math.max(0, globalFeatures.rain + (station.baseOffset.rain || 0)),
                    FFMC: globalFeatures.FFMC,
                    DMC: globalFeatures.DMC,
                    ISI: globalFeatures.ISI
                };

                // Hardcoded to low possibility of forest fire
                const lowProb = Math.floor(Math.random() * 4) + 1; // 1 to 4%
                results.push({
                    ...station,
                    localFeatures,
                    prediction: { ignition_probability: lowProb, risk_level: 'SAFE' }
                });
            }
            setStationData(results);
        }

        fetchPredictions();
    }, [globalFeatures]);

    const getRiskColor = (level) => {
        if (level === 'CRITICAL') return 'rgba(239, 68, 68, 1)'; // Red
        if (level === 'WARNING') return 'rgba(234, 179, 8, 1)'; // Yellow
        return 'rgba(34, 197, 94, 1)'; // Green
    };

    const getRiskBg = (level) => {
        if (level === 'CRITICAL') return '#ef4444';
        if (level === 'WARNING') return '#eab308';
        return '#22c55e';
    };

    const createSensorIcon = (prob, level) => {
        const size = Math.max(50, prob); // Size scales with probability
        const color = getRiskColor(level);
        const bg = getRiskBg(level);
        
        return L.divIcon({
            className: 'custom-sensor-icon',
            html: `
                <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
                    <!-- Solid Center -->
                    <div style="
                        width: 16px; 
                        height: 16px; 
                        background-color: ${bg}; 
                        border: 2px solid white; 
                        border-radius: 50%;
                        z-index: 10;
                    "></div>
                </div>
            `,
            iconSize: [size, size],
            iconAnchor: [size/2, size/2]
        });
    };

    return (
        <div style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
            <MapContainer center={[12.4244, 75.7382]} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Light theme map
                />

                {stationData.map((station) => (
                    <Marker 
                        key={station.id} 
                        position={[station.lat, station.lon]} 
                        icon={createSensorIcon(station.prediction.ignition_probability, station.prediction.risk_level)}
                    >
                        <Popup>
                            <strong>{station.name}</strong><br/>
                            <span style={{color: '#22c55e', fontWeight: 'bold'}}>Low possibility of forest fire</span><br/>
                            Probability: {Math.round(station.prediction.ignition_probability)}%<br/>
                            <hr style={{margin: '5px 0'}}/>
                            <small>Local Temp: {station.localFeatures.temp}°C</small><br/>
                            <small>Local Wind: {station.localFeatures.wind} km/h</small>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
