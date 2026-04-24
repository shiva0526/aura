import { useState, useEffect } from "react"
import { getFinal } from "../utils/api"

export default function HospitalAlert() {
    const [plan, setPlan] = useState(null)
    const [acknowledged, setAcknowledged] = useState(false)
    const [checkedActions, setCheckedActions] = useState({})

    useEffect(() => {
        const fetchData = async () => {
            const newPlan = await getFinal()
            setPlan(prevPlan => {
                if (JSON.stringify(prevPlan) !== JSON.stringify(newPlan)) {
                    setAcknowledged(false)
                    setCheckedActions({})
                }
                return newPlan
            })
        }

        fetchData()
        const intervalId = setInterval(fetchData, 3000)

        return () => clearInterval(intervalId)
    }, [])

    const toggleCheck = (idx) => {
        setCheckedActions(prev => ({ ...prev, [idx]: !prev[idx] }))
    }

    const getSeverityStyles = (severity) => {
        const lower = (severity || "").toLowerCase()
        if (lower.includes("high")) return { border: "#FF2D2D", bg: "#440000", glow: "flash-border-red", header: "🚨 MASS CASUALTY ALERT", color: "#FF2D2D" }
        if (lower.includes("medium")) return { border: "#FFB800", bg: "#332200", glow: "none", header: "⚠️ URGENT MEDICAL ALERT", color: "#FFB800" }
        if (lower.includes("low")) return { border: "#00F5FF", bg: "#002233", glow: "none", header: "📋 INCOMING PATIENTS", color: "#00F5FF" }
        return { border: "#333", bg: "#111", glow: "none", header: "📋 INCOMING ALERT", color: "#fff" }
    }

    if (!plan || plan.status === "waiting") {
        return (
            <main style={{ minHeight: '100vh', backgroundColor: '#050508', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <style>{`
                    @keyframes pulse-cross {
                        0% { transform: scale(1); opacity: 0.8; }
                        50% { transform: scale(1.2); opacity: 1; text-shadow: 0 0 40px #FF2D2D; }
                        100% { transform: scale(1); opacity: 0.8; }
                    }
                    @keyframes flatline {
                        0% { background-position: 100% 0; }
                        100% { background-position: -100% 0; }
                    }
                `}</style>
                <div style={{ fontSize: '100px', color: '#FF2D2D', animation: 'pulse-cross 2s infinite' }}>
                    ✚
                </div>
                <h1 className="font-rajdhani" style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0', letterSpacing: '2px' }}>
                    HOSPITAL ALERT TERMINAL
                </h1>
                <p className="font-share-tech uppercase" style={{ color: '#00FF88', fontSize: '24px', letterSpacing: '4px' }}>
                    ALL CLEAR — NO INCOMING ALERTS
                </p>

                {/* Subtly animated flatline */}
                <div style={{ position: 'absolute', bottom: '50px', width: '300px', height: '2px', backgroundColor: '#222', overflow: 'hidden' }}>
                    <div style={{
                        width: '50px', height: '100%',
                        background: 'linear-gradient(90deg, transparent, #00FF88, transparent)',
                        animation: 'flatline 3s linear infinite'
                    }} />
                </div>
            </main>
        )
    }

    const sevStyles = getSeverityStyles(plan.severity)
    const actionsList = plan.actions || []
    const checkedCount = Object.values(checkedActions).filter(Boolean).length
    const progressPerc = actionsList.length > 0 ? (checkedCount / actionsList.length) * 100 : 0

    return (
        <main style={{ minHeight: '100vh', backgroundColor: '#050508', color: '#fff', padding: '40px', boxSizing: 'border-box' }}>
            <style>{`
                @keyframes flash-border-red {
                    0% { border-color: #FF2D2D; box-shadow: inset 0 0 50px rgba(255,45,45,0.4), 0 0 30px rgba(255,45,45,0.3); }
                    50% { border-color: #550000; box-shadow: inset 0 0 10px rgba(255,45,45,0.1), 0 0 5px rgba(255,45,45,0.1); }
                    100% { border-color: #FF2D2D; box-shadow: inset 0 0 50px rgba(255,45,45,0.4), 0 0 30px rgba(255,45,45,0.3); }
                }
            `}</style>

            <div style={{
                border: `4px solid ${sevStyles.border}`,
                backgroundColor: '#0a0a0f',
                padding: '40px',
                animation: sevStyles.glow === 'flash-border-red' ? 'flash-border-red 1.5s infinite' : 'none',
                minHeight: 'calc(100vh - 80px)',
                display: 'flex', flexDirection: 'column'
            }}>

                {/* Header */}
                <div style={{ backgroundColor: sevStyles.color, padding: '20px', textAlign: 'center', marginBottom: '40px' }}>
                    <h1 className="font-rajdhani" style={{ fontSize: '48px', color: '#fff', margin: 0, fontWeight: 'bold', letterSpacing: '3px' }}>
                        {sevStyles.header}
                    </h1>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>

                    <div style={{ backgroundColor: '#111', padding: '25px', border: '1px solid #333' }}>
                        <p style={{ color: '#888', margin: '0 0 10px 0', fontSize: '18px' }}>SEVERITY LEVEL</p>
                        <div style={{ display: 'inline-block', backgroundColor: sevStyles.bg, border: `1px solid ${sevStyles.border}`, padding: '10px 20px' }}>
                            <span className="font-rajdhani" style={{ fontSize: '32px', color: sevStyles.color, fontWeight: 'bold' }}>
                                {plan.severity || 'UNKNOWN'}
                            </span>
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#111', padding: '25px', border: '1px solid #333' }}>
                        <p style={{ color: '#888', margin: '0 0 10px 0', fontSize: '18px' }}>TEAMS DISPATCHED</p>
                        <p className="font-share-tech" style={{ fontSize: '48px', color: '#fff', margin: 0 }}>
                            {Array.isArray(plan.teams) ? plan.teams.length : plan.teams || 0}
                        </p>
                    </div>

                    <div style={{ backgroundColor: '#111', padding: '25px', border: '1px solid #333' }}>
                        <p style={{ color: '#888', margin: '0 0 10px 0', fontSize: '18px' }}>INCOMING ROUTE</p>
                        <p className="font-share-tech" style={{ fontSize: '24px', color: '#00F5FF', margin: 0 }}>
                            ➔ {plan.route || 'N/A'}
                        </p>
                    </div>

                    <div style={{ backgroundColor: '#111', padding: '25px', border: '1px solid #333' }}>
                        <p style={{ color: '#888', margin: '0 0 10px 0', fontSize: '18px' }}>EXPECTED PATIENTS</p>
                        <p className="font-share-tech" style={{ fontSize: '48px', color: '#fff', margin: 0 }}>
                            {plan.patients || plan.target_count || plan.status || 'UNKNOWN'}
                        </p>
                    </div>
                </div>

                {/* Actions Panel */}
                <div style={{ backgroundColor: '#111', padding: '30px', border: '1px solid #333', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                        <h2 className="font-rajdhani" style={{ fontSize: '32px', color: '#FFB800', margin: 0 }}>PREPARE IMMEDIATELY</h2>
                        <span className="font-share-tech" style={{ color: '#888', fontSize: '24px' }}>{checkedCount} / {actionsList.length} COMPLETED</span>
                    </div>

                    <div style={{ width: '100%', height: '8px', backgroundColor: '#222', marginBottom: '30px' }}>
                        <div style={{ height: '100%', width: `${progressPerc}%`, backgroundColor: '#00FF88', transition: 'width 0.3s ease' }}></div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {actionsList.map((action, i) => {
                            const isChecked = !!checkedActions[i]
                            return (
                                <div key={i} onClick={() => toggleCheck(i)} style={{
                                    display: 'flex', alignItems: 'center', padding: '15px',
                                    backgroundColor: isChecked ? 'rgba(0, 255, 136, 0.1)' : '#0a0a0f',
                                    border: isChecked ? '1px solid #00FF88' : '1px solid #333',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}>
                                    <div style={{
                                        width: '24px', height: '24px', marginRight: '20px',
                                        border: isChecked ? 'none' : '2px solid #555',
                                        backgroundColor: isChecked ? '#00FF88' : 'transparent',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                                    }}>
                                        {isChecked && <span style={{ color: '#000', fontWeight: 'bold' }}>✓</span>}
                                    </div>
                                    <span style={{
                                        fontSize: '20px', color: isChecked ? '#00FF88' : '#ccc',
                                        textDecoration: isChecked ? 'line-through' : 'none'
                                    }}>
                                        {action}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Acknowledge Button */}
                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                    {!acknowledged ? (
                        <button
                            onClick={() => setAcknowledged(true)}
                            className="font-rajdhani"
                            style={{
                                backgroundColor: '#FF2D2D', color: '#fff', border: 'none',
                                padding: '20px 60px', fontSize: '32px', fontWeight: 'bold',
                                cursor: 'pointer', letterSpacing: '4px',
                                boxShadow: '0 0 30px rgba(255, 45, 45, 0.5)'
                            }}
                        >
                            ACKNOWLEDGE ALERT
                        </button>
                    ) : (
                        <div style={{
                            backgroundColor: 'rgba(0, 255, 136, 0.1)', border: '2px solid #00FF88',
                            padding: '20px 60px', color: '#00FF88', fontSize: '32px',
                            fontWeight: 'bold', letterSpacing: '4px', display: 'flex', alignItems: 'center', gap: '20px'
                        }}>
                            <span>✅</span> ACKNOWLEDGED — PREPARING RESPONSE
                        </div>
                    )}
                </div>

            </div>
        </main>
    )
}
