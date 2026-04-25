import Head from 'next/head'
import { useState } from 'react'
import { LayoutDashboard, Settings, Moon, Sun, Flame, Thermometer, Droplets, Wind, CloudRain, Leaf, Activity, Map } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import the map so it only loads in the browser
const IgnitionMap = dynamic(() => import('../components/IgnitionMap'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full bg-slate-900 text-slate-400 font-bold tracking-widest uppercase text-sm">Initializing Sensor Grid...</div>
})

export default function PredictorDashboard() {
  const [darkMode, setDarkMode] = useState(false)
  
  // Baseline environmental features
  const [globalFeatures, setGlobalFeatures] = useState({
    temp: 32.0,
    RH: 40.0,
    wind: 12.0,
    rain: 0.0,
    FFMC: 85.0,
    DMC: 110.0,
    ISI: 7.0
  })

  const toggleTheme = () => setDarkMode(!darkMode)

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setGlobalFeatures(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const themeClasses = darkMode
    ? "bg-stone-900 text-stone-200"
    : "bg-[#FAFAF9] text-stone-800"

  const cardClasses = darkMode
    ? "bg-stone-800 border-stone-700"
    : "bg-white border-stone-200 shadow-sm"
    
  const inputClasses = darkMode 
    ? "bg-stone-700 border-stone-600 text-stone-200 accent-orange-500" 
    : "bg-stone-100 border-stone-200 text-stone-800 accent-orange-500"

  const textClasses = darkMode ? "text-stone-100" : "text-stone-900";
  const subTextClasses = darkMode ? "text-stone-400" : "text-stone-500";

  return (
    <div className={`min-h-screen flex font-inter transition-colors duration-500 overflow-hidden ${themeClasses}`}>
      <Head>
        <title>IGNITION PREDICTOR | AURA</title>
      </Head>

      {/* Sidebar */}
      <div className={`w-20 border-r flex flex-col items-center py-8 gap-8 z-30 transition-colors duration-500 ${darkMode ? 'bg-stone-900 border-stone-700' : 'bg-white border-stone-200'}`}>
        <div className="w-12 h-12 bg-orange-500 text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm cursor-pointer">*</div>
        <button className="text-white bg-orange-500 p-3 rounded-xl shadow-sm"><Flame size={24} /></button>
        <button className={`${darkMode ? 'text-stone-400 hover:text-orange-400' : 'text-stone-400 hover:text-orange-500'} hover:bg-orange-50 p-3 rounded-xl transition-all`}><LayoutDashboard size={24} /></button>

        <div className="flex-1"></div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-xl transition-all duration-300 ${darkMode ? 'text-orange-400 bg-stone-800' : 'text-orange-500 bg-orange-50'}`}
        >
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        <button className={`${darkMode ? 'text-stone-400 hover:text-orange-400' : 'text-stone-400 hover:text-orange-500'} hover:bg-orange-50 p-3 rounded-xl transition-all`}><Settings size={24} /></button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className={`border-b px-8 py-5 flex justify-between items-center z-20 transition-colors duration-500 ${darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200 shadow-sm'}`}>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${textClasses}`}>Aura Ignition Forecaster</h1>
            <p className={`text-sm font-medium ${subTextClasses}`}>AI-Driven Spatial Fire Probability Network</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span> Network Active
            </span>
          </div>
        </header>

        <div className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-y-auto">

          {/* Left Column - Large Map */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8 h-full">
            <div className={`rounded-2xl border flex flex-col h-[700px] relative overflow-hidden transition-all duration-500 ${cardClasses}`}>
              <div className={`p-5 border-b flex justify-between items-center z-10 relative ${darkMode ? 'bg-stone-900 border-stone-700' : 'bg-white border-stone-200'}`}>
                <h2 className={`font-bold text-lg flex items-center gap-2 ${textClasses}`}><Map size={18} className="text-orange-500"/> Regional Risk Map</h2>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${subTextClasses}`}>Multi-Sensor Matrix</span>
              </div>
              <div className="flex-1 relative overflow-hidden bg-[#0a0a0a]">
                <IgnitionMap globalFeatures={globalFeatures} />
              </div>
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            <div className={`rounded-2xl border p-6 flex flex-col relative overflow-hidden transition-all duration-500 ${cardClasses}`}>
              <h2 className={`font-bold mb-6 flex items-center gap-2 ${textClasses}`}>
                <Activity size={18} className="text-orange-500" /> Regional Climate Baseline
              </h2>
              <p className={`text-xs mb-6 ${subTextClasses}`}>
                Adjust the baseline environmental factors below. The map will automatically calculate and display the microclimate ignition risk for each sensor location in real-time.
              </p>

              <div className="flex flex-col gap-5 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                {/* Temperature */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className={`flex items-center gap-1.5 font-semibold ${subTextClasses}`}><Thermometer size={16}/> Temp (°C)</span>
                        <span className={`font-bold ${textClasses}`}>{globalFeatures.temp}</span>
                    </div>
                    <input type="range" name="temp" min="0" max="50" step="0.5" value={globalFeatures.temp} onChange={handleSliderChange} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${inputClasses}`} />
                </div>

                {/* Relative Humidity */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className={`flex items-center gap-1.5 font-semibold ${subTextClasses}`}><Droplets size={16}/> Humidity (%)</span>
                        <span className={`font-bold ${textClasses}`}>{globalFeatures.RH}</span>
                    </div>
                    <input type="range" name="RH" min="0" max="100" step="1" value={globalFeatures.RH} onChange={handleSliderChange} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${inputClasses}`} />
                </div>

                {/* Wind Speed */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className={`flex items-center gap-1.5 font-semibold ${subTextClasses}`}><Wind size={16}/> Wind (km/h)</span>
                        <span className={`font-bold ${textClasses}`}>{globalFeatures.wind}</span>
                    </div>
                    <input type="range" name="wind" min="0" max="100" step="1" value={globalFeatures.wind} onChange={handleSliderChange} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${inputClasses}`} />
                </div>

                {/* Rain */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className={`flex items-center gap-1.5 font-semibold ${subTextClasses}`}><CloudRain size={16}/> Rain (mm)</span>
                        <span className={`font-bold ${textClasses}`}>{globalFeatures.rain}</span>
                    </div>
                    <input type="range" name="rain" min="0" max="50" step="0.1" value={globalFeatures.rain} onChange={handleSliderChange} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${inputClasses}`} />
                </div>

                <div className="h-px w-full bg-slate-800/50 my-2"></div>

                {/* FFMC */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className={`flex items-center gap-1.5 font-semibold ${subTextClasses}`}><Leaf size={16}/> FFMC Index</span>
                        <span className={`font-bold ${textClasses}`}>{globalFeatures.FFMC}</span>
                    </div>
                    <input type="range" name="FFMC" min="18.7" max="96.2" step="0.1" value={globalFeatures.FFMC} onChange={handleSliderChange} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${inputClasses}`} />
                </div>

                {/* DMC */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className={`flex items-center gap-1.5 font-semibold ${subTextClasses}`}><Activity size={16}/> DMC Index</span>
                        <span className={`font-bold ${textClasses}`}>{globalFeatures.DMC}</span>
                    </div>
                    <input type="range" name="DMC" min="1.1" max="291.3" step="0.1" value={globalFeatures.DMC} onChange={handleSliderChange} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${inputClasses}`} />
                </div>

                {/* ISI */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className={`flex items-center gap-1.5 font-semibold ${subTextClasses}`}><Activity size={16}/> ISI Index</span>
                        <span className={`font-bold ${textClasses}`}>{globalFeatures.ISI}</span>
                    </div>
                    <input type="range" name="ISI" min="0" max="56.1" step="0.1" value={globalFeatures.ISI} onChange={handleSliderChange} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${inputClasses}`} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
