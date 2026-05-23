/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Wind, 
  Cctv, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Tv, 
  Camera, 
  DoorClosed, 
  DoorOpen, 
  AlertTriangle, 
  Play, 
  RotateCcw, 
  Sliders, 
  Info,
  Layers,
  HelpCircle
} from 'lucide-react';
import { gameAudio } from './audio';
import { CameraView } from './components/CameraView';
import { OfficeHallwayView } from './components/OfficeHallwayView';

// Type definitions for Game State
type PlayerLocation = 'office' | 'generator' | 'vent';
type CameraId = 'CAM_01' | 'CAM_02' | 'CAM_03' | 'CAM_04' | 'CAM_05';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
  category: 'gameplay' | 'traque' | 'survival';
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'survive_1hr', title: 'Uma Hora a Menos', description: 'Sobreviveu à primeira hora (01:00 AM) de vigília.', unlocked: false, icon: '⏰', category: 'survival' },
  { id: 'crank_gen', title: 'Engrenagem Segura', description: 'Ativou a manivela para recarregar o Gerador Principal.', unlocked: false, icon: '⚙️', category: 'gameplay' },
  { id: 'repair_vent', title: 'Respiração Profunda', description: 'Reparou o sistema de ventilação para recuperar oxigênio.', unlocked: false, icon: '💨', category: 'gameplay' },
  { id: 'traque_volt', title: 'Pânico no Coelho', description: 'Assustou Volt na porta esquerda arremessando um Traque.', unlocked: false, icon: '🐰', category: 'traque' },
  { id: 'traque_scrappy', title: 'Sombra Espantada', description: 'Assustou Scrappy na porta direita arremessando um Traque.', unlocked: false, icon: '🐺', category: 'traque' },
  { id: 'traque_spring', title: 'Marionete Fugitiva', description: 'Inibiu Spring-Grix no duto utilizando um potente Traque.', unlocked: false, icon: '🎭', category: 'traque' },
  { id: 'traque_all', title: 'Mestre Explosor', description: 'Usou todos os 4 Traques disponíveis em uma única noite.', unlocked: false, icon: '🧨', category: 'traque' },
  { id: 'reach_5am', title: 'Quase Lá...', description: 'Sustentou a vigilância até a marca de 05:00 AM.', unlocked: false, icon: '🛑', category: 'survival' },
  { id: 'win_night', title: 'Sobrevivente de Elite', description: 'Concluiu e sobreviveu a qualquer noite com sucesso!', unlocked: false, icon: '🏆', category: 'survival' },
  { id: 'golden_night', title: 'Pesadelo de Metal', description: 'Iniciou a Noite Personalizada com inteligência máxima (todos 20).', unlocked: false, icon: '👑', category: 'gameplay' },
];

interface Animatronic {
  name: string;
  nickname: string;
  color: string;
  aiLevel: number;
  currentCam: CameraId | 'door' | 'office' | 'vent_room' | 'generator_room';
}

export default function App() {
  // Game Setup & Nights configuration
  const [gameState, setGameState] = useState<'menu' | 'intro' | 'playing' | 'gameover' | 'victory'>('menu');
  const [currentNight, setCurrentNight] = useState<number>(1);
  const [isCustomNight, setIsCustomNight] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // Custom Night AI settings (0 - 20)
  const [voltAI, setVoltAI] = useState<number>(3);
  const [springGrixAI, setSpringGrixAI] = useState<number>(2);
  const [scrappyAI, setScrappyAI] = useState<number>(1);
  const [runnerAI, setRunnerAI] = useState<number>(2);

  // Runner state tracker for spatial running footsteps
  const [runnerState, setRunnerState] = useState<'idle' | 'running'>('idle');
  const [runnerPosPercent, setRunnerPosPercent] = useState<number>(-50);

  // Time & Survival states
  const [timeHour, setTimeHour] = useState<number>(0); // 0 = 12 AM, 1 = 1 AM, ..., 6 = 6 AM (Victory)
  const [timeSecs, setTimeSecs] = useState<number>(0); // Seconds passed in current hour

  // Player position
  const [playerLoc, setPlayerLoc] = useState<PlayerLocation>('office');

  // Basic assets and tools
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [oxygenLevel, setOxygenLevel] = useState<number>(100);
  const [isCCTVOpen, setIsCCTVOpen] = useState<boolean>(false);
  const [currentCam, setCurrentCam] = useState<CameraId>('CAM_01');
  const [camGlitch, setCamGlitch] = useState<boolean>(false);

  // Office mechanics (Doors & Lights)
  const [leftDoorClosed, setLeftDoorClosed] = useState<boolean>(false);
  const [rightDoorClosed, setRightDoorClosed] = useState<boolean>(false);
  const [leftLightOn, setLeftLightOn] = useState<boolean>(false);
  const [rightLightOn, setRightLightOn] = useState<boolean>(false);

  // Generator room mechanics
  const [isCrankingGen, setIsCrankingGen] = useState<boolean>(false);
  const [genFlashlight, setGenFlashlight] = useState<boolean>(false);
  const [genFlashlightBattery, setGenFlashlightBattery] = useState<number>(100);

  // Vent room mechanics
  const [isRepairingVent, setIsRepairingVent] = useState<boolean>(false);
  const [ventFlashlight, setVentFlashlight] = useState<boolean>(false);
  const [ventFlashlightBattery, setVentFlashlightBattery] = useState<number>(100);
  const [ventGateClosed, setVentGateClosed] = useState<boolean>(false);

  // Animatronics Position Tracker
  // Volt (Coelho): CAM_01 -> CAM_02 -> Office Door (or) CAM_04 -> Generator Room
  const [voltPos, setVoltPos] = useState<CameraId | 'door' | 'generator_room'>('CAM_01');
  // Scrappy (Lobo de Sombras): CAM_01 -> CAM_03 -> Right Office Door
  const [scrappyPos, setScrappyPos] = useState<CameraId | 'door'>('CAM_01');
  // Spring-Grix (Marionete): CAM_01 -> CAM_05 -> Vent Room
  const [springgrixPos, setSpringgrixPos] = useState<CameraId | 'vent_room' | 'office'>('CAM_01');

  // Jumpscare reason
  const [jumpscareBy, setJumpscareBy] = useState<string>('');

  // --- INVENTORIES AND ACHIEVEMENTS STATES ---
  const [traques, setTraques] = useState<number>(4);
  const [traqueExplosionFlash, setTraqueExplosionFlash] = useState<'left' | 'right' | 'vent' | null>(null);
  const [traquesUsedInNight, setTraquesUsedInNight] = useState<number>(0);

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem('consecutive_night_achievements');
      if (saved) {
        const parsed = JSON.parse(saved);
        return INITIAL_ACHIEVEMENTS.map(initial => {
          const item = parsed.find((p: any) => p.id === initial.id);
          return item ? { ...initial, unlocked: item.unlocked } : initial;
        });
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ACHIEVEMENTS;
  });

  const [unlockedToast, setUnlockedToast] = useState<{ title: string; description: string; icon: string } | null>(null);
  const [menuTab, setMenuTab] = useState<'instructions' | 'achievements'>('instructions');

  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
      const alreadyUnlocked = prev.find(ach => ach.id === id)?.unlocked;
      if (alreadyUnlocked) return prev;

      const updated = prev.map(ach => {
        if (ach.id === id) {
          setUnlockedToast({ title: ach.title, description: ach.description, icon: ach.icon });
          return { ...ach, unlocked: true };
        }
        return ach;
      });

      localStorage.setItem('consecutive_night_achievements', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (unlockedToast) {
      const timer = setTimeout(() => {
        setUnlockedToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [unlockedToast]);

  // UI state logs
  const [logs, setLogs] = useState<string[]>(['Sistemas inicializados. Sobreviva até as 06:00.']);

  // Refs for precise timer cycles
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const aiIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Setup / reset stats before start
  const startGame = (nightNum: number) => {
    // Determine AI Levels based on Selected Night
    let vAI = voltAI;
    let sG_AI = springGrixAI;
    let scAI = scrappyAI;
    let rAI = runnerAI;

    if (!isCustomNight) {
      // Automatic configs for presets
      const nightConfigs = [
        { v: 1, s: 0, sc: 1, r: 0 }, // Night 1
        { v: 3, s: 2, sc: 2, r: 2 }, // Night 2
        { v: 6, s: 5, sc: 5, r: 5 }, // Night 3
        { v: 10, s: 8, sc: 9, r: 8 }, // Night 4
        { v: 15, s: 13, sc: 14, r: 12 }, // Night 5
      ];
      const config = nightConfigs[nightNum - 1] || nightConfigs[0];
      vAI = config.v;
      sG_AI = config.s;
      scAI = config.sc;
      rAI = config.r;
      
      // Update state for sliders
      setVoltAI(vAI);
      setSpringGrixAI(sG_AI);
      setScrappyAI(scAI);
      setRunnerAI(rAI);
    }

    // Reset parameters
    setTimeHour(0);
    setTimeSecs(0);
    setBatteryLevel(100);
    setOxygenLevel(100);
    setPlayerLoc('office');
    setLeftDoorClosed(false);
    setRightDoorClosed(false);
    setLeftLightOn(false);
    setRightLightOn(false);
    setIsCCTVOpen(false);
    setGenFlashlight(false);
    setGenFlashlightBattery(100);
    setVentFlashlight(false);
    setVentFlashlightBattery(100);
    setVentGateClosed(false);

    // Reset Traque states
    setTraques(4);
    setTraquesUsedInNight(0);
    setTraqueExplosionFlash(null);

    // Initial positions
    setVoltPos('CAM_01');
    setScrappyPos('CAM_01');
    setSpringgrixPos('CAM_01');

    setRunnerState('idle');
    setRunnerPosPercent(-50);

    setJumpscareBy('');
    setLogs(['Sistemas online. Conectado ao Terminal Principal.', 'Segurança residencial da filial Alpha estabelecida.']);
    
    // Check Golden Night
    if (isCustomNight && vAI === 20 && sG_AI === 20 && scAI === 20 && rAI === 20) {
      unlockAchievement('golden_night');
    }
    
    // Play sound ambience and switch states
    setGameState('intro');
    if (!isAudioMuted) {
      gameAudio.startAmbient();
    }
  };

  const endIntroAndPlay = () => {
    setGameState('playing');
  };

  const triggerJumpscare = (name: string) => {
    setJumpscareBy(name);
    setGameState('gameover');
    gameAudio.stopAmbient();
    if (!isAudioMuted) {
      gameAudio.playJumpscare();
    }
  };

  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev.slice(0, 9)]);
  };

  // Sound triggers
  const toggleMute = () => {
    setIsAudioMuted(prev => {
      const newVal = !prev;
      if (newVal) {
        gameAudio.stopAmbient();
      } else {
        if (gameState === 'playing' || gameState === 'intro') {
          gameAudio.startAmbient();
        }
      }
      return newVal;
    });
  };

  const toggleLeftDoor = () => {
    if (playerLoc !== 'office') return;
    setLeftDoorClosed(prev => {
      const next = !prev;
      if (!isAudioMuted) gameAudio.playDoorSlam(!next);
      addLog(`Porta Esquerda ${next ? 'FECHADA' : 'ABERTA'}.`);
      if (next) {
        setLeftLightOn(false);
      }
      return next;
    });
  };

  const toggleRightDoor = () => {
    if (playerLoc !== 'office') return;
    setRightDoorClosed(prev => {
      const next = !prev;
      if (!isAudioMuted) gameAudio.playDoorSlam(!next);
      addLog(`Porta Direita ${next ? 'FECHADA' : 'ABERTA'}.`);
      if (next) {
        setRightLightOn(false);
      }
      return next;
    });
  };

  const handleThrowTraque = (location: 'left' | 'right' | 'vent') => {
    if (traques <= 0) return;
    
    // Check if monster exists
    if (location === 'left' && voltPos !== 'door') return;
    if (location === 'right' && scrappyPos !== 'door') return;
    if (location === 'vent' && springgrixPos !== 'vent_room') return;
    
    // Check if door is closed (blocking the throw)
    if (location === 'left' && leftDoorClosed) return;
    if (location === 'right' && rightDoorClosed) return;
    if (location === 'vent' && ventGateClosed) return;

    // Use Traque
    setTraques(prev => prev - 1);
    const nextUsed = traquesUsedInNight + 1;
    setTraquesUsedInNight(nextUsed);

    if (!isAudioMuted) {
      gameAudio.playExplosion();
    }

    // Trigger visual flash
    setTraqueExplosionFlash(location);
    setTimeout(() => {
      setTraqueExplosionFlash(null);
    }, 800);

    // Repel monster and aggravate
    if (location === 'left') {
      setVoltPos('CAM_01');
      setVoltAI(prev => {
        const next = Math.min(20, prev + 4);
        addLog(`TRAQUE DETONADO! Cabum! Volt recuou sob forte explosão, mas a agressão o irritou grandemente! (IA: ${next})`);
        return next;
      });
      unlockAchievement('traque_volt');
    } else if (location === 'right') {
      setScrappyPos('CAM_01');
      setScrappyAI(prev => {
        const next = Math.min(20, prev + 4);
        addLog(`TRAQUE DETONADO! Cabum! Scrappy recuou ferido pelo estouro, mas a fumaça o deixou mais hostil! (IA: ${next})`);
        return next;
      });
      unlockAchievement('traque_scrappy');
    } else if (location === 'vent') {
      setSpringgrixPos('CAM_01');
      setSpringGrixAI(prev => {
        const next = Math.min(20, prev + 4);
        addLog(`TRAQUE DETONADO! Cabum! A Marionete fugiu assustada dos dutos, mas as molas estão irritadíssimas! (IA: ${next})`);
        return next;
      });
      unlockAchievement('traque_spring');
    }

    if (nextUsed >= 4) {
      unlockAchievement('traque_all');
    }
  };

  // Handle position clicks ("clicar para ir ao local que você clicou")
  const changePosition = (loc: PlayerLocation) => {
    if (playerLoc === loc) return;
    setPlayerLoc(loc);
    // Turning off lights when leaving
    if (loc !== 'office') {
      setLeftLightOn(false);
      setRightLightOn(false);
      setIsCCTVOpen(false);
    }
    if (!isAudioMuted) {
      gameAudio.playCameraSwitch(); // Mechanical clunk sound
    }
    addLog(`Deslocado para: ${loc === 'office' ? 'Escritório Principal' : loc === 'generator' ? 'Sala do Gerador' : 'Depósito de Ventilação'}`);
  };

  // Primary Game Timers (Main Thread, Power, Oxygen, Hour Updates)
  useEffect(() => {
    if (gameState !== 'playing') {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      return;
    }

    gameIntervalRef.current = setInterval(() => {
      // 1. Time Progression: 60s per hour
      setTimeSecs(prevSecs => {
        const nextSecs = prevSecs + 1;
        if (nextSecs >= 60) {
          setTimeHour(prevHour => {
            const nextHour = prevHour + 1;
            
            // Check hour-based achievements
            if (nextHour === 1) {
              unlockAchievement('survive_1hr');
            } else if (nextHour === 5) {
              unlockAchievement('reach_5am');
            }

            if (nextHour >= 6) {
              setGameState('victory');
              unlockAchievement('win_night');
              gameAudio.stopAmbient();
              if (!isAudioMuted) gameAudio.playVictoryChime();
            } else {
              addLog(`Atenção: Horário atualizado para ${nextHour}:00 AM.`);
            }
            return nextHour;
          });
          return 0;
        }
        return nextSecs;
      });

      // 2. Battery Consumption calculation
      setBatteryLevel(prevBat => {
        if (prevBat <= 0) {
          // Total blackout: force doors open, lights off, wait for jumpscare
          setLeftDoorClosed(false);
          setRightDoorClosed(false);
          setLeftLightOn(false);
          setRightLightOn(false);
          setIsCCTVOpen(false);
          
          // Trigger jumpscare randomly or let them breach
          setTimeout(() => {
            triggerJumpscare('Apagão Total (Falta de Energia)');
          }, 3500);

          return 0;
        }

        // Base drain is 0.15% per second
        let drain = 0.15;
        if (leftDoorClosed) drain += 0.35;
        if (rightDoorClosed) drain += 0.35;
        if (isCCTVOpen) drain += 0.2;
        if (leftLightOn || rightLightOn) drain += 0.15;
        if (genFlashlight && playerLoc === 'generator') drain += 0.1;
        if (ventFlashlight && playerLoc === 'vent') drain += 0.1;

        const nextBat = Math.max(0, prevBat - drain);
        return parseFloat(nextBat.toFixed(2));
      });

      // 3. Oxygen / Ventilation drain level
      setOxygenLevel(prevOxy => {
        let drain = 0.5; // Constant base ventilation drop
        if (playerLoc === 'vent' && isRepairingVent) {
          // Rapid recharge when player cranks the maintenance console
          unlockAchievement('repair_vent');
          return Math.min(100, prevOxy + 4);
        }
        
        const nextOxy = Math.max(0, prevOxy - drain);
        
        // Critical oxygen visual blackout side-effects
        if (nextOxy < 25 && Math.random() < 0.1) {
          addLog("ALERTA: Níveis Críticos de Oxigênio! Alucinações iminentes.");
        }

        if (nextOxy <= 0 && Math.random() < 0.3) {
          // Suffocation jumpscare
          triggerJumpscare('Asfixia (Filtros Obstruídos)');
        }

        return nextOxy;
      });

      // 4. Generator cranking effect
      if (playerLoc === 'generator' && isCrankingGen) {
        unlockAchievement('crank_gen');
        setBatteryLevel(prevBat => {
          if (!isAudioMuted && Math.random() < 0.5) gameAudio.playCrankSound();
          return Math.min(100, prevBat + 2.2);
        });
      }

      // Flashlight batteries update
      setGenFlashlightBattery(prev => {
        if (genFlashlight && playerLoc === 'generator') {
          return Math.max(0, prev - 1.2);
        }
        return Math.min(100, prev + 0.5); // Slow recharge when off
      });

      setVentFlashlightBattery(prev => {
        if (ventFlashlight && playerLoc === 'vent') {
          return Math.max(0, prev - 1.2);
        }
        return Math.min(100, prev + 0.5);
      });

    }, 1000);

    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, [gameState, leftDoorClosed, rightDoorClosed, isCCTVOpen, leftLightOn, rightLightOn, playerLoc, isCrankingGen, isRepairingVent, genFlashlight, ventFlashlight, isAudioMuted]);


  // Handler for spatial running animatronic
  const triggerRunnerSprinting = () => {
    setRunnerState(curr => {
      if (curr !== 'idle') return curr;
      
      setRunnerPosPercent(-20); // start position (far left)

      if (!isAudioMuted) {
        gameAudio.playRunningLeftToRight();
      }
      addLog("ALERTA CRÍTICO: Ruídos ultrassônicos! Volt-Runner disparou correndo da esquerda para a direita!");

      const startTime = Date.now();
      const duration = 2500; // 2.5 seconds
      const animInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        // Calculate current percentage position: from -20% to 120%
        const currentPercent = -20 + progress * 140;
        setRunnerPosPercent(currentPercent);

        if (progress >= 1) {
          clearInterval(animInterval);
          
          // At the end of the sprint, check if Right Door is closed
          setRightDoorClosed(rightClosed => {
            if (rightClosed) {
              // Survived! He hits the door
              addLog("DEFESA EXCELENTE: Volt-Runner colidiu contra a blindagem direita e recuou!");
              if (!isAudioMuted) {
                gameAudio.playLightFlicker(); // Spark/flicker effect
                gameAudio.playDoorSlam(true);
              }
              // Flash screen or make light flicker
              setCamGlitch(true);
              setTimeout(() => setCamGlitch(false), 300);
            } else {
              // Captured! Jumpscare
              triggerJumpscare('Volt-Runner (Em sprint de alta velocidade)');
            }
            return rightClosed;
          });

          // Reset runner back to idle
          setRunnerState('idle');
          setRunnerPosPercent(-50);
        }
      }, 40); // 25 FPS

      return 'running';
    });
  };


  // AI Movement Engine (Runs every 3 seconds to calculate step progression)
  useEffect(() => {
    if (gameState !== 'playing') {
      if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
      return;
    }

    aiIntervalRef.current = setInterval(() => {
      // Random movement opportunities
      const moveOppVal = () => Math.floor(Math.random() * 20) + 1;

      // --- 1. VOLT (O Coelho Cibernético) AI MOVEMENT ---
      // Path 1 (Office door): CAM_01 -> CAM_02 -> Office door
      // Path 2 (Generator): CAM_01 -> CAM_04 -> Generator room
      if (voltAI >= moveOppVal()) {
        if (!isAudioMuted && Math.random() < 0.3) gameAudio.playFootstep();
        
        setVoltPos(curr => {
          if (curr === 'CAM_01') {
            const pathChoice = Math.random() < 0.5 ? 'CAM_02' : 'CAM_04';
            addLog(`Gritinhos abafados detectados nos circuitos de áudio.`);
            return pathChoice;
          } else if (curr === 'CAM_02') {
            return 'door';
          } else if (curr === 'CAM_04') {
            return 'generator_room';
          } else if (curr === 'door') {
            // If door is closed, Volt bumps and retreats
            if (leftDoorClosed && playerLoc === 'office') {
              addLog(`Impacto metálico abafado na porta de aço esquerdo.`);
              if (!isAudioMuted) gameAudio.playDoorSlam(true);
              return 'CAM_01';
            }
            // If player is in Office and door is open, jumpscare!
            if (playerLoc === 'office' && !leftDoorClosed) {
              triggerJumpscare('Volt (Coelho Robótico)');
            }
            return 'door'; // Hostile stance
          } else if (curr === 'generator_room') {
            // At generator room!
            if (playerLoc === 'generator' && genFlashlight && genFlashlightBattery > 0) {
              // Blinded by flashlight, falls back to CAM_01
              addLog(`Volt foi cegado pelo feixe da lanterna e recuou.`);
              return 'CAM_01';
            }
            if (playerLoc === 'generator' && (!genFlashlight || genFlashlightBattery <= 0)) {
              // Unprepared! Jumpscare!
              triggerJumpscare('Volt (Emboscada Mecânica)');
            }
            // If player was at office, Volt waits, then enters Office anyways if left open
            if (playerLoc !== 'generator') {
              // Moves straight to office
              return 'door';
            }
            return 'generator_room';
          }
          return 'CAM_01';
        });
      }


      // --- 2. SCRAPPY (A Sombra Derretida) AI MOVEMENT ---
      // Path: CAM_01 -> CAM_03 -> Right Door
      if (scrappyAI >= moveOppVal()) {
        setScrappyPos(curr => {
          if (curr === 'CAM_01') {
            return 'CAM_03';
          } else if (curr === 'CAM_03') {
            return 'door';
          } else if (curr === 'door') {
            if (rightDoorClosed && playerLoc === 'office') {
              addLog(`Sussurros de estática colidiram com a chapa direita.`);
              if (!isAudioMuted) gameAudio.playDoorSlam(true);
              return 'CAM_01';
            }
            if (playerLoc === 'office' && !rightDoorClosed) {
              triggerJumpscare('Scrappy (Lobo de Sombras)');
            }
            return 'door';
          }
          return 'CAM_01';
        });
      }


      // --- 3. SPRING-GRIX (A Marionete de Mola) AI MOVEMENT ---
      // Path: CAM_01 -> CAM_05 -> Vent Room -> Office ceiling
      if (springGrixAI >= moveOppVal()) {
        setSpringgrixPos(curr => {
          if (curr === 'CAM_01') {
            return 'CAM_05';
          } else if (curr === 'CAM_05') {
            return 'vent_room';
          } else if (curr === 'vent_room') {
            // If vent gate is closed and player is at ventilation Depot, she's blocked
            if (ventGateClosed && playerLoc === 'vent') {
              addLog(`Estrondo ecoou no duto direito. Grelha segurou Spring-Grix.`);
              return 'CAM_01';
            }
            // If player is at Ventilation depot, they can scare her with flashlight
            if (playerLoc === 'vent' && ventFlashlight && ventFlashlightBattery > 0) {
              addLog(`Spring-Grix recua assustada com a forte iluminação.`);
              return 'CAM_05';
            }
            // If player ignores her in the Vent room
            if (playerLoc === 'vent' && (!ventFlashlight || ventFlashlightBattery <= 0) && !ventGateClosed) {
              triggerJumpscare('Spring-Grix (A Marionete)');
            }
            // Otherwise, she enters office ceiling
            if (playerLoc !== 'vent') {
              return 'office';
            }
            return 'vent_room';
          } else if (curr === 'office') {
            // Once inside the office, it's a matter of seconds before she strikes
            if (playerLoc === 'office') {
              triggerJumpscare('Spring-Grix (Invasão do Teto)');
            }
            return 'office';
          }
          return 'CAM_01';
        });
      }


      // --- 4. VOLT-RUNNER (Invasor Veloz) AI MOVEMENT ---
      if (runnerState === 'idle' && runnerAI >= moveOppVal()) {
        triggerRunnerSprinting();
      }

    }, 3000);

    return () => {
      if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
    };
  }, [gameState, voltAI, springGrixAI, scrappyAI, runnerAI, runnerState, leftDoorClosed, rightDoorClosed, ventGateClosed, playerLoc, genFlashlight, ventFlashlight, genFlashlightBattery, ventFlashlightBattery, isAudioMuted]);

  // Active camera feed rendering text description/ASCII/creepy eyes
  const renderCCTVFeed = () => {
    let feedText = '';
    const hasVolt = voltPos === currentCam;
    const hasScrappy = scrappyPos === currentCam;
    const hasSpringGrix = springgrixPos === currentCam;

    switch (currentCam) {
      case 'CAM_01':
        feedText = "ÁREA MULTI-STAGES DE EXPOSIÇÃO: ";
        if (hasVolt || hasScrappy || hasSpringGrix) {
          const names = [];
          if (hasVolt) names.push("Coelho Volt");
          if (hasScrappy) names.push("Scrappy-Shadow");
          if (hasSpringGrix) names.push("Grix-Puppet");
          feedText += `Siluetas ativas na base de recarga: [${names.join(', ')}]`;
        } else {
          feedText += "Estações de ferro desocupadas. Palco vazio.";
        }
        break;
      case 'CAM_02':
        feedText = "RECEPTÁCULO DO CORREDOR ESQUERDO: ";
        if (hasVolt) {
          feedText += "AVISO: Coelho Volt está rastejando rapidamente em direção ao seu painel frontal!";
        } else {
          feedText += "Vazio. Chão úmido refletindo a luz néon intermitente.";
        }
        break;
      case 'CAM_03':
        feedText = "GALERIA DO CORREDOR DIREITO (DUTOS COBRE): ";
        if (hasScrappy) {
          feedText += "CRÍTICO: Uma fumaça negra densa coagula na câmera. Sombra de olhos vermelhos (Scrappy).";
        } else {
          feedText += "Vazio. Vapor escapando de uma tubulação antiga.";
        }
        break;
      case 'CAM_04':
        feedText = "PASSEIO TÉCNICO DE ENTRADA DO GERADOR: ";
        if (voltPos === 'CAM_04') {
          feedText += "PERIGO: Silhueta de orelhas longas se movendo entre fiações suspensas.";
        } else {
          feedText += "Conexões elétricas estáveis. Ruído de ressonância eletromecânica.";
        }
        break;
      case 'CAM_05':
        feedText = "LABIRINTO CENTRAL DOS DUTOS DE VENTILAÇÃO: ";
        if (springgrixPos === 'CAM_05') {
          feedText += "ALERTA: Cabos pendurados oscilam. Marionete Spring-Grix escorregando nos tubos.";
        } else {
          feedText += "Fluxo de ar reduzido, grelhas sujas.";
        }
        break;
    }

    return (
      <div className="relative h-full w-full bg-black/90 border border-emerald-500/30 rounded flex flex-col justify-between overflow-hidden">
        {/* Camera Header */}
        <div className="p-3 bg-zinc-950/90 border-b border-emerald-500/20 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-red-600 animate-ping" />
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">SISTEMA CCTV ONLINE</span>
          </div>
          <span className="text-emerald-400 font-mono text-sm font-bold tracking-wider">{currentCam}</span>
        </div>

        {/* Video Frame */}
        <div className="flex-1 w-full h-full relative" style={{ minHeight: '260px' }}>
          <CameraView 
            currentCam={currentCam} 
            voltPos={voltPos} 
            scrappyPos={scrappyPos} 
            springgrixPos={springgrixPos} 
            camGlitch={camGlitch}
          />
        </div>

        {/* Descrip footer */}
        <div className="p-3 bg-zinc-950/70 border-t border-emerald-500/20 font-mono text-[11px] text-zinc-300 leading-relaxed z-10">
          {feedText}
        </div>
      </div>
    );
  };

  // Helper calculation for total battery drain bars
  const calculateDrainBars = () => {
    let bars = 1; // base
    if (leftDoorClosed) bars++;
    if (rightDoorClosed) bars++;
    if (isCCTVOpen) bars++;
    if (leftLightOn || rightLightOn) bars++;
    if (genFlashlight && playerLoc === 'generator') bars++;
    if (ventFlashlight && playerLoc === 'vent') bars++;
    return bars;
  };

  // Handle switching CCTV monitor with feedback switch sound
  const toggleCCTV = () => {
    if (playerLoc !== 'office') return;
    setIsCCTVOpen(prev => {
      const next = !prev;
      if (!isAudioMuted) {
        gameAudio.playCameraSwitch();
      }
      return next;
    });
  };

  const handleCamSelect = (cam: CameraId) => {
    if (currentCam === cam) return;
    setCamGlitch(true);
    setCurrentCam(cam);
    if (!isAudioMuted) {
      gameAudio.playCameraSwitch();
    }
    setTimeout(() => {
      setCamGlitch(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200 antialiased font-sans" id="game-root">
      
      {/* 1. HEADER HUD BAR */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex justify-between items-center shadow-lg z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-md animate-pulse">
            <ShieldCheck className="w-5 h-5 text-zinc-100" />
          </div>
          <div>
            <h1 className="text-sm font-black text-zinc-100 tracking-wider">TERMINAL DE CONTROLE DE SEGURANÇA</h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:block">Sobrevivência Noturna v4.8</p>
          </div>
        </div>

        {/* Global info controls */}
        <div className="flex items-center gap-4">
          {gameState === 'playing' && (
            <div className="bg-zinc-950 px-3 py-1.5 border border-zinc-800 rounded font-mono text-xs flex gap-4 items-center">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping" />
                POSIÇÃO ATUAL: <strong className="text-zinc-100 uppercase">{playerLoc === 'office' ? 'Escritório' : playerLoc === 'generator' ? 'Sala Gerador' : 'Depósito Ventilação'}</strong>
              </div>
            </div>
          )}

          <button 
            onClick={toggleMute} 
            className="p-2 border border-zinc-800 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title={isAudioMuted ? "Ativar Áudio" : "Mutar Áudio"}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
          </button>
        </div>
      </header>

      {/* 2. MAIN GAME LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col justify-between items-center relative overflow-hidden" id="viewport-frame">
        
        {/* ================= STAGE A: MENU PRINCIPAL ================= */}
        {gameState === 'menu' && (
          <div className="flex-1 w-full max-w-3xl flex flex-col justify-center items-center py-10 px-4">
            
            {/* Terminal decorative frame */}
            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl relative overflow-hidden flex flex-col">
              
              {/* Eerie retro CRT scanlines background */}
              <div className="absolute inset-0 bg-radial-[circle_at_center,_transparent_50%,_black_80%] pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px] pointer-events-none" />

              <div className="text-center z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/50 border border-red-500/20 rounded-full mb-4">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase">Protótipo de Sobrevivência Avançado</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-zinc-100 tracking-tight leading-none">FIVE NIGHTS AT THE</h2>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-red-600 tracking-widest mt-1 uppercase font-mono animate-[pulse_3s_infinite]">SECURITY TERMINAL</h3>
                <p className="text-xs text-zinc-500 font-mono mt-3 max-w-lg mx-auto">
                  Você foi contratado como vigia noturno no laboratório de automação desativado da Alpha-Tech. 
                  Mantenha a base energizada, resfrie os ventiladores contaminados e monitore as câmeras contra as antigas mascotes elétricas.
                </p>
              </div>

              {/* Tabs Switcher Segment */}
              <div className="flex border-b border-zinc-800 mt-6 z-10">
                <button
                  type="button"
                  onClick={() => setMenuTab('instructions')}
                  className={`flex-1 py-2 font-mono text-xs font-black tracking-wider uppercase border-b-2 transition-all ${
                    menuTab === 'instructions'
                      ? 'border-red-500 text-red-500 bg-red-950/10'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  📖 Diretrizes & Controles
                </button>
                <button
                  type="button"
                  onClick={() => setMenuTab('achievements')}
                  className={`flex-1 py-2 font-mono text-xs font-black tracking-wider uppercase border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                    menuTab === 'achievements'
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-950/10'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  🏆 Painel de Conquistas ({achievements.filter(a => a.unlocked).length}/{achievements.length})
                </button>
              </div>

              {/* Tab Content Rendering */}
              {menuTab === 'instructions' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-zinc-950 border border-zinc-850 p-4 rounded-lg z-10 font-mono text-[11px] text-zinc-450 leading-relaxed">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200 mb-2 border-b border-zinc-800 pb-1 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-400" /> REGRAS DE SOBREVIVÊNCIA
                    </h4>
                    <ul className="space-y-1.5 list-disc pl-4">
                      <li>Sua <span className="text-emerald-400 font-bold">Bateria Central</span> se esgota com portas fechadas e monitorativo de câmeras.</li>
                      <li>Surgiram problemas de suprimento? <span className="text-yellow-400 font-bold">Clique no Mapa</span> para trocar de sala e recarregar manualmente a energia.</li>
                      <li>A ventilação falha se ficar offline! <span className="text-amber-400 font-bold">Vá para a Sala de Ventilação</span> para recondicionar o oxigênio e fugir das alucinações.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200 mb-2 border-b border-zinc-800 pb-1 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> CONTROLES DO DETECTOR
                    </h4>
                    <ul className="space-y-1.5 list-disc pl-4">
                      <li><strong className="text-zinc-300">Office:</strong> Interruptores de luz e portas. Use botões laterais vermelhos, lâmpadas ou jogue Traques para sobreviver.</li>
                      <li><strong className="text-zinc-300">Sala de Carga:</strong> Segure girar a manivela para restaurar a bateria geral.</li>
                      <li><strong className="text-zinc-300">Dutos:</strong> Acenda a lanterna ou jogue Traque para inibir marionetes.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="mt-4 bg-zinc-950 border border-zinc-850 p-4 rounded-lg z-10 font-mono text-[11px] text-zinc-300 flex flex-col space-y-3">
                  <div className="flex justify-between items-center bg-zinc-900 px-3 py-2 border border-zinc-800 rounded">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Sincronização de Progresso</span>
                    {/* Tiny Progress Bar */}
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-zinc-950 border border-zinc-850 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                          style={{ width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-emerald-400 font-black text-xs">
                        {Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Achievements Grid List */}
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {achievements.map((ach) => (
                      <div 
                        key={ach.id} 
                        className={`p-2.5 border rounded-md flex items-center gap-3 transition-colors ${
                          ach.unlocked 
                            ? 'bg-emerald-950/15 border-emerald-900/40' 
                            : 'bg-zinc-900/10 border-zinc-800/20 opacity-50'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${
                          ach.unlocked ? 'bg-emerald-950/30 border border-emerald-500/30' : 'bg-zinc-900 border border-zinc-800'
                        }`}>
                          {ach.unlocked ? ach.icon : '🔒'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[11px] font-bold tracking-tight ${ach.unlocked ? 'text-zinc-100' : 'text-zinc-500'}`}>
                              {ach.title}
                            </span>
                            {ach.unlocked ? (
                              <span className="text-[7.5px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-500 text-zinc-950 tracking-tighter">Concluído</span>
                            ) : (
                              <span className="text-[7.5px] uppercase font-black px-1.5 py-0.5 rounded bg-zinc-850 text-zinc-500 tracking-tighter">Bloqueado</span>
                            )}
                          </div>
                          <p className="text-[9.5px] text-zinc-400 mt-0.5">{ach.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CONFIG LEVEL SELECTOR & START */}
              <div className="mt-8 z-10 flex flex-col gap-6 border-t border-zinc-800/80 pt-6">
                
                {/* Mode Toggles */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => {
                        setIsCustomNight(false);
                        setCurrentNight(n);
                      }}
                      className={`px-4 py-2 rounded-md font-mono text-xs font-black transition-all ${
                        !isCustomNight && currentNight === n 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-2 ring-red-500/50' 
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      NOITE {n}
                    </button>
                  ))}

                  <button
                    onClick={() => setIsCustomNight(true)}
                    className={`px-4 py-2 rounded-md font-mono text-xs font-black flex items-center gap-1.5 transition-all ${
                      isCustomNight 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-500/50' 
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" /> PERSONALIZADA (6)
                  </button>
                </div>

                {/* Custom Night Sliders */}
                {isCustomNight && (
                  <div className="bg-zinc-950 p-4 border border-purple-500/20 rounded-lg space-y-4 font-mono text-xs">
                    <h4 className="text-purple-400 font-bold tracking-wider text-center uppercase">Ajuste de Inteligência Artificial (0 - 20)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Volt */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-yellow-500">
                          <span>VOLT (COELHO)</span>
                          <span>Nível {voltAI}</span>
                        </div>
                        <input 
                          type="range" min="0" max="20" value={voltAI} 
                          onChange={(e) => setVoltAI(parseInt(e.target.value))}
                          className="w-full accent-yellow-500 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                      </div>
                      {/* Spring-Grix */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-emerald-500">
                          <span>SPRING-GRIX (VENTIL)</span>
                          <span>Nível {springGrixAI}</span>
                        </div>
                        <input 
                          type="range" min="0" max="20" value={springGrixAI} 
                          onChange={(e) => setSpringGrixAI(parseInt(e.target.value))}
                          className="w-full accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                      </div>
                      {/* Scrappy */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-red-500">
                          <span>SCRAPPY (SOMBRA)</span>
                          <span>Nível {scrappyAI}</span>
                        </div>
                        <input 
                          type="range" min="0" max="20" value={scrappyAI} 
                          onChange={(e) => setScrappyAI(parseInt(e.target.value))}
                          className="w-full accent-red-500 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                      </div>
                      {/* Volt-Runner */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-orange-500">
                          <span>VOLT-RUNNER (VELOZ)</span>
                          <span>Nível {runnerAI}</span>
                        </div>
                        <input 
                          type="range" min="0" max="20" value={runnerAI} 
                          onChange={(e) => setRunnerAI(parseInt(e.target.value))}
                          className="w-full accent-orange-500 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Start triggering */}
                <button
                  onClick={() => startGame(currentNight)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 hover:text-black font-extrabold uppercase tracking-widest text-sm rounded-lg flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/20 hover:scale-[1.02] transform transition-all cursor-pointer font-sans"
                >
                  <Play className="w-5 h-5 fill-current" /> INICIAR PROCEDIMENTO DE ENTRADA
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ================= STAGE B: INTRO HORROR CARD ================= */}
        {gameState === 'intro' && (
          <div className="flex-1 w-full max-w-xl flex flex-col justify-center items-center py-12">
            <div className="bg-zinc-900 border border-red-500/30 p-8 rounded-lg shadow-2xl space-y-6 text-center font-mono w-full relative">
              <div className="animate-pulse flex flex-col items-center">
                <Tv className="w-16 h-16 text-red-600 mb-2" />
                <div className="w-1/3 h-1 bg-red-600 rounded mb-4" />
              </div>
              <h3 className="text-xl font-bold text-zinc-100 tracking-widest uppercase">CONEXÃO CONSTITUÍDA</h3>
              <p className="text-xs text-zinc-400 text-left leading-relaxed">
                "Olá? Oi! Se você está ouvindo isso, você sobreviveu ao processo seletivo básico. 
                Bem-vindo ao turno da noite. O terminal na sua mesa central controla o gerador e os filtros principais. 
                Os modelos antigos Volt, Scrappy e Spring-Grix têm uma fiação falha... eles confundem as pessoas com módulos vazios de motor e tentam empacotar você. 
                Sim, aquilo pode causar sérias dores. Use as portas de aço para bloqueá-los. 
                Se a luz falhar, você tem que reabastecer a bateria no gerador ao lado. Boa sorte."
              </p>
              <div className="pt-4 border-t border-zinc-800">
                <button
                  onClick={endIntroAndPlay}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase rounded hover:scale-105 transition-all"
                >
                  ACESSAR TERMINAL (00:00 AM)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE C: PRINCIPAL GAMEPLAY ================= */}
        {gameState === 'playing' && (
          <div className="flex-1 w-full flex flex-col gap-4">
            
            {/* 1. TOP STATS BAR (AM & Battery) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Battery level counter */}
              <div className="bg-zinc-900 border border-zinc-800 p-3 rounded flex justify-between items-center bg-radial-[circle_at_left,_rgba(16,185,129,0.05)_5%,_transparent_80%]">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase block">ENERGIA GERAL DA BASE</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black font-mono tracking-tight ${batteryLevel < 20 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
                      {batteryLevel}%
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">BAT</span>
                  </div>
                </div>
                {/* Drain rate indicators bar */}
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">CONSUMO DE RECURSO</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((bar) => (
                      <span 
                        key={bar} 
                        className={`w-2.5 h-4.5 rounded-sm transition-colors duration-200 ${
                          bar <= calculateDrainBars() 
                            ? calculateDrainBars() >= 4 
                              ? 'bg-red-500 shadow-[0_0_5px_#f5c5]' 
                              : 'bg-emerald-500 shadow-[0_0_5px_#10b9]' 
                            : 'bg-zinc-800'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Time display indicator */}
              <div className="bg-zinc-900 border border-zinc-800 p-3 rounded flex flex-col items-center justify-center bg-radial-[circle_at_center,_rgba(239,68,68,0.02)_0%,_transparent_100%]">
                <span className="text-[9px] font-mono text-zinc-400 tracking-widest uppercase">NÚCLEO DE HORÁRIO</span>
                <div className="text-3xl font-black font-mono text-zinc-100 tracking-widest animate-[pulse_2s_infinite]">
                  {timeHour === 0 ? "12" : timeHour}:00 <span className="text-xs font-normal text-red-500 tracking-normal text-left">AM</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  Sobrevivência da Noite {isCustomNight ? 'Custom' : currentNight} ({60 - timeSecs}s restantes)
                </div>
              </div>

              {/* Space Oxygen level meter */}
              <div className="bg-zinc-900 border border-zinc-800 p-3 rounded flex justify-between items-center bg-radial-[circle_at_right,_rgba(59,130,246,0.05)_5%,_transparent_80%]">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase block">CONCENTRAÇÃO OXIGÊNIO</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black font-mono tracking-tight ${oxygenLevel < 35 ? 'text-amber-500 animate-[bounce_1.5s_infinite]' : 'text-blue-400'}`}>
                      {oxygenLevel.toFixed(0)}%
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">O2</span>
                  </div>
                </div>
                <div className="w-1/2 flex flex-col justify-end text-right">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase mb-1">PROVEDOR FILTRAGEM</span>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${oxygenLevel < 35 ? 'bg-amber-600' : 'bg-blue-500'}`}
                      style={{ width: `${oxygenLevel}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* 2. PLAYING ROOM GRID */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-[460px]">
              
              {/* LEFT & CENTER SUB-GRID: Current Active Room Space View (8 columns) */}
              <div className="lg:col-span-8 flex flex-col gap-3 min-h-[400px]">
                
                {/* Visual representation of player's physical location */}
                <div className="flex-1 rounded-lg border border-zinc-800 relative bg-zinc-950 p-4 shadow-xl overflow-hidden flex flex-col justify-between">
                  
                  {/* Decorative corner brackets or CCTV scan details */}
                  <div className="absolute top-2 left-2 text-[10px] font-mono text-zinc-600">SYS_LOC_LIVE</div>
                  <div className="absolute top-2 right-2 text-[10px] text-red-500 animate-pulse font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    {playerLoc === 'office' ? 'CONTROL_STATION' : playerLoc === 'generator' ? 'GEN_STATION' : 'MAINT_STATION'}
                  </div>

                  {/* High tension vignette filters */}
                  {oxygenLevel < 30 && (
                    <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_30%,_rgba(153,27,27,0.3)_100%)] animate-[pulse_1.5s_infinite] pointer-events-none z-10" />
                  )}

                  {/* ================= AREA A: ESCRITÓRIO PRINCIPAL ================= */}
                  {playerLoc === 'office' && (
                    <div className="flex-1 flex flex-col justify-between" id="office-room-view">
                      
                      {/* Sprinter Silhouette running from Left to Right */}
                      {runnerState === 'running' && (
                        <div className="absolute inset-x-0 top-1/4 h-48 pointer-events-none z-20 overflow-hidden">
                          <div 
                            className="absolute bottom-0 h-44 w-28 flex flex-col items-center justify-center transition-all duration-75"
                            style={{ left: `${runnerPosPercent}%` }}
                          >
                            <div className="relative">
                              {/* Motion blur wind tails */}
                              <div className="absolute right-full top-4 w-12 h-2 bg-gradient-to-r from-transparent to-orange-500/60 blur-[2px] animate-pulse" />
                              <div className="absolute right-full top-12 w-16 h-2 bg-gradient-to-r from-transparent to-red-500/75 blur-[3px] animate-pulse" />
                              <div className="absolute right-full top-20 w-10 h-2 bg-gradient-to-r from-transparent to-orange-600/50 blur-[2px] animate-pulse" />

                              {/* Running robot shape with glowing yellow neon eyes */}
                              <div className="w-16 h-24 bg-zinc-950/95 border-2 border-orange-500/50 rounded-2xl flex flex-col items-center justify-center relative shadow-[0_0_20px_rgba(249,115,22,0.4)] animate-[bounce_0.15s_infinite]">
                                {/* Rabbit ears tilted back because of wind/speed */}
                                <div className="absolute bottom-full left-3 w-3 h-10 bg-zinc-900 border-t-2 border-x border-orange-500/40 rounded-t-full origin-bottom -rotate-[45deg]" />
                                <div className="absolute bottom-full right-3 w-3 h-10 bg-zinc-900 border-t-2 border-x border-orange-500/40 rounded-t-full origin-bottom -rotate-[35deg]" />

                                {/* Glowing mechanical red/yellow eyes */}
                                <div className="flex gap-2.5 mt-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#f00] animate-ping absolute" />
                                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_12px_#f50]" />
                                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_12px_#f50]" />
                                </div>

                                {/* Speed mouth / grill */}
                                <div className="w-8 h-2 bg-zinc-800 border-t border-red-500/30 mt-4 rounded" />

                                {/* Sprint number banner */}
                                <span className="text-[7.5px] font-mono text-zinc-500 mt-2 font-bold uppercase tracking-tighter">SPEED RUN</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-orange-400 font-mono font-black tracking-widest mt-1 bg-black/85 px-2 py-0.5 rounded border border-orange-500/35 shadow animate-pulse uppercase">
                              RUNNING
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Left Wall Corridor Light Status, Door button */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch flex-1 my-4">
                        
                        {/* Door Wall (Esquerda) */}
                        <div className={`p-4 rounded-lg border transition-all flex flex-col justify-between items-center relative ${
                          leftLightOn 
                            ? voltPos === 'door' 
                              ? 'bg-yellow-950/40 border-yellow-500/50 shadow-[inset_0_0_20px_rgba(234,179,8,0.2)]' 
                              : 'bg-zinc-900 border-zinc-700 shadow-inner'
                            : 'bg-zinc-900/40 border-zinc-800/40'
                        }`}>
                          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">ALA ESQUERDA</span>
                          
                          {/* Left Window Visual */}
                          <div className="w-full aspect-[4/3] bg-black border border-zinc-800 rounded flex flex-col items-center justify-center relative overflow-hidden my-3">
                            <OfficeHallwayView
                              side="left"
                              lightOn={leftLightOn}
                              hasMonster={voltPos === 'door'}
                            />
                            {/* Traque explosion flash */}
                            {traqueExplosionFlash === 'left' && (
                              <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center animate-ping">
                                <span className="font-sans text-xl font-extrabold text-red-600 tracking-wider">💥 CABUM!!!</span>
                              </div>
                            )}
                          </div>

                          {/* Control panels */}
                          <div className="w-full grid grid-cols-2 gap-2">
                            <button
                              onClick={toggleLeftDoor}
                              className={`py-2 px-1 rounded text-xs font-mono font-bold flex flex-col items-center justify-center border transition-all ${
                                leftDoorClosed 
                                  ? 'bg-red-950 border-red-500 hover:bg-red-900/60 text-red-400' 
                                  : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300'
                              }`}
                            >
                              {leftDoorClosed ? <DoorClosed className="w-4 h-4 mb-1" /> : <DoorOpen className="w-4 h-4 mb-1" />}
                              <span>PORTA: {leftDoorClosed ? 'FECHADO' : 'ABERTO'}</span>
                            </button>
                            <button
                              onMouseDown={() => {
                                if (leftDoorClosed) return;
                                if (!isAudioMuted && !leftLightOn) gameAudio.playLightFlicker();
                                setLeftLightOn(true);
                              }}
                              onMouseUp={() => setLeftLightOn(false)}
                              onMouseLeave={() => setLeftLightOn(false)}
                              onTouchStart={() => {
                                if (leftDoorClosed) return;
                                if (!isAudioMuted && !leftLightOn) gameAudio.playLightFlicker();
                                setLeftLightOn(true);
                              }}
                              onTouchEnd={() => setLeftLightOn(false)}
                              className={`py-2 px-1 rounded text-xs font-mono font-bold flex flex-col items-center justify-center border transition-all select-none ${
                                leftDoorClosed
                                  ? 'bg-zinc-950 border-zinc-900 text-zinc-650 cursor-not-allowed opacity-40'
                                  : leftLightOn 
                                    ? 'bg-yellow-500 border-yellow-400 text-zinc-950 font-black' 
                                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 cursor-pointer'
                              }`}
                              disabled={leftDoorClosed}
                            >
                              <Zap className="w-4 h-4 mb-1" />
                              <span>{leftDoorClosed ? 'LUZ BLOQUEADA' : 'LUZ ATIVADA'}</span>
                            </button>
                          </div>

                          {/* Jogar Traque Button */}
                          <button
                            onClick={() => handleThrowTraque('left')}
                            disabled={traques <= 0 || leftDoorClosed}
                            className={`w-full mt-3 py-2 px-3 rounded font-mono text-xs font-black border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              voltPos === 'door' && !leftDoorClosed && traques > 0
                                ? 'bg-red-600 border-red-500 hover:bg-red-500 text-white animate-pulse shadow-lg shadow-red-600/30 font-bold'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <span>🧨 JOGAR TRAQUE ({traques}/4)</span>
                            {voltPos === 'door' && !leftDoorClosed && traques > 0 && (
                              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                            )}
                          </button>
                        </div>

                        {/* Central CCTV Main Monitor Console */}
                        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col justify-between items-center text-center">
                          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">SISTEMA SECURITY PANEL</span>
                          
                          <div className="my-4 space-y-3">
                            <Tv className="w-12 h-12 text-zinc-500 mx-auto animate-pulse" />
                            <h4 className="text-xs font-mono text-zinc-300">CCTV CONSEC MONITORADO</h4>
                            <p className="text-[10px] text-zinc-500 font-mono max-w-xs">
                              Mantenha atenção nos feeds eletrônicos periódicos para estimar a proximidade no setor.
                            </p>
                          </div>

                          <button
                            onClick={toggleCCTV}
                            className={`w-full py-3 rounded font-mono text-xs font-extrabold border transition-all tracking-wider ${
                              isCCTVOpen 
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-950/20' 
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                            }`}
                          >
                            {isCCTVOpen ? '× FECHAR HUD DE CÂMERAS' : '□ MONITORAR CÂMERAS (CCTV)'}
                          </button>
                        </div>

                        {/* Door Wall (Direita) */}
                        <div className={`p-4 rounded-lg border transition-all flex flex-col justify-between items-center relative ${
                          rightLightOn 
                            ? scrappyPos === 'door' 
                              ? 'bg-yellow-950/40 border-yellow-500/50 shadow-[inset_0_0_20px_rgba(234,179,8,0.2)]' 
                              : 'bg-zinc-900 border-zinc-700 shadow-inner'
                            : 'bg-zinc-900/40 border-zinc-800/40'
                        }`}>
                          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">ALA DIREITA</span>
                          
                          {/* Right Window Visual */}
                          <div className="w-full aspect-[4/3] bg-black border border-zinc-800 rounded flex flex-col items-center justify-center relative overflow-hidden my-3">
                            <OfficeHallwayView
                              side="right"
                              lightOn={rightLightOn}
                              hasMonster={scrappyPos === 'door'}
                            />
                            {/* Traque explosion flash */}
                            {traqueExplosionFlash === 'right' && (
                              <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center animate-ping">
                                <span className="font-sans text-xl font-extrabold text-red-600 tracking-wider">💥 CABUM!!!</span>
                              </div>
                            )}
                          </div>

                          {/* Control panels */}
                          <div className="w-full grid grid-cols-2 gap-2">
                            <button
                              onClick={toggleRightDoor}
                              className={`py-2 px-1 rounded text-xs font-mono font-bold flex flex-col items-center justify-center border transition-all ${
                                rightDoorClosed 
                                  ? 'bg-red-950 border-red-500 hover:bg-red-900/60 text-red-400' 
                                  : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300'
                              }`}
                            >
                              {rightDoorClosed ? <DoorClosed className="w-4 h-4 mb-1" /> : <DoorOpen className="w-4 h-4 mb-1" />}
                              <span>PORTA: {rightDoorClosed ? 'FECHADO' : 'ABERTO'}</span>
                            </button>
                            <button
                              onMouseDown={() => {
                                if (rightDoorClosed) return;
                                if (!isAudioMuted && !rightLightOn) gameAudio.playLightFlicker();
                                setRightLightOn(true);
                              }}
                              onMouseUp={() => setRightLightOn(false)}
                              onMouseLeave={() => setRightLightOn(false)}
                              onTouchStart={() => {
                                if (rightDoorClosed) return;
                                if (!isAudioMuted && !rightLightOn) gameAudio.playLightFlicker();
                                setRightLightOn(true);
                              }}
                              onTouchEnd={() => setRightLightOn(false)}
                              className={`py-2 px-1 rounded text-xs font-mono font-bold flex flex-col items-center justify-center border transition-all select-none ${
                                rightDoorClosed
                                  ? 'bg-zinc-950 border-zinc-900 text-zinc-650 cursor-not-allowed opacity-40'
                                  : rightLightOn 
                                    ? 'bg-yellow-500 border-yellow-400 text-zinc-950 font-black' 
                                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 cursor-pointer'
                              }`}
                              disabled={rightDoorClosed}
                            >
                              <Zap className="w-4 h-4 mb-1" />
                              <span>{rightDoorClosed ? 'LUZ BLOQUEADA' : 'LUZ ATIVADA'}</span>
                            </button>
                          </div>

                          {/* Jogar Traque Button */}
                          <button
                            onClick={() => handleThrowTraque('right')}
                            disabled={traques <= 0 || rightDoorClosed}
                            className={`w-full mt-3 py-2 px-3 rounded font-mono text-xs font-black border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              scrappyPos === 'door' && !rightDoorClosed && traques > 0
                                ? 'bg-red-600 border-red-500 hover:bg-red-500 text-white animate-pulse shadow-lg shadow-red-600/30 font-bold'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <span>🧨 JOGAR TRAQUE ({traques}/4)</span>
                            {scrappyPos === 'door' && !rightDoorClosed && traques > 0 && (
                              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                            )}
                          </button>
                        </div>

                      </div>

                      {/* CCTV camera overlay module inside office if active */}
                      {isCCTVOpen && (
                        <div className="absolute inset-0 bg-zinc-950 p-3 z-30 flex flex-col md:flex-row gap-3">
                          
                          {/* Left Panel: Camera Stream output */}
                          <div className="flex-1 min-h-[220px]">
                            {renderCCTVFeed()}
                          </div>

                          {/* Right Panel: Map Blueprint and Select Trigger */}
                          <div className="w-full md:w-64 bg-zinc-900 border border-zinc-800 p-3 rounded flex flex-col justify-between font-mono">
                            <div>
                              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-2 border-b border-zinc-800 pb-1">PLANTA DE CCTV</span>
                              
                              {/* Simple CSS-rendered node grid blueprint representing FNAF corridors */}
                              <div className="relative aspect-square w-full bg-zinc-950 rounded border border-zinc-800 p-2 flex flex-col justify-between text-[10px] text-zinc-400">
                                
                                <div className="absolute inset-0 bg-grid-[#10b981]/[0.03] pointer-events-none" />

                                {/* CAM 1 at top */}
                                <div className="flex justify-center">
                                  <button 
                                    onClick={() => handleCamSelect('CAM_01')}
                                    className={`py-1 px-2 border rounded font-bold text-[9px] ${currentCam === 'CAM_01' ? 'bg-emerald-600 text-zinc-950 border-emerald-400' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'}`}
                                  >
                                    CAM-01
                                  </button>
                                </div>

                                <div className="flex justify-between items-center my-1.5 px-1">
                                  <button 
                                    onClick={() => handleCamSelect('CAM_02')}
                                    className={`py-1 px-1.5 border rounded font-bold text-[9px] ${currentCam === 'CAM_02' ? 'bg-emerald-600 text-zinc-950 border-emerald-400' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800'}`}
                                  >
                                    CAM-02
                                  </button>
                                  <span className="text-[8px] text-zinc-600 tracking-tighter">=== COLD HALLWAYS ===</span>
                                  <button 
                                    onClick={() => handleCamSelect('CAM_03')}
                                    className={`py-1 px-1.5 border rounded font-bold text-[9px] ${currentCam === 'CAM_03' ? 'bg-emerald-600 text-zinc-950 border-emerald-400' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800'}`}
                                  >
                                    CAM-03
                                  </button>
                                </div>

                                <div className="flex justify-between items-center px-1 my-1">
                                  <button 
                                    onClick={() => handleCamSelect('CAM_04')}
                                    className={`py-1 px-1.5 border rounded font-bold text-[9px] ${currentCam === 'CAM_04' ? 'bg-emerald-600 text-zinc-950 border-emerald-400' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800'}`}
                                  >
                                    CAM-04
                                  </button>
                                  <div className="px-2 py-1 bg-red-950/20 border border-zinc-800 text-[8px] rounded text-zinc-400">
                                    ESCRITÓRIO
                                  </div>
                                  <button 
                                    onClick={() => handleCamSelect('CAM_05')}
                                    className={`py-1 px-1.5 border rounded font-bold text-[9px] ${currentCam === 'CAM_05' ? 'bg-emerald-600 text-zinc-950 border-emerald-400' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800'}`}
                                  >
                                    CAM-05
                                  </button>
                                </div>

                              </div>
                            </div>

                            <button 
                              onClick={toggleCCTV}
                              className="mt-4 w-full py-2 bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 text-xs text-center uppercase tracking-wider rounded"
                            >
                              Voltar para Escritório
                            </button>
                          </div>

                        </div>
                      )}

                    </div>
                  )}


                  {/* ================= AREA B: SALA DO GERADOR ================= */}
                  {playerLoc === 'generator' && (
                    <div className="flex-1 flex flex-col md:flex-row gap-4 py-3" id="generator-room-view">
                      
                      {/* Cranking Control Core */}
                      <div className="flex-1 bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex flex-col justify-between items-center relative overflow-hidden">
                        
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping" />
                          <span className="text-[10px] font-mono text-zinc-500">CONVERSOR BIFÁSICO</span>
                        </div>

                        <div className="text-center my-6">
                          <Zap className="w-20 h-20 text-yellow-500 mx-auto animate-[pulse_2s_infinite] drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" />
                          <h4 className="text-sm font-mono text-zinc-100 font-bold mt-3">SISTEMA DIÁRIO DE CARGA DINÂMICA</h4>
                          <p className="text-xs text-zinc-400 max-w-sm mt-1 mx-auto leading-relaxed">
                            Mantenha a manivela girada para gerar watts suplementares. Drena sua atenção do escritório principal.
                          </p>
                        </div>

                        {/* Interactive crank wheel (Hold interaction or clicking) */}
                        <div className="w-full space-y-3 z-10">
                          <button
                            onMouseDown={() => setIsCrankingGen(true)}
                            onMouseUp={() => setIsCrankingGen(false)}
                            onMouseLeave={() => setIsCrankingGen(false)}
                            onTouchStart={() => setIsCrankingGen(true)}
                            onTouchEnd={() => setIsCrankingGen(false)}
                            className={`w-full py-4 rounded-lg font-mono text-sm font-black uppercase tracking-widest border transition-all select-none cursor-pointer ${
                              isCrankingGen 
                                ? 'bg-yellow-500 text-zinc-950 border-yellow-400 shadow-xl shadow-yellow-500/20 scale-[0.98]' 
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                            }`}
                          >
                            {isCrankingGen ? "⚡ GERANDO ENERGIA ATIVA... ⚡" : "⚙️ CLIQUE E SEGURE PARA REABASTECER BATERIA"}
                          </button>
                        </div>
                      </div>

                      {/* Generator Corridor watch (Vulnerability) */}
                      <div className="w-full md:w-80 bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex flex-col justify-between">
                        
                        <div className="border-b border-zinc-800 pb-2 mb-2">
                          <span className="text-[10px] font-mono text-zinc-500 block">SEGURANÇA PERIMETRAL</span>
                          <span className="text-xs font-mono text-zinc-100 font-bold uppercase">CORREDOR DO GERADOR (A-4)</span>
                        </div>

                        {/* Dark hallway stream visual */}
                        <div className={`w-full aspect-[4/3] rounded bg-black border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden my-3 ${
                          genFlashlight && genFlashlightBattery > 0 
                            ? 'shadow-[inset_0_0_20px_rgba(255,255,255,0.15)] bg-zinc-950' 
                            : 'bg-black'
                        }`}>
                          {genFlashlight && genFlashlightBattery > 0 ? (
                            voltPos === 'generator_room' ? (
                              <div className="text-center animate-pulse">
                                <span className="text-[10px] font-mono text-yellow-500 font-bold block mb-1">=== VOLT IDENTIFICADO ===</span>
                                <div className="flex gap-4 justify-center my-1">
                                  <span className="w-3.5 h-3.5 rounded bg-yellow-400 shadow-[0_0_12px_#fb0]" />
                                  <span className="w-3.5 h-3.5 rounded bg-yellow-400 shadow-[0_0_12px_#fb0]" />
                                </div>
                                <span className="text-[8px] font-mono text-zinc-400">CEGUE-O COM A LANTERNA PARA FAZÊ-LO RECUAR</span>
                              </div>
                            ) : (
                              <span className="text-[9px] font-mono text-zinc-300">Corredor iluminado... Nada à frente</span>
                            )
                          ) : (
                            <div className="text-center">
                              {voltPos === 'generator_room' && (
                                <div className="flex gap-4 justify-center animate-pulse py-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                                </div>
                              )}
                              <span className="text-[9px] font-mono text-zinc-600">[PITCH BLACK - ATIVE A LANTERNA]</span>
                            </div>
                          )}

                          {/* Battery indicator specifically for this portable light */}
                          {genFlashlight && (
                            <div className="absolute bottom-2 inset-x-2 flex items-center justify-between font-mono text-[9px] text-zinc-400 px-1 bg-black/60 rounded">
                              <span>BATERIA DA LANTERNA:</span>
                              <span className={genFlashlightBattery < 20 ? "text-red-500 font-bold" : "text-emerald-400"}>
                                {genFlashlightBattery.toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Flashlight toggle trigger */}
                        <button
                          onMouseDown={() => {
                            if (!isAudioMuted && !genFlashlight) gameAudio.playFlashlightClick();
                            setGenFlashlight(true);
                          }}
                          onMouseUp={() => setGenFlashlight(false)}
                          onMouseLeave={() => setGenFlashlight(false)}
                          onTouchStart={() => {
                            if (!isAudioMuted && !genFlashlight) gameAudio.playFlashlightClick();
                            setGenFlashlight(true);
                          }}
                          onTouchEnd={() => setGenFlashlight(false)}
                          className={`w-full py-3.5 rounded font-mono text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer select-none transition-all ${
                            genFlashlight && genFlashlightBattery > 0 
                              ? 'bg-zinc-100 text-zinc-950 font-black border-zinc-200' 
                              : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          <span>🔦 {genFlashlight ? "SOLTE PARA APAGAR" : "Pressione para LIGAR LANTERNA"}</span>
                        </button>

                      </div>

                    </div>
                  )}


                  {/* ================= AREA C: DEPÓSITO DE VENTILAÇÃO ================= */}
                  {playerLoc === 'vent' && (
                    <div className="flex-1 flex flex-col md:flex-row gap-4 py-3" id="vent-room-view">
                      
                      {/* Filter Restoration Box */}
                      <div className="flex-1 bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex flex-col justify-between items-center relative overflow-hidden">
                        
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                          <span className="text-[10px] font-mono text-zinc-500">EXAUSTORES ATIVOS</span>
                        </div>

                        <div className="text-center my-6">
                          <Wind className="w-20 h-20 text-blue-400 mx-auto animate-[pulse_2s_infinite] drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]" />
                          <h4 className="text-sm font-mono text-zinc-100 font-bold mt-3">RECONDICIONADOR DE NITROÊNIO (O2)</h4>
                          <p className="text-xs text-zinc-400 max-w-sm mt-1 mx-auto leading-relaxed">
                            A base se torna tóxica se os filtros estiverem entupidos. Use o comando de limpeza de dutos regularmente.
                          </p>
                        </div>

                        <div className="w-full space-y-3 z-10">
                          <button
                            onMouseDown={() => setIsRepairingVent(true)}
                            onMouseUp={() => setIsRepairingVent(false)}
                            onMouseLeave={() => setIsRepairingVent(false)}
                            onTouchStart={() => setIsRepairingVent(true)}
                            onTouchEnd={() => setIsRepairingVent(false)}
                            className={`w-full py-4 rounded-lg font-mono text-sm font-black uppercase tracking-widest border transition-all select-none cursor-pointer ${
                              isRepairingVent 
                                ? 'bg-blue-500 text-zinc-950 border-blue-400 shadow-xl shadow-blue-500/20' 
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                            }`}
                          >
                            {isRepairingVent ? "♻️ LIMPANDO FILTROS DE AR... ♻️" : "🏗️ CLIQUE E SEGURE PARA RESTAURAR OXIGÊNIO"}
                          </button>
                        </div>
                      </div>

                      {/* Ventilation Duct Protection Box */}
                      <div className="w-full md:w-80 bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex flex-col justify-between">
                        
                        <div className="border-b border-zinc-800 pb-2 mb-2">
                          <span className="text-[10px] font-mono text-zinc-500 block">SISTEMA AUXILIAR</span>
                          <span className="text-xs font-mono text-zinc-100 font-bold uppercase font-mono">Duto Traseiro Central (B-5)</span>
                        </div>

                        {/* Ventilation view */}
                        <div className={`w-full aspect-[4/3] rounded bg-black border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden my-2 ${
                          ventFlashlight && ventFlashlightBattery > 0 
                            ? 'shadow-[inset_0_0_20px_rgba(255,255,255,0.15)]' 
                            : 'bg-black'
                        }`}>
                          {ventFlashlight && ventFlashlightBattery > 0 ? (
                            springgrixPos === 'vent_room' ? (
                              <div className="text-center animate-pulse">
                                <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">=== SPRING-GRIX DETECTADA ===</span>
                                <div className="flex gap-5 justify-center my-1 animate-[bounce_1s_infinite]">
                                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#34d399]" />
                                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#34d399]" />
                                </div>
                                <span className="text-[8.5px] font-mono text-zinc-300">SHINE FLASHLIGHT OR CLOSE GRELHA IMMEDIATELY</span>
                              </div>
                            ) : (
                              <span className="text-[9px] font-mono text-zinc-300">Conduto de ventilação limpo...</span>
                            )
                          ) : (
                            <div className="text-center">
                              {springgrixPos === 'vent_room' && (
                                <div className="flex gap-4 justify-center animate-pulse py-1">
                                  <span className="w-1.5 h-1.5 rounded bg-emerald-500/50" />
                                  <span className="w-1.5 h-1.5 rounded bg-emerald-500/50" />
                                </div>
                              )}
                              <span className="text-[9px] font-mono text-zinc-600">[ESCURO - TOQUE EM LANTERNA]</span>
                            </div>
                          )}

                          {/* Grelha Overlay indicator */}
                          {ventGateClosed && (
                            <div className="absolute inset-0 bg-red-950/60 border border-red-500 flex items-center justify-center font-mono text-xs text-red-500 font-bold uppercase tracking-widest z-10 transition-transform animate-pulse">
                              [ Grelha de Aço Fechada ]
                            </div>
                          )}

                          {/* Traque explosion flash */}
                          {traqueExplosionFlash === 'vent' && (
                            <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center animate-ping">
                              <span className="font-sans text-[10px] font-black text-red-600 tracking-wider">💥 CABUM!!! DU-TO DETONADO</span>
                            </div>
                          )}
                        </div>

                        {/* Flashlight trigger & Vent Grill block switch */}
                        <div className="space-y-2">
                          <button
                            onMouseDown={() => {
                              if (ventGateClosed) return;
                              if (!isAudioMuted && !ventFlashlight) gameAudio.playFlashlightClick();
                              setVentFlashlight(true);
                            }}
                            onMouseUp={() => setVentFlashlight(false)}
                            onMouseLeave={() => setVentFlashlight(false)}
                            onTouchStart={() => {
                              if (ventGateClosed) return;
                              if (!isAudioMuted && !ventFlashlight) gameAudio.playFlashlightClick();
                              setVentFlashlight(true);
                            }}
                            onTouchEnd={() => setVentFlashlight(false)}
                            className={`w-full py-2.5 rounded font-mono text-xs font-bold border flex items-center justify-center gap-1.5 select-none transition-all ${
                              ventGateClosed
                                ? 'bg-zinc-950 border-zinc-900 text-zinc-650 cursor-not-allowed opacity-40'
                                : ventFlashlight && ventFlashlightBattery > 0 
                                  ? 'bg-zinc-100 text-zinc-950 font-black border-zinc-200' 
                                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                            }`}
                            disabled={ventGateClosed}
                          >
                            <span>{ventGateClosed ? "🔦 GRELHA BLOQUEANDO LUZ" : ventFlashlight ? "🔦 SOLTE PARA DESLIGAR" : "🔦 Pressione para LIGAR LANTERNA"}</span>
                          </button>

                          <button
                            onClick={() => {
                              setVentGateClosed(prev => {
                                const next = !prev;
                                if (!isAudioMuted) gameAudio.playDoorSlam(!next);
                                if (next) {
                                  setVentFlashlight(false);
                                }
                                return next;
                              });
                            }}
                            className={`w-full py-2.5 rounded font-mono text-xs font-bold border transition-all ${
                              ventGateClosed 
                                ? 'bg-red-900 border-red-500 text-red-100' 
                                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                            }`}
                          >
                            🚪 {ventGateClosed ? "ABRIR GRELHA DE VENT" : "FECHAR GRELHA DE VENT"}
                          </button>

                          {/* Jogar Traque Button inside Vent */}
                          <button
                            onClick={() => handleThrowTraque('vent')}
                            disabled={traques <= 0 || ventGateClosed}
                            className={`w-full mt-2 py-2 px-3 rounded font-mono text-xs font-black border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              springgrixPos === 'vent_room' && !ventGateClosed && traques > 0
                                ? 'bg-red-600 border-red-500 hover:bg-red-500 text-white animate-[pulse_1s_infinite] shadow-lg shadow-red-600/30'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <span>🧨 JOGAR TRAQUE ({traques}/4)</span>
                            {springgrixPos === 'vent_room' && !ventGateClosed && traques > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            )}
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                </div>

                {/* Live Console Output System log block (Subtle layout element) */}
                <div className="bg-zinc-900 border border-zinc-800 rounded p-3 font-mono text-[10px] [text-shadow:_0_1px_rgba(0,0,0,0.5)]">
                  <div className="text-zinc-500 uppercase tracking-widest font-black border-b border-zinc-800 pb-1 mb-2">TELEMETRIA DOC DE SISTEMA (LOGS)</div>
                  <div className="h-16 overflow-y-auto space-y-1 select-none font-medium text-emerald-400">
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-zinc-600">[{10 - i}]</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT SUB-GRID: Tactical Mini-Map for Navigation Nodes (4 columns) */}
              <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="border-b border-zinc-800 pb-2 mb-4">
                    <h3 className="text-xs font-mono font-black text-zinc-400 tracking-widest uppercase">MÓDULOS DE POSIÇÃO (MAPA)</h3>
                    <p className="text-[10px] font-mono text-zinc-500">Clique para deslocar fisicamente o personagem</p>
                  </div>

                  {/* High Quality SVG Blueprint interactive map representing FNAF location blueprint */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded p-3 flex flex-col items-center">
                    
                    <svg className="w-full aspect-square text-zinc-700 max-w-[200px]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                      
                      {/* Grid background on vector style */}
                      <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#18181b" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="200" height="200" fill="url(#grid)" />

                      {/* Industrial Walls linking the rooms */}
                      <path d="M 30,50 L 170,50 L 170,150 L 30,150 Z" stroke="#374151" strokeWidth="2" strokeDasharray="4 4" />
                      
                      {/* Corridors lines */}
                      <line x1="100" y1="50" x2="100" y2="150" stroke="#4b5563" strokeWidth="2" />
                      <line x1="30" y1="100" x2="170" y2="100" stroke="#4b5563" strokeWidth="2" />

                      {/* 1. Generator Node (Left Annex) */}
                      <g 
                        className="cursor-pointer group transition-all"
                        onClick={() => changePosition('generator')}
                      >
                        <circle 
                          cx="30" cy="100" r="14" 
                          fill={playerLoc === 'generator' ? '#eab308' : '#1e1b4b'} 
                          stroke={playerLoc === 'generator' ? '#facc15' : '#4338ca'} 
                          strokeWidth="2" 
                        />
                        <text x="30" y="103" fill={playerLoc === 'generator' ? '#000' : '#818cf8'} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">GEN</text>
                      </g>

                      {/* 2. Office Node (Central Hub) */}
                      <g 
                        className="cursor-pointer group transition-all"
                        onClick={() => changePosition('office')}
                      >
                        <circle 
                          cx="100" cy="150" r="16" 
                          fill={playerLoc === 'office' ? '#10b981' : '#1e1b4b'} 
                          stroke={playerLoc === 'office' ? '#34d399' : '#4338ca'} 
                          strokeWidth="2" 
                        />
                        <text x="100" y="153" fill={playerLoc === 'office' ? '#000' : '#818cf8'} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">ESC</text>
                      </g>

                      {/* 3. Ventilation Node (Right Annex) */}
                      <g 
                        className="cursor-pointer group transition-all"
                        onClick={() => changePosition('vent')}
                      >
                        <circle 
                          cx="170" cy="100" r="14" 
                          fill={playerLoc === 'vent' ? '#3b82f6' : '#1e1b4b'} 
                          stroke={playerLoc === 'vent' ? '#60a5fa' : '#4338ca'} 
                          strokeWidth="2" 
                        />
                        <text x="170" y="103" fill={playerLoc === 'vent' ? '#000' : '#818cf8'} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">O2</text>
                      </g>

                      {/* Simulated monster tracking markers (Only visible to help player coordinate visually) */}
                      {voltPos === 'generator_room' && (
                        <circle cx="30" cy="80" r="4" fill="#ef4444" className="animate-ping" />
                      )}
                      {springgrixPos === 'vent_room' && (
                        <circle cx="170" cy="80" r="4" fill="#ef4444" className="animate-ping" />
                      )}
                      {(voltPos === 'door' || scrappyPos === 'door') && (
                        <circle cx="100" cy="120" r="5" fill="#f43f5e" className="animate-bounce" />
                      )}
                      {runnerState === 'running' && (
                        <circle 
                          cx={30 + Math.max(0, Math.min(1, (runnerPosPercent + 20) / 140)) * 140} 
                          cy="80" 
                          r="5.5" 
                          fill="#f97316" 
                          className="animate-ping" 
                        />
                      )}

                    </svg>

                  </div>

                  {/* Room Legends and Hotkeys links */}
                  <div className="mt-4 space-y-2 font-mono text-[11px]">
                    <button
                      onClick={() => changePosition('office')}
                      className={`w-full py-2.5 px-3 rounded border text-left flex justify-between items-center transition-colors font-bold ${
                        playerLoc === 'office' 
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400' 
                          : 'bg-zinc-800/30 border-zinc-800 hover:bg-zinc-800/80 text-zinc-400'
                      }`}
                    >
                      <span>1. Escritório Central (ESC)</span>
                      <ShieldCheck className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => changePosition('generator')}
                      className={`w-full py-2.5 px-3 rounded border text-left flex justify-between items-center transition-colors font-bold ${
                        playerLoc === 'generator' 
                          ? 'bg-yellow-950/40 border-yellow-500/50 text-yellow-400' 
                          : 'bg-zinc-800/30 border-zinc-800 hover:bg-zinc-800/80 text-zinc-400'
                      }`}
                    >
                      <span>2. Sala do Gerador (GEN)</span>
                      <Zap className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => changePosition('vent')}
                      className={`w-full py-2.5 px-3 rounded border text-left flex justify-between items-center transition-colors font-bold ${
                        playerLoc === 'vent' 
                          ? 'bg-blue-950/40 border-blue-500/50 text-blue-400' 
                          : 'bg-zinc-800/30 border-zinc-800 hover:bg-zinc-800/80 text-zinc-400'
                      }`}
                    >
                      <span>3. Depósito Ventilação (O2)</span>
                      <Wind className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* General Quit/Back option */}
                <div className="mt-6 border-t border-zinc-800 pt-3">
                  <button
                    onClick={() => {
                      setGameState('menu');
                      gameAudio.stopAmbient();
                    }}
                    className="w-full py-2 border border-zinc-850 hover:bg-zinc-800 rounded font-mono text-xs text-zinc-550 hover:text-zinc-300 font-bold"
                  >
                    × ABORTAR CONEXÃO (SAIR)
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ================= STAGE D: JUMPSCARE / GAME OVER SCREEN ================= */}
        {gameState === 'gameover' && (
          <div className="flex-1 w-full max-w-lg flex flex-col justify-center items-center py-10">
            <div className="bg-zinc-900 border-2 border-red-600 rounded-xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between items-center text-center animate-shake pb-10">
              
              {/* Pulsating red ambient filter */}
              <div className="absolute inset-0 bg-red-950/10 animate-ping" />

              <div className="z-10 text-red-500 font-mono text-3xl font-black tracking-widest uppercase mb-4 animate-bounce">
                SINAL PERDIDO
              </div>

              {/* Beautiful eerie blood effect */}
              <div className="relative w-28 h-28 my-4 flex items-center justify-center bg-black border-4 border-red-600 rounded-full shadow-[0_0_20px_#f00]">
                <span className="text-4xl text-red-600 select-none font-bold">☠</span>
              </div>

              <div className="z-10 mt-4 space-y-2">
                <h3 className="text-xl font-bold font-mono text-zinc-100">FALHA DE INTEGRIDADE</h3>
                <p className="text-zinc-400 font-mono text-xs max-w-md">
                  Vigilante neutralizado na {isCustomNight ? 'Noite Personalizada' : `Noite ${currentNight}`} por <strong className="text-red-500 underline">{jumpscareBy}</strong> às {timeHour === 0 ? "12" : timeHour}:00 AM.
                </p>
                <p className="text-[10px] text-zinc-500 font-mono italic">
                  "Os circuitos de fusíveis detectaram força traumática extrema no console."
                </p>
              </div>

              <div className="z-10 mt-8 w-full space-y-3">
                <button
                  onClick={() => startGame(currentNight)}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase font-mono text-xs tracking-wider rounded-lg shadow-lg hover:scale-105 transform transition-all cursor-pointer"
                >
                  Tentar Novamente (Reiniciar Noite)
                </button>
                <button
                  onClick={() => {
                    setGameState('menu');
                    gameAudio.stopAmbient();
                  }}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold uppercase font-mono text-xs rounded-lg transition-all"
                >
                  Voltar ao Menu Principal
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ================= STAGE E: VICTORY SCREEN (6 AM) ================= */}
        {gameState === 'victory' && (
          <div className="flex-1 w-full max-w-xl flex flex-col justify-center items-center py-10">
            <div className="bg-zinc-900 border border-emerald-500 p-8 rounded-xl shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
              
              <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_40%,_rgba(16,185,129,0.15)_100%)] animate-pulse pointer-events-none" />

              <div className="text-5xl font-black text-emerald-400 tracking-widest font-mono select-none animate-[bounce_1.5s_infinite]">
                06:00 AM
              </div>
              
              <div className="bg-slate-950 border border-emerald-500/20 rounded p-6 my-6 font-mono text-xs max-w-md text-zinc-300 space-y-3 leading-relaxed">
                <h4 className="text-sm font-bold text-emerald-400 text-center uppercase tracking-wider">REGISTRO DE TURNO CONCLUÍDO</h4>
                <p>
                  Parabéns! Você alcançou o final do expediente. As portas automáticas de segurança do complexo de pesquisa foram liberadas.
                </p>
                <p className="text-zinc-500 text-[10px]">
                  Os animatrônicos desativaram seus sensores de proximidade diurnos e recuaram para as cabines de estase principais. Seus saldos eletrônicos foram transferidos com sucesso.
                </p>
              </div>

              <div className="w-full space-y-3">
                {!isCustomNight && currentNight < 5 ? (
                  <button
                    onClick={() => {
                      const next = currentNight + 1;
                      setCurrentNight(next);
                      startGame(next);
                    }}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black uppercase text-xs tracking-wider rounded-lg shadow-lg hover:scale-105 transition-all cursor-pointer"
                  >
                    Avançar para a Noite {currentNight + 1}
                  </button>
                ) : (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded text-emerald-400 font-bold text-[10px] uppercase font-mono">
                    ★ CONQUISTA: SOBREVIVENTE MESTRE INTEGRAL ★
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setGameState('menu');
                    gameAudio.stopAmbient();
                  }}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold uppercase text-xs rounded-lg transition-all"
                >
                  Retornar ao Menu
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* 3. RETRO FOOTER */}
      <footer className="bg-zinc-950 border-t border-zinc-900 px-6 py-2 text-center text-[10px] font-mono text-zinc-600">
        Inspirado em Five Nights at Freddy's. Desenvolvido com TypeScript &amp; Web Audio API. 2026.
      </footer>

    </div>
  );
}
