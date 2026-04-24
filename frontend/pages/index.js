import { useState, useEffect } from 'react'
import { getStatus, getOracle, getPlan } from '../utils/api'

export default function CommandCenter() {
    const [status, setStatus] = useState(null)
    const [oracle, setOracle] = useState(null)
    const [plan, setPlan] = useState(null)
    const [time, setTime] = useState("")

    useEffect(() => {
        const updateClock = () => {
            const now = new Date()
            setTime(now.toLocaleTimeString('en-US', { hour12: false }))
        }
        updateClock()
        const clockId = setInterval(updateClock, 1000)

        const fetchData = async () => {
            setStatus(await getStatus())
            setOracle(await getOracle())
            setPlan(await getPlan())
        }
        fetchData()
        const dataId = setInterval(fetchData, 2000)

        return () => {
            clearInterval(clockId)
            clearInterval(dataId)
        }
    }, [])

    const getSeverityColor = (sev) => {
        const lower = (sev || "").toLowerCase()
        if (lower.includes("high")) return "#FF2D2D"
        if (lower.includes("medium")) return "#FFB800"
        return "#00F5FF"
    }

    const oracleSevColor = oracle ? getSeverityColor(oracle.severity_level || oracle.severity) : "#444"

    return (
        <div style={{ minHeight: '100vh', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Top Bar */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #FF2D2D', paddingBottom: '10px' }}>
                <h1 className="font-rajdhani" style={{ fontSize: '32px', margin: 0, fontWeight: 'bold' }}>
                    AURA COMMAND CENTER
                </h1>
                <span className="font-share-tech" style={{ fontSize: '24px', color: '#00F5FF', minWidth: '120px', textAlign: 'right' }}>
                    {time}
                </span>
            </header>

            {/* Pipeline Status Row */}
            <div style={{ display: 'flex', gap: '20px' }}>
                {['PULSE', 'ORACLE', 'COMPASS', 'SHIELD'].map(layer => {
                    const active = status && status[layer.toLowerCase()]
                    return (
                        <div key={layer} style={{
                            flex: 1, padding: '15px 20px',
                            border: active ? '1px solid #00F5FF' : '1px solid #222',
                            backgroundColor: active ? 'rgba(0, 245, 255, 0.05)' : '#0a0a0a',
                            color: active ? '#fff' : '#444',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            transition: 'all 0.5s ease',
                            boxShadow: active ? 'inset 0 0 15px rgba(0,245,255,0.1)' : 'none'
                        }}>
                            <span className="font-rajdhani" style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px' }}>
                                {layer}
                            </span>
                            <div style={{
                                width: '12px', height: '12px', borderRadius: '50%',
                                backgroundColor: active ? '#00FF88' : '#222',
                                boxShadow: active ? '0 0 10px #00FF88' : 'none',
                                animation: active ? 'blink 2s infinite' : 'none'
                            }}></div>
                        </div>
                    )
                })}
            </div>

            {/* Main Grid */}
            <div style={{ display: 'flex', gap: '20px', flex: 1 }}>

                {/* Left Oracle Panel */}
                <div style={{ flex: 1, border: '1px solid #222', padding: '25px', backgroundColor: '#08080a', display: 'flex', flexDirection: 'column' }}>
                    <h2 className="font-rajdhani" style={{ borderBottom: '1px outset #333', paddingBottom: '10px', fontSize: '24px', margin: '0 0 20px 0', color: '#666' }}>
                        ORACLE PANEL
                    </h2>
                    {oracle ? (
                        <div className="slide-in-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h1 className="font-rajdhani" style={{ fontSize: '64px', color: oracleSevColor, margin: '0 0 10px 0', textShadow: `0 0 20px ${oracleSevColor}`, textTransform: 'uppercase' }}>
                                {oracle.severity_level || oracle.severity || "UNKNOWN"}
                            </h1>

                            <div style={{ margin: '15px 0' }}>
                                <span className="font-share-tech" style={{ letterSpacing: '2px' }}>THREAT SCORE: {oracle.severity_score || oracle.score || 0}/100</span>
                                <div style={{ width: '100%', height: '8px', backgroundColor: '#111', marginTop: '10px' }}>
                                    <div style={{ height: '100%', width: `${oracle.severity_score || oracle.score || 0}%`, backgroundColor: oracleSevColor, transition: 'width 1s ease' }}></div>
                                </div>
                            </div>

                            <p className="font-share-tech" style={{ color: '#00F5FF', borderLeft: '4px solid #00F5FF', paddingLeft: '15px', margin: '20px 0', lineHeight: '1.5' }}>
                                {oracle.wildfire_forecast || "NO FORECAST AVAILABLE"}
                            </p>

                            {oracle.weather && (
                                <div className="font-share-tech" style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', borderTop: '1px dashed #333', paddingTop: '20px', color: '#aaa' }}>
                                    <div><span style={{ color: '#555' }}>WND:</span> {oracle.weather.wind_speed} km/h</div>
                                    <div><span style={{ color: '#555' }}>HUM:</span> {oracle.weather.humidity}%</div>
                                    <div><span style={{ color: '#555' }}>TMP:</span> {oracle.weather.temperature}°C</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="font-share-tech blink" style={{ color: '#444', fontSize: '18px', letterSpacing: '4px' }}>WAITING FOR SIGNAL...</p>
                        </div>
                    )}
                </div>

                {/* Right Compass Panel */}
                <div style={{ flex: 1, border: '1px solid #222', padding: '25px', backgroundColor: '#08080a', display: 'flex', flexDirection: 'column' }}>
                    <h2 className="font-rajdhani" style={{ borderBottom: '1px outset #333', paddingBottom: '10px', fontSize: '24px', margin: '0 0 20px 0', color: '#666' }}>
                        COMPASS PANEL
                    </h2>
                    {plan ? (
                        <div className="slide-in-up font-share-tech" style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px', marginBottom: '20px' }}>
                                <h1 style={{ fontSize: '80px', margin: 0, color: '#00FF88', lineHeight: '1' }}>
                                    {Array.isArray(plan.teams) ? plan.teams.length : plan.teams || 0}
                                </h1>
                                <span style={{ color: '#555', letterSpacing: '2px', fontSize: '20px' }}>ACTIVE TEAMS</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderLeft: '2px dotted #333', paddingLeft: '20px', margin: '30px 0' }}>
                                <p style={{ fontSize: '18px' }}><span style={{ color: '#00F5FF', marginRight: '10px' }}>➔</span> {plan.route || "CALCULATING CAUTION ROUTE..."}</p>
                                <p style={{ fontSize: '18px' }}><span style={{ color: '#FF2D2D', marginRight: '10px' }}>✚</span> {plan.hospital || "STANDBY HOSPITAL"}</p>
                            </div>

                            <div style={{ marginTop: '30px', backgroundColor: '#111', padding: '20px' }}>
                                <span style={{ color: '#FFB800', letterSpacing: '2px', display: 'block', marginBottom: '15px' }}>REQUIRED ACTIONS</span>
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {(plan.actions || []).map((action, i) => (
                                        <li key={i} style={{ borderBottom: '1px solid #222', paddingBottom: '8px', color: '#ccc' }}>
                                            <span style={{ color: '#444', marginRight: '10px' }}>[0{i + 1}]</span> {action}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="font-share-tech blink" style={{ color: '#444', fontSize: '18px', letterSpacing: '4px' }}>STANDBY...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Map */}
            <div style={{ border: '1px solid #222', backgroundColor: '#030303', margin: '0' }}>
                {plan ? (
                    <div className="slide-in-up" style={{ padding: '10px' }}>
                        <iframe
                            src="http://localhost:8000/map"
                            style={{ width: '100%', height: '400px', border: '1px solid #00F5FF', filter: 'hue-rotate(180deg) invert(90%) opacity(0.8) grayscale(50%)' }}
                            title="Rescue Map"
                        />
                    </div>
                ) : (
                    <div style={{
                        width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundImage: 'linear-gradient(rgba(34,34,34,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,34,34,0.3) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}>
                        <p className="font-rajdhani blink" style={{ color: '#FF2D2D', fontSize: '24px', letterSpacing: '2px', textShadow: '0 0 10px rgba(255,45,45,0.5)' }}>
                            ROUTE MAP LOADS AFTER SOS DETECTED
                        </p>
                    </div>
                )}
            </div>

        </div>
    )
}
