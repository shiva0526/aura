/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { MapPin, Flag, Hospital, Tent, Navigation, AlertTriangle, User, ChevronRight, Map as MapIcon, Crosshair, CloudRain, Mountain, Battery, Radio, Moon, Sun, Activity, ChevronDown, CheckCircle2 } from 'lucide-react'
import { getOfficers, getFinal, getApprovedMission, freeOfficer } from '../utils/api'
import dynamic from 'next/dynamic'

const GroundRouteMap = dynamic(() => import('../components/GroundRouteMap'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">Loading Route Map...</div>
})

export default function GroundDashboard() {
  const [darkMode, setDarkMode] = useState(true)
  const [selectedTeamId, setSelectedTeamId] = useState("GO-01")
  const [arrived, setArrived] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [routeLeg, setRouteLeg] = useState(null)
  const [officers, setOfficers] = useState([])
  const [globalMission, setGlobalMission] = useState(null)
  const [approvedMission, setApprovedMission] = useState(null)

  // Real-time Polling
  useEffect(() => {
    const poll = async () => {
      const offData = await getOfficers();
      if (offData) setOfficers(offData);

      const finalData = await getFinal();
      if (finalData && finalData.mission_id) {
        setGlobalMission(finalData);
      }

      const approved = await getApprovedMission();
      if (approved && approved.mission_id) {
        setApprovedMission(approved);
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, []);

  // Use the polled list to find the selected team
  const team = officers.find(o => o.id === selectedTeamId) || (officers.length > 0 ? officers[0] : { id: '...', name: 'Loading...', status: 'off', lat: 0, lon: 0, battery: '...', signal: '...' });

  const mission = (team && team.status === 'busy' && globalMission) ? {
    id: globalMission.mission_id,
    type: globalMission.disaster_type || "Emergency Response",
    severity: globalMission.severity || "HIGH",
    route: globalMission.route || "Sector A-1",
    eta: "10 mins",
    distance: "4.2 km",
    hospital: globalMission.hospital || "City Central",
    targetLat: globalMission.lat,
    targetLon: globalMission.lon
  } : null;

  const toggleTheme = () => setDarkMode(!darkMode)

  const themeClasses = darkMode
    ? "bg-slate-950 text-slate-200"
    : "bg-gradient-to-br from-blue-50 via-white to-blue-50 text-[#18181B]"

  const cardClasses = darkMode
    ? "bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl shadow-black/10"
    : "bg-white/80 backdrop-blur-md border-white shadow-xl shadow-blue-900/5"

  const handleArrive = () => {
    setArrived(true)
    setRouteLeg('full')
    setTimeout(() => {
      setShowFeedback(true)
    }, 800)
  }

  const handleComplete = async () => {
    if (!team || team.id === '...') return;
    await freeOfficer(team.id);
    setArrived(false);
    setShowFeedback(false);
    setRouteLeg(null);
    setApprovedMission(null);
  }

  return (
    <div className={`min-h-screen flex flex-col font-inter transition-colors duration-500 overflow-hidden relative ${themeClasses}`}>
      <Head>
        <title>COMMAND INTERFACE | AURA</title>
      </Head>

      {/* Header */}
      <header className={`border-b px-6 py-4 flex justify-between items-center z-20 transition-colors duration-500 ${darkMode ? 'bg-slate-900/80 border-slate-800 shadow-2xl shadow-black/50' : 'bg-white/80 border-white shadow-sm'}`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
              <Crosshair size={20} />
            </div>
            <div>
              <h1 className={`font-bold tracking-widest uppercase text-xs ${darkMode ? 'text-blue-500' : 'text-blue-600'}`}>Field Operator HUD</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-lg font-black uppercase ${darkMode ? 'text-white' : 'text-gray-900'}`}>{team.name}</span>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mx-2"></span>
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-[0.2em]">{team.status}</span>
              </div>
            </div>
          </div>

          <div className={`w-px h-10 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}></div>

          {/* Team Switcher */}
          <div className="relative group">
            <select
              value={selectedTeamId}
              onChange={(e) => {
                setSelectedTeamId(e.target.value)
                setArrived(false)
                setShowFeedback(false)
                setRouteLeg(null)
              }}
              className={`appearance-none font-black tracking-widest px-5 py-2 pr-12 rounded-xl border transition-all cursor-pointer text-xs uppercase ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-blue-500 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
            >
              {officers.map(off => (
                <option key={off.id} value={off.id}>{off.name.toUpperCase()} [{off.id.split('-')[1]}]</option>
              ))}
            </select>
            <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? 'text-slate-600' : 'text-gray-400'}`} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-5 text-[10px] font-black px-4 py-2.5 rounded-xl border tracking-widest uppercase transition-colors ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
            <span className="flex items-center gap-2"><Battery size={16} className={team.battery === '100%' ? 'text-green-500' : 'text-orange-500'} /> Power: {team.battery}</span>
            <span className={`w-px h-3 ${darkMode ? 'bg-slate-800' : 'bg-gray-200'}`}></span>
            <span className="flex items-center gap-2 text-cyan-500"><Radio size={16} /> Link: {team.signal}</span>
          </div>

          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-all duration-300 border ${darkMode ? 'text-yellow-400 bg-yellow-400/5 border-yellow-400/20 hover:bg-yellow-400/10' : 'text-blue-600 bg-blue-600/5 border-blue-600/20'}`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <div className="p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1500px] mx-auto w-full h-[calc(100vh-76px)]">

        {/* Tactical Intel Panel */}
        <div className={`lg:col-span-4 rounded-2xl border flex flex-col relative overflow-hidden h-full transition-all duration-500 shadow-2xl ${cardClasses}`}>
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${mission ? (mission.severity === 'HIGH' ? 'from-red-600 to-red-400' : 'from-orange-500 to-yellow-500')
            : 'from-blue-600 to-cyan-400'
            }`}></div>

          <div className="p-8 flex-1 flex flex-col overflow-y-auto">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest mb-3 inline-block border ${mission ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                  {mission ? 'Operation Priority: High' : 'Patrol Protocol Active'}
                </span>
                <h2 className={`text-4xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {mission ? 'MISSION REQ' : 'UNIT STANDBY'}
                </h2>
                <p className={`text-xs mt-3 font-bold tracking-widest uppercase flex items-center gap-2 ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                  {mission ? <><AlertTriangle size={14} className="text-red-500 animate-pulse" /> {mission.id}</> : <><Activity size={14} className="text-blue-500" /> All Systems Nominal</>}
                </p>
              </div>
            </div>

            {mission ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`rounded-xl p-5 border transition-colors ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3">Hazard Class</span>
                    <p className="text-sm font-black uppercase text-red-500">{mission.type}</p>
                  </div>
                  <div className={`rounded-xl p-5 border transition-colors ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3">Raster Route</span>
                    <p className="text-sm font-black uppercase text-blue-500">{mission.route}</p>
                  </div>
                </div>

                <div className={`rounded-2xl border p-5 space-y-4 tracking-widest font-bold uppercase transition-colors ${darkMode ? 'bg-slate-950/30 border-slate-800' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Destination</span>
                    <span className="text-slate-200">{mission.hospital}</span>
                  </div>
                  <div className="h-px bg-slate-800/50 w-full"></div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Distance</span>
                    <span className="text-slate-200">{mission.distance}</span>
                  </div>
                  <div className="h-px bg-slate-800/50 w-full"></div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Weather Block</span>
                    <span className="text-slate-200">{team.weather}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex-1 flex flex-col items-center justify-center text-center p-10 rounded-2xl border-2 border-dashed transition-colors ${darkMode ? 'border-slate-800/50 bg-slate-950/20 text-slate-600' : 'border-gray-100 text-gray-400'}`}>
                <Activity size={48} className="opacity-10 mb-6" />
                <p className="font-black uppercase tracking-[0.3em] text-xs">Awaiting Raster Uplink</p>
                <p className="text-[10px] uppercase font-bold mt-4 opacity-40 leading-relaxed max-w-[180px]">Maintain regional patrol until headquarters transmits rescue coordinates.</p>
              </div>
            )}

            <div className="mt-auto">
              {mission ? (
                !arrived ? (
                  <button
                    onClick={handleArrive}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] text-sm py-5 rounded-xl flex justify-center items-center gap-3 transition-all transform active:scale-[0.98] shadow-2xl shadow-blue-500/20 border-b-4 border-blue-800"
                  >
                    <Navigation size={20} /> Initiate Route Uplink
                  </button>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="h-px bg-slate-800 flex-1"></div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocol Override</span>
                      <div className="h-px bg-slate-800 flex-1"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <button onClick={() => setRouteLeg(routeLeg === 'sos' ? 'full' : 'sos')} className={`flex flex-col items-center justify-center py-5 gap-3 border-2 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] ${darkMode ? (routeLeg === 'sos' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-slate-950 border-slate-800 hover:border-red-500 hover:text-red-500 text-slate-500') : (routeLeg === 'sos' ? 'bg-red-50 border-red-500 text-red-500' : 'bg-white border-gray-100 hover:border-red-500 text-gray-500')}`}>
                        <Crosshair size={24} /> SOS Route
                      </button>
                      <button onClick={() => setRouteLeg(routeLeg === 'hospital' ? 'full' : 'hospital')} className={`flex flex-col items-center justify-center py-5 gap-3 border-2 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] ${darkMode ? (routeLeg === 'hospital' ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-slate-950 border-slate-800 hover:border-blue-500 hover:text-blue-500 text-slate-500') : (routeLeg === 'hospital' ? 'bg-blue-50 border-blue-500 text-blue-500' : 'bg-white border-gray-100 hover:border-blue-500 text-gray-500')}`}>
                        <Hospital size={24} /> Route Hospital
                      </button>
                    </div>
                    <button onClick={handleComplete} className={`w-full flex items-center justify-center py-4 gap-3 border-2 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] ${darkMode ? 'bg-slate-950 border-slate-800 hover:border-green-500 hover:text-green-500 text-slate-500' : 'bg-white border-gray-100 hover:border-green-500 text-gray-500'}`}>
                      <CheckCircle2 size={18} /> Complete & Free Unit
                    </button>
                  </div>
                )
              ) : (
                <div className={`w-full py-5 rounded-xl font-black uppercase tracking-[0.3em] text-[10px] border-2 border-dashed transition-colors flex justify-center items-center gap-2 ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-800' : 'bg-gray-50 border-gray-100 text-gray-300'}`}>
                  Unit Status: Idle
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Raster Map HUD Panel */}
        <div className={`lg:col-span-8 relative rounded-2xl border overflow-hidden h-full transition-all duration-500 shadow-2xl ${cardClasses}`}>
          {approvedMission && approvedMission.officer_id === team.id ? (
            /* Live Route Map when mission is approved */
            <>
              <div className="absolute top-4 left-4 z-[1000] pointer-events-none space-y-2">
                <div className="font-black text-[9px] uppercase tracking-[0.2em] text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/30 backdrop-blur-sm pointer-events-none">
                  {routeLeg === 'full' && `🔴 LIVE ROUTE — ${approvedMission.officer_name} → Victim → ${approvedMission.hospital_name}`}
                  {routeLeg === 'sos' && `🔴 SOS ROUTE — ${approvedMission.officer_name} → Victim`}
                  {routeLeg === 'hospital' && `🔴 HOSPITAL ROUTE — Victim → ${approvedMission.hospital_name}`}
                  {!routeLeg && '🔴 AWAITING ROUTE UPLINK'}
                </div>
              </div>
              <GroundRouteMap
                officerPos={[approvedMission.officer_lat, approvedMission.officer_lon]}
                victimPos={[approvedMission.victim_lat, approvedMission.victim_lon]}
                hospitalPos={[approvedMission.hospital_lat, approvedMission.hospital_lon]}
                routeLeg={routeLeg}
              />
            </>
          ) : (
            /* Default static map when no mission */
            <>
              <div className="absolute inset-0 bg-[#02050A]">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1600"
                  alt="Raster Map"
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 pointer-events-none scale-110 ${darkMode ? 'invert opacity-20 contrast-[1.2] grayscale' : 'opacity-80'}`}
                />
                <div className={`absolute inset-0 transition-opacity duration-500 ${darkMode ? 'bg-blue-900/10 mix-blend-screen' : 'bg-gradient-to-tr from-blue-900/40 via-transparent to-transparent'}`}></div>
              </div>
            </>
          )}

          {/* HUD Info Widgets */}
          <div className={`absolute bottom-8 left-8 p-6 px-10 rounded-2xl border-2 backdrop-blur-xl flex items-center gap-10 transition-all duration-500 shadow-2xl ${darkMode ? 'bg-slate-950/80 border-slate-800/80' : 'bg-white/90 border-white'}`}>
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-lg shadow-blue-500/10"><Navigation size={22} /></div>
              <div>
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Estimated Arrival</div>
                <div className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>{mission ? mission.eta : '---'}</div>
              </div>
            </div>
            <div className={`w-px h-12 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}></div>
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shadow-lg shadow-orange-500/10"><Activity size={22} /></div>
              <div>
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Raster Distance</div>
                <div className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>{mission ? mission.distance : '---'}</div>
              </div>
            </div>
          </div>

          <div className="absolute top-8 left-8 text-left pointer-events-none space-y-2 opacity-50">
            <div className="font-black text-[9px] uppercase tracking-[0.2em] text-blue-500 bg-blue-500/5 px-3 py-1 rounded-lg border border-blue-500/20">Telemetry Lock: Active</div>
            <div className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-500 px-3">Sector: {team.id}_GRID_ALPHA</div>
          </div>
        </div>
      </div>
    </div>
  )
}
