import React, { useState } from 'react';
import { Factory } from '../types';
import { MapPin, Navigation, Compass, Layers, ZoomIn, ZoomOut } from 'lucide-react';

interface GeofenceMapProps {
  factory?: Factory;
  radiusMeters?: number;
  onRadiusChange?: (newRadius: number) => void;
  interactiveRadius?: boolean;
  busPositionPercent?: number; // 0 to 100 along route
  plate?: string;
  isCompleted?: boolean;
  showBus?: boolean;
  heightClass?: string;
  isPassengerView?: boolean; // Hides technical geofence badges
}

export const GeofenceMap: React.FC<GeofenceMapProps> = ({
  factory,
  radiusMeters = 150,
  onRadiusChange,
  interactiveRadius = false,
  busPositionPercent = 75,
  plate = '26 S 2244',
  isCompleted = false,
  showBus = true,
  heightClass = 'h-56',
  isPassengerView = false,
}) => {
  const [zoom, setZoom] = useState(1);

  // Map coordinate bounds
  const gateX = 180;
  const gateY = 110;

  // Visual radius in SVG units: 150m is approx 65px
  const visualRadius = Math.max(30, Math.min(100, (radiusMeters / 150) * 65 * zoom));

  // Route path calculation for bus
  const busT = Math.min(100, Math.max(0, busPositionPercent)) / 100;
  const p0 = { x: 45, y: 195 };
  const p1 = { x: 90, y: 175 };
  const p2 = { x: 135, y: 140 };
  const p3 = { x: gateX, y: gateY };

  // Cubic bezier point
  const u = 1 - busT;
  const busX = u * u * u * p0.x + 3 * u * u * busT * p1.x + 3 * u * busT * busT * p2.x + busT * busT * busT * p3.x;
  const busY = u * u * u * p0.y + 3 * u * u * busT * p1.y + 3 * u * busT * busT * p2.y + busT * busT * busT * p3.y;

  const distPixels = Math.hypot(busX - gateX, busY - gateY);
  const insideGeofence = distPixels <= visualRadius;

  return (
    <div className={`relative w-full ${heightClass} bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 select-none shadow-inner`}>
      {/* SVG Map Canvas */}
      <svg className="w-full h-full" viewBox="0 0 360 220" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="geofenceGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity={isPassengerView ? "0.1" : "0.35"} />
            <stop offset="70%" stopColor="#0284c7" stopOpacity={isPassengerView ? "0.05" : "0.15"} />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>

          <pattern id="gridPattern" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="0.75" />
          </pattern>
        </defs>

        {/* Base Grid */}
        <rect width="100%" height="100%" fill="#090d16" />
        <rect width="100%" height="100%" fill="url(#gridPattern)" />

        {/* Industrial Zone Road Network */}
        <path
          d="M 10 215 Q 110 185, 200 120 T 350 40"
          fill="none"
          stroke="#1e293b"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path
          d="M 10 215 Q 110 185, 200 120 T 350 40"
          fill="none"
          stroke="#334155"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M 10 215 Q 110 185, 200 120 T 350 40"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.4"
        />

        {/* Secondary Avenue into Factory Gate */}
        <path
          d="M 170 120 L 180 80 L 260 75"
          fill="none"
          stroke="#1e293b"
          strokeWidth="14"
          strokeLinejoin="round"
        />
        <path
          d="M 170 120 L 180 80 L 260 75"
          fill="none"
          stroke="#334155"
          strokeWidth="11"
          strokeLinejoin="round"
        />

        {/* Destination Campus Outline */}
        <rect
          x="195"
          y="25"
          width="145"
          height="80"
          rx="8"
          fill="#0f172a"
          stroke="#1e293b"
          strokeWidth="1.5"
        />
        <text x="210" y="50" fill="#94a3b8" fontSize="9" fontWeight="bold" letterSpacing="0.5">
          {factory ? factory.shortName : 'HEDEF NOKTA'}
        </text>
        <text x="210" y="65" fill="#64748b" fontSize="7">
          Giriş & İndirme Noktası
        </text>

        {/* Destination Gate Checkpoint Point */}
        <rect x="172" y="102" width="16" height="16" rx="4" fill="#0284c7" opacity="0.9" />
        <path d="M 176 110 L 184 110" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

        {/* Circular Geofence Zone (Rendered quietly in passenger view, prominent in admin) */}
        {!isPassengerView && (
          <>
            <circle
              cx={gateX}
              cy={gateY}
              r={visualRadius}
              fill="url(#geofenceGradient)"
              stroke="#38bdf8"
              strokeWidth="1.75"
              strokeDasharray="5 3"
            />
            <circle
              cx={gateX}
              cy={gateY}
              r={visualRadius * 0.9}
              fill="none"
              stroke="#0284c7"
              strokeWidth="1"
              opacity="0.5"
              className="animate-pulse"
            />
            <text
              x={gateX}
              y={gateY - visualRadius - 4}
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="9"
              fontWeight="bold"
            >
              Nizamiye Geofence ({radiusMeters}m)
            </text>
          </>
        )}

        {/* Gate Pin Label */}
        <circle cx={gateX} cy={gateY} r="4" fill="#ffffff" />

        {/* Shuttle Bus Marker (Requirement 17: HIDDEN IF isCompleted) */}
        {showBus && !isCompleted && (
          <g transform={`translate(${busX}, ${busY})`}>
            <circle cx="0" cy="0" r="14" fill="#f59e0b" opacity="0.25" className="animate-ping" />
            <circle cx="0" cy="0" r="10" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            <path
              d="M -3 -4 L 4 0 L -3 4 Z"
              fill="#0f172a"
              transform={`rotate(${insideGeofence ? -45 : -25})`}
            />

            {/* License plate chip */}
            <g transform="translate(0, -16)">
              <rect
                x="-26"
                y="-10"
                width="52"
                height="14"
                rx="4"
                fill="#0f172a"
                stroke="#f59e0b"
                strokeWidth="1"
              />
              <text x="0" y="0" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="bold">
                {plate}
              </text>
            </g>
          </g>
        )}
      </svg>

      {/* Floating Geofence Status Badge (ONLY in admin/driver view, HIDDEN in passenger view) */}
      {!isPassengerView && (
        <div className="absolute top-2.5 left-2.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700/60 shadow-lg flex items-center gap-2 text-[10px]">
          <div className={`w-2 h-2 rounded-full ${insideGeofence ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
          <span className="font-semibold text-slate-200">
            {insideGeofence ? 'Geofence Bölgesi İÇİNDE' : 'Kapıya Yaklaşıyor'}
          </span>
          <span className="text-slate-400">· {radiusMeters}m Çember</span>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1">
        <button
          onClick={() => setZoom((z) => Math.min(1.4, z + 0.15))}
          className="w-7 h-7 bg-slate-900/90 border border-slate-700/80 rounded-lg flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shadow-md"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
          className="w-7 h-7 bg-slate-900/90 border border-slate-700/80 rounded-lg flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shadow-md"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Geofence Radius Slider (When enabled by company screen) */}
      {interactiveRadius && onRadiusChange && !isPassengerView && (
        <div className="absolute bottom-2 left-2 right-2 bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/70 shadow-lg flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold text-slate-200 text-[11px]">Bölge Yarıçapı:</span>
          </div>
          <input
            type="range"
            min="80"
            max="250"
            step="10"
            value={radiusMeters}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className="flex-1 accent-sky-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
          />
          <span className="font-mono font-bold text-sky-400 text-[11px] shrink-0">
            {radiusMeters} metre
          </span>
        </div>
      )}
    </div>
  );
};
