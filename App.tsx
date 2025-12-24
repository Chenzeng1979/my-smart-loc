import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import SearchModal from './components/SearchModal';
import MapControl from './components/MapControl';
import { Location, AppPreset, SearchResult } from './types';

const App: React.FC = () => {
  const [history, setHistory] = useState<Location[]>([]);
  const [currentPreset, setCurrentPreset] = useState<AppPreset>(AppPreset.DINGTALK);
  const [currentPos, setCurrentPos] = useState<[number, number]>([39.9087, 116.3975]); 
  const [selectedLocation, setSelectedLocation] = useState<SearchResult | null>(null);
  const [showStatus, setShowStatus] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [mapStyle, setMapStyle] = useState<'normal' | 'satellite'>('normal');

  useEffect(() => {
    const saved = localStorage.getItem('smartloc_history');
    if (saved) { try { setHistory(JSON.parse(saved)); } catch (e) { console.error(e); } }
  }, []);

  const handleSelectResult = useCallback((res: SearchResult) => {
    setSelectedLocation(res);
    setCurrentPos([res.lat, res.lng]);
  }, []);

  const handleTeleport = () => {
    if (!selectedLocation) return;
    setStatusMsg(`高德引擎正在重写 GPS 信号...`);
    setShowStatus(true);
    setTimeout(() => {
      const newLoc: Location = {
        id: Date.now().toString(),
        name: selectedLocation.name,
        address: selectedLocation.address,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        timestamp: Date.now()
      };
      const newHistory = [newLoc, ...history.filter(h => h.name !== newLoc.name)].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('smartloc_history', JSON.stringify(newHistory));
      setStatusMsg(`[高德内核] ${selectedLocation.name} 定位成功`);
      setTimeout(() => setShowStatus(false), 3000);
    }, 1200);
  };

  return (
    <div className="flex h-screen w-full bg-slate-900 overflow-hidden antialiased">
      <div className="hidden lg:block w-80 h-full bg-white shadow-2xl z-20">
        <Sidebar 
          history={history}
          currentPreset={currentPreset}
          setPreset={setCurrentPreset}
          onSelectHistory={(loc) => handleSelectResult({ ...loc, description: '' })}
          onClearHistory={() => { setHistory([]); localStorage.removeItem('smartloc_history'); }}
        />
      </div>
      <div className="flex-1 relative">
        <SearchModal onSelect={handleSelectResult} />
        <MapControl 
          center={currentPos} 
          viewMode={viewMode}
          mapStyle={mapStyle}
          onLocationChange={(lat, lng) => handleSelectResult({
            name: `自定义坐标点`, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng, description: ''
          })} 
        />
        <div className="absolute top-28 right-6 z-[1000] flex flex-col gap-3">
           <button onClick={() => setMapStyle(mapStyle === 'normal' ? 'satellite' : 'normal')} className={`w-12 h-12 rounded-xl shadow-xl flex items-center justify-center transition-all ${mapStyle === 'satellite' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945" /></svg>
           </button>
           <button onClick={() => setViewMode(viewMode === '2D' ? '3D' : '2D')} className={`w-12 h-12 rounded-xl shadow-xl flex items-center justify-center font-bold ${viewMode === '3D' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}>
             {viewMode === '2D' ? '3D' : '2D'}
           </button>
        </div>
        {selectedLocation && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[1000]">
            <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-6 border border-white/50">
                <h2 className="text-xl font-bold text-slate-900">{selectedLocation.name}</h2>
                <p className="text-xs text-slate-400 mt-1 mb-4">{selectedLocation.address}</p>
                <button onClick={handleTeleport} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all">开始模拟定位</button>
            </div>
          </div>
        )}
        {showStatus && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[2000]">
            <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>{statusMsg}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
