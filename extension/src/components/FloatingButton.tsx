import React, { useState, useRef, useEffect, useCallback } from 'react';
import NudgeBubble from './NudgeBubble';
import type { Language } from '../types';

interface FloatingButtonProps {
  onOpen: () => void;
  showNudge: boolean;
  onNudgeAccept: () => void;
  onNudgeDismiss: () => void;
  panelOpen: boolean;
  language: Language;
}

export default function FloatingButton({
  onOpen,
  showNudge,
  onNudgeAccept,
  onNudgeDismiss,
  panelOpen,
  language,
}: FloatingButtonProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    hasDragged.current = false;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    buttonRef.current?.setPointerCapture(e.pointerId);
  }, [position]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return;
    hasDragged.current = true;
    const newX = Math.max(0, Math.min(window.innerWidth - 56, e.clientX - dragOffset.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 56, e.clientY - dragOffset.current.y));
    requestAnimationFrame(() => {
      setPosition({ x: newX, y: newY });
    });
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    if (!hasDragged.current) {
      onOpen();
    }
  }, [onOpen]);

  if (panelOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 2147483646,
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      {showNudge && (
        <NudgeBubble
          onAccept={onNudgeAccept}
          onDismiss={onNudgeDismiss}
          language={language}
          position={position}
        />
      )}
      <button
        ref={buttonRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        aria-label="Open Neem Form Assistant"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: isDragging ? '#4747C2' : '#5B5BD6',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(91,91,214,0.4)',
          border: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'background 0.2s, box-shadow 0.2s',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '22px',
          fontWeight: 'bold',
          letterSpacing: '-0.5px',
        }}
      >
        S
      </button>
    </div>
  );
}
