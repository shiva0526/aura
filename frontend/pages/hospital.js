import Head from 'next/head'
import { useState, useEffect } from 'react'
import { LayoutDashboard, MessageSquare, Users, Settings, Megaphone, BedDouble, UserCheck, AlertTriangle, Filter } from 'lucide-react'
import { getFinal, getOracle } from '../utils/api'

export default function HospitalDashboard() {
  const [bedInput, setBedInput] = useState('25')
  const [bedsConfirmed, setBedsConfirmed] = useState(false)
  const [mission, setMission] = useState(null)
  const [oracleData, setOracleData] = useState(null)

  // Poll backend for live data
  useEffect(() => {
    const fetchData = async () => {
      const finalData = await getFinal()
      if (finalData && !finalData.status?.includes('waiting')) {
        setMission(finalData)
      }
      const oracle = await getOracle()
      if (oracle && !oracle.status?.includes('waiting')) {
        setOracleData(oracle)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleConfirmBeds = () => {
    setBedsConfirmed(true)
  }

  // Derive live values
  const severity = mission?.severity || oracleData?.severity_level || 'HIGH'
  const severityColor = severity === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' :
    severity === 'MEDIUM' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
      'bg-green-50 text-green-600 border border-green-100'
  const teamsDispatched = mission?.teams || 0
  const routeName = mission?.route || 'Pending...'
  const hospitalName = mission?.hospital || 'This Hospital'
  const weatherCondition = oracleData?.weather?.condition || 'Unknown'
  const wildfire = oracleData?.wildfire_forecast || 'Checking...'

  const incomingPatients = [
    {
      id: '#PT-4829',
      condition: mission ? `Via ${routeName}` : 'Blunt trauma, suspected internal bleeding',
      eta: '2 mins',
      unit: `Medic Unit (${teamsDispatched} teams)`,
      status: severity === 'HIGH' ? 'CRITICAL' : severity === 'MEDIUM' ? 'SEVERE' : 'STABLE',
      statusColor: severity === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' :
        severity === 'MEDIUM' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
          'bg-green-50 text-green-600 border border-green-100'
    },
    { id: '#PT-4830', condition: 'Severe lacerations, hypothermia', eta: '8 mins', unit: 'Rescue Heli Bravo', status: 'SEVERE', statusColor: 'bg-orange-50 text-orange-600 border border-orange-100' },
    { id: '#PT-4831', condition: 'Minor fractures, conscious', eta: '15 mins', unit: 'Transport Bus 2', status: 'STABLE', statusColor: 'bg-green-50 text-green-600 border border-green-100' },
    { id: '#PT-4832', condition: 'Exposure, minor abrasions', eta: '15 mins', unit: 'Transport Bus 2', status: 'STABLE', statusColor: 'bg-green-50 text-green-600 border border-green-100' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex font-inter text-[#18181B] overflow-hidden">
      <Head>
        <title>Hospital Dashboard</title>
      </Head>

      {/* Sidebar */}
      <div className="w-20 bg-white/80 backdrop-blur-xl border-r border-white shadow-xl shadow-blue-900/5 flex flex-col items-center py-8 gap-8 z-30">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-lg shadow-red-500/30 mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" />
            <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <button className="text-white bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-md shadow-red-500/20"><LayoutDashboard size={24} /></button>
        <button className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-all"><MessageSquare size={24} /></button>
        <button className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-all"><Users size={24} /></button>
        <div className="flex-1"></div>
        <button className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-all"><Settings size={24} /></button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-white/50 px-8 py-5 flex justify-between items-center shadow-sm z-20">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Central Hospital Dashboard</h1>
            <p className="text-gray-500 text-sm font-medium">Live status and resource allocation.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${severityColor}`}>
              Severity: {severity}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-widest shadow-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
              System Live
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">

          {/* Urgent Request Banner */}
          {!bedsConfirmed && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white flex justify-between items-center mb-8 shadow-xl shadow-blue-500/30 animate-slide-up relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
              <div className="flex items-center gap-5 relative z-10">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/20">
                  <Megaphone size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl tracking-tight">Urgent Request from Base Camp</h3>
                  <p className="text-blue-100 text-sm mt-1 font-medium">
                    {mission ? `${teamsDispatched} rescue teams dispatched via ${routeName}. ${severity} severity alert.` : 'Mass casualty incident in Sector 7. Immediate bed allocation required.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-black/10 backdrop-blur-sm p-2 rounded-xl border border-white/10 relative z-10">
                <div className="flex items-center gap-3 px-2">
                  <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">Qty</span>
                  <input
                    type="number"
                    value={bedInput}
                    onChange={(e) => setBedInput(e.target.value)}
                    className="w-16 bg-white/20 border border-white/30 text-white font-bold px-2 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-center"
                  />
                  <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">Beds</span>
                </div>
                <button
                  onClick={handleConfirmBeds}
                  className="bg-white text-blue-600 font-bold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-lg transform hover:-translate-y-0.5"
                >
                  Confirm Availability
                </button>
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 col-span-1 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400"></div>
              <div className="flex justify-between items-start mb-5 mt-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <AlertTriangle size={20} className="text-red-500" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Active Calamity</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${severityColor}`}>Severity: {severity}</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Wildfire Status</p>
              <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">{wildfire}</h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Weather</p>
              <h3 className="text-sm font-bold text-gray-800">{weatherCondition}</h3>
              <div className="mt-6 pt-4 border-t border-gray-100 text-xs font-medium text-gray-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> Teams dispatched: {teamsDispatched}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 col-span-1 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gray-300 to-gray-400"></div>
              <div className="flex justify-between items-start mb-2 mt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Capacity</span>
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><BedDouble size={20} /></div>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-2 tracking-tighter">240</h2>
              <p className="text-sm font-medium text-gray-500">Standard + ICU Wards</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 col-span-1 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <div className="flex justify-between items-start mb-2 mt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Allocated</span>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><UserCheck size={20} /></div>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-2 tracking-tighter">215</h2>
              <p className="text-sm text-orange-500 flex items-center gap-1.5 font-bold">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                +12 in last hour
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-xl shadow-red-200/50 col-span-1 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-red-600 z-20"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
              <div className="flex justify-between items-start mb-2 mt-2 relative z-10">
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Remaining Beds</span>
                <div className="p-2 bg-red-50 rounded-lg text-red-500"><AlertTriangle size={20} /></div>
              </div>
              <h2 className="text-5xl font-bold text-red-600 mb-4 tracking-tighter relative z-10">25</h2>

              <div className="relative z-10">
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full" style={{ width: '89%' }}></div>
                </div>
                <p className="text-xs text-red-500 font-bold">89% Capacity Reached</p>
              </div>
            </div>
          </div>

          {/* Incoming Patients Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gray-200 to-gray-300"></div>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center pt-7">
              <div className="flex items-center gap-3 text-gray-900">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 border border-gray-100">
                  <BedDouble size={20} />
                </div>
                <h2 className="font-bold text-xl tracking-tight">Incoming Patients</h2>
              </div>
              <button className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors uppercase tracking-widest">
                <Filter size={14} /> Filter
              </button>
            </div>

            <div className="p-3">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-[10px] text-gray-400 uppercase bg-gray-50/80 font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-xl">ID</th>
                    <th className="px-6 py-4">Condition</th>
                    <th className="px-6 py-4">ETA</th>
                    <th className="px-6 py-4">Escorting Unit</th>
                    <th className="px-6 py-4 text-right rounded-tr-xl">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {incomingPatients.map((patient, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/50 transition-colors group">
                      <td className="px-6 py-5 font-bold text-gray-800">{patient.id}</td>
                      <td className="px-6 py-5 text-gray-600 font-medium">{patient.condition}</td>
                      <td className={`px-6 py-5 font-bold ${patient.eta === '2 mins' ? 'text-red-500' : 'text-gray-600'}`}>
                        {patient.eta}
                      </td>
                      <td className="px-6 py-5 text-gray-500 font-medium">{patient.unit}</td>
                      <td className="px-6 py-5 text-right">
                        <span className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest inline-flex items-center gap-1.5 ${patient.statusColor}`}>
                          {patient.status === 'CRITICAL' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>}
                          {patient.status === 'SEVERE' && <AlertTriangle size={12} strokeWidth={3} />}
                          {patient.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 text-center border-t border-gray-100 bg-gray-50/80 rounded-b-2xl">
              <button className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-blue-600 transition-colors">
                View Full Manifest (14)
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
