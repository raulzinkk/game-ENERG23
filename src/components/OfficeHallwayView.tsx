import React from 'react';

interface OfficeHallwayViewProps {
  side: 'left' | 'right' | 'generator' | 'vent';
  lightOn: boolean;
  hasMonster: boolean;
}

export const OfficeHallwayView: React.FC<OfficeHallwayViewProps> = ({
  side,
  lightOn,
  hasMonster,
}) => {
  if (side === 'left') {
    return (
      <svg
        className="w-full h-full select-none"
        viewBox="0 0 200 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Lit Corridor Gradients */}
          <radialGradient id="leftLightBeam" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#ca8a04" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#18181b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="leftWallGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>
          <linearGradient id="leftWallDarkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>
        </defs>

        {/* Base Background - Dark in all cases, but brightly colored when light is on */}
        <rect width="200" height="150" fill={lightOn ? "#1c1917" : "#020202"} />

        {/* Perspective Guidelines & Environment */}
        {lightOn ? (
          <>
            {/* Ceiling */}
            <polygon points="0,0 200,0 140,40 60,40" fill="#2d2a29" opacity="0.4" />
            {/* Floor (Steel plates with checkerboard style line) */}
            <polygon points="0,150 200,150 140,110 60,110" fill="#181615" />
            <line x1="60" y1="110" x2="0" y2="150" stroke="#44403c" strokeWidth="1.5" />
            <line x1="140" y1="110" x2="200" y2="150" stroke="#44403c" strokeWidth="1.5" />
            <line x1="100" y1="110" x2="100" y2="150" stroke="#292524" strokeWidth="1" />
            
            {/* Left Wall */}
            <polygon points="0,0 60,40 60,110 0,150" fill="url(#leftWallGrad)" />
            <line x1="30" y1="20" x2="30" y2="130" stroke="#52525b" strokeWidth="1" opacity="0.3" />
            {/* Industrial Pipes on Left Wall */}
            <line x1="0" y1="30" x2="60" y2="50" stroke="#374151" strokeWidth="4.5" />
            <line x1="0" y1="28" x2="60" y2="48" stroke="#9ca3af" strokeWidth="1.2" />

            {/* Right Wall */}
            <polygon points="200,0 140,40 140,110 200,150" fill="#18181b" opacity="0.9" />
            <line x1="170" y1="20" x2="170" y2="130" stroke="#3f3f46" strokeWidth="1" opacity="0.3" />

            {/* Door at the very end of hallway */}
            <rect x="60" y="40" width="80" height="70" fill="#09090b" stroke="#3f3f46" strokeWidth="1" />
            <line x1="100" y1="40" x2="100" y2="110" stroke="#27272a" strokeWidth="1" />

            {/* Flashlight Beam Core Glow Overlay */}
            <ellipse cx="100" cy="85" rx="90" ry="60" fill="url(#leftLightBeam)" />
          </>
        ) : (
          <>
            {/* Extremely dark depth perspectives */}
            <polygon points="0,0 200,0 140,40 60,40" fill="#050505" />
            <polygon points="0,150 200,150 140,110 60,110" fill="#030303" />
            <polygon points="0,0 60,40 60,110 0,150" fill="url(#leftWallDarkGrad)" />
            <polygon points="200,0 140,40 140,110 200,150" fill="#020202" />
            <rect x="60" y="40" width="80" height="70" fill="#000" stroke="#111827" strokeWidth="0.5" />
          </>
        )}

        {/* --- CREATURE DRAWING --- */}
        {hasMonster ? (
          lightOn ? (
            /* VOLT THE BUNNY REVEALED IN FLASH LIGHT */
            <g id="closet-volt-body" className="animate-[pulse_1s_infinite]">
              {/* Shadow undertone on the wall */}
              <ellipse cx="100" cy="110" rx="35" ry="40" fill="#000" opacity="0.4" />

              {/* Ears */}
              <path d="M 85,35 C 75,-15 95,-15 95,35" fill="#18181b" stroke="#ea580c" strokeWidth="1.5" />
              <path d="M 115,35 C 125,-15 105,-15 105,35" fill="#18181b" stroke="#ea580c" strokeWidth="1.5" />
              {/* Inner ear details */}
              <path d="M 87,35 C 80,0 92,0 92,35" fill="#ea580c" opacity="0.4" />
              <path d="M 113,35 C 120,0 108,0 108,35" fill="#ea580c" opacity="0.4" />

              {/* Mechanical head */}
              <circle cx="100" cy="50" r="24" fill="#0f172a" stroke="#ca8a04" strokeWidth="2" />
              
              {/* Glowing Yellow Headlight Eyes */}
              <g className="animate-pulse">
                <circle cx="91" cy="46" r="4.5" fill="#facc15" className="animate-ping" />
                <circle cx="91" cy="46" r="3" fill="#eab308" />
                <circle cx="109" cy="46" r="4.5" fill="#facc15" className="animate-ping" />
                <circle cx="109" cy="46" r="3" fill="#eab308" />
              </g>

              {/* Bare Metallic Endo-skeleton teeth / Grin */}
              <rect x="88" y="62" width="24" height="10" fill="#030712" rx="2" stroke="#4b5563" strokeWidth="1.5" />
              <line x1="92" y1="62" x2="92" y2="72" stroke="#9ca3af" strokeWidth="1" />
              <line x1="96" y1="62" x2="96" y2="72" stroke="#9ca3af" strokeWidth="1" />
              <line x1="100" y1="62" x2="100" y2="72" stroke="#9ca3af" strokeWidth="1" />
              <line x1="104" y1="62" x2="104" y2="72" stroke="#9ca3af" strokeWidth="1" />
              <line x1="108" y1="62" x2="108" y2="72" stroke="#9ca3af" strokeWidth="1" />

              {/* Robot Nose / whiskers plates */}
              <ellipse cx="94" cy="56" rx="5" ry="3.5" fill="#1e293b" />
              <ellipse cx="106" cy="56" rx="5" ry="3.5" fill="#1e293b" />
              <circle cx="100" cy="56" r="2" fill="#ca8a04" />

              {/* Gigantic Suit Chest & Shoulders blocking the view */}
              <path d="M 55,150 L 70,80 L 130,80 L 145,150 Z" fill="#1e1b4b" stroke="#ea580c" strokeWidth="1.5" />
              {/* Cyber tie button */}
              <polygon points="100,90 94,102 106,102" fill="#ef4444" />
              <polygon points="100,114 94,102 106,102" fill="#ef4444" />

              {/* Wires loose on shoulders */}
              <path d="M 68,90 Q 55,105 58,125" fill="none" stroke="#22c55e" strokeWidth="1.2" />
              <path d="M 132,90 Q 145,105 140,120" fill="none" stroke="#3b82f6" strokeWidth="1.2" />

              {/* Red warning overlay on whole character representing hostility */}
              <rect x="0" y="0" width="200" height="150" fill="#ef4444" opacity="0.05" />
            </g>
          ) : (
            /* VOLT HIDING IN DARKNESS - ONLY GLOWING PUPILS VISIBLE */
            <g id="closet-volt-dark">
              <circle cx="91" cy="46" r="2.5" fill="#facc15" className="animate-pulse shadow-[0_0_10px_#f93]" />
              <circle cx="109" cy="46" r="2.5" fill="#facc15" className="animate-pulse shadow-[0_0_10px_#f93]" />
              {/* Very faint silhouette */}
              <ellipse cx="100" cy="48" rx="14" ry="12" fill="#09090b" opacity="0.15" />
            </g>
          )
        ) : (
          /* NO MONSTER AND LIGHT IS ON: TEXT ADDS REASSURANCE */
          lightOn && (
            <g opacity="0.8">
              <rect x="52" y="12" width="96" height="14" fill="#000" rx="1" stroke="#27272a" strokeWidth="0.5" opacity="0.7" />
              <text x="100" y="22" fill="#d4d4d8" fontSize="6.5" fontFamily="monospace" textAnchor="middle" letterSpacing="0.8">
                CORREDOR DESIMPEDIDO
              </text>
            </g>
          )
        )}

        {/* Vintage Camera Frame details */}
        <rect x="2" y="2" width="196" height="146" fill="none" stroke={lightOn ? "#ca8a04" : "#1e293b"} strokeWidth="0.5" opacity="0.25" />
        <text x="8" y="10" fill={lightOn ? "#ea580c" : "#71717a"} fontSize="5.5" fontFamily="monospace" opacity="0.5">
          L_WING_DOOR_CAM
        </text>
        <text x="192" y="10" fill={lightOn ? "#84cc16" : "#71717a"} fontSize="5.5" fontFamily="monospace" opacity="0.7" textAnchor="end">
          {lightOn ? "LIGHT: ON" : "LIGHT: OFF"}
        </text>
      </svg>
    );
  } else if (side === 'right') {
    // --- RIGHT WING ---
    return (
      <svg
        className="w-full h-full select-none"
        viewBox="0 0 200 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Lit Corridor Gradients */}
          <radialGradient id="rightLightBeam" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#fef08a" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#18181b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rightWallGrad" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#292524" />
            <stop offset="100%" stopColor="#0c0a09" />
          </linearGradient>
          <linearGradient id="scrappyFog" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#450a0a" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Base Background */}
        <rect width="200" height="150" fill={lightOn ? "#141417" : "#020101"} />

        {/* Perspective Guidelines & Environment */}
        {lightOn ? (
          <>
            {/* Ceiling */}
            <polygon points="0,0 200,0 140,40 60,40" fill="#242120" opacity="0.35" />
            {/* Floor */}
            <polygon points="0,150 200,150 140,110 60,110" fill="#110f0e" />
            <line x1="60" y1="110" x2="0" y2="150" stroke="#292524" strokeWidth="1" />
            <line x1="140" y1="110" x2="200" y2="150" stroke="#292524" strokeWidth="1" />

            {/* Left Wall */}
            <polygon points="0,0 60,40 60,110 0,150" fill="#1c1917" opacity="0.9" />
            
            {/* Right Wall */}
            <polygon points="200,0 140,40 140,110 200,150" fill="url(#rightWallGrad)" />
            {/* Rusty Ventilation plates on Right Wall */}
            <rect x="148" y="55" width="40" height="40" fill="#0c0a09" stroke="#44403c" strokeWidth="1" />
            <line x1="152" y1="65" x2="184" y2="65" stroke="#292524" />
            <line x1="152" y1="75" x2="184" y2="75" stroke="#292524" />
            <line x1="152" y1="85" x2="184" y2="85" stroke="#292524" />

            {/* End Hallway door frame */}
            <rect x="60" y="40" width="80" height="70" fill="#080707" stroke="#27272a" strokeWidth="0.8" />

            {/* Light beam simulation */}
            <ellipse cx="100" cy="85" rx="85" ry="55" fill="url(#rightLightBeam)" />
          </>
        ) : (
          <>
            {/* Dark perspectives */}
            <polygon points="0,0 200,0 140,40 60,40" fill="#040404" />
            <polygon points="0,150 200,150 140,110 60,110" fill="#020202" />
            <polygon points="0,0 60,40 60,110 0,150" fill="#030303" />
            <polygon points="200,0 140,40 140,110 200,150" fill="#030303" opacity="0.5" />
            <rect x="60" y="40" width="80" height="70" fill="#000" />
          </>
        )}

        {/* --- CREATURE DRAWING --- */}
        {hasMonster ? (
          lightOn ? (
            /* SCRAPPY THE SHADOW WOLF IN FLASH LIGHT */
            <g id="closet-scrappy-body" className="animate-[pulse_1.2s_infinite]">
              {/* Dynamic Blood-mist background cloud packaging Scrappy */}
              <rect x="40" y="40" width="120" height="110" fill="url(#scrappyFog)" />

              {/* Wolf pointed ears sticking out */}
              <g>
                <polygon points="82,45 74,18 94,36" fill="#030712" stroke="#ef4444" strokeWidth="1" />
                <polygon points="118,45 126,18 106,36" fill="#030712" stroke="#ef4444" strokeWidth="1" />
              </g>

              {/* Dark fuzzy shadow head */}
              <ellipse cx="100" cy="48" rx="22" ry="18" fill="#090504" stroke="#7f1d1d" strokeWidth="1.5" />
              
              {/* Evil Piercing Crimson Eyes */}
              <g className="animate-pulse">
                <circle cx="91" cy="45" r="4" fill="#fc8181" />
                <circle cx="91" cy="45" r="2.2" fill="#e53e3e" />
                <circle cx="109" cy="45" r="4" fill="#fc8181" />
                <circle cx="109" cy="45" r="2.2" fill="#e53e3e" />
              </g>

              {/* Predator Snout with brutal iron teeth */}
              <path d="M 86,64 L 100,72 L 114,64" stroke="#44403c" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Sharp iron fangs */}
              <polygon points="90,62 93,70 96,62" fill="#fafafa" />
              <polygon points="100,62 103,71 106,62" fill="#fafafa" />
              <polygon points="110,62 112,70 114,62" fill="#fafafa" />

              {/* Monstrous wolf body block closer to screen */}
              <path d="M 50,150 Q 80,72 100,72 Q 120,72 150,150 Z" fill="#030202" stroke="#450a0a" strokeWidth="2" />

              {/* Creepy mechanical wolf claws climbing/grabbing the window! */}
              <g opacity="0.95">
                {/* Left claw clutching the pane */}
                <path d="M 60,110 Q 75,125 80,145" stroke="#1c1917" strokeWidth="7" fill="none" strokeLinecap="round" />
                <polygon points="80,145 84,152 76,146" fill="#f5f5f4" />
                {/* Right claw clutching the pane */}
                <path d="M 140,110 Q 125,125 120,145" stroke="#1c1917" strokeWidth="7" fill="none" strokeLinecap="round" />
                <polygon points="120,145 116,152 124,146" fill="#f5f5f4" />
              </g>

              {/* Static screen line glitch across character */}
              <line x1="45" y1="85" x2="155" y2="85" stroke="#fecaca" strokeWidth="1" strokeDasharray="5 15" opacity="0.6" />
            </g>
          ) : (
            /* SCRAPPY IN DARKNESS - ONLY EVIL GLOWING RED PUPILS IN THE FOG */
            <g id="closet-scrappy-dark">
              <circle cx="91" cy="45" r="2.2" fill="#dc2626" className="animate-pulse shadow-[0_0_12px_#f00]" />
              <circle cx="109" cy="45" r="2.2" fill="#dc2626" className="animate-pulse shadow-[0_0_12px_#f00]" />
              <ellipse cx="100" cy="46" rx="12" ry="10" fill="#050101" opacity="0.25" />
            </g>
          )
        ) : (
          /* NO MONSTER AND LIGHT IS ON: TEXT ADDS REASSURANCE */
          lightOn && (
            <g opacity="0.8">
              <rect x="52" y="12" width="96" height="14" fill="#000" rx="1" stroke="#27272a" strokeWidth="0.5" opacity="0.7" />
              <text x="100" y="22" fill="#d4d4d8" fontSize="6.5" fontFamily="monospace" textAnchor="middle" letterSpacing="0.8">
                CORREDOR DESIMPEDIDO
              </text>
            </g>
          )
        )}

        {/* Vintage Camera Frame details */}
        <rect x="2" y="2" width="196" height="146" fill="none" stroke={lightOn ? "#991b1b" : "#1e293b"} strokeWidth="0.5" opacity="0.25" />
        <text x="8" y="10" fill={lightOn ? "#ef4444" : "#71717a"} fontSize="5.5" fontFamily="monospace" opacity="0.5">
          R_WING_DOOR_CAM
        </text>
        <text x="192" y="10" fill={lightOn ? "#84cc16" : "#71717a"} fontSize="5.5" fontFamily="monospace" opacity="0.7" textAnchor="end">
          {lightOn ? "LIGHT: ON" : "LIGHT: OFF"}
        </text>
      </svg>
    );
  } else if (side === 'generator') {
    // --- GENERATOR BACKROOM ---
    return (
      <svg
        className="w-full h-full select-none"
        viewBox="0 0 200 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="genLightBeam" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#854d0e" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#09090b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="generatorCase" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3f3f46" />
            <stop offset="100%" stopColor="#18181b" />
          </linearGradient>
        </defs>

        <rect width="200" height="150" fill={lightOn ? "#1a1816" : "#020202"} />

        {lightOn ? (
          <>
            {/* Ceiling & massive cables hanging */}
            <polygon points="0,0 200,0 150,30 50,30" fill="#2d2a28" opacity="0.4" />
            <path d="M 30,0 Q 40,25 50,20 Q 60,15 70,35" fill="none" stroke="#2e100c" strokeWidth="2.5" opacity="0.8" />
            <path d="M 120,0 Q 130,22 145,22 Q 160,22 170,0" fill="none" stroke="#111827" strokeWidth="2" opacity="0.9" />

            {/* Industrial Generator Block */}
            <rect x="25" y="55" width="75" height="75" fill="url(#generatorCase)" stroke="#52525b" strokeWidth="1" />
            <rect x="35" y="65" width="15" height="15" fill="#18181b" stroke="#71717a" />
            <circle cx="42.5" cy="72.5" r="4.5" fill="#84cc16" className="animate-pulse" />
            {/* Analog dial */}
            <rect x="60" y="65" width="30" height="15" fill="#09090b" stroke="#ca8a04" strokeWidth="0.8" />
            <line x1="75" y1="78" x2="82" y2="68" stroke="#ef4444" strokeWidth="1.5" />

            {/* Ground grid */}
            <polygon points="0,150 200,150 150,115 50,115" fill="#151413" />
            <line x1="50" y1="115" x2="0" y2="150" stroke="#3730a3" strokeWidth="0.8" opacity="0.4" />
            <line x1="150" y1="115" x2="200" y2="150" stroke="#3730a3" strokeWidth="0.8" opacity="0.4" />

            {/* Right wall and ventilation duct */}
            <polygon points="200,0 150,30 150,115 200,150" fill="#1c1917" opacity="0.8" />
            <rect x="155" y="45" width="35" height="40" fill="#090504" opacity="0.9" />
            <line x1="155" y1="55" x2="190" y2="55" stroke="#44403c" />
            <line x1="155" y1="65" x2="190" y2="65" stroke="#44403c" />
            <line x1="155" y1="75" x2="190" y2="75" stroke="#44403c" />

            <ellipse cx="120" cy="80" rx="80" ry="55" fill="url(#genLightBeam)" />
          </>
        ) : (
          <>
            <polygon points="0,0 200,0 150,30 50,30" fill="#050505" />
            <polygon points="0,150 200,150 150,115 50,115" fill="#030303" />
            <rect x="25" y="55" width="75" height="75" fill="#020202" stroke="#18181b" strokeWidth="0.5" />
          </>
        )}

        {/* --- CREATURE DRAWING: VOLT IN THE GENERATOR --- */}
        {hasMonster ? (
          lightOn ? (
            <g id="gen-volt-body" className="animate-[pulse_1s_infinite]">
              <ellipse cx="125" cy="115" rx="30" ry="32" fill="#000" opacity="0.5" />

              {/* Big Rabit Ears */}
              <path d="M 112,48 C 102,-2 122,-2 122,48" fill="#18181b" stroke="#d97706" strokeWidth="1.5" />
              <path d="M 138,48 C 148,-2 128,-2 128,48" fill="#18181b" stroke="#d97706" strokeWidth="1.5" />
              <path d="M 114,48 C 108,12 118,12 118,48" fill="#b45309" opacity="0.5" />
              <path d="M 136,48 C 142,12 132,12 132,48" fill="#b45309" opacity="0.5" />

              {/* Head */}
              <circle cx="125" cy="62" r="20" fill="#111827" stroke="#eab308" strokeWidth="2" />

              {/* Yellow Headlight Eyes */}
              <circle cx="118" cy="58" r="4" fill="#fcfae9" />
              <circle cx="118" cy="58" r="2.5" fill="#eab308" className="animate-pulse" />
              <circle cx="132" cy="58" r="4" fill="#fcfae9" />
              <circle cx="132" cy="58" r="2.5" fill="#eab308" className="animate-pulse" />

              {/* Grinning Metal Teeth */}
              <rect x="115" y="70" width="20" height="8" fill="#0c0a09" rx="1.5" stroke="#52525b" />
              <line x1="119" y1="70" x2="119" y2="78" stroke="#9ca3af" />
              <line x1="125" y1="70" x2="125" y2="78" stroke="#9ca3af" />
              <line x1="131" y1="70" x2="131" y2="78" stroke="#9ca3af" />

              {/* Chest wires and metallic suit */}
              <path d="M 95,150 L 105,88 L 145,88 L 155,150 Z" fill="#172554" stroke="#d97706" strokeWidth="1.5" />
              <ellipse cx="125" cy="115" rx="8" ry="15" fill="#020617" />
              {/* Exposed copper wires */}
              <path d="M 125,100 C 115,115 135,115 125,130" fill="none" stroke="#ea580c" strokeWidth="1.8" />
              <path d="M 121,105 C 131,118 111,118 127,128" fill="none" stroke="#2563eb" strokeWidth="1.2" />

              <rect x="0" y="0" width="200" height="150" fill="#fbbf24" opacity="0.04" />
            </g>
          ) : (
            <g id="gen-volt-dark">
              <circle cx="118" cy="58" r="2.5" fill="#eab308" className="animate-pulse" />
              <circle cx="132" cy="58" r="2.5" fill="#eab308" className="animate-pulse" />
            </g>
          )
        ) : (
          lightOn && (
            <g opacity="0.7">
              <rect x="52" y="12" width="96" height="14" fill="#000" rx="1" stroke="#27272a" strokeWidth="0.5" opacity="0.7" />
              <text x="100" y="22" fill="#d4d4d8" fontSize="6.5" fontFamily="monospace" textAnchor="middle" letterSpacing="0.8">
                SETOR REABASTECIDO
              </text>
            </g>
          )
        )}

        <rect x="2" y="2" width="196" height="146" fill="none" stroke={lightOn ? "#ca8a04" : "#1e293b"} strokeWidth="0.5" opacity="0.25" />
        <text x="8" y="10" fill={lightOn ? "#ea580c" : "#71717a"} fontSize="5.5" fontFamily="monospace" opacity="0.5">
          A-4_GENERATOR_CAM
        </text>
        <text x="192" y="10" fill={lightOn ? "#84cc16" : "#71717a"} fontSize="5.5" fontFamily="monospace" opacity="0.7" textAnchor="end">
          {lightOn ? "BEAM: ON" : "BEAM: OFF"}
        </text>
      </svg>
    );
  } else {
    // --- VENTILATION DUCT ---
    return (
      <svg
        className="w-full h-full select-none"
        viewBox="0 0 200 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="ventLightBeam" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.32" />
            <stop offset="60%" stopColor="#0891b2" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Circular metal tunnel pipe styling */}
        <rect width="200" height="150" fill={lightOn ? "#0c131d" : "#010204"} />

        {lightOn ? (
          <>
            {/* Duct Concentric rings */}
            <circle cx="100" cy="75" r="95" stroke="#1e293b" strokeWidth="2.5" opacity="0.6" />
            <circle cx="100" cy="75" r="75" stroke="#1e293b" strokeWidth="2" opacity="0.45" />
            <circle cx="100" cy="75" r="55" stroke="#1e293b" strokeWidth="1.5" opacity="0.3" />
            <circle cx="100" cy="75" r="35" stroke="#0f172a" strokeWidth="1" opacity="0.2" />

            {/* Longitudinal perspective lines */}
            <line x1="5" y1="5" x2="65" y2="48" stroke="#1e293b" strokeWidth="1" opacity="0.35" />
            <line x1="195" y1="5" x2="135" y2="48" stroke="#1e293b" strokeWidth="1" opacity="0.35" />
            <line x1="5" y1="145" x2="65" y2="102" stroke="#1e293b" strokeWidth="1" opacity="0.35" />
            <line x1="195" y1="145" x2="135" y2="102" stroke="#1e293b" strokeWidth="1" opacity="0.35" />
            <line x1="100" y1="0" x2="100" y2="40" stroke="#0284c7" strokeWidth="1.5" opacity="0.25" />
            <line x1="100" y1="150" x2="100" y2="110" stroke="#0284c7" strokeWidth="1.5" opacity="0.25" />

            {/* Industrial ventilator fan blades at the center representing high depth */}
            <g opacity="0.25">
              <circle cx="100" cy="75" r="14" fill="#090d16" stroke="#0284c7" />
              <path d="M 100,75 L 88,35 L 112,35 Z" fill="#0284c7" />
              <path d="M 100,75 L 140,87 L 140,63 Z" fill="#0284c7" />
              <path d="M 100,75 L 112,115 L 88,115 Z" fill="#0284c7" />
              <path d="M 100,75 L 60,63 L 60,87 Z" fill="#0284c7" />
            </g>

            <ellipse cx="100" cy="75" rx="80" ry="60" fill="url(#ventLightBeam)" />
          </>
        ) : (
          <>
            {/* Very faint central circle */}
            <circle cx="100" cy="75" r="75" stroke="#090d16" strokeWidth="1" />
            <circle cx="100" cy="75" r="45" stroke="#05070b" strokeWidth="1" />
          </>
        )}

        {/* --- CREATURE DRAWING --- */}
        {hasMonster ? (
          lightOn ? (
            /* SPRING-GRIX THE WIRE MANNEQUIN IN THE VENT FEEDS */
            <g id="vent-spring-body" className="animate-[bounce_0.8s_infinite] origin-center">
              {/* Backside Shadow mask */}
              <ellipse cx="100" cy="78" rx="20" ry="24" fill="#000" opacity="0.65" />

              {/* Wire long limbs stretching to the edges of the duct */}
              <g stroke="#111827" strokeWidth="3" strokeLinecap="round" opacity="0.9">
                {/* Limb 1 top-left */}
                <path d="M 100,75 Q 60,40 20,25" />
                {/* Limb 2 top-right */}
                <path d="M 100,75 Q 140,40 180,25" />
                {/* Limb 3 bottom-left */}
                <path d="M 100,74 Q 60,110 32,130" />
                {/* Limb 4 bottom-right */}
                <path d="M 100,74 Q 140,110 168,130" />
              </g>

              {/* Wire highlight coils */}
              <g stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" opacity="0.6">
                <path d="M 100,75 L 45,35" strokeDasharray="3 3" />
                <path d="M 100,75 L 155,35" strokeDasharray="3 3" />
              </g>

              {/* Creepy split puppet mask face */}
              <ellipse cx="100" cy="62" rx="17" ry="22" fill="#f4f4f5" stroke="#059669" strokeWidth="2.2" />
              
              {/* Purple/Red rosy helper cheeks */}
              <circle cx="89" cy="68" r="3.2" fill="#ec4899" />
              <circle cx="111" cy="68" r="3.2" fill="#ec4899" />

              {/* Menacing mechanical deep black eye sockets and Emerald Pupils */}
              <ellipse cx="91" cy="54" rx="3.5" ry="5.5" fill="#09090b" />
              <ellipse cx="109" cy="54" rx="3.5" ry="5.5" fill="#09090b" />
              <g className="animate-pulse">
                <circle cx="91" cy="54" r="2" fill="#a7f3d0" />
                <circle cx="91" cy="54" r="1" fill="#059669" />
                <circle cx="109" cy="54" r="2" fill="#a7f3d0" />
                <circle cx="109" cy="54" r="1" fill="#059669" />
              </g>

              {/* Sad vertical paint stripes running from the eyes */}
              <line x1="91" y1="60" x2="91" y2="72" stroke="#047857" strokeWidth="1.8" />
              <line x1="109" y1="60" x2="109" y2="72" stroke="#047857" strokeWidth="1.8" />

              {/* Hollow dark mouth grin */}
              <path d="M 89,75 Q 100,88 111,75" stroke="#09090b" strokeWidth="2" fill="#000" strokeLinecap="round" />

              {/* Highlight flash-reflection shine */}
              <ellipse cx="94" cy="46" rx="3" ry="1.5" fill="#fff" opacity="0.6" transform="rotate(-15, 94, 46)" />

              {/* Green color lens overlay representing the toxic nature of spring-grix */}
              <rect x="0" y="0" width="200" height="150" fill="#10b981" opacity="0.05" />
            </g>
          ) : (
            /* SPRING-GRIX GLOWING EMERALD GLASS EYES IN COLD TUNNEL */
            <g id="vent-spring-dark">
              <circle cx="91" cy="54" r="2" fill="#34d399" className="animate-pulse shadow-[0_0_10px_#10b981]" />
              <circle cx="109" cy="54" r="2" fill="#34d399" className="animate-pulse shadow-[0_0_10px_#10b981]" />
              <ellipse cx="100" cy="58" rx="10" ry="12" fill="#030712" opacity="0.35" />
            </g>
          )
        ) : (
          lightOn && (
            <g opacity="0.7">
              <rect x="52" y="12" width="96" height="14" fill="#000" rx="1" stroke="#27272a" strokeWidth="0.5" opacity="0.7" />
              <text x="100" y="22" fill="#d4d4d8" fontSize="6.5" fontFamily="monospace" textAnchor="middle" letterSpacing="0.8">
                CONDUTO DESOBSTRUÍDO
              </text>
            </g>
          )
        )}

        <rect x="2" y="2" width="196" height="146" fill="none" stroke={lightOn ? "#0891b2" : "#1e293b"} strokeWidth="0.5" opacity="0.25" />
        <text x="8" y="10" fill={lightOn ? "#06b6d4" : "#71717a"} fontSize="5.5" fontFamily="monospace" opacity="0.5">
          B-5_VENT_DUCT_CAM
        </text>
        <text x="192" y="10" fill={lightOn ? "#84cc16" : "#71717a"} fontSize="5.5" fontFamily="monospace" opacity="0.7" textAnchor="end">
          {lightOn ? "BEAM: ON" : "BEAM: OFF"}
        </text>
      </svg>
    );
  }
};
