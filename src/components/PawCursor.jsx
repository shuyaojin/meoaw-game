import React, { useState, useEffect } from 'react';

export default function PawCursor() {
  const [paws, setPaws] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Throttle creation to avoid too many DOM nodes
      if (Math.random() > 0.3) return;

      const newPaw = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        angle: Math.random() * 30 - 15 // Random slight rotation
      };

      setPaws(prev => [...prev, newPaw]);

      // Cleanup after animation
      setTimeout(() => {
        setPaws(prev => prev.filter(p => p.id !== newPaw.id));
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {paws.map(paw => (
        <div
          key={paw.id}
          className="absolute w-4 h-4 text-cat-pink opacity-0 animate-paw-fade"
          style={{
            left: paw.x,
            top: paw.y,
            transform: `translate(-50%, -50%) rotate(${paw.angle}deg)`,
          }}
        >
          🐾
        </div>
      ))}
      <style>{`
        @keyframes paw-fade {
          0% { opacity: 0.6; transform: translate(-50%, -50%) scale(0.5); }
          50% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2) translateY(-20px); }
        }
        .animate-paw-fade {
          animation: paw-fade 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
