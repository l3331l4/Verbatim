import React from "react";

interface WaveformBarsProps {
    active?: boolean;
    className?: string;
}

export default function WaveformBars({ active = false, className = "" }: WaveformBarsProps) {

    const pattern = [0.5, 0.8, 1.1, 1.35, 1.6, 1.35, 1.1, 0.8, 0.5];
    const bars = [...pattern, ...pattern.slice(0, -1)];

    return (
        <div className={`relative ${className}`}>
            <div className="wf">
                {bars.map((max, i) => {
                    const styles = {
                        "--min": active ? ".35" : ".4",
                        "--max": active ? String(max) : String(Math.max(0.5, max * 0.7)),
                        "--dur": `${800 + (i % 7) * 70}ms`,
                        "--delay": `${i * 60}ms`,
                        "--entrance-delay": `${100 + i * 30}ms`,
                    } as React.CSSProperties;

                    return (
                        <span
                            key={i}
                            className={`wf-bar ${active ? "wf-bar-active" : ""}`}
                            style={styles}
                        />
                    );
                })}
            </div>
            <div className="wf-floor" />
        </div>
    );
}