import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Lead } from '../../store/useCrmStore';
import { Navigation, Compass, ClipboardList } from 'lucide-react';

// Default center (e.g. Coronel Pringles / Argentina or fallback)
const DEFAULT_CENTER = { lat: -37.980, lng: -61.397, zoom: 15 };

const COLOR_POR_ESTADO: Record<string, string> = {
  confirmado: '#16a34a', // Green
  indeciso: '#eab308',  // Yellow
  potencial: '#3b82f6', // Blue
  negado: '#dc2626',    // Red
};

function getEstadoLead(lead: Lead): { valor: string; etiqueta: string; emoji: string } {
  const cat = (lead.categoria || '').toLowerCase().trim();
  const estadoRaw = lead.estado?.toLowerCase() || 'potencial';

  // 1. Confirmado / Ganado / Terminado (Verde)
  if (
    cat === 'aceptado' ||
    cat === 'ganado' ||
    cat === 'terminado' ||
    cat === 'completado' ||
    cat.includes('aceptad') ||
    cat.includes('ganad') ||
    cat.includes('terminad') ||
    cat.includes('exit') ||
    cat.includes('ok') ||
    estadoRaw === 'aprobado' ||
    estadoRaw === 'confirmado'
  ) {
    return { valor: 'confirmado', etiqueta: 'Confirmado', emoji: '✅' };
  }

  // 2. Negado / Rechazado / Perdido (Rojo)
  if (
    cat === 'rechazado' ||
    cat === 'perdido' ||
    cat === 'cancelado' ||
    cat.includes('rechazad') ||
    cat.includes('perdid') ||
    cat.includes('cancelad') ||
    estadoRaw === 'negado'
  ) {
    return { valor: 'negado', etiqueta: 'Negado', emoji: '❌' };
  }

  // 3. Indeciso / Seguimiento / Propuestas (Amarillo)
  if (
    cat === 'indeciso' ||
    cat.includes('llamada') ||
    cat.includes('propuesta') ||
    cat.includes('espera') ||
    cat.includes('seguimiento') ||
    estadoRaw === 'indeciso'
  ) {
    return { valor: 'indeciso', etiqueta: 'Indeciso', emoji: '🤔' };
  }

  // 4. Default / Potencial / Lead (Azul)
  return { valor: 'potencial', etiqueta: 'Potencial', emoji: '⏳' };
}

function construirIconoCliente(lead: Lead) {
  const estado = getEstadoLead(lead);
  const color = COLOR_POR_ESTADO[estado.valor] || '#3b82f6';

  return L.divIcon({
    className: 'marcador-cliente-div',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100px;
        height: 60px;
      ">
        <!-- Circular pin with AppyStudio logo and status border -->
        <div style="
          background-color: #09090b;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid ${color};
          box-shadow: 0 4px 10px rgba(0,0,0,0.6);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <img src="/appyStudio.jpeg" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        
        <!-- Label below -->
        <div style="
          margin-top: 4px;
          background-color: rgba(9, 9, 11, 0.9);
          border: 1px solid rgba(63, 63, 70, 0.8);
          padding: 2px 6px;
          border-radius: 6px;
          color: #ffffff;
          font-family: system-ui, -apple-system, sans-serif;
          font-weight: 800;
          font-size: 9px;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        ">
          ${lead.nombre}
        </div>
      </div>
    `,
    iconSize: [100, 60],
    iconAnchor: [50, 16],
    popupAnchor: [0, -16],
  });
}

interface ClientesMapaProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onMapClick: (lat: number, lng: number, address: string) => void;
  selectedLead: Lead | null;
}

// Controller component to center/fly map when requested
function MapController({ centrarEn }: { centrarEn: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (centrarEn) {
      map.flyTo(centrarEn, Math.max(map.getZoom(), 16));
    }
  }, [centrarEn, map]);
  return null;
}

// Capture clicks on the map to trigger client creation
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number, address: string) => void }) {
  const [loadingGeocode, setLoadingGeocode] = useState(false);
  
  useMapEvents({
    async click(e) {
      if (loadingGeocode) return;
      setLoadingGeocode(true);
      const { lat, lng } = e.latlng;
      let addressStr = '';
      try {
        // Reverse geocoding with OpenStreetMap Nominatim
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        if (res.ok) {
          const data = await res.json();
          addressStr = data.display_name || '';
        }
      } catch (err) {
        console.error('Error reverse geocoding', err);
      } finally {
        setLoadingGeocode(false);
        onMapClick(lat, lng, addressStr);
      }
    }
  });
  return null;
}

export const ClientesMapa: React.FC<ClientesMapaProps> = ({ leads, onSelectLead, onMapClick, selectedLead }) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);

  // Filter leads that actually have valid geo coordinates
  const geoLeads = useMemo(() => {
    return leads.filter(l => typeof l.latitud === 'number' && typeof l.longitud === 'number');
  }, [leads]);

  // Request browser location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          // Only auto-fly to user if there are no existing leads mapped
          if (geoLeads.length === 0) {
            setFlyToCoords(coords);
          }
        },
        (error) => {
          console.warn('Geolocation access denied or unavailable', error);
        }
      );
    }
  }, [geoLeads.length]);

  // If a lead is selected externally, fly to it
  useEffect(() => {
    if (selectedLead && typeof selectedLead.latitud === 'number' && typeof selectedLead.longitud === 'number') {
      setFlyToCoords([selectedLead.latitud, selectedLead.longitud]);
    }
  }, [selectedLead]);

  const handleFlyToUser = () => {
    if (userLocation) {
      setFlyToCoords([...userLocation]);
    } else {
      // Re-trigger request
      navigator.geolocation.getCurrentPosition((position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
        setFlyToCoords(coords);
      });
    }
  };

  // Live blue dot divIcon for user position
  const userIcon = useMemo(() => {
    return L.divIcon({
      className: 'punto-azul-vivo-marcador',
      html: `
        <div style="position: relative; width: 20px; height: 20px;">
          <div style="
            position: absolute;
            width: 14px;
            height: 14px;
            background-color: #3b82f6;
            border: 2.5px solid white;
            border-radius: 50%;
            top: 3px;
            left: 3px;
            z-index: 10;
            box-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
          "></div>
          <div style="
            position: absolute;
            width: 20px;
            height: 20px;
            background-color: rgba(59, 130, 246, 0.4);
            border-radius: 50%;
            animation: pulse-halo 2s infinite ease-out;
          "></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }, []);

  // Center coordinate of map
  const mapCenter: [number, number] = useMemo(() => {
    if (geoLeads.length > 0 && typeof geoLeads[0].latitud === 'number' && typeof geoLeads[0].longitud === 'number') {
      return [geoLeads[0].latitud, geoLeads[0].longitud];
    }
    return [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng];
  }, [geoLeads]);

  // Helper to extract city name
  const extraerCiudad = (direccion?: string): string => {
    if (!direccion) return 'Sin dirección';
    const partes = direccion.split(',').map(p => p.trim());
    for (const part of partes) {
      if (part.toLowerCase().includes('pringles')) return 'Coronel Pringles';
      if (part.toLowerCase().includes('bahia blanca') || part.toLowerCase().includes('bahía blanca')) return 'Bahía Blanca';
      if (part.toLowerCase().includes('buenos aires')) continue;
      if (part.toLowerCase().includes('argentina')) continue;
    }
    if (partes.length >= 3 && isNaN(Number(partes[2]))) return partes[2];
    if (partes.length >= 2 && isNaN(Number(partes[1]))) return partes[1];
    return 'Otras';
  };

  // Grouping metrics
  const metricas = useMemo(() => {
    const rubrosMap: Record<string, number> = {};
    const ciudadesMap: Record<string, number> = {};
    const estadosMap: Record<string, number> = {
      'Confirmado': 0,
      'Potencial': 0,
      'Indeciso': 0,
      'Negado': 0
    };

    leads.forEach(lead => {
      // 1. Rubro
      const rub = lead.rubro ? lead.rubro.trim() : 'Sin rubro';
      rubrosMap[rub] = (rubrosMap[rub] || 0) + 1;

      // 2. Ciudad
      const cd = extraerCiudad(lead.direccionTexto);
      ciudadesMap[cd] = (ciudadesMap[cd] || 0) + 1;

      // 3. Estado
      const estadoInfo = getEstadoLead(lead);
      estadosMap[estadoInfo.etiqueta] = (estadosMap[estadoInfo.etiqueta] || 0) + 1;
    });

    return {
      rubros: Object.entries(rubrosMap).sort((a, b) => b[1] - a[1]),
      ciudades: Object.entries(ciudadesMap).sort((a, b) => b[1] - a[1]),
      estados: Object.entries(estadosMap).filter(([_, count]) => count > 0)
    };
  }, [leads]);

  return (
    <div className="relative w-full h-[580px] rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col lg:flex-row">
      {/* Map container (Left on desktop) */}
      <div className="relative flex-1 h-[400px] lg:h-full">
        {/* Map Header */}
      <div className="absolute top-4 left-4 z-[1000] bg-zinc-900/90 border border-zinc-800 backdrop-blur-md px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-xl">
        <Compass className="text-emerald-400 size-4 animate-spin-slow" />
        <div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Clientes Registrados</span>
          <span className="text-white text-xs font-black">{geoLeads.length} en el mapa</span>
        </div>
      </div>

      {/* Fly to user location button */}
      <button
        onClick={handleFlyToUser}
        className="absolute bottom-6 right-6 z-[1000] p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-2xl text-xs font-bold"
        title="Centrar en mi ubicación"
      >
        <Navigation size={14} className="text-emerald-400 rotate-45" />
        <span>Mi ubicación</span>
      </button>

      {/* Embedded style tag for animations */}
      <style>{`
        @keyframes pulse-halo {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .leaflet-container {
          background-color: #0c0a09 !important;
        }
        /* Dark map style hacks */
        .dark-tile-layer {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
      `}</style>

      <MapContainer
        center={mapCenter}
        zoom={DEFAULT_CENTER.zoom}
        scrollWheelZoom
        className="w-full h-full"
      >
        <TileLayer
          className="dark-tile-layer"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController centrarEn={flyToCoords} />
        <MapClickHandler onMapClick={onMapClick} />

        {/* User position */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon} interactive={false} />
        )}

        {/* Client markers */}
        {geoLeads.map((lead) => {
          const leadState = getEstadoLead(lead);
          return (
            <Marker
              key={lead.id}
              position={[lead.latitud!, lead.longitud!]}
              icon={construirIconoCliente(lead)}
            >
              <Popup>
                <div className="min-w-[200px] p-2 bg-zinc-950 text-white rounded-xl space-y-2 font-sans">
                  <div className="w-full h-20 rounded-lg overflow-hidden border border-zinc-850 mb-1">
                    <img 
                      src="/appyStudio.jpeg" 
                      alt="AppyStudio" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-extrabold text-sm text-white leading-tight">{lead.nombre}</h4>
                  {lead.rubro && (
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md inline-block">
                      🏷️ {lead.rubro}
                    </span>
                  )}
                  {lead.direccionTexto && (
                    <p className="text-[10px] text-zinc-550 leading-snug">{lead.direccionTexto}</p>
                  )}
                  <div className="text-[10px] flex items-center gap-1">
                    <span>{leadState.emoji}</span>
                    <span className="font-bold capitalize">{leadState.etiqueta}</span>
                    {lead.tipoSoftwareQuiere && (
                      <span className="text-zinc-400">· {lead.tipoSoftwareQuiere}</span>
                    )}
                  </div>
                  <button
                    onClick={() => onSelectLead(lead)}
                    className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-bold py-1.5 rounded-lg transition-colors"
                  >
                    Abrir Ficha Comercial
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      </div>

      {/* Sidebar de Métricas / Leyenda */}
      <div className="w-full lg:w-80 bg-zinc-900/40 backdrop-blur-md p-5 overflow-y-auto neon-scrollbar flex flex-col gap-5 text-white">
        <div className="border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <ClipboardList className="text-emerald-400 size-4" />
            <span>Métricas del Relevamiento</span>
          </h3>
          <p className="text-[10px] text-zinc-550 mt-1">Resumen consolidado comercial</p>
        </div>

        {/* Estados */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Por Estado</h4>
          <div className="grid grid-cols-2 gap-2">
            {metricas.estados.map(([estado, count]) => {
              const bg = estado === 'Confirmado' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                         estado === 'Indeciso' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                         estado === 'Negado' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                         'bg-blue-500/10 border-blue-500/20 text-blue-400';
              return (
                <div key={estado} className={`p-2 rounded-xl border ${bg} text-center flex flex-col items-center justify-center`}>
                  <span className="text-xs font-black">{count}</span>
                  <span className="text-[9px] uppercase tracking-wider font-bold block mt-0.5">{estado}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ciudades */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Por Ciudad</h4>
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 neon-scrollbar">
            {metricas.ciudades.map(([ciudad, count]) => (
              <div key={ciudad} className="flex justify-between items-center bg-zinc-950/40 border border-zinc-850 px-3 py-2 rounded-xl text-xs">
                <span className="font-bold text-zinc-350 truncate pr-2">{ciudad}</span>
                <span className="bg-zinc-850 px-2 py-0.5 rounded-lg font-black text-[10px] text-zinc-300">{count}</span>
              </div>
            ))}
            {metricas.ciudades.length === 0 && (
              <p className="text-[10px] text-zinc-500 italic">No hay direcciones registradas.</p>
            )}
          </div>
        </div>

        {/* Rubros */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Por Rubro</h4>
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 neon-scrollbar">
            {metricas.rubros.map(([rubro, count]) => (
              <div key={rubro} className="flex justify-between items-center bg-zinc-950/40 border border-zinc-850 px-3 py-2 rounded-xl text-xs">
                <span className="font-bold text-zinc-350 truncate pr-2">🏷️ {rubro}</span>
                <span className="bg-zinc-850 px-2 py-0.5 rounded-lg font-black text-[10px] text-zinc-300">{count}</span>
              </div>
            ))}
            {metricas.rubros.length === 0 && (
              <p className="text-[10px] text-zinc-500 italic">No hay rubros definidos.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
