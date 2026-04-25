import React, { useState, useEffect } from 'react';
import { getIgnitionPrediction } from '../utils/api';
import { Flame, Thermometer, Droplets, Wind, CloudRain, Leaf, Activity } from 'lucide-react';

export default function IgnitionWidget({ darkMode = true }) {
    const [features, setFeatures] = useState({
        temp: 35.0,
        RH: 30.0,
        wind: 15.0,
        rain: 0.0,
        FFMC: 90.0,
        DMC: 120.0,
        ISI: 8.5
    });

    const [prediction, setPrediction] = useState({ ignition_probability: 0, risk_level: 'SAFE' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPrediction = async () => {
            setLoading(true);
            const data = await getIgnitionPrediction(features);
            if (data) {
                setPrediction(data);
            }
            setLoading(false);
        };
        
        // Debounce fetching slightly to avoid spamming the backend while dragging sliders
        const timeoutId = setTimeout(() => {
            fetchPrediction();
        }, 300);
        
        return () => clearTimeout(timeoutId);
    }, [features]);

    const handleSliderChange = (e) => {
        const { name, value } = e.target;
        setFeatures(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    // Color mapping
    const getRiskColor = (level) => {
        if (level === 'CRITICAL') return 'text-red-500';
        if (level === 'WARNING') return 'text-yellow-500';
        return 'text-green-500';
    };

    const getRiskBg = (level) => {
        if (level === 'CRITICAL') return 'bg-red-500';
        if (level === 'WARNING') return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getRiskGradient = (level) => {
        if (level === 'CRITICAL') return 'from-red-500 to-orange-500';
        if (level === 'WARNING') return 'from-yellow-500 to-orange-400';
        return 'from-green-500 to-emerald-400';
    };

    const containerClasses = darkMode
        ? "bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl shadow-black/20"
        : "bg-white/80 border-white backdrop-blur-md shadow-xl shadow-blue-900/5";

    const textClasses = darkMode ? "text-white" : "text-gray-900";
    const subTextClasses = darkMode ? "text-slate-400" : "text-gray-500";
    const inputClasses = darkMode ? "bg-slate-800/50 border-slate-700 text-slate-300 accent-blue-500" : "bg-gray-100 border-gray-200 text-gray-700 accent-blue-600";

    return (
        <div className={`rounded-2xl border p-6 flex flex-col relative overflow-hidden transition-all duration-500 ${containerClasses}`}>
            <h2 className={`font-bold mb-6 flex items-center gap-2 ${textClasses}`}>
                <Flame size={18} className={getRiskColor(prediction.risk_level)} /> 
                Ignition Forecaster
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side: Circular Gauge */}
                <div className="flex flex-col items-center justify-center">
                    <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                        {/* Background Track */}
                        <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className={`${darkMode ? 'text-slate-800' : 'text-gray-200'}`} />
                            {/* Progress Arc */}
                            <circle 
                                cx="80" 
                                cy="80" 
                                r="70" 
                                stroke="currentColor" 
                                strokeWidth="8" 
                                fill="transparent" 
                                strokeDasharray="439.8" 
                                strokeDashoffset={439.8 - (prediction.ignition_probability / 100) * 439.8}
                                strokeLinecap="round"
                                className={`transition-all duration-1000 ease-out ${getRiskColor(prediction.risk_level)}`} 
                            />
                        </svg>
                        
                        {/* Inner Content */}
                        <div className="absolute flex flex-col items-center justify-center bg-transparent rounded-full w-28 h-28 z-10 shadow-inner">
                            <span className={`text-3xl font-black ${textClasses}`}>{Math.round(prediction.ignition_probability)}%</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${getRiskColor(prediction.risk_level)}`}>{prediction.risk_level}</span>
                        </div>

                        {/* Outer Glow */}
                        <div className={`absolute w-full h-full rounded-full blur-xl opacity-20 -z-10 bg-gradient-to-br ${getRiskGradient(prediction.risk_level)}`}></div>
                    </div>
                </div>

                {/* Right Side: Interactive Sliders */}
                <div className="flex flex-col gap-4 overflow-y-auto max-h-64 pr-2 custom-scrollbar">
                    {/* Temperature */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                            <span className={`flex items-center gap-1 font-semibold ${subTextClasses}`}><Thermometer size={14}/> Temp (°C)</span>
                            <span className={`font-bold ${textClasses}`}>{features.temp}</span>
                        </div>
                        <input type="range" name="temp" min="0" max="50" step="0.5" value={features.temp} onChange={handleSliderChange} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${inputClasses}`} />
                    </div>

                    {/* Relative Humidity */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                            <span className={`flex items-center gap-1 font-semibold ${subTextClasses}`}><Droplets size={14}/> Humidity (%)</span>
                            <span className={`font-bold ${textClasses}`}>{features.RH}</span>
                        </div>
                        <input type="range" name="RH" min="0" max="100" step="1" value={features.RH} onChange={handleSliderChange} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${inputClasses}`} />
                    </div>

                    {/* Wind Speed */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                            <span className={`flex items-center gap-1 font-semibold ${subTextClasses}`}><Wind size={14}/> Wind (km/h)</span>
                            <span className={`font-bold ${textClasses}`}>{features.wind}</span>
                        </div>
                        <input type="range" name="wind" min="0" max="100" step="1" value={features.wind} onChange={handleSliderChange} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${inputClasses}`} />
                    </div>

                    {/* Rain */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                            <span className={`flex items-center gap-1 font-semibold ${subTextClasses}`}><CloudRain size={14}/> Rain (mm)</span>
                            <span className={`font-bold ${textClasses}`}>{features.rain}</span>
                        </div>
                        <input type="range" name="rain" min="0" max="50" step="0.1" value={features.rain} onChange={handleSliderChange} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${inputClasses}`} />
                    </div>

                    {/* FFMC */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                            <span className={`flex items-center gap-1 font-semibold ${subTextClasses}`}><Leaf size={14}/> FFMC Index</span>
                            <span className={`font-bold ${textClasses}`}>{features.FFMC}</span>
                        </div>
                        <input type="range" name="FFMC" min="18.7" max="96.2" step="0.1" value={features.FFMC} onChange={handleSliderChange} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${inputClasses}`} />
                    </div>

                    {/* DMC */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                            <span className={`flex items-center gap-1 font-semibold ${subTextClasses}`}><Activity size={14}/> DMC Index</span>
                            <span className={`font-bold ${textClasses}`}>{features.DMC}</span>
                        </div>
                        <input type="range" name="DMC" min="1.1" max="291.3" step="0.1" value={features.DMC} onChange={handleSliderChange} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${inputClasses}`} />
                    </div>

                    {/* ISI */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                            <span className={`flex items-center gap-1 font-semibold ${subTextClasses}`}><Activity size={14}/> ISI Index</span>
                            <span className={`font-bold ${textClasses}`}>{features.ISI}</span>
                        </div>
                        <input type="range" name="ISI" min="0" max="56.1" step="0.1" value={features.ISI} onChange={handleSliderChange} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${inputClasses}`} />
                    </div>
                </div>
            </div>
        </div>
    );
}
