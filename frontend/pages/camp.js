import Head from 'next/head'
import { useState } from 'react'
import { LayoutDashboard, MessageSquare, Users, Settings, Bell, Search, Map, MapPin, Crosshair, AlertTriangle, CheckCircle2, Navigation, Radio, Moon, Sun } from 'lucide-react'

export default function CampDashboard() {
  const [darkMode, setDarkMode] = useState(true)
  const [showPopup, setShowPopup] = useState(false)
  const [popupState, setPopupState] = useState('initial')

  // Static Hardcoded Data
  const [officers] = useState([
    {
      id: "GO-01",
      name: "Team Alpha",
      status: "Active",
      location: "12.9750°N, 77.5900°E",
      victim: "-",
      action: "Assign",
      lat: 12.9750,
      lon: 77.5900
    },
    {
      id: "GO-02",
      name: "Team Bravo",
      status: "En Route",
      location: "12.9600°N, 77.5800°E",
      victim: "RESCUE-001",
      action: "Assigned",
      lat: 12.9600,
      lon: 77.5800
    },
    {
      id: "GO-03",
      name: "Team Charlie",
      status: "Resting",
      location: "12.9800°N, 77.6100°E",
      victim: "-",
      action: "Assign",
      lat: 12.9800,
      lon: 77.6100
    }
  ])

  const toggleTheme = () => setDarkMode(!darkMode)

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
        <title>Camp Officer Dashboard | AURA</title>
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
            <h1 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Camp Command</h1>
            <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} text-sm font-medium`}>AURA Autonomous Rescue Agent</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95">
              <Radio size={18} /> Emergency Broadcast
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-y-auto">

          {/* Left Column */}
          <div className="col-span-7 flex flex-col gap-8">

            {/* Live Drone Feed */}
            <div className={`rounded-2xl border overflow-hidden flex flex-col relative group transition-all duration-500 ${cardClasses}`}>
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 to-blue-600 z-10"></div>
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gray-50/5 pt-5">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                  <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Live Drone Feed</h2>
                  <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold">DRONE-04</span>
                </div>
                <div className="flex gap-2 text-slate-500">
                  <Crosshair size={18} className="hover:text-blue-500 cursor-pointer transition" />
                  <Map size={18} className="hover:text-blue-500 cursor-pointer transition" />
                </div>
              </div>
              <div className="relative h-[340px] bg-black w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1506260408121-e353d10b87c7?auto=format&fit=crop&q=80&w=800"
                  alt="Drone Feed Forest"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-white text-xs font-mono px-3 py-1.5 rounded-lg border border-white/10">
                  ALT: 450FT | SPD: 15KTS
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/20 rounded-full flex items-center justify-center pointer-events-none">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>

            {/* Officer Management */}
            <div className={`rounded-2xl border flex-1 relative overflow-hidden transition-all duration-500 ${cardClasses}`}>
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gray-300/30 to-gray-400/30"></div>
              <div className="p-6 border-b border-white/5 pt-7 flex justify-between items-center">
                <h2 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ground Officer Units</h2>
                <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 uppercase tracking-wider">Operational</span>
              </div>

              <div className="p-3">
                <table className="w-full text-sm text-left">
                  <thead className={`text-[10px] uppercase tracking-wider font-bold ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                    <tr>
                      <th className="px-5 py-3">ID</th>
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Coordinates</th>
                      <th className="px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {officers.map((officer, i) => (
                      <tr key={i} className={`border-b transition-colors group ${darkMode ? 'border-slate-800/50 hover:bg-slate-800/30 text-slate-300' : 'border-gray-50 hover:bg-blue-50/50 text-gray-700'}`}>
                        <td className="px-5 py-4 font-bold">{officer.id}</td>
                        <td className="px-5 py-4 font-medium">{officer.name}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border flex w-max items-center gap-1.5 ${officer.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                              officer.status === 'En Route' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${officer.status === 'Active' ? 'bg-green-500 animate-pulse' : officer.status === 'En Route' ? 'bg-yellow-500' : 'bg-slate-400'}`}></span>
                            {officer.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono opacity-60 text-xs">{officer.location}</td>
                        <td className="px-5 py-4">
                          <button className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${officer.action === 'Assign'
                              ? 'text-blue-500 bg-blue-500/10 hover:bg-blue-500 hover:text-white border border-blue-500/20 shadow-sm'
                              : 'text-slate-500 bg-slate-800/50 cursor-default'
                            }`}>
                            {officer.action}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="col-span-5 flex flex-col gap-8">

            {/* Rescue Map */}
            <div className={`rounded-2xl border flex flex-col h-[400px] relative overflow-hidden group transition-all duration-500 ${cardClasses}`}>
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 to-green-600 z-10"></div>
              <div className="p-5 border-b border-white/5 flex justify-between items-center pt-6 z-10 relative">
                <h2 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Topographical Scan</h2>
                <button className="text-slate-500 hover:text-blue-500 transition-colors"><Settings size={18} /></button>
              </div>
              <div className="flex-1 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800"
                  alt="Topographic Map"
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${darkMode ? 'invert opacity-20 grayscale brightness-75' : 'grayscale opacity-60'}`}
                />

                {/* Marker Overlays */}
                <div className="absolute top-[30%] left-[45%] flex flex-col items-center">
                  <div className={`px-2 py-1 rounded shadow-sm text-[10px] font-bold mb-1 backdrop-blur-md border ${darkMode ? 'bg-slate-900/80 text-blue-400 border-blue-500/30' : 'bg-white/90 text-blue-700 border-white'}`}>Base Camp</div>
                  <MapPin size={28} className="text-blue-500 drop-shadow-xl" fill="#3b82f644" />
                </div>

                <div className="absolute top-[60%] left-[30%] flex flex-col items-center animate-bounce">
                  <div className={`px-2 py-1 rounded shadow-sm text-[10px] font-bold mb-1 backdrop-blur-md border ${darkMode ? 'bg-slate-900/80 text-red-400 border-red-500/30' : 'bg-white/90 text-red-600 border-white'}`}>Victim Alert</div>
                  <AlertTriangle size={24} className="text-red-500 drop-shadow-xl" fill="#ef444444" />
                </div>
              </div>
              <div className={`p-3 text-[10px] font-bold uppercase tracking-wider flex justify-center gap-6 z-10 relative border-t transition-colors duration-500 ${darkMode ? 'bg-slate-900/80 border-white/5 text-slate-500' : 'bg-white border-gray-100 text-gray-500'}`}>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/30"></span> Victims</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30"></span> Base</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/30"></span> Hospital</div>
              </div>
            </div>

            {/* Quick Actions / Stats */}
            <div className={`rounded-2xl border flex-1 p-6 flex flex-col relative overflow-hidden transition-all duration-500 ${cardClasses}`}>
              <h2 className={`font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Activity size={18} className="text-blue-500" /> Command Analytics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border flex flex-col gap-1 transition-colors ${darkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-blue-50/50 border-blue-100/50'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Units</span>
                  <span className="text-2xl font-bold">02</span>
                </div>
                <div className={`p-4 rounded-xl border flex flex-col gap-1 transition-colors ${darkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-blue-50/50 border-blue-100/50'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Response Time</span>
                  <span className="text-2xl font-bold">4.2m</span>
                </div>
                <div className={`p-4 rounded-xl border flex flex-col gap-1 col-span-2 transition-colors ${darkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-green-50/50 border-green-100/50'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Status</span>
                  <span className="text-sm font-bold text-green-500 flex items-center gap-2">
                    <CheckCircle2 size={16} /> ALL SYSTEMS NOMINAL
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-6 flex flex-col gap-2">
                <div className={`flex justify-between items-center p-3 rounded-lg border border-dashed transition-colors ${darkMode ? 'border-slate-800 bg-slate-800/20' : 'border-gray-200 bg-gray-50'}`}>
                  <span className="text-xs font-bold opacity-60 tracking-wider">AURA CORES</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>)}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
