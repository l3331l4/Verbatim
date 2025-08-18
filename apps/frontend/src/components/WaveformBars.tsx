import React, { useState, useEffect } from "react";

interface WaveformBarsProps {
    active?: boolean;
    className?: string;
}

export default function WaveformBars({ active = false, className = "" }: WaveformBarsProps) {
    const [wasActive, setWasActive] = useState(active);

    useEffect(() => {
    if (active) {
      setWasActive(true);
    } else if (wasActive) {
      const timer = setTimeout(() => setWasActive(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [active, wasActive]);

    const pattern = [0.5, 0.8, 1.1, 1.35, 1.6, 1.35, 1.1, 0.8, 0.5];
    const bars = [...pattern, ...pattern.slice(0, -1)];

    return (
        <div className={`relative ${className}`}>
            <div className="wf">
                {bars.map((max, i) => {
                    const styles = {
                        "--min": ".35",
                        "--max": String(max),
                        "--dur": `${800 + (i % 7) * 70}ms`,
                        "--delay": `${i * 60}ms`,
                        "--entrance-delay": `${100 + i * 30}ms`,
                    } as React.CSSProperties;

                    return (
                        <span
                            key={i}
                            className={`wf-bar ${
                                active ? "wf-bar-active" :
                                wasActive ? "wf-bar-fading" : ""
                            }`}
                            style={styles}
                        />
                    );
                })}
            </div>
            <div className="wf-floor" />
        </div>
    );
}