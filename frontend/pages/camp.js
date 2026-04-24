import Head from 'next/head'
import { useState, useEffect } from 'react'
import { LayoutDashboard, MessageSquare, Users, Settings, Bell, Search, Map, MapPin, Crosshair, AlertTriangle, CheckCircle2, Navigation, Radio } from 'lucide-react'

export default function CampDashboard() {
  const [showPopup, setShowPopup] = useState(false)
  const [popupState, setPopupState] = useState('initial') // initial, recalculating, assigning_backup
  const [officers, setOfficers] = useState([
    { id: 'GO-101', name: 'Sarah Jenkins', status: 'Active', location: 'Sec A, Grid 4', victim: '-', action: 'Assign' },
    { id: 'GO-102', name: 'Marcus Chen', status: 'En Route', location: 'Sec B, Grid 1', victim: 'Victim #2', action: 'Assigned' },
    { id: 'GO-103', name: 'David Ross', status: 'Resting', location: 'Base Camp', victim: '-', action: 'Assign' }
  ])

  // Simulate a new victim alert after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleAssignYes = () => {
    setPopupState('assigning_backup')
  }

  const handleAssignNo = () => {
    setPopupState('recalculating')
    setTimeout(() => {
      setShowPopup(false)
      setPopupState('initial')
    }, 2500)
  }

  const handleBackupConfirm = () => {
    setShowPopup(false)
    setPopupState('initial')
    setOfficers(prev => prev.map(o => o.id === 'GO-101' ? { ...o, status: 'En Route', victim: 'Victim #4', action: 'Assigned' } : o))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex font-inter text-[#18181B] overflow-hidden">
      <Head>
        <title>Camp Officer Dashboard</title>
      </Head>

      {/* Sidebar */}
      <div className="w-20 bg-white/80 backdrop-blur-xl border-r border-white shadow-xl shadow-blue-900/5 flex flex-col items-center py-8 gap-8 z-30">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/30 mb-4">*</div>
        <button className="text-white bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-md shadow-blue-500/20"><LayoutDashboard size={24} /></button>
        <button className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-xl transition-all"><MessageSquare size={24} /></button>
        <button className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-xl transition-all"><Users size={24} /></button>
        <div className="flex-1"></div>
        <button className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-xl transition-all"><Settings size={24} /></button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-white/50 px-8 py-5 flex justify-between items-center shadow-sm z-20">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 text-sm font-medium">Camp Operations Center</p>
          </div>
          <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-500/30 transition-all transform hover:-translate-y-0.5">
            <Radio size={18} /> Emergency Broadcast
          </button>
        </header>

        <div className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-y-auto">
          
          {/* Left Column */}
          <div className="col-span-7 flex flex-col gap-8">
            
            {/* Live Drone Feed */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col relative group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 to-blue-600 z-10"></div>
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 pt-5">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                  <h2 className="font-bold text-gray-900">Live Drone Feed</h2>
                  <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold">DRONE-04</span>
                </div>
                <div className="flex gap-2 text-gray-400">
                  <Crosshair size={18} className="hover:text-blue-500 cursor-pointer transition" />
                  <Map size={18} className="hover:text-blue-500 cursor-pointer transition" />
                </div>
              </div>
              <div className="relative h-[340px] bg-gray-900 w-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1506260408121-e353d10b87c7?auto=format&fit=crop&q=80&w=800" 
                  alt="Drone Feed Forest" 
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-white text-xs font-mono px-3 py-1.5 rounded-lg border border-white/10">
                  ALT: 450FT | SPD: 15KTS
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/30 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>

            {/* Ground Officer Management */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex-1 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gray-300 to-gray-400"></div>
              <div className="p-6 border-b border-gray-100 pt-7">
                <h2 className="font-bold text-gray-900 text-lg">Ground Officer Management</h2>
              </div>
              
              <div className="p-3">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50/80 font-bold">
                    <tr>
                      <th className="px-5 py-3 rounded-tl-xl">ID</th>
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Location</th>
                      <th className="px-5 py-3">Victim</th>
                      <th className="px-5 py-3 rounded-tr-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {officers.map((officer, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/50 transition-colors group">
                        <td className="px-5 py-4 font-bold text-gray-800">{officer.id}</td>
                        <td className="px-5 py-4 font-medium">{officer.name}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border flex w-max items-center gap-1.5 ${
                            officer.status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' : 
                            officer.status === 'En Route' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 
                            'bg-gray-100 text-gray-600 border-gray-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${officer.status === 'Active' ? 'bg-green-500 animate-pulse' : officer.status === 'En Route' ? 'bg-yellow-500' : 'bg-gray-400'}`}></span>
                            {officer.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-500 font-medium">{officer.location}</td>
                        <td className="px-5 py-4 text-gray-500 font-medium">{officer.victim}</td>
                        <td className="px-5 py-4">
                          <button className={`text-sm font-bold ${officer.action === 'Assign' ? 'text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition group-hover:shadow-sm' : 'text-gray-400'}`}>
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
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col h-[400px] relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 to-green-600 z-10"></div>
              <div className="p-5 border-b border-gray-100 flex justify-between items-center pt-6 bg-white z-10 relative">
                <h2 className="font-bold text-gray-900 text-lg">Rescue Map</h2>
                <button className="text-gray-400 hover:text-blue-600 transition"><Settings size={18} /></button>
              </div>
              <div className="flex-1 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" 
                  alt="Topographic Map" 
                  className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:opacity-80 transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-blue-500/5 mix-blend-multiply"></div>
                
                {/* Map Overlays */}
                <div className="absolute top-1/3 left-1/3 w-32 h-32 border-2 border-blue-400/50 bg-blue-400/10 rounded-lg"></div>
                <div className="absolute top-[30%] left-[40%] flex flex-col items-center">
                  <div className="bg-white/90 backdrop-blur px-2 py-1 rounded shadow-sm text-[10px] font-bold text-blue-700 mb-1">Base Camp</div>
                  <MapPin size={28} className="text-blue-500 drop-shadow-md" fill="#bfdbfe" />
                </div>

                <div className="absolute top-[60%] left-[30%] flex flex-col items-center animate-bounce">
                  <div className="bg-white/90 backdrop-blur px-2 py-1 rounded shadow-sm text-[10px] font-bold text-red-600 mb-1">Victim #4</div>
                  <AlertTriangle size={24} className="text-red-500 drop-shadow-md" fill="#fecaca" />
                </div>
              </div>
              <div className="p-3 text-[10px] font-bold uppercase tracking-wider flex justify-center gap-6 text-gray-500 bg-white border-t border-gray-100 z-10 relative">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/30"></span> Victims</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30"></span> Base</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-500/30"></span> Hospital</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/30"></span> Officer</div>
              </div>
            </div>

            {/* Ground Officer Live Data */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex-1 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500"></div>
              <div className="p-6 border-b border-gray-100 pt-7">
                <h2 className="font-bold text-gray-900 mb-4 text-lg">Ground Officer Live Data</h2>
                <div className="relative group">
                  <Search size={16} className="absolute left-4 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search officer or ID..." 
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="p-3 flex flex-col gap-2 overflow-y-auto">
                <div className="p-4 hover:bg-gray-50 rounded-xl flex items-start gap-4 cursor-pointer border border-transparent hover:border-gray-100 transition-all group">
                  <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Navigation size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">GO-101 | Sarah Jenkins</p>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Just now</span>
                    </div>
                    <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
                      <Map size={12} className="text-gray-400" /> Sec A, Grid 4 
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span> 
                      Victim: None
                    </p>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-gray-50 rounded-xl flex items-start gap-4 cursor-pointer border border-transparent hover:border-gray-100 transition-all group">
                  <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Navigation size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">GO-102 | Marcus Chen</p>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">2m ago</span>
                    </div>
                    <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
                      <Map size={12} className="text-gray-400" /> Sec B, Grid 1
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span> 
                      Victim: <span className="text-red-500 font-bold ml-1">#2</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Interactive Popup Overlay */}
      {showPopup && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 w-full max-w-lg animate-slide-up relative overflow-hidden">
            {/* Decorative top border for popup */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400"></div>

            {popupState === 'initial' && (
              <>
                <div className="flex items-center gap-4 mb-5 text-red-500 mt-2">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
                    <AlertTriangle size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">New SOS Detected</h3>
                </div>
                <p className="text-gray-600 text-base mb-8 leading-relaxed font-medium">
                  A new person is found stuck near your camp <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">(Sec A, Grid 3)</span>. Shall I assign the rescue task to the closest available ground officer, <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">GO-101 (Sarah Jenkins)</span>?
                </p>
                <div className="flex gap-4 justify-end">
                  <button onClick={handleAssignNo} className="px-5 py-3 rounded-xl font-bold text-gray-600 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                    No, Recalculate
                  </button>
                  <button onClick={handleAssignYes} className="px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">
                    Yes, Assign GO-101
                  </button>
                </div>
              </>
            )}

            {popupState === 'recalculating' && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-gray-100 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Recalculating Route...</h3>
                <p className="text-base font-medium text-gray-500">Sending request to the next closest camp.</p>
              </div>
            )}

            {popupState === 'assigning_backup' && (
              <>
                <div className="flex items-center gap-4 mb-5 text-blue-500 mt-2">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                    <Users size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Backup Request Suggested</h3>
                </div>
                <p className="text-gray-600 text-base mb-8 leading-relaxed font-medium">
                  The terrain severity is high. Should we send a backup team along with GO-101 to this location?
                </p>
                <div className="flex gap-4 justify-end">
                  <button onClick={handleBackupConfirm} className="px-5 py-3 rounded-xl font-bold text-gray-600 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                    No Backup Needed
                  </button>
                  <button onClick={handleBackupConfirm} className="px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 shadow-lg shadow-yellow-500/30 transition-all transform hover:-translate-y-0.5">
                    Yes, Send Backup Team
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
