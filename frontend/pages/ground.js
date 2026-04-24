import Head from 'next/head'
import { useState } from 'react'
import { MapPin, Flag, Hospital, Tent, Navigation, AlertTriangle, User, ChevronRight, Map as MapIcon, Crosshair, CloudRain, Mountain, Battery, Radio, Moon, Sun, Activity, ChevronDown } from 'lucide-react'

export default function GroundDashboard() {
  const [darkMode, setDarkMode] = useState(true)
  const [selectedTeamId, setSelectedTeamId] = useState("GO-01")
  const [arrived, setArrived] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const teams = {
    "GO-01": {
      id: "GO-01",
      name: "Team Alpha",
      status: "Active Patrol",
      battery: "92%",
      signal: "CH-04",
      mission: null,
      lat: 12.9750,
      lon: 77.5900,
      weather: "Thunderstorm, 24°C"
    },
    "GO-02": {
      id: "GO-02",
      name: "Team Bravo",
      status: "En Route to Mission",
      battery: "78%",
      signal: "CH-02",
      mission: {
        id: "Flood Rescue (RESCUE-001)",
        type: "Flood Rescue",
        severity: "HIGH",
        route: "Route B (Main)",
        eta: "10 mins",
        distance: "4.2 km",
        hospital: "City Central",
        targetLat: 12.9610,
        targetLon: 77.5820,
        teams: 2
      },
      lat: 12.9600,
      lon: 77.5800,
      weather: "Heavy Rain, 18°C"
    },
    "GO-03": {
      id: "GO-03",
      name: "Team Charlie",
      status: "Resting at Base",
      battery: "100%",
      signal: "CH-05",
      mission: null,
      lat: 12.9800,
      lon: 77.6100,
      weather: "Clear, 22°C"
    }
  }

  const team = teams[selectedTeamId]
  const mission = team.mission

  const toggleTheme = () => setDarkMode(!darkMode)

  const themeClasses = darkMode
    ? "bg-slate-950 text-slate-200"
    : "bg-gradient-to-br from-blue-50 via-white to-blue-50 text-[#18181B]"

  const cardClasses = darkMode
    ? "bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl shadow-black/20"
    : "bg-white/80 backdrop-blur-md border-white shadow-xl shadow-blue-900/5"

  const handleArrive = () => {
    setArrived(true)
    setTimeout(() => {
      setShowFeedback(true)
    }, 800)
  }

  const submitFeedback = () => {
    setShowFeedback(false)
  }

  return (
    <div className={`min-h-screen flex flex-col font-inter transition-colors duration-500 overflow-hidden relative ${themeClasses}`}>
      <Head>
        <title>Ground Dashboard | AURA</title>
      </Head>

      {/* Header */}
      <header className={`border-b px-6 py-4 flex justify-between items-center z-20 transition-colors duration-500 ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-white/50 shadow-sm'}`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
              <User size={20} />
            </div>
            <div>
              <h1 className={`font-bold leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Unit: {team.id}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">{team.status}</span>
              </div>
            </div>
          </div>

          <div className={`w-px h-8 ${darkMode ? 'bg-slate-800' : 'bg-gray-200'}`}></div>

          {/* Team Selector */}
          <div className="relative group">
            <select
              value={selectedTeamId}
              onChange={(e) => {
                setSelectedTeamId(e.target.value)
                setArrived(false)
                setShowFeedback(false)
              }}
              className={`appearance-none font-bold tracking-tight px-4 py-2 pr-10 rounded-xl outline-none transition-all cursor-pointer text-sm border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-blue-500' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
            >
              <option value="GO-01">TEAM ALPHA</option>
              <option value="GO-02">TEAM BRAVO</option>
              <option value="GO-03">TEAM CHARLIE</option>
            </select>
            <ChevronDown size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-4 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
            <span className="flex items-center gap-1.5"><Battery size={14} className={team.battery === '100%' ? 'text-green-500' : 'text-orange-500'} /> {team.battery}</span>
            <span className={`w-px h-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></span>
            <span className="flex items-center gap-1.5"><Radio size={14} className="text-blue-500" /> {team.signal}</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-all duration-300 border ${darkMode ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 'text-blue-600 bg-blue-600/10 border-blue-600/20'}`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {mission && (
            <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${mission.severity === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
              }`}>
              Severity: {mission.severity}
            </div>
          )}
        </div>
      </header>

      <div className="p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1400px] mx-auto w-full h-[calc(100vh-74px)]">

        {/* Left Panel */}
        <div className={`lg:col-span-4 rounded-2xl border flex flex-col relative overflow-hidden h-full transition-all duration-500 ${cardClasses}`}>
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${mission ? (mission.severity === 'HIGH' ? 'from-red-500 to-orange-500' : 'from-orange-500 to-yellow-500')
              : 'from-blue-500 to-blue-400'
            }`}></div>

          <div className="p-6 flex-1 flex flex-col overflow-y-auto">
            <div className="flex justify-between items-start mb-6 mt-2">
              <div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2 inline-block border ${mission ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                  {mission ? 'Active Assignment' : 'Observation Mode'}
                </span>
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {mission ? mission.id : 'Standby'}
                </h2>
                <p className={`text-sm mt-1 font-medium flex items-center gap-1.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  {mission ? <><AlertTriangle size={14} className="text-yellow-500" /> Route: {mission.route}</> : <><Activity size={14} className="text-blue-500" /> Scanning Sector G-4</>}
                </p>
              </div>
              {mission && (
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                  <AlertTriangle size={24} />
                </div>
              )}
            </div>

            {mission ? (
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className={`rounded-xl p-4 border transition-colors ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Hospital</span>
                    <p className="text-sm font-semibold">{mission.hospital}</p>
                  </div>
                  <div className={`rounded-xl p-4 border transition-colors ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Reports</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20"><Crosshair size={16} /></div>
                      <div>
                        <p className="text-xs font-bold leading-tight">Drone AQ-77</p>
                        <p className="text-[9px] opacity-50 uppercase font-bold tracking-widest">Live Link</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mb-3 px-1 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Environmental Scan</span>
                  <div className={`rounded-xl border divide-y transition-colors ${darkMode ? 'bg-slate-800/20 border-slate-700 divide-slate-800' : 'bg-white border-gray-200 divide-gray-100 shadow-sm'}`}>
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center"><CloudRain size={16} /></div>
                        <span className="text-sm font-semibold opacity-80">Weather</span>
                      </div>
                      <span className="text-sm font-bold">{team.weather}</span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center"><Mountain size={16} /></div>
                        <span className="text-sm font-semibold opacity-80">Wildfire</span>
                      </div>
                      <span className="text-sm font-bold text-green-500">Low Risk</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex-1 flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed mb-6 ${darkMode ? 'border-slate-800 text-slate-500' : 'border-gray-200 text-gray-400'}`}>
                <div className="w-16 h-16 bg-blue-500/5 rounded-full flex items-center justify-center mb-4 transition-transform hover:rotate-12">
                  <Navigation size={32} className="opacity-20" />
                </div>
                <p className="font-bold tracking-tight">Units on standby</p>
                <p className="text-xs max-w-[200px] mt-2 opacity-60">Ready to respond to regional SOS signals from command center.</p>
              </div>
            )}

            <div className="mt-auto">
              {mission ? (
                !arrived ? (
                  <button
                    onClick={handleArrive}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/30 text-lg"
                  >
                    <Flag size={20} /> Arrived at Scene
                  </button>
                ) : (
                  <div className="space-y-4 animate-fade-in bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-px bg-blue-500/20 flex-1"></div>
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Resolution Steps</span>
                      <div className="h-px bg-blue-500/20 flex-1"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={submitFeedback} className={`flex flex-col items-center justify-center py-5 gap-3 border-2 rounded-xl transition-all ${darkMode ? 'bg-slate-800/50 border-slate-700 hover:border-red-400' : 'bg-white border-gray-100 hover:border-red-300'}`}>
                        <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center"><Hospital size={20} /></div>
                        <span className="text-xs font-bold tracking-tight text-slate-400">Hospital</span>
                      </button>
                      <button onClick={submitFeedback} className={`flex flex-col items-center justify-center py-5 gap-3 border-2 rounded-xl transition-all ${darkMode ? 'bg-slate-800/50 border-slate-700 hover:border-green-400' : 'bg-white border-gray-100 hover:border-green-300'}`}>
                        <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center"><Tent size={20} /></div>
                        <span className="text-xs font-bold tracking-tight text-slate-400">Base Camp</span>
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <button className={`w-full py-4 rounded-xl font-bold tracking-widest text-sm border border-dashed transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-gray-50 border-gray-200 text-gray-400'} cursor-not-allowed`}>
                  NO MISSION ACTIVE
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className={`lg:col-span-8 relative rounded-2xl border overflow-hidden h-full transition-all duration-500 ${cardClasses}`}>
          <div className="absolute inset-0 bg-[#02050A]">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1600"
              alt="Map Background"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${darkMode ? 'invert opacity-30 brightness-[0.7] contrast-[1.1] grayscale hover:scale-105' : 'opacity-80 hover:scale-105'}`}
            />
            <div className={`absolute inset-0 transition-opacity duration-500 ${darkMode ? 'bg-blue-900/10 mix-blend-color-dodge' : 'bg-gradient-to-t from-blue-900/40 via-transparent to-transparent'}`}></div>
          </div>

          {/* Map UI Controls */}
          <div className={`absolute top-4 right-4 backdrop-blur border rounded-xl p-2 flex flex-col gap-2 transition-colors ${darkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white/90 border-gray-200'}`}>
            <button className="p-2 text-slate-500 hover:text-blue-500 transition-colors"><MapIcon size={20} /></button>
            <button className="p-2 text-slate-500 hover:text-blue-500 transition-colors"><Navigation size={20} /></button>
          </div>

          {/* Unit Marker */}
          <div className="absolute top-[35%] left-[25%]">
            <div className="flex flex-col items-center">
              <div className={`px-2 py-1 rounded-lg text-[10px] font-bold mb-2 border backdrop-blur shadow-xl transition-all ${darkMode ? 'bg-slate-900/80 text-blue-400 border-blue-500/30' : 'bg-white/90 text-blue-600 border-white'}`}>
                {team.id} ({team.name})
              </div>
              <div className="relative">
                <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.6)] z-10 animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border border-blue-500/40 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>

          {/* Mission Markers & Route */}
          {mission && (
            <>
              {/* Fake Route */}
              <svg className="absolute w-[400px] h-[200px] top-[35%] left-[25%] overflow-visible pointer-events-none">
                <path d="M 0 0 C 80 -20, 150 80, 280 120" fill="none" stroke={darkMode ? "rgba(59,130,246,0.4)" : "#3b82f6"} strokeWidth="5" strokeDasharray="8 8" className="animate-[dash_20s_linear_infinite]" />
              </svg>

              <div className="absolute top-[calc(35%+120px)] left-[calc(25%+280px)] flex flex-col items-center animate-bounce">
                <div className={`px-2 py-1 rounded-lg text-[10px] font-bold mb-2 border backdrop-blur shadow-xl transition-all ${darkMode ? 'bg-slate-900/80 text-red-400 border-red-500/30' : 'bg-white/90 text-red-600 border-white'}`}>
                  {mission.type}
                </div>
                <MapPin size={40} className="text-red-500 drop-shadow-2xl" fill="#ef444444" />
              </div>
            </>
          )}

          {/* ETA Overlay Card */}
          {mission && (
            <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 rounded-2xl shadow-2xl border p-4 px-8 flex items-center gap-8 transition-all duration-500 ${darkMode ? 'bg-slate-900/90 border-slate-700 text-white' : 'bg-white/90 border-white text-gray-900'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Navigation size={20} /></div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ETA</div>
                  <div className="text-xl font-bold">{mission.eta}</div>
                </div>
              </div>
              <div className={`w-px h-10 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}></div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500"><Activity size={20} /></div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dist</div>
                  <div className="text-xl font-bold">{mission.distance}</div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 right-4 text-right pointer-events-none opacity-40 font-mono text-[9px] uppercase tracking-tighter">
            <div>SATTELITE_LOCK: [YES]</div>
            <div>SIGNAL_STRENGTH: [STABLE]</div>
            <div>DEVICE: AURA_FIELD_{team.id}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
