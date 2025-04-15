'use client';

import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';

export default function BackgroundAnimation4home() {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

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

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={auroraConfig}
            className="absolute inset-0 z-0"
        />
    );
}