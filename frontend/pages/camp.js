import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'
import React from 'react'
import { LayoutDashboard, MessageSquare, Users, Settings, Bell, Search, Map, MapPin, Crosshair, AlertTriangle, CheckCircle2, Navigation, Radio, Moon, Sun, Activity, Plus, X, Trash2 } from 'lucide-react'
import { getOfficers, deployOfficer, getFinal, approveMission, deleteOfficer } from '../utils/api'
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
  const [isDeployMode, setIsDeployMode] = useState(false)
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
                  severity: finalData.severity || 'CRITICAL',
                  face_count: finalData.face_count || 1
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingMission, lastSeenMissionId]);

  const handleApprove = async (officerId) => {
    if (!pendingMission) return;
    const officer = officers.find(o => o.id === officerId);
    const hospital = hospitals.find(h => h.name.toLowerCase().includes(pendingMission.hospital.toLowerCase().split(' ')[0])) || hospitals[0];

    await approveMission({
      mission_id: pendingMission.mission_id,
      officer_id: officerId,
      officer_name: officer?.name || officerId,
      officer_lat: officer?.lat || 12.42,
      officer_lon: officer?.lon || 75.74,
      victim_lat: pendingMission.lat,
      victim_lon: pendingMission.lon,
      hospital_name: pendingMission.hospital,
      hospital_lat: hospital.lat,
      hospital_lon: hospital.lon,
      severity: pendingMission.severity,
      victim_count: pendingMission.face_count || 1
    });

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

  const handleMapClick = (latlng) => {
    if (isDeployMode) {
      setNewTeam({ name: '', lat: latlng.lat.toFixed(4), lon: latlng.lng.toFixed(4) });
      setIsDeployMode(false);
      setShowDeployModal(true);
    }
  };

  const handleDeleteOfficer = async (id) => {
    if (confirm(`Remove field unit ${id}?`)) {
      const res = await deleteOfficer(id);
      if (res) {
        setOfficers(prev => prev.filter(o => o.id !== id));
      }
    }
  }

  const themeClasses = darkMode
    ? "bg-[#0B0F19] text-slate-200"
    : "bg-gradient-to-br from-blue-50 via-white to-slate-100 text-[#18181B]"

  const cardClasses = darkMode
    ? "bg-[#111827]/80 border-slate-800/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
    : "bg-white/80 backdrop-blur-md border-white/50 shadow-xl shadow-blue-900/5"

  const sidebarClasses = darkMode
    ? "bg-[#0B0F19] border-slate-800/60"
    : "bg-white/80 backdrop-blur-xl border-white"

  let activeRoute = null;
  if (pendingMission) {
    const off = officers.find(o => o.id === pendingMission.officerId);
    const hosp = hospitals.find(h => h.name.toLowerCase().includes(pendingMission.hospital.toLowerCase().split(' ')[0])) || hospitals[0];
    if (off && hosp) {
      activeRoute = {
        start: [off.lat, off.lon],
        via: [pendingMission.lat, pendingMission.lon],
        end: [hosp.lat, hosp.lon]
      };
    }
  }

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
        <header className={`border-b px-10 py-6 flex justify-between items-center z-20 transition-colors duration-500 ${darkMode ? 'bg-[#0B0F19] border-slate-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'bg-white/80 border-gray-200/50 shadow-sm backdrop-blur-xl'}`}>
          <div>
            <h1 className={`text-3xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tactical Command</h1>
            <p className={`${darkMode ? 'text-slate-500' : 'text-gray-500'} text-[10px] font-black uppercase tracking-widest mt-1`}>Sector: HQ-Alpha | System Status: Optimal</p>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={() => setIsDeployMode(!isDeployMode)}
              className={`${isDeployMode ? 'bg-orange-600 hover:bg-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.5)] border-orange-500/50 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] border-blue-500/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]'} px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all transform hover:-translate-y-0.5 border active:scale-95`}
            >
              {isDeployMode ? <Crosshair size={16} className={`${isDeployMode ? 'animate-pulse' : ''}`} /> : <Plus size={16} />}
              {isDeployMode ? 'Click Map to Deploy...' : 'Deploy New Team'}
            </button>
            <button className="bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/20 hover:border-red-500/40 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all hover:text-red-400">
              <Radio size={16} /> Emergency Broadcast
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden h-full">

          {/* System Status / Stats - Horizontal Top Bar */}
          <div className={`rounded-2xl border flex items-center justify-between transition-all duration-500 shrink-0 px-8 py-3 ${cardClasses}`}>
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-lg ${darkMode ? 'bg-[#151b2b]' : 'bg-blue-50'} border ${darkMode ? 'border-slate-800' : 'border-blue-200'}`}>
                <Activity size={18} className="text-blue-500" />
              </div>
              <h2 className={`font-black uppercase tracking-widest text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Operational Telemetry</h2>
            </div>
            <div className={`flex gap-6 items-center ${darkMode ? 'bg-black/20' : 'bg-blue-50'} px-5 py-2.5 rounded-xl border ${darkMode ? 'border-white/5' : 'border-blue-100'}`}>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>Units Available</span>
                <span className={`text-xl font-black drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] ${darkMode ? 'text-white' : 'text-gray-900'}`}>{officers.filter(o => o.status === 'Active' || o.status === 'available').length}</span>
              </div>
              <div className={`w-px h-5 ${darkMode ? 'bg-slate-800' : 'bg-gray-300'}`}></div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-green-500/50' : 'text-green-600/60'}`}>GPS Base Confidence</span>
                <span className="text-xl font-black drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]">99.8%</span>
              </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-12 gap-8 min-h-0 pb-10">

            {/* Left Column - Large Map */}
            <div className="col-span-7 flex flex-col h-full">
              {/* Tactical Map */}
              <div className={`rounded-2xl border flex flex-col flex-1 relative overflow-hidden group transition-all duration-500 ${cardClasses}`}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 z-10"></div>
                <div className={`p-6 border-b flex justify-between items-center z-10 relative ${darkMode ? 'bg-[#0B0F19]/80 backdrop-blur-md border-slate-800/80' : 'bg-white/90 border-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <Map size={20} className="text-blue-500" />
                    <h2 className={`font-black text-sm uppercase tracking-widest ${darkMode ? 'text-white' : 'text-gray-900'}`}>Topographic Raster</h2>
                  </div>
                </div>
                <div className="flex-1 relative overflow-hidden bg-black">
                  <RescueMap officers={officers} hospitals={hospitals} activeRoute={activeRoute} onMapClick={isDeployMode ? handleMapClick : null} />
                </div>
              </div>
            </div>

            {/* Right Column - Field Units */}
            <div className="col-span-5 flex flex-col h-full min-h-0 gap-6">

              {/* Ignition Predictor */}
              <IgnitionWidget darkMode={darkMode} />

              {/* Ground Unit Management */}
              <div className={`rounded-2xl border flex-1 relative flex flex-col transition-all duration-500 min-h-0 overflow-hidden ${cardClasses}`}>
                <div className={`p-6 border-b flex justify-between items-center z-10 shrink-0 ${darkMode ? 'bg-[#0B0F19]/50 backdrop-blur-md border-slate-800/80' : 'bg-white/90 border-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-blue-500" />
                    <h2 className={`font-black uppercase tracking-widest text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Field Units</h2>
                  </div>
                  <span className="text-[9px] font-black text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 uppercase tracking-widest">Active Patrol</span>
                </div>

                <div className={`p-4 flex-1 overflow-y-auto min-h-[100px] flex flex-col gap-2 ${darkMode ? 'bg-[#0B0F19]/20' : 'bg-blue-50/20'}`}>
                  {officers.map((officer, i) => (
                    <React.Fragment key={officer.id || i}>
                      <div className={`p-3 rounded-xl border flex items-center justify-between transition-all group ${darkMode ? 'bg-[#151b2b] border-slate-800/80 hover:border-slate-600' : 'bg-white border-blue-100 hover:border-blue-300 hover:shadow-lg'} shadow-sm`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${darkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                            {officer.id.split('-')[1]}
                          </div>
                          <div>
                            <span className={`font-black block text-sm tracking-wide ${darkMode ? 'text-white' : 'text-blue-900'}`}>{officer.id}</span>
                            <span className={`text-[9px] font-bold uppercase tracking-widest block mt-0.5 ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>{officer.name}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1.5 flex items-center gap-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${officer.status === 'Active' || officer.status === 'available' ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(74,222,128,0.1)]' :
                            officer.status === 'En Route' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                              'bg-slate-500/10 text-slate-400 border-slate-500/30'
                            }`}>
                            <span className={`w-1 h-1 rounded-full ${officer.status === 'Active' || officer.status === 'available' ? 'bg-green-400 animate-pulse' : officer.status === 'En Route' ? 'bg-yellow-400' : 'bg-slate-400'}`}></span>
                            {officer.status === 'available' ? 'ACTIVE' : officer.status}
                          </span>

                          <div className={`w-px h-6 ${darkMode ? 'bg-slate-800' : 'bg-gray-200'}`}></div>

                          <button onClick={() => handleDeleteOfficer(officer.id)} className={`p-1.5 rounded-lg transition-all ${darkMode ? 'text-slate-500 hover:bg-red-500/20 hover:text-red-400' : 'text-gray-400 hover:bg-red-50 hover:text-red-500'}`}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {pendingMission?.officerId === officer.id && (
                        <div className={`mx-6 p-5 py-4 rounded-xl border border-l-4 mt-2 mb-4 animate-fade-in ${darkMode ? 'bg-[#0f1b33] border-blue-500/30 border-l-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.15)]' : 'bg-blue-50 border-blue-200 border-l-blue-600 shadow-lg shadow-blue-500/10'}`}>
                          <div className="flex items-center gap-3 mb-4 mt-1">
                            <div className="bg-blue-500/20 p-2 rounded-lg text-blue-500">
                              <AlertTriangle size={18} className="animate-pulse" />
                            </div>
                            <span className="font-black text-xs uppercase tracking-widest text-blue-500">AI Assignment: {pendingMission.hospital} <span className="mx-2 opacity-30">|</span> Severity: {pendingMission.severity}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <button onClick={() => handleApprove(officer.id)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95 flex-1 border border-blue-400/50">Approve Protocol</button>
                            <button onClick={handleDeny} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all active:scale-95 flex-1 ${darkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-gray-300 text-gray-500 hover:bg-gray-100'}`}>Deny / Rotate</button>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
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
// cache clear
