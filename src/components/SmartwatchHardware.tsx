import React, { useState } from 'react';
import { DeviceStyle } from '../types';
import { RotateCw, Smartphone, Watch, Sun, Moon } from 'lucide-react';
import { feedback } from '../services/audio';

interface SmartwatchHardwareProps {
  children: React.ReactNode;
  deviceStyle: DeviceStyle;
  onChangeDeviceStyle: (style: DeviceStyle) => void;
  onSideButtonClick?: () => void;
  onCrownRotate?: (direction: 'up' | 'down') => void;
  ambientMode: boolean;
  onToggleAmbient: () => void;
}

export const SmartwatchHardware: React.FC<SmartwatchHardwareProps> = ({
  children,
  deviceStyle,
  onChangeDeviceStyle,
  onSideButtonClick,
  onCrownRotate,
  ambientMode,
  onToggleAmbient,
}) => {
  const [crownAngle, setCrownAngle] = useState(0);

  const handleCrownClick = () => {
    feedback.playRotary();
    setCrownAngle((prev) => prev + 45);
    if (onCrownRotate) {
      onCrownRotate('down');
    }
  };

  const handleSideButton = () => {
    feedback.playTap();
    if (onSideButtonClick) {
      onSideButtonClick();
    }
  };

  if (deviceStyle === 'frameless') {
    return (
      <div className="flex flex-col items-center justify-center p-2">
        <div className="w-[360px] h-[360px] rounded-full overflow-hidden shadow-2xl ring-4 ring-neutral-800 bg-black">
          {children}
        </div>
      </div>
    );
  }

  const isSquare = deviceStyle === 'square';

  return (
    <div className="flex flex-col items-center">
      {/* Top Device Controls */}
      <div className="flex items-center gap-2 mb-3 bg-neutral-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-800 text-xs text-neutral-300">
        <span className="font-semibold text-neutral-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <Watch className="w-3.5 h-3.5 text-sky-400" />
          Wear OS 5
        </span>
        <div className="w-px h-3 bg-neutral-700" />
        <button
          onClick={() => onChangeDeviceStyle('pixel')}
          className={`px-2 py-0.5 rounded-full transition text-[11px] ${
            deviceStyle === 'pixel'
              ? 'bg-sky-500 text-white font-medium'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Pixel Watch
        </button>
        <button
          onClick={() => onChangeDeviceStyle('galaxy')}
          className={`px-2 py-0.5 rounded-full transition text-[11px] ${
            deviceStyle === 'galaxy'
              ? 'bg-sky-500 text-white font-medium'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Galaxy Watch
        </button>
        <button
          onClick={() => onChangeDeviceStyle('square')}
          className={`px-2 py-0.5 rounded-full transition text-[11px] ${
            deviceStyle === 'square'
              ? 'bg-sky-500 text-white font-medium'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Square
        </button>
        <div className="w-px h-3 bg-neutral-700" />
        <button
          onClick={onToggleAmbient}
          title={ambientMode ? 'Wake Watch' : 'Ambient / AOD Mode'}
          className={`p-1 rounded-full transition ${
            ambientMode
              ? 'text-amber-400 hover:bg-neutral-800'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          {ambientMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Smartwatch Case & Strap Container */}
      <div className="relative flex flex-col items-center select-none">
        {/* Top Strap */}
        <div className="w-36 h-12 bg-neutral-800 rounded-t-2xl shadow-inner border-t border-x border-neutral-700/50 flex flex-col items-center justify-end pb-1 relative overflow-hidden">
          <div className="w-full h-1 bg-neutral-900/80 mb-1" />
          <div className="w-20 h-1 bg-neutral-700/30 rounded-full" />
        </div>

        {/* Watch Body with Crown and Side Button */}
        <div className="relative flex items-center justify-center">
          {/* Main Case */}
          <div
            className={`relative p-3.5 shadow-2xl transition-all duration-300 ${
              isSquare
                ? 'rounded-[44px] bg-gradient-to-b from-neutral-800 via-neutral-900 to-black border-4 border-neutral-700'
                : 'rounded-full bg-gradient-to-tr from-neutral-950 via-neutral-800 to-neutral-700 border-4 border-neutral-700/80'
            }`}
            style={{
              boxShadow:
                '0 25px 60px -15px rgba(0, 0, 0, 0.9), inset 0 2px 4px rgba(255, 255, 255, 0.15)',
            }}
          >
            {/* Outer Bezel Accent */}
            {deviceStyle === 'galaxy' && (
              <div className="absolute inset-1.5 rounded-full border border-dashed border-neutral-600/50 pointer-events-none" />
            )}

            {/* Watch Screen Glass Bezel */}
            <div
              className={`relative overflow-hidden bg-black shadow-inner ${
                isSquare
                  ? 'w-[320px] h-[340px] rounded-[36px]'
                  : 'w-[340px] h-[340px] rounded-full'
              }`}
            >
              {/* Glass reflection gloss */}
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-full z-30" />

              {/* Watch Display Content */}
              {children}
            </div>
          </div>

          {/* Interactive Hardware Rotating Crown on Right */}
          <button
            onClick={handleCrownClick}
            title="Click or rotate crown to scroll"
            className="absolute -right-3 top-28 w-4 h-12 bg-gradient-to-r from-neutral-700 to-neutral-500 rounded-r-md border-y border-r border-neutral-400 shadow-md flex items-center justify-center hover:brightness-125 active:translate-x-0.5 transition"
            style={{
              transform: `rotate(${crownAngle}deg)`,
            }}
          >
            <div className="w-1 h-8 flex flex-col justify-between py-1 pointer-events-none">
              <div className="w-full h-0.5 bg-neutral-900 rounded" />
              <div className="w-full h-0.5 bg-neutral-900 rounded" />
              <div className="w-full h-0.5 bg-neutral-900 rounded" />
              <div className="w-full h-0.5 bg-neutral-900 rounded" />
            </div>
          </button>

          {/* Physical Side Action Button */}
          <button
            onClick={handleSideButton}
            title="Physical side button: Quick Log"
            className="absolute -right-2 bottom-28 w-3 h-9 bg-neutral-700 rounded-r border-y border-r border-neutral-500 shadow hover:brightness-125 active:translate-x-0.5 transition"
          />
        </div>

        {/* Bottom Strap */}
        <div className="w-36 h-14 bg-neutral-800 rounded-b-2xl shadow-inner border-b border-x border-neutral-700/50 flex flex-col items-center justify-start pt-2 relative overflow-hidden">
          <div className="w-8 h-3 border border-neutral-600 rounded bg-neutral-900/60" />
          <div className="w-20 h-1 bg-neutral-700/30 rounded-full mt-2" />
        </div>
      </div>
    </div>
  );
};
