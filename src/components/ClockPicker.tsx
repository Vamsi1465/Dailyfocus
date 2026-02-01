import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ClockPickerProps {
    initialHour?: number;
    initialMinute?: number;
    onChange: (hour: number, minute: number) => void;
    onClose?: () => void;
}

export function ClockPicker({ initialHour = 9, initialMinute = 0, onChange, onClose }: ClockPickerProps) {
    const [mode, setMode] = useState<'hour' | 'minute'>('hour');
    const [hour, setHour] = useState(initialHour);
    const [minute, setMinute] = useState(initialMinute);
    const [isPm, setIsPm] = useState(initialHour >= 12);

    const handleHourSelect = (val: number) => {
        let newHour = val;
        if (val === 12) {
            newHour = isPm ? 12 : 0;
        } else {
            newHour = isPm ? val + 12 : val;
        }
        setHour(newHour);
        setMode('minute');
    };

    const handleMinuteSelect = (val: number) => {
        setMinute(val);
        onChange(hour, val);
        if (onClose) setTimeout(onClose, 200);
    };

    useEffect(() => {
        onChange(hour, minute);
    }, [hour, minute]);

    const toggleAmPm = () => {
        const newIsPm = !isPm;
        setIsPm(newIsPm);
        let newH = hour;
        if (newIsPm && hour < 12) newH += 12;
        if (!newIsPm && hour >= 12) newH -= 12;
        setHour(newH);
    };

    const CLOCK_RADIUS = 90;
    const CLOCK_SIZE = 220;

    const renderClockFace = () => {
        const numbers = mode === 'hour' 
            ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
            : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
            
        const currentVal = mode === 'hour' ? (hour % 12 || 12) : minute;
        
        // Calculate angle - 12 o'clock is at top (270deg in standard coords, or -90deg)
        const valueToAngle = (val: number, total: number) => {
            return ((val / total) * 360 - 90) * (Math.PI / 180);
        };

        const currentAngle = mode === 'hour' 
            ? valueToAngle(hour % 12 || 12, 12)
            : valueToAngle(minute, 60);

        // Calculate hand endpoint
        const handX = CLOCK_SIZE / 2 + CLOCK_RADIUS * Math.cos(currentAngle);
        const handY = CLOCK_SIZE / 2 + CLOCK_RADIUS * Math.sin(currentAngle);

        return (
            <div className="relative mx-auto" style={{ width: CLOCK_SIZE, height: CLOCK_SIZE }}>
                {/* Clock Circle */}
                <div className="absolute inset-0 rounded-full bg-zinc-900/60 border border-white/10" />
                
                {/* Clock Hand Line */}
                <svg className="absolute inset-0 pointer-events-none" width={CLOCK_SIZE} height={CLOCK_SIZE}>
                    <line
                        x1={CLOCK_SIZE / 2}
                        y1={CLOCK_SIZE / 2}
                        x2={handX}
                        y2={handY}
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        className="transition-all duration-200"
                    />
                    {/* Center dot */}
                    <circle
                        cx={CLOCK_SIZE / 2}
                        cy={CLOCK_SIZE / 2}
                        r="4"
                        fill="hsl(var(--primary))"
                    />
                    {/* End dot */}
                    <circle
                        cx={handX}
                        cy={handY}
                        r="4"
                        fill="hsl(var(--primary))"
                        className="transition-all duration-200"
                    />
                </svg>

                {/* Numbers */}
                {numbers.map((num, i) => {
                    const angle = valueToAngle(i, 12);
                    const x = CLOCK_SIZE / 2 + CLOCK_RADIUS * Math.cos(angle);
                    const y = CLOCK_SIZE / 2 + CLOCK_RADIUS * Math.sin(angle);
                    const isSelected = num === currentVal;

                    return (
                        <button
                            key={num}
                            onClick={() => mode === 'hour' ? handleHourSelect(num) : handleMinuteSelect(num)}
                            className={cn(
                                "absolute w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-150 z-10",
                                isSelected 
                                    ? "bg-primary text-primary-foreground scale-110 shadow-lg" 
                                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200 hover:scale-105"
                            )}
                            style={{ 
                                left: `${x}px`, 
                                top: `${y}px`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            {num === 0 && mode === 'minute' ? '00' : num}
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center gap-4 bg-zinc-950 p-5 rounded-xl border border-white/10 shadow-2xl w-[280px]">
            {/* Header Display */}
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setMode('hour')}
                    className={cn(
                        "text-4xl font-bold transition-all font-mono tracking-tight",
                        mode === 'hour' ? "text-primary" : "text-zinc-500 hover:text-zinc-400"
                    )}
                >
                    {(hour % 12 || 12).toString().padStart(2, '0')}
                </button>
                <span className="text-4xl text-zinc-600 font-light">:</span>
                <button 
                    onClick={() => setMode('minute')}
                    className={cn(
                        "text-4xl font-bold transition-all font-mono tracking-tight",
                        mode === 'minute' ? "text-primary" : "text-zinc-500 hover:text-zinc-400"
                    )}
                >
                    {minute.toString().padStart(2, '0')}
                </button>
                
                <div className="flex flex-col gap-1 ml-2">
                    <button 
                        onClick={() => { if (isPm) toggleAmPm(); }}
                        className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded border transition-all",
                            !isPm 
                                ? "bg-white text-black border-white" 
                                : "text-zinc-500 border-zinc-700 hover:text-zinc-300"
                        )}
                    >
                        AM
                    </button>
                    <button 
                        onClick={() => { if (!isPm) toggleAmPm(); }}
                        className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded border transition-all",
                            isPm 
                                ? "bg-white text-black border-white" 
                                : "text-zinc-500 border-zinc-700 hover:text-zinc-300"
                        )}
                    >
                        PM
                    </button>
                </div>
            </div>

            {/* Clock Face */}
            <div className="py-2">
                {renderClockFace()}
            </div>

            {/* OK Button */}
            <div className="w-full pt-2 border-t border-white/5">
                <button 
                    onClick={() => onClose?.()}
                    className="w-full h-10 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded-lg text-sm font-bold uppercase tracking-wider transition-all"
                >
                    OK
                </button>
            </div>
        </div>
    );
}
