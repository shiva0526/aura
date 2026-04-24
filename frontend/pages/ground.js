import Head from 'next/head'
import { useState, useEffect } from 'react'
import { MapPin, Flag, Hospital, Tent, Navigation, AlertTriangle, User, ChevronRight, Map as MapIcon, Crosshair, CloudRain, Mountain, Battery, Radio } from 'lucide-react'
import { getFinal, getOracle } from '../utils/api'

export default function GroundDashboard() {
  const [arrived, setArrived] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [mission, setMission] = useState(null)
  const [oracleData, setOracleData] = useState(null)

  // Fetch assignment data from backend
  useEffect(() => {
    const fetchMission = async () => {
      const finalData = await getFinal()
      if (finalData && !finalData.status?.includes('waiting')) {
        setMission(finalData)
      }
      const oracle = await getOracle()
      if (oracle && !oracle.status?.includes('waiting')) {
        setOracleData(oracle)
      }
    }
    fetchMission()
    const interval = setInterval(fetchMission, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleArrive = () => {
    setArrived(true)
    setTimeout(() => {
      setShowFeedback(true)
    }, 800)
  }

  const submitFeedback = (destination) => {
    setShowFeedback(false)
    setFeedbackSubmitted(true)
  }

  // Derive display values from live data
  const victimId = mission?.attempts !== undefined ? `Victim #${mission.attempts + 1}` : 'Victim #3'
  const severity = mission?.severity || oracleData?.severity_level || 'Unknown'
  const weather = oracleData?.weather || {}
  const weatherText = weather.condition ? `${weather.condition}, ${weather.temperature}°C` : 'Heavy Rain, 18°C'
  const routeName = mission?.route || 'Calculating...'
  const hospitalName = mission?.hospital || 'Pending...'
  const distance = mission ? `${(Math.random() * 2 + 0.5).toFixed(1)} km` : '1.4 km'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col font-inter text-[#18181B] relative overflow-hidden">
      <Head>
        <title>Ground Officer Dashboard</title>
      </Head>

      {/* Top Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
            <User size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">Officer J. Reynolds</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">Active Patrol</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <span className="flex items-center gap-1.5"><Battery size={14} className="text-green-500" /> 87%</span>
            <span className="w-px h-3 bg-gray-300"></span>
            <span className="flex items-center gap-1.5"><Radio size={14} className="text-blue-500" /> CH-04</span>
          </div>
          <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${severity === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100' :
              severity === 'MEDIUM' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                severity === 'LOW' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                  'bg-gray-50 text-gray-500 border-gray-200'
            }`}>
            Severity: {severity}
          </div>
        </div>
      </header>

      <div className="p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1400px] mx-auto w-full h-[calc(100vh-70px)]">

        {/* Left Panel: Info & Action (Col Span 4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col relative overflow-hidden h-full">
          {/* Decorative colored top border */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${severity === 'HIGH' ? 'from-red-500 via-red-400 to-orange-400' :
              severity === 'MEDIUM' ? 'from-orange-500 via-orange-400 to-yellow-400' :
                'from-yellow-400 via-yellow-300 to-green-400'
            }`}></div>

          <div className="p-6 flex-1 flex flex-col overflow-y-auto">
            <div className="flex justify-between items-start mb-6 mt-2">
              <div>
                <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2 inline-block border border-red-100">Current Assignment</span>
                <h2 className="text-3xl font-bold text-gray-900">{victimId}</h2>
                <p className="text-sm text-gray-500 mt-1 font-medium flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-yellow-500" /> Route: {routeName}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
                <AlertTriangle size={24} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Hospital</span>
                <p className="text-sm font-semibold text-gray-800">{hospitalName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Reported By</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Crosshair size={16} /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-tight">Drone Alpha-2</p>
                    <p className="text-[10px] text-gray-500 uppercase">Live Feed Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Environmental Scan — LIVE DATA */}
            <div className="mb-8">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3 px-1">Environmental Scan</span>
              <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-sm">
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"><CloudRain size={16} /></div>
                    <span className="text-sm font-semibold text-gray-700">Weather</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{weatherText}</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center"><Mountain size={16} /></div>
                    <span className="text-sm font-semibold text-gray-700">Wildfire</span>
                  </div>
                  <span className={`text-sm font-bold ${oracleData?.wildfire_forecast?.includes('CRITICAL') ? 'text-red-600' :
                      oracleData?.wildfire_forecast?.includes('HIGH') ? 'text-orange-600' :
                        'text-green-600'
                    }`}>{oracleData?.wildfire_forecast || 'Checking...'}</span>
                </div>
              </div>
            </div>

            <div className="mt-auto">
              {!arrived ? (
                <button
                  onClick={handleArrive}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/30 text-lg"
                >
                  <Flag size={20} /> Arrived on Scene
                </button>
              ) : (
                <div className="space-y-4 animate-fade-in bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Outcome Routing</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => submitFeedback('hospital')} className="bg-white flex flex-col items-center justify-center py-5 gap-3 border-2 border-gray-100 rounded-xl hover:border-red-300 hover:bg-red-50 transition">
                      <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                        <Hospital size={24} />
                      </div>
                      <span className="text-sm font-bold text-gray-700">Hospital</span>
                    </button>
                    <button onClick={() => submitFeedback('camp')} className="bg-white flex flex-col items-center justify-center py-5 gap-3 border-2 border-gray-100 rounded-xl hover:border-green-300 hover:bg-green-50 transition">
                      <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                        <Tent size={24} />
                      </div>
                      <span className="text-sm font-bold text-gray-700">Base Camp</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Map Area (Col Span 8) */}
        <div className="lg:col-span-8 relative bg-white rounded-2xl shadow-lg shadow-blue-100 border border-blue-100/50 overflow-hidden h-full group">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1600"
            alt="Map Background"
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent pointer-events-none"></div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur shadow-sm rounded-lg p-2 flex flex-col gap-2">
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"><MapIcon size={20} /></button>
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"><Navigation size={20} /></button>
          </div>

          {/* Mock Route on Map */}
          <div className="absolute top-[35%] left-[25%] text-[#3B82F6]">
            <div className="w-5 h-5 bg-blue-500 rounded-full border-[3px] border-white shadow-[0_0_20px_rgba(59,130,246,0.6)] relative z-10 animate-pulse"></div>
            <svg className="absolute top-2.5 left-2.5 w-[400px] h-[200px] overflow-visible" style={{ pointerEvents: 'none' }}>
              <path d="M 0 0 C 80 -20, 150 80, 280 120 L 350 140" fill="none" stroke="#3B82F6" strokeWidth="5" strokeDasharray="8 8" className="animate-[dash_20s_linear_infinite]" />
            </svg>
            <div className="absolute top-6 left-6 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-blue-600 shadow-sm">Your Location</div>
          </div>

          {/* Target Location */}
          <div className="absolute top-[calc(35%+120px)] left-[calc(25%+350px)] text-red-500 flex flex-col items-center animate-bounce">
            <div className="bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-red-600 shadow-sm mb-1">{victimId}</div>
            <MapPin size={48} fill="#ef4444" className="text-white drop-shadow-xl" />
          </div>

          {/* ETA Widget on Map */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 px-6 py-3 flex items-center gap-6 text-sm font-bold w-max">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Navigation size={18} /></div>
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-widest leading-none mb-1">ETA</div>
                <div className="text-gray-900 text-lg">8 min</div>
              </div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-widest leading-none mb-1">Distance</div>
                <div className="text-gray-900 text-lg">{distance}</div>
              </div>
            </div>
            {mission && (
              <>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase tracking-widest leading-none mb-1">Teams</div>
                    <div className="text-gray-900 text-lg">{mission.teams}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Popup Overlays */}
      {showFeedback && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 flex items-center gap-3 text-white">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm"><AlertTriangle size={24} /></div>
              <h3 className="font-bold text-xl">Initial Assessment</h3>
            </div>

            <div className="p-6 space-y-6 bg-gray-50/50">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Condition of the people</label>
                <div className="relative">
                  <select className="w-full bg-white border border-gray-200 rounded-xl p-4 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition appearance-none shadow-sm cursor-pointer text-base">
                    <option value="">Select condition...</option>
                    <option value="critical">Critical (Unconscious / Severe trauma)</option>
                    <option value="severe">Severe (Conscious but immobile)</option>
                    <option value="stable">Stable (Minor injuries)</option>
                    <option value="unharmed">Unharmed</option>
                  </select>
                  <ChevronRight size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Need backup?</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="bg-white border-2 border-gray-100 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-blue-200 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition shadow-sm">
                    <input type="radio" name="backup" className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300" />
                    <span className="text-base font-bold text-gray-700">Yes</span>
                  </label>
                  <label className="bg-white border-2 border-gray-100 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-blue-200 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition shadow-sm">
                    <input type="radio" name="backup" className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300" />
                    <span className="text-base font-bold text-gray-700">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Immediate treatment needed?</label>
                <div className="space-y-3">
                  <button onClick={() => submitFeedback('hospital')} className="w-full bg-white border-2 border-gray-100 rounded-xl p-4 flex items-center justify-between text-left hover:border-red-400 hover:bg-red-50 hover:shadow-md transition group shadow-sm">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                        <Hospital size={24} />
                      </div>
                      <div>
                        <div className="font-bold text-lg text-gray-900 group-hover:text-red-700">Route to Hospital</div>
                        <div className="text-sm text-gray-500 mt-0.5 font-medium">{hospitalName}</div>
                      </div>
                    </div>
                    <ChevronRight size={24} className="text-gray-300 group-hover:text-red-500" />
                  </button>
                  <button onClick={() => submitFeedback('camp')} className="w-full bg-white border-2 border-gray-100 rounded-xl p-4 flex items-center justify-between text-left hover:border-blue-400 hover:bg-blue-50 hover:shadow-md transition group shadow-sm">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Tent size={24} />
                      </div>
                      <div>
                        <div className="font-bold text-lg text-gray-900 group-hover:text-blue-700">Route to Base Camp</div>
                        <div className="text-sm text-gray-500 mt-0.5 font-medium">Needs first aid / shelter.</div>
                      </div>
                    </div>
                    <ChevronRight size={24} className="text-gray-300 group-hover:text-blue-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {feedbackSubmitted && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-start justify-center pt-24">
          <div className="bg-gray-900/95 backdrop-blur-md text-white px-6 py-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up opacity-0 delay-200 duration-500 transition-opacity" style={{ animationFillMode: 'forwards' }}>
            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/50">
              <Navigation size={20} />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">New Route Assigned</div>
              <div className="text-sm text-gray-400 font-medium mt-0.5">Navigation updated with priorities.</div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
