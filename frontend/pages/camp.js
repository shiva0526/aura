import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'
import React from 'react'
import { LayoutDashboard, MessageSquare, Users, Settings, Bell, Search, Map, MapPin, Crosshair, AlertTriangle, CheckCircle2, Navigation, Radio, Moon, Sun, Activity, Plus, X } from 'lucide-react'
import { getOfficers, deployOfficer, getFinal } from '../utils/api'
import dynamic from 'next/dynamic'
import IgnitionWidget from '../components/IgnitionWidget'

// Dynamically import the map so it only loads in the browser
const RescueMap = dynamic(() => import('../components/RescueMap'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">Initializing Satellite Uplink...</div>
})

const hospitals = [
  { id: 'H1', name: 'Madikeri Base Camp & Triage', lat: 12.4400, lon: 75.7500 },
  { id: 'H2', name: 'Kushalnagar Relief Hospital', lat: 12.4550, lon: 75.7150 },
  { id: 'H3', name: 'Siddapur Field Clinic', lat: 12.3950, lon: 75.7800 }
];

function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function CampDashboard() {
  const [darkMode, setDarkMode] = useState(true)
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: '', lat: '', lon: '' })
  const [officers, setOfficers] = useState([
    { id: 'GO-01', name: 'Officer Alpha', lat: 12.4100, lon: 75.7300, status: 'Active' },
    { id: 'GO-02', name: 'Officer Bravo', lat: 12.4300, lon: 75.7100, status: 'Active' },
    { id: 'GO-03', name: 'Officer Charlie', lat: 12.4000, lon: 75.7600, status: 'Active' }
  ])
  const [mission, setMission] = useState(null)
  const [pendingMission, setPendingMission] = useState(null)
  const [lastSeenMissionId, setLastSeenMissionId] = useState(null)
  const handledMissions = useRef(new Set())
  const isFirstFetch = useRef(true)

  // Real-time Polling
  useEffect(() => {
    let isSubscribed = true;
    const poll = async () => {
      const offData = await getOfficers();
      const currentOfficers = (offData && offData.length > 0) ? offData : officers;
      if (offData && offData.length > 0 && isSubscribed) setOfficers(offData);

      try {
        const res = await fetch("http://localhost:8000/final?t=" + Date.now(), { cache: "no-store" });
        if (res.ok && isSubscribed) {
          const finalData = await res.json();

          if (finalData && finalData.mission_id) {
            setMission(finalData);

            // First fetch: just record the existing mission_id, don't trigger UI
            if (isFirstFetch.current) {
              setLastSeenMissionId(finalData.mission_id);
              isFirstFetch.current = false;
              return;
            }

            // Only trigger on genuinely NEW missions
            if (finalData.mission_id !== lastSeenMissionId && !handledMissions.current.has(finalData.mission_id) && !pendingMission) {
              let activeOfficers = currentOfficers.filter(o => o.status === 'Active' || o.status === 'available');
              if (activeOfficers.length > 0) {
                const targetLat = finalData.lat || 12.4200;
                const targetLon = finalData.lon || 75.7400;
                const targetHosp = finalData.hospital || 'Madikeri Base Camp & Triage';

                // Hackathon: randomly pick any active ground station
                const closest = activeOfficers[Math.floor(Math.random() * activeOfficers.length)];

                setPendingMission({
                  mission_id: finalData.mission_id,
                  officerId: closest.id,
                  lat: targetLat,
                  lon: targetLon,
                  hospital: targetHosp,
                  severity: finalData.severity || 'CRITICAL'
                });
                setLastSeenMissionId(finalData.mission_id);
              }
            }
          } else {
            // Backend returned "waiting" or no mission — mark first fetch done
            if (isFirstFetch.current) isFirstFetch.current = false;
          }
        }
      } catch (e) {
        if (isFirstFetch.current) isFirstFetch.current = false;
      }
    };

    poll(); // Initial
    const interval = setInterval(poll, 5000);
    return () => { isSubscribed = false; clearInterval(interval); };
  }, [pendingMission, lastSeenMissionId]);

  const handleApprove = (officerId) => {
    if (!pendingMission) return;
    setOfficers(prev => prev.map(o => o.id === officerId ? { ...o, status: 'En Route', current_task_id: pendingMission.mission_id } : o));
    handledMissions.current.add(pendingMission.mission_id);
    setPendingMission(null);
  }

  const handleDeny = () => {
    if (!pendingMission) return;
    handledMissions.current.add(pendingMission.mission_id);
    setPendingMission(null);
  }

  const toggleTheme = () => setDarkMode(!darkMode)

  const handleDeploy = async (e) => {
    e.preventDefault()
    if (!newTeam.name || !newTeam.lat || !newTeam.lon) return

    const result = await deployOfficer({
      name: newTeam.name,
      lat: parseFloat(newTeam.lat),
      lon: parseFloat(newTeam.lon)
    });

    if (result) {
      setNewTeam({ name: '', lat: '', lon: '' })
      setShowDeployModal(false)
      // Polling will pick up the new team
    }
  }

  const themeClasses = darkMode
    ? "bg-slate-950 text-slate-200"
    : "bg-gradient-to-br from-blue-50 via-white to-blue-50 text-[#18181B]"

  const cardClasses = darkMode
    ? "bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl shadow-black/20"
    : "bg-white/80 backdrop-blur-md border-white shadow-xl shadow-blue-900/5"

  const sidebarClasses = darkMode
    ? "bg-slate-950 border-slate-800"
    : "bg-white/80 backdrop-blur-xl border-white"

  return (
    <div className={`min-h-screen flex font-inter transition-colors duration-500 overflow-hidden ${themeClasses}`}>
      <Head>
        <title>COMMAND CENTER | AURA</title>
      </Head>

      {/* Sidebar */}
      <div className={`w-20 border-r flex flex-col items-center py-8 gap-8 z-30 transition-colors duration-500 ${sidebarClasses}`}>
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/30 mb-4 transition-transform hover:scale-105 active:scale-95 cursor-pointer">*</div>
        <button className="text-white bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-md shadow-blue-500/20"><LayoutDashboard size={24} /></button>
        <button className={`${darkMode ? 'text-slate-500 hover:text-blue-400' : 'text-gray-400 hover:text-blue-600'} hover:bg-blue-50/10 p-3 rounded-xl transition-all`}><MessageSquare size={24} /></button>
        <button className={`${darkMode ? 'text-slate-500 hover:text-blue-400' : 'text-gray-400 hover:text-blue-600'} hover:bg-blue-50/10 p-3 rounded-xl transition-all`}><Users size={24} /></button>

        <div className="flex-1"></div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-xl transition-all duration-300 ${darkMode ? 'text-yellow-400 bg-yellow-400/10' : 'text-blue-600 bg-blue-600/10'}`}
        >
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        <button className={`${darkMode ? 'text-slate-500 hover:text-blue-400' : 'text-gray-400 hover:text-blue-600'} hover:bg-blue-50/10 p-3 rounded-xl transition-all`}><Settings size={24} /></button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className={`border-b px-8 py-5 flex justify-between items-center z-20 transition-colors duration-500 ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-white/50 shadow-sm'}`}>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tactical Command</h1>
            <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} text-sm font-medium`}>Sector: HQ-Alpha | System Status: Optimal</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDeployModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={18} /> Deploy New Team
            </button>
            <button className="bg-red-500/10 text-red-500 border border-red-500/20 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all hover:bg-red-500 hover:text-white">
              <Radio size={18} /> Emergency Broadcast
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-y-auto">

          {/* Left Column - Large Map */}
          <div className="col-span-8 flex flex-col gap-8 h-full">
            {/* Tactical Map */}
            <div className={`rounded-2xl border flex flex-col h-[600px] relative overflow-hidden group transition-all duration-500 ${cardClasses}`}>
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-600 z-10"></div>
              <div className="p-5 border-b border-white/5 flex justify-between items-center pt-6 z-10 relative">
                <h2 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Topographic Raster</h2>
              </div>
              <div className="flex-1 relative overflow-hidden bg-white/50">
                <RescueMap officers={officers} hospitals={hospitals} />
              </div>
            </div>
          </div>

          {/* Right Column - Data & Stats */}
          <div className="col-span-4 flex flex-col gap-8">

            {/* System Status / Stats */}
            <div className={`rounded-2xl border p-6 flex flex-col relative overflow-hidden transition-all duration-500 ${cardClasses}`}>
              <h2 className={`font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Activity size={18} className="text-blue-500" /> Operational Metrics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border transition-colors ${darkMode ? 'bg-slate-800/30 border-slate-700/50 text-slate-300' : 'bg-blue-50/50 border-blue-100/50'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Units Ready</span>
                  <span className="text-2xl font-bold block">{officers.filter(o => o.status === 'Active').length}</span>
                </div>
                <div className={`p-4 rounded-xl border transition-colors ${darkMode ? 'bg-slate-800/30 border-slate-700/50 text-slate-300' : 'bg-blue-50/50 border-blue-100/50'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">GPS Confidence</span>
                  <span className="text-2xl font-bold block text-green-500">99.8%</span>
                </div>
              </div>
            </div>

            {/* Ignition Predictor */}
            <IgnitionWidget darkMode={darkMode} />

            {/* Ground Unit Management */}
            <div className={`rounded-2xl border flex-1 relative overflow-hidden flex flex-col transition-all duration-500 ${cardClasses}`}>
              <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
                <h2 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Field Units</h2>
                <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 uppercase tracking-wider">Active Patrol</span>
              </div>

              <div className="p-3 flex-1 overflow-y-auto min-h-[100px]">
                <table className="w-full text-sm text-left">
                  <thead className={`text-[10px] uppercase tracking-wider font-bold ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                    <tr>
                      <th className="px-5 py-3">Callsign</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {officers.map((officer, i) => (
                      <React.Fragment key={officer.id || i}>
                        <tr className={`border-b transition-colors group ${darkMode ? 'border-slate-800/50 hover:bg-slate-800/30 text-slate-300' : 'border-gray-50 hover:bg-blue-50/50 text-gray-700'}`}>
                          <td className="px-5 py-4">
                            <span className="font-bold text-blue-500 block text-xs">{officer.id}</span>
                            <span className="font-medium text-xs">{officer.name}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2 py-1 flex w-fit items-center gap-1.5 rounded text-[10px] font-bold uppercase tracking-wider border ${officer.status === 'Active' || officer.status === 'available' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                              officer.status === 'En Route' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${officer.status === 'Active' || officer.status === 'available' ? 'bg-green-500 animate-pulse' : officer.status === 'En Route' ? 'bg-yellow-500' : 'bg-slate-400'}`}></span>
                              {officer.status === 'available' ? 'Active' : officer.status}
                            </span>
                          </td>
                        </tr>
                        {pendingMission?.officerId === officer.id && (
                          <tr className={`border-b ${darkMode ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-100'} border-l-4 ${darkMode ? 'border-l-blue-400' : 'border-l-blue-500'}`}>
                            <td colSpan="2" className="px-5 py-4">
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle size={16} className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                  <span className={`font-bold text-xs tracking-wide uppercase ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                    AI Recommendation: Assign to {pendingMission.hospital} | Severity: {pendingMission.severity}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => handleApprove(officer.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-500/20">
                                    Approve Assignment
                                  </button>
                                  <button onClick={handleDeny} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${darkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-gray-300 text-gray-500 hover:bg-gray-100'}`}>
                                    Deny / Recalculate
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Deployment Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeployModal(false)}></div>
          <div className={`w-full max-w-md rounded-2xl border overflow-hidden p-8 relative animate-slide-up shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Plus size={24} className="text-blue-500" /> New Team Deployment
              </h3>
              <button onClick={() => setShowDeployModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDeploy} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Team Callsign</label>
                <input
                  type="text"
                  placeholder="e.g. Team Delta"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white' : 'bg-gray-50 border-gray-200 focus:border-blue-300 text-gray-900'
                    }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="12.4xxx"
                    value={newTeam.lat}
                    onChange={(e) => setNewTeam({ ...newTeam, lat: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white' : 'bg-gray-50 border-gray-200 focus:border-blue-300 text-gray-900'
                      }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="75.7xxx"
                    value={newTeam.lon}
                    onChange={(e) => setNewTeam({ ...newTeam, lon: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white' : 'bg-gray-50 border-gray-200 focus:border-blue-300 text-gray-900'
                      }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98]"
              >
                Confirm Deployment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
