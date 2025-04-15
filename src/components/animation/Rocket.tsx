'use client';

import { useEffect, useRef } from 'react';
import './Rocket.css';

export default function Rocket() {
  const rocketRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const rocket = rocketRef.current;
    if (!rocket) return;
    
    // Inicia a animação após o componente ser montado
    rocket.classList.add('animate');
    
    // Remove a animação quando o componente for desmontado
    return () => {
      rocket.classList.remove('animate');
    };
  }, []);
  
  return (
    <div className="rocket-wrapper" ref={rocketRef}>
      <div className="rocket">
        <div className="rocket-body">
          <div className="window"></div>
        </div>
        <div className="fin fin-left"></div>
        <div className="fin fin-right"></div>
        <div className="exhaust-flame"></div>
        <ul className="exhaust-fumes">
          {[...Array(8)].map((_, i) => (
            <li key={i}></li>
          ))}
        </ul>
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="spark"
            style={{
              '--tx': `${Math.random() * 60 - 30}px`,
              '--ty': `${Math.random() * 60 + 30}px`,
              animationDelay: `${Math.random() * 1}s`
            } as React.CSSProperties}
          ></div>
        ))}
      </div>
    </div>
  );
}