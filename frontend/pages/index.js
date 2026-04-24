import Head from 'next/head'
import { useRouter } from 'next/router'
import { MonitorDot, MapPin, PlusSquare, ShieldAlert } from 'lucide-react'

export default function RoleSelection() {
  const router = useRouter()

  const roles = [
    {
      id: 'camp',
      title: 'Camp Officer',
      icon: <MonitorDot size={32} className="text-white mb-2" />,
      color: 'from-blue-500 to-blue-600',
      path: '/camp',
      disabled: false
    },
    {
      id: 'ground',
      title: 'Ground Officer',
      icon: <MapPin size={32} className="text-white mb-2" />,
      color: 'from-green-500 to-green-600',
      path: '/ground',
      disabled: false
    },
    {
      id: 'hospital',
      title: 'Hospital',
      icon: <PlusSquare size={32} className="text-white mb-2" />,
      color: 'from-red-500 to-red-600',
      path: '/hospital',
      disabled: false
    },
    {
      id: 'admin',
      title: 'Admin',
      icon: <ShieldAlert size={32} className="text-gray-400 mb-2" />,
      color: 'from-gray-200 to-gray-300',
      path: '#',
      disabled: true,
      tag: 'Coming soon'
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6 font-inter">
      <Head>
        <title>RescueOps - Login</title>
      </Head>

      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-xl shadow-blue-900/5 border border-white max-w-lg w-full text-center animate-fade-in relative overflow-hidden">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-green-400 to-red-500"></div>

        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg shadow-blue-500/30">
          *
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">RescueOps</h1>
        <p className="text-gray-500 text-sm mb-10 font-medium">Select your operational role to continue</p>
        
        <div className="grid grid-cols-2 gap-5">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => !role.disabled && router.push(role.path)}
              disabled={role.disabled}
              className={`relative flex flex-col items-center justify-center p-6 border rounded-2xl transition-all duration-300 group
                ${role.disabled 
                  ? 'border-gray-100 bg-gray-50/50 opacity-60 cursor-not-allowed' 
                  : 'border-white bg-white hover:border-blue-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer transform hover:-translate-y-1'
                }
              `}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-md ${
                role.disabled ? 'bg-gray-100 shadow-none' : `bg-gradient-to-br ${role.color} shadow-${role.color.split('-')[1]}-500/30`
              }`}>
                {role.icon}
              </div>
              
              <span className={`font-bold text-sm ${role.disabled ? 'text-gray-400' : 'text-gray-800'}`}>
                {role.title}
              </span>
              
              {role.tag && (
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-gray-200 text-gray-500 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {role.tag}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
