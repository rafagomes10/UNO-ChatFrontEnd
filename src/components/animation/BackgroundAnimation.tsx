'use client';

import { useCallback, useState, useEffect } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';
import Rocket from './Rocket';

export default function BackgroundAnimation() {
  const [currentEffect, setCurrentEffect] = useState('meteor');
  const [showRocket, setShowRocket] = useState(false);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const galaxyConfig = {
    fullScreen: {
      enable: false,
      zIndex: 0
    },
    particles: {
      number: { value: 150, density: { enable: true, value_area: 800 } },
      color: { value: ["#ffffff", "#87ceeb", "#add8e6", "#e6e6fa", "#800080"] },
      shape: { type: "circle" },
      opacity: {
        value: 1,
        random: true,
        animation: { enable: true, speed: 1, minimumValue: 0.1, sync: false }
      },
      size: {
        value: 3,
        random: true,
        animation: { enable: true, speed: 2, minimumValue: 0.3, sync: false }
      },
      move: {
        enable: true,
        speed: 0.5,
        direction: "none" as const,
        random: true,
        straight: false,
        outModes: "out" as const
      },
      twinkle: {
        particles: { enable: true, frequency: 0.05, opacity: 1 }
      }
    },
    background: {
      color: { value: "#0a0b2e" },
      image: "radial-gradient(circle, #1a1a4a 0%, #0a0b2e 100%)",
      position: "50% 50%",
      repeat: "no-repeat",
      size: "cover"
    }
  };

  const meteorConfig = {
    fullScreen: {
      enable: false,
      zIndex: 0
    },
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: "#FFD700" },
      shape: { type: "circle" },
      opacity: {
        value: 0.8,
        random: true,
        animation: { enable: true, speed: 1, minimumValue: 0.1, sync: false }
      },
      size: {
        value: 2,
        random: true,
        animation: { enable: true, speed: 3, minimumValue: 0.5, sync: false }
      },
      move: {
        enable: true,
        speed: 15,
        direction: "bottom-right" as const,
        random: false,
        straight: true,
        outModes: "out" as const
      },
      trail: {
        enable: true,
        length: 10,
        fillColor: "#000"
      }
    },
    background: {
      color: { value: "#000033" },
      image: "linear-gradient(125deg, #000033 0%, #000066 100%)",
      position: "50% 50%",
      repeat: "no-repeat",
      size: "cover"
    }
  };

  const auroraConfig = {
    fullScreen: {
      enable: false,
      zIndex: 0
    },
    particles: {
      number: { value: 100, density: { enable: true, value_area: 800 } },
      color: { value: ["#00ff00", "#00ffff", "#ff00ff"] },
      shape: { type: "circle" },
      opacity: {
        value: 0.5,
        random: true,
        animation: { enable: true, speed: 0.5, minimumValue: 0.1, sync: false }
      },
      size: {
        value: 4,
        random: true,
        animation: { enable: true, speed: 1, minimumValue: 0.5, sync: false }
      },
      move: {
        enable: true,
        speed: 2,
        direction: "top" as const,
        random: true,
        straight: false,
        outModes: "out" as const
      },
      wobble: {
        enable: true,
        distance: 10,
        speed: 10
      }
    },
    background: {
      color: { value: "#000022" },
      image: "linear-gradient(180deg, #000022 0%, #001133 100%)",
      position: "50% 50%",
      repeat: "no-repeat",
      size: "cover"
    }
  };

  useEffect(() => {
    const effects = ['meteor', 'galaxy', 'aurora'];
    let currentIndex = 0;
  
    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % effects.length;
      const newEffect = effects[currentIndex];
      setCurrentEffect(newEffect);
      
      // Mostrar o foguete apenas quando o efeito for meteor
      if (newEffect === 'meteor') {
        setShowRocket(true);
        
        // Esconder o foguete após a animação terminar
        const rocketTimeout = setTimeout(() => {
          setShowRocket(false);
        }, 8000);
        
        return () => clearTimeout(rocketTimeout);
      } else {
        setShowRocket(false);
      }
    }, 10000);
  
    // Verificar se o efeito inicial é meteor para mostrar o foguete
    if (currentEffect === 'meteor') {
      setShowRocket(true);
    }
  
    return () => clearInterval(intervalId);
  }, []);

  const getCurrentConfig = () => {
    switch (currentEffect) {
      case 'meteor':
        return meteorConfig;
      case 'aurora':
        return auroraConfig;
      default:
        return galaxyConfig;
    }
  };

  return (
    <div>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={getCurrentConfig()}
        className="absolute inset-0 z-0"
      />
      {showRocket && <Rocket />}
    </div>
  );
}