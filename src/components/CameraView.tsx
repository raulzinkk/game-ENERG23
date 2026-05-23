import React from 'react';

interface CameraViewProps {
  currentCam: 'CAM_01' | 'CAM_02' | 'CAM_03' | 'CAM_04' | 'CAM_05';
  voltPos: string;
  scrappyPos: string;
  springgrixPos: string;
  camGlitch: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({
  currentCam,
  voltPos,
  scrappyPos,
  springgrixPos,
  camGlitch,
}) => {
  const hasVolt = voltPos === currentCam;
  const hasScrappy = scrappyPos === currentCam;
  const hasSpringGrix = springgrixPos === currentCam;

  // Render rooms as high-fidelity interactive SVGs
  const renderRoomSVG = () => {
    switch (currentCam) {
      case 'CAM_01': // Show Stage (Main stage)
        return (
          <svg className="w-full h-full text-zinc-400 bg-zinc-950" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="stageGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3f3f46" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#09090b" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="spotlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="redCurtain" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7f1d1d" />
                <stop offset="50%" stopColor="#b91c1c" />
                <stop offset="100%" stopColor="#450a0a" />
              </linearGradient>
            </defs>

            {/* Back wall with stars */}
            <rect width="400" height="300" fill="url(#stageGlow)" />
            <g fill="#71717a" opacity="0.4">
              <circle cx="50" cy="40" r="1.5" />
              <circle cx="120" cy="60" r="1" />
              <circle cx="180" cy="35" r="1.5" />
              <circle cx="230" cy="70" r="1" />
              <circle cx="280" cy="30" r="2" />
              <circle cx="340" cy="50" r="1" />
            </g>

            {/* Main Stage Floor */}
            <polygon points="0,220 400,220 400,300 0,300" fill="#18181b" />
            {/* Wooden stripes/planks on the floor */}
            <line x1="40" y1="220" x2="10" y2="300" stroke="#27272a" strokeWidth="2" />
            <line x1="120" y1="220" x2="100" y2="300" stroke="#27272a" strokeWidth="2" />
            <line x1="200" y1="220" x2="200" y2="300" stroke="#27272a" strokeWidth="2" />
            <line x1="280" y1="220" x2="300" y2="300" stroke="#27272a" strokeWidth="2" />
            <line x1="360" y1="220" x2="390" y2="300" stroke="#27272a" strokeWidth="2" />
            
            {/* Stage Border lip */}
            <rect x="0" y="212" width="400" height="8" fill="#a1a1aa" opacity="0.15" />
            <rect x="0" y="220" width="400" height="4" fill="#27272a" />

            {/* Bunting Party Flags */}
            <path d="M 0,20 Q 100,50 200,20 Q 300,50 400,20" fill="none" stroke="#52525b" strokeWidth="1.5" strokeDasharray="3 3" />
            <polygon points="30,26 45,45 60,29" fill="#ef4444" opacity="0.6" />
            <polygon points="90,32 105,52 120,35" fill="#f59e0b" opacity="0.6" />
            <polygon points="150,31 165,51 180,32" fill="#3b82f6" opacity="0.6" />
            <polygon points="210,31 225,51 240,32" fill="#10b981" opacity="0.6" />
            <polygon points="270,33 285,53 300,35" fill="#ec4899" opacity="0.6" />
            <polygon points="330,27 345,46 360,29" fill="#8b5cf6" opacity="0.6" />

            {/* Left and Right Curtains */}
            <path d="M 0,20 Q 40,40 40,220 L 0,220 Z" fill="url(#redCurtain)" />
            <path d="M 400,20 Q 360,40 360,220 L 400,220 Z" fill="url(#redCurtain)" />
            <rect x="0" y="0" width="400" height="24" fill="url(#redCurtain)" />

            {/* Center Spotlight Cone */}
            <polygon points="200,0 120,250 280,250" fill="url(#spotlight)" />

            {/* Microphone stand */}
            <line x1="200" y1="225" x2="200" y2="185" stroke="#71717a" strokeWidth="2" />
            <circle cx="200" cy="183" r="3" fill="#a1a1aa" />
            <path d="M 194,225 C 196,228 204,228 206,225" stroke="#71717a" strokeWidth="2" fill="none" />

            {/* --- CHARACTERS ON SHOW STAGE --- */}
            {/* 1. Volt (Left side of stage) */}
            {hasVolt && (
              <g id="stage-volt" className="transition-all duration-500 hover:scale-105 origin-bottom">
                {/* Rabbit Ears */}
                <path d="M 100,105 C 93,65 103,65 103,105" fill="#27272a" stroke="#fb923c" strokeWidth="1" />
                <path d="M 112,105 C 119,65 109,65 109,105" fill="#27272a" stroke="#fb923c" strokeWidth="1" />
                <path d="M 102,105 C 97,75 103,75 103,105" fill="#ea580c" opacity="0.6" />
                <path d="M 110,105 C 115,75 109,75 109,105" fill="#ea580c" opacity="0.6" />
                {/* Robot Head */}
                <circle cx="106" cy="115" r="14" fill="#18181b" stroke="#e11d48" strokeWidth="1" />
                <rect x="98" y="118" width="16" height="5" rx="1" fill="#3f3f46" />
                {/* Glowing yellow eyes */}
                <circle cx="101" cy="111" r="2.5" fill="#facc15" className="animate-pulse" />
                <circle cx="111" cy="111" r="2.5" fill="#facc15" className="animate-pulse" />
                {/* Mechanical suit body */}
                <rect x="91" y="129" width="30" height="42" rx="4" fill="#1e1b4b" stroke="#ea580c" strokeWidth="1.5" />
                <circle cx="106" cy="140" r="5" fill="#ca8a04" /> {/* Bow tie / chest button */}
                <line x1="106" y1="145" x2="106" y2="165" stroke="#ca8a04" strokeWidth="2" />
                {/* Legs */}
                <rect x="94" y="171" width="7" height="42" fill="#18181b" stroke="#ca8a04" />
                <rect x="111" y="171" width="7" height="42" fill="#18181b" stroke="#ca8a04" />
                <ellipse cx="97" cy="214" rx="6" ry="3" fill="#27272a" />
                <ellipse cx="114" cy="214" rx="6" ry="3" fill="#27272a" />
                {/* Arms */}
                <path d="M 91,135 Q 75,145 80,170" fill="none" stroke="#27272a" strokeWidth="5.5" strokeLinecap="round" />
                <path d="M 121,135 Q 137,145 132,170" fill="none" stroke="#27272a" strokeWidth="5.5" strokeLinecap="round" />
              </g>
            )}

            {/* 2. Scrappy (Center-back, cloaked in dark violet) */}
            {hasScrappy && (
              <g id="stage-scrappy" className="transition-all duration-500 origin-bottom">
                {/* Shadow Wolf Haze */}
                <ellipse cx="200" cy="145" rx="25" ry="35" fill="#2e1065" opacity="0.35" className="animate-pulse" />
                {/* Wolf pointed ears */}
                <polygon points="186,105 194,88 198,105" fill="#1e1.51b" stroke="#ef4444" strokeWidth="1" />
                <polygon points="214,105 206,88 202,105" fill="#1e1b4b" stroke="#ef4444" strokeWidth="1" />
                {/* Head */}
                <ellipse cx="200" cy="115" rx="14" ry="12" fill="#09090b" stroke="#581c87" strokeWidth="1.5" />
                {/* Crimson glowing eyes */}
                <circle cx="195" cy="114" r="2.2" fill="#dc2626" />
                <circle cx="205" cy="114" r="2.2" fill="#dc2626" />
                {/* Snout */}
                <polygon points="196,118 204,118 200,128" fill="#18181b" stroke="#581c87" />
                {/* Shadow body */}
                <path d="M 183,127 Q 170,160 200,185 Q 230,160 217,127 Z" fill="#09090b" stroke="#ef4444" strokeWidth="1" />
                {/* Shadow tendril arms */}
                <path d="M 185,140 Q 165,165 170,195" stroke="#1e1b4b" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                <path d="M 215,140 Q 235,165 230,195" stroke="#1e1b4b" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              </g>
            )}

            {/* 3. Spring-Grix (Right side of stage) */}
            {hasSpringGrix && (
              <g id="stage-springgrix" className="transition-all duration-500 origin-bottom">
                {/* Slender marionette body */}
                {/* Neck and connections */}
                <line x1="295" y1="120" x2="295" y2="135" stroke="#a1a1aa" strokeWidth="2.5" />
                {/* Mask head */}
                <ellipse cx="295" cy="108" rx="11" ry="15" fill="#fafafa" stroke="#10b981" strokeWidth="1.5" />
                {/* Purple cheeks */}
                <circle cx="288" cy="113" r="3.2" fill="#c084fc" />
                <circle cx="302" cy="113" r="3.2" fill="#c084fc" />
                {/* Glowing Cyan/Green Eyes */}
                <circle cx="291" cy="104" r="1.8" fill="#34d399" />
                <circle cx="299" cy="104" r="1.8" fill="#34d399" />
                {/* Dark smile */}
                <path d="M 290,116 Q 295,124 300,116" fill="none" stroke="#000" strokeWidth="1.5" />
                {/* Striped skinny body */}
                <rect x="287" y="135" width="16" height="45" rx="3" fill="#18181b" stroke="#71717a" strokeWidth="1" />
                {/* White stripes */}
                <line x1="287" y1="143" x2="303" y2="143" stroke="#f4f4f5" strokeWidth="2" />
                <line x1="287" y1="153" x2="303" y2="153" stroke="#f4f4f5" strokeWidth="2" />
                <line x1="287" y1="163" x2="303" y2="163" stroke="#f4f4f5" strokeWidth="2" />
                <line x1="287" y1="173" x2="303" y2="173" stroke="#f4f4f5" strokeWidth="2" />
                {/* Long thin metallic legs */}
                <line x1="291" y1="180" x2="288" y2="218" stroke="#18181b" strokeWidth="2" />
                <line x1="299" y1="180" x2="302" y2="218" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
                {/* Thin striped arms */}
                <path d="M 287,140 Q 270,160 278,190" stroke="#18181b" strokeWidth="2" fill="none" />
                <path d="M 303,140 Q 320,160 312,190" stroke="#18181b" strokeWidth="2" fill="none" />
              </g>
            )}
          </svg>
        );

      case 'CAM_02': // Left Corridor (Corredor Esquerdo - Volt's primary assault path)
        return (
          <svg className="w-full h-full text-zinc-400 bg-zinc-950" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="corridorGlow" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#18181b" />
                <stop offset="100%" stopColor="#020205" />
              </linearGradient>
              <linearGradient id="emergencyLight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#b91c1c" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#b91c1c" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="hallwayLamp" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#ca8a04" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Tunnel walls */}
            <rect width="400" height="300" fill="url(#corridorGlow)" />

            {/* Depth perspective lines (Corridor architecture) */}
            {/* Ceiling, Floor, Side wall boundaries */}
            <polygon points="0,0 120,80 120,220 0,300" fill="#09090b" opacity="0.5" />
            <polygon points="400,0 280,80 280,220 400,300" fill="#09090b" opacity="0.6" />
            <polygon points="120,80 280,80 280,220 120,220" fill="#030303" /> {/* Back door frame */}

            {/* Steel wall panels (Left wall perspective) */}
            <line x1="0" y1="120" x2="120" y2="130" stroke="#3f3f46" strokeWidth="1" />
            <line x1="0" y1="180" x2="120" y2="170" stroke="#3f3f46" strokeWidth="1" />
            {/* Right wall perspective */}
            <line x1="400" y1="120" x2="280" y2="130" stroke="#27272a" strokeWidth="1.2" />
            <line x1="400" y1="180" x2="280" y2="170" stroke="#27272a" strokeWidth="1.2" />

            {/* Floor tiles grid */}
            <line x1="120" y1="220" x2="0" y2="300" stroke="#1e1b4b" strokeWidth="2.5" />
            <line x1="280" y1="220" x2="400" y2="300" stroke="#1e1b4b" strokeWidth="2.5" />
            {/* Perspective crosses */}
            <line x1="150" y1="220" x2="70" y2="300" stroke="#1e293b" strokeWidth="1" opacity="0.4" />
            <line x1="250" y1="220" x2="330" y2="300" stroke="#1e293b" strokeWidth="1" opacity="0.4" />
            <line x1="200" y1="220" x2="200" y2="300" stroke="#1e293b" strokeWidth="1" opacity="0.4" />

            {/* Server cabinet silhouette on the left wall */}
            <rect x="25" y="90" width="40" height="110" fill="#0c0a09" rx="1" stroke="#27272a" />
            <circle cx="35" cy="110" r="1.5" fill="#22c55e" className="animate-pulse" />
            <circle cx="35" cy="120" r="1.5" fill="#eab308" />
            <circle cx="35" cy="130" r="1.5" fill="#ef4444" />
            
            {/* Ceiling flashing emergency hazard lamp */}
            <polygon points="200,30 160,220 240,220" fill="url(#hallwayLamp)" />
            <rect x="192" y="24" width="16" height="8" fill="#451a03" />
            <ellipse cx="200" cy="30" rx="6" ry="3" fill="#eab308" className="animate-pulse" />

            {/* Red alert glowing exit neon marker */}
            <rect x="180" y="55" width="40" height="12" fill="#7f1d1d" rx="1" stroke="#ef4444" strokeWidth="0.5" />
            <text x="200" y="64" fill="#f87171" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle" className="animate-pulse">EXIT</text>

            {/* Metal pipes along left ceiling */}
            <line x1="0" y1="40" x2="120" y2="90" stroke="#27272a" strokeWidth="5.5" />
            <line x1="0" y1="30" x2="120" y2="85" stroke="#52525b" strokeWidth="2" />

            {/* --- APPROACHING VOLT (COELHO) IN LEFT HALWAY --- */}
            {hasVolt && (
              <g id="hallway-volt" className="animate-[pulse_4s_infinite]">
                {/* Large creepy rabbit ears casting long black shadow in hallway */}
                <path d="M 175,100 C 160,40 200,30 190,105" fill="#020202" opacity="0.85" />
                <path d="M 225,100 C 240,40 200,30 210,105" fill="#020202" opacity="0.85" />

                {/* Rabbit silhouette leaning forwards towards camera */}
                {/* Head */}
                <ellipse cx="200" cy="115" rx="20" ry="18" fill="#111827" stroke="#ea580c" strokeWidth="2" />
                {/* Glowing neon orange/yellow headlights/eyes */}
                <circle cx="192" cy="112" r="4.5" fill="#f59e0b" className="animate-ping absolute" />
                <circle cx="192" cy="112" r="3" fill="#fbbf24" />
                <circle cx="208" cy="112" r="4.5" fill="#f59e0b" className="animate-ping absolute" />
                <circle cx="208" cy="112" r="3" fill="#fbbf24" />
                
                {/* Creepy exposed metal jaw/teeth */}
                <rect x="190" y="123" width="20" height="7" fill="#030712" rx="1" stroke="#4b5563" />
                <line x1="193" y1="123" x2="193" y2="130" stroke="#9ca3af" />
                <line x1="197" y1="123" x2="197" y2="130" stroke="#9ca3af" />
                <line x1="201" y1="123" x2="201" y2="130" stroke="#9ca3af" />
                <line x1="205" y1="123" x2="205" y2="130" stroke="#9ca3af" />
                <line x1="209" y1="123" x2="209" y2="130" stroke="#9ca3af" />

                {/* Giant robotic body closer to screen */}
                <path d="M 150,260 L 175,138 L 225,138 L 250,260 Z" fill="#18181b" stroke="#f97316" strokeWidth="1.5" />
                {/* Wires hanging from arm joints */}
                <path d="M 160,170 Q 150,190 145,210" fill="none" stroke="#22c55e" strokeWidth="1.5" />
                <path d="M 240,170 Q 255,190 250,225" fill="none" stroke="#ef4444" strokeWidth="1" />
                <path d="M 245,175 Q 262,205 258,235" fill="none" stroke="#ca8a04" strokeWidth="1.5" />
              </g>
            )}
          </svg>
        );

      case 'CAM_03': // Right Corridor (Corredor Direito - Scrappy's path)
        return (
          <svg className="w-full h-full text-zinc-400 bg-zinc-950" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="rightCorridorGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1c1917" />
                <stop offset="60%" stopColor="#0c0a09" />
                <stop offset="100%" stopColor="#020101" />
              </linearGradient>
              <linearGradient id="scrappyMist" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#0c0a09" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Back structure */}
            <rect width="400" height="300" fill="url(#rightCorridorGlow)" />

            {/* Corridor grid structure */}
            <polygon points="400,0 280,80 280,220 400,300" fill="#140f0c" opacity="0.6" />
            <polygon points="0,0 120,80 120,220 0,300" fill="#140f0c" opacity="0.5" />
            
            {/* Brick pattern lines on walls */}
            <path d="M 280,95 L 400,30 M 280,120 L 400,70 M 280,150 L 400,120 M 280,180 L 400,190 M 280,210 L 400,260" stroke="#292524" strokeWidth="1.5" />
            <path d="M 120,95 L 0,30 M 120,120 L 0,70 M 120,150 L 0,120 M 120,180 L 0,190 M 120,210 L 0,260" stroke="#292524" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Hanging pipe leak emitting steam on the upper right */}
            <line x1="300" y1="0" x2="300" y2="70" stroke="#44403c" strokeWidth="6" />
            <rect x="296" y="65" width="8" height="4" fill="#78716c" />
            {/* Animated-like visual steam leaks */}
            <g opacity="0.25">
              <circle cx="300" cy="80" r="6" fill="#f5f5f4" />
              <circle cx="295" cy="95" r="10" fill="#e7e5e4" />
              <circle cx="305" cy="115" r="15" fill="#d6d3d1" />
            </g>

            {/* Distant utility door */}
            <rect x="150" y="80" width="100" height="140" fill="#090504" stroke="#44403c" strokeWidth="2.5" />
            <line x1="150" y1="150" x2="250" y2="150" stroke="#292524" strokeWidth="1.5" />
            <circle cx="235" cy="143" r="3.2" fill="#78716c" />

            {/* Glowing red wall indicator */}
            <circle cx="165" cy="100" r="2.5" fill="#ef4444" className="animate-pulse" />
            <rect x="175" y="97" width="22" height="6" fill="#292524 animate-pulse" />

            {/* Floors tiles layout lines */}
            <polygon points="120,220 280,220 400,300 0,300" fill="#0c0a09" />
            <line x1="120" y1="220" x2="0" y2="300" stroke="#1c1917" strokeWidth="2" />
            <line x1="280" y1="220" x2="400" y2="300" stroke="#1c1917" strokeWidth="2" />

            {/* --- IMMERSIVE SCRAPPY (LOBO DE SOMBRAS) --- */}
            {hasScrappy && (
              <g id="right-corridor-scrappy">
                {/* Dark fog/smoke wrapping the scene */}
                <rect x="0" y="100" width="400" height="200" fill="url(#scrappyMist)" />
                
                {/* Crawling wolf robot shadow approaching directly */}
                <g className="animate-[bounce_2s_infinite]">
                  {/* Wolf shape shadow tail */}
                  <path d="M 120,280 Q 90,260 85,250" stroke="#000" strokeWidth="9" strokeLinecap="round" opacity="0.9" />
                  
                  {/* Red piercing glitch eyes */}
                  <circle cx="185" cy="170" r="4.5" fill="#f87171" className="animate-pulse" />
                  <circle cx="185" cy="170" r="2.5" fill="#ef4444" />
                  
                  <circle cx="215" cy="170" r="4.5" fill="#f87171" className="animate-pulse" />
                  <circle cx="215" cy="170" r="2.5" fill="#ef4444" />

                  {/* Wolf mechanical wolf jaw with sharp steel fangs */}
                  <path d="M 175,188 L 190,195 L 210,195 L 225,188" stroke="#78716c" strokeWidth="3.5" fill="none" />
                  {/* Fangs */}
                  <polygon points="185,188 188,198 193,188" fill="#fafafa" />
                  <polygon points="200,188 203,198 207,188" fill="#fafafa" />
                  <polygon points="214,188 217,198 221,188" fill="#fafafa" />

                  {/* Shadow beast head and ears */}
                  <path d="M 165,150 Q 200,120 235,150 L 228,185 L 172,185 Z" fill="#090504" stroke="#781d1d" strokeWidth="2.2" />
                  {/* Pointed wolf ears */}
                  <polygon points="172,148 160,115 184,138" fill="#090504" stroke="#ef4444" strokeWidth="1" />
                  <polygon points="228,148 240,115 216,138" fill="#090504" stroke="#ef4444" strokeWidth="1" />

                  {/* Gigantic dark shadow claws resting on the corridor floor */}
                  <path d="M 140,250 Q 155,255 170,285" stroke="#000" strokeWidth="11" strokeLinecap="round" />
                  <path d="M 260,250 Q 245,255 230,285" stroke="#000" strokeWidth="11" strokeLinecap="round" />
                  {/* White claw tips */}
                  <polygon points="170,285 168,294 175,286" fill="#f5f5f4" />
                  <polygon points="230,285 232,294 225,286" fill="#f5f5f4" />
                </g>
              </g>
            )}
          </svg>
        );

      case 'CAM_04': // Generator Room (Volt's detour path)
        return (
          <svg className="w-full h-full text-zinc-400 bg-zinc-950" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="genRoomBg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#172554" stopOpacity="0.3" /> {/* technical electric blue */}
                <stop offset="100%" stopColor="#090d16" />
              </linearGradient>
              <linearGradient id="electricArc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#1e40af" />
              </linearGradient>
            </defs>

            {/* Blue-accented industrial grid space */}
            <rect width="400" height="300" fill="url(#genRoomBg)" />

            {/* Concrete tile markings */}
            <line x1="0" y1="210" x2="400" y2="210" stroke="#1e293b" strokeWidth="2" />
            <line x1="100" y1="210" x2="100" y2="300" stroke="#0f172a" />
            <line x1="300" y1="210" x2="300" y2="300" stroke="#0f172a" />

            {/* Industrial electrical power lines */}
            <path d="M 0,40 Q 100,75 200,45 Q 300,75 400,40" fill="none" stroke="#0f172a" strokeWidth="3" />
            <path d="M 0,55 Q 120,95 240,65 Q 320,85 400,55" fill="none" stroke="#1e293b" strokeWidth="1.5" />

            {/* Main Central Power Generator Unit */}
            <rect x="70" y="80" width="260" height="130" fill="#0f172a" rx="4" stroke="#1d4ed8" strokeWidth="2.5" />
            {/* Ventilation vents inside generator unit */}
            <rect x="90" y="95" width="45" height="100" fill="#020617" rx="2" />
            <line x1="90" y1="110" x2="135" y2="110" stroke="#334155" strokeWidth="2" />
            <line x1="90" y1="125" x2="135" y2="125" stroke="#334155" strokeWidth="2" />
            <line x1="90" y1="140" x2="135" y2="140" stroke="#334155" strokeWidth="2" />
            <line x1="90" y1="155" x2="135" y2="155" stroke="#334155" strokeWidth="2" />
            <line x1="90" y1="170" x2="135" y2="170" stroke="#334155" strokeWidth="2" />
            <line x1="90" y1="185" x2="135" y2="185" stroke="#334155" strokeWidth="2" />

            {/* Core monitoring oscilloscope screen on Generator */}
            <rect x="155" y="105" width="90" height="50" fill="#020617" rx="2" stroke="#3b82f6" strokeWidth="1" />
            {/* Interactive Sine Wave */}
            <path d="M 160,130 Q 170,110 180,130 T 200,130 T 220,130 T 240,130" fill="none" stroke="#22c55e" strokeWidth="1.5" className="animate-pulse" />
            <span className="absolute text-[8px] font-mono text-emerald-400">MONITOR_GEN_OK</span>

            {/* High Voltage Danger Decal Flag */}
            <polygon points="275,115 315,115 315,165 275,165" fill="#ca8a04" rx="2" stroke="#facc15" strokeWidth="1" />
            <path d="M 295,123 L 285,145 L 295,145 L 290,158 L 305,134 L 295,134 Z" fill="#000" /> {/* Lightning bolt graphic */}

            {/* Power copper pipe lines leading to generator block */}
            <line x1="30" y1="210" x2="70" y2="175" stroke="#475569" strokeWidth="6" />
            <line x1="370" y1="210" x2="330" y2="175" stroke="#475569" strokeWidth="6" />

            {/* Electric sparks arc overlay */}
            <g opacity="0.3">
              <path d="M 160,80 L 165,75 L 160,70 L 170,60" stroke="#60a5fa" strokeWidth="2" fill="none" className="animate-bounce" />
              <path d="M 230,80 L 235,74 L 228,68 L 243,58" stroke="#60a5fa" strokeWidth="2" fill="none" className="animate-bounce" />
            </g>

            {/* --- VOLT THE CYBER BUNNY TAMPERING WITH POWER SYSTEM --- */}
            {hasVolt && (
              <g id="generator-volt">
                {/* Volt hiding behind/over the generator block, tinkering wires */}
                <g className="animate-[pulse_3.5s_infinite]">
                  {/* Creepy long bendy metal ears popping over generator top ceiling */}
                  <path d="M 145,95 C 130,45 155,30 152,95" fill="#1e293b" stroke="#eab308" strokeWidth="1.5" />
                  <path d="M 170,95 C 185,45 160,30 163,95" fill="#1e293b" stroke="#eab308" strokeWidth="1.5" />

                  {/* Half mask head visible peering from top of machine */}
                  <ellipse cx="158" cy="100" rx="17" ry="15" fill="#0f172a" stroke="#ca8a04" strokeWidth="1.5" />
                  {/* Glowing warning yellow mechanical pupils */}
                  <circle cx="151" cy="98" r="3.2" fill="#eab308" />
                  <circle cx="151" cy="98" r="1.5" fill="#ffffff" />
                  <circle cx="165" cy="98" r="3.2" fill="#eab308" />
                  <circle cx="165" cy="98" r="1.5" fill="#ffffff" />

                  {/* Wired robotic hand climbing the generator */}
                  <path d="M 255,100 Q 260,90 270,92" stroke="#94a3b8" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M 258,105 Q 266,95 273,98" stroke="#94a3b8" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M 255,110 Q 264,103 271,107" stroke="#94a3b8" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <circle cx="253" cy="105" r="5" fill="#334155" />
                </g>

                {/* Electric hazard sparkles popping out because Volt is sabotaging */}
                <path d="M 135,115 L 140,105 L 134,95" stroke="#facc15" strokeWidth="2.5" fill="none" className="animate-ping" />
                <path d="M 185,115 L 190,103 L 180,95" stroke="#facc15" strokeWidth="2.5" fill="none" className="animate-ping" />
              </g>
            )}
          </svg>
        );

      case 'CAM_05': // Ventilation Duct (Spring-Grix marionette crawl shaft)
        return (
          <svg className="w-full h-full text-zinc-400 bg-zinc-950" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ventGlow" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#064e3b" stopOpacity="0.4" /> {/* toxic mossy green duct tint */}
                <stop offset="100%" stopColor="#02140f" />
              </linearGradient>
            </defs>

            {/* Mossy tunnel base background */}
            <rect width="400" height="300" fill="url(#ventGlow)" />

            {/* Concentric square vent rings representing depth */}
            {/* Ring 1 (farthest vent opening) */}
            <rect x="150" y="110" width="100" height="80" fill="#010604" stroke="#042f1a" strokeWidth="2" />
            <line x1="150" y1="110" x2="0" y2="0" stroke="#064e43" strokeWidth="3" />
            <line x1="250" y1="110" x2="400" y2="0" stroke="#064e43" strokeWidth="3" />
            <line x1="150" y1="190" x2="0" y2="300" stroke="#064e43" strokeWidth="3" />
            <line x1="250" y1="190" x2="400" y2="300" stroke="#064e43" strokeWidth="3" />

            {/* Ring 2 (medium distance) */}
            <rect x="100" y="70" width="200" height="160" fill="none" stroke="#065f46" strokeWidth="1.5" opacity="0.6" />
            {/* Ring 3 (closer distance) */}
            <rect x="50" y="35" width="300" height="230" fill="none" stroke="#059669" strokeWidth="2" opacity="0.3" />

            {/* Screws on vent wall plates */}
            <ellipse cx="60" cy="45" rx="3" ry="3" fill="#111827" stroke="#374151" />
            <ellipse cx="340" cy="45" rx="3" ry="3" fill="#111827" stroke="#374151" />
            <ellipse cx="60" cy="255" rx="3" ry="3" fill="#111827" stroke="#374151" />
            <ellipse cx="340" cy="255" rx="3" ry="3" fill="#111827" stroke="#374151" />

            {/* Turning ventilation fan blades in the distant grid depth */}
            <g id="distant-fan" className="animate-[spin_4.5s_linear_infinite] origin-[200px_150px]">
              <line x1="170" y1="150" x2="230" y2="150" stroke="#022c22" strokeWidth="4.5" />
              <line x1="200" y1="120" x2="200" y2="180" stroke="#022c22" strokeWidth="4.5" />
              <circle cx="200" cy="150" r="4.5" fill="#111827" />
            </g>

            {/* Cobwebs in the upper left corner of duct */}
            <path d="M 0,0 L 40,0 M 0,0 L 0,40 M 0,0 L 30,30" stroke="#166534" strokeWidth="1" opacity="0.4" />
            <path d="M 10,0 Q 15,15 0,10 M 20,0 Q 25,25 0,20 M 30,0 Q 35,35 0,30" fill="none" stroke="#166534" strokeWidth="0.8" opacity="0.35" />

            {/* --- SPRING-GRIX THE MARIONETTE CLIMBING IN VENT DUCT --- */}
            {hasSpringGrix && (
              <g id="vent-springgrix" className="animate-[pulse_3s_infinite]">
                {/* Sinister White Mask with glowing emerald eyes dangling directly inside outer shaft */}
                <ellipse cx="200" cy="140" rx="22" ry="30" fill="#fcfcfc" stroke="#10b981" strokeWidth="2.5" />
                
                {/* Purple cheek dots */}
                <circle cx="186" cy="150" r="5.5" fill="#b175ff" />
                <circle cx="214" cy="150" r="5.5" fill="#b175ff" stroke="#a21caf" />
                
                {/* Glowing neon green puppet ocular nodes */}
                <circle cx="192" cy="132" r="3.2" fill="#10b981" className="animate-ping absolute" />
                <circle cx="192" cy="132" r="3.2" fill="#34d399" />
                <circle cx="208" cy="132" r="3.2" fill="#10b981" className="animate-ping absolute" />
                <circle cx="208" cy="132" r="3.2" fill="#34d399" />

                {/* Dark crying tear lines running down her cheeks */}
                <path d="M 191,135 Q 192,143 189,148" fill="none" stroke="#2563eb" strokeWidth="2" />
                <path d="M 209,135 Q 208,143 211,148" fill="none" stroke="#2563eb" strokeWidth="2" />

                {/* Crooked black smile */}
                <path d="M 188,158 Q 200,172 212,158" fill="none" stroke="#000000" strokeWidth="2.5" />

                {/* Elongated striped stick arms bracing against the metal duct walls */}
                <path d="M 178,140 Q 130,120 70,110" stroke="#090d16" strokeWidth="7" fill="none" strokeLinecap="round" />
                <path d="M 222,140 Q 270,120 330,110" stroke="#090d16" strokeWidth="7" fill="none" strokeLinecap="round" />
                {/* White striping detail */}
                <path d="M 178,140 Q 130,120 70,110" stroke="#f4f4f5" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="6 12" />
                <path d="M 222,140 Q 270,120 330,110" stroke="#f4f4f5" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="6 12" />

                {/* Spine skeleton neck */}
                <line x1="200" y1="170" x2="200" y2="210" stroke="#334155" strokeWidth="4.5" />
              </g>
            )}
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative h-full w-full bg-black/90 border border-emerald-500/30 rounded flex flex-col justify-between overflow-hidden">
      {/* Target Scope lines overlay */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-emerald-500/10 pointer-events-none z-10" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-emerald-500/10 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-radial-[circle_at_center,_transparent_60%,_black_90%] pointer-events-none z-10" />

      {/* Retro Signal Quality Indicator overlay */}
      <div className="absolute left-4 top-16 z-20 pointer-events-none bg-black/75 border border-emerald-500/40 text-[9px] font-mono text-emerald-500/90 px-1.5 py-0.5 rounded flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        SGL_STRENGTH: 98%
      </div>

      <div className="absolute right-4 top-16 z-20 pointer-events-none bg-black/75 border border-red-500/40 text-[9px] font-mono text-red-500 px-2 py-0.5 rounded flex items-center gap-1.5 uppercase font-bold tracking-widest animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
        REC
      </div>

      {/* Frame Dimensions Helper text */}
      <div className="absolute left-4 bottom-4 z-20 pointer-events-none font-mono text-[8.5px] text-zinc-500">
        ISO_200 / EXP_F1.2 / AUTO_FOCUS
      </div>

      {/* Visual representation of Room Camera graphics */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center">
        {renderRoomSVG()}

        {/* Scan lines & Glitch filter overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_6px_100%] pointer-events-none z-20 animate-[pulse_6s_infinite]" />

        {/* Glitch Overlay Effect */}
        {camGlitch && (
          <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center font-mono text-xs text-red-500 font-bold tracking-widest z-30">
            <span className="animate-bounce">=== NO SIGNAL - BUFF_SYNC ===</span>
            <span className="text-zinc-600 font-normal mt-1 text-[10px]">CCTV_FRAME_STUTTER</span>
          </div>
        )}
      </div>
    </div>
  );
};
