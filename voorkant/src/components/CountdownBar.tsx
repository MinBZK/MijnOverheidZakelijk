"use client";

import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import Button from "./button";

const CountdownBar = forwardRef(function CountdownBar(
  { onComplete }: { onComplete: () => void },
  ref,
) {
  const [progress, setProgress] = useState(100);
  const [completed, setCompleted] = useState(false);
  const [resetKey, setResetKey] = useState(0); // to reset useEffect
  const [paused, setPaused] = useState(false);

  // Allow parent to trigger a reset
  useImperativeHandle(ref, () => ({
    reset: () => {
      setProgress(100);
      setCompleted(false);
      setResetKey((prev) => prev + 1);
    },
  }));

  useEffect(() => {
    const totalDuration = 60000;
    const interval = 100;
    const decrement = (100 * interval) / totalDuration;

    const timer = setInterval(() => {
      if (paused) return;
      setProgress((prev) => {
        const next = prev - decrement;
        if (next <= 0) {
          clearInterval(timer);
          setCompleted(true);
          return 0;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [paused, resetKey]); // runs every time resetKey changes

  useEffect(() => {
    if (completed && onComplete) {
      onComplete();
    }
  }, [completed, onComplete]);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
        <div
          className="h-full bg-blue-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <Button onClick={() => setPaused((prev) => !prev)}>
        {paused ? (
          <svg fill="#ffffff" height="15px" width="15px" viewBox="0 0 16 16">
            <path d="M5 16L7 16L15 8L7 -2.7818e-08L5 0L5 16Z" />
          </svg>
        ) : (
          <svg
            fill="#ffffff"
            height="15px"
            width="15px"
            version="1.1"
            id="Capa_1"
            viewBox="0 0 512 512"
          >
            <g>
              <g>
                <path
                  d="M256,0C114.842,0,0,114.842,0,256s114.842,256,256,256s256-114.842,256-256S397.158,0,256,0z M256,465.455
                    c-115.493,0-209.455-93.961-209.455-209.455S140.507,46.545,256,46.545S465.455,140.507,465.455,256S371.493,465.455,256,465.455z
                    "
                />
              </g>
            </g>
            <g>
              <g>
                <path
                  d="M318.061,139.636c-12.853,0-23.273,10.42-23.273,23.273v186.182c0,12.853,10.42,23.273,23.273,23.273
                    c12.853,0,23.273-10.42,23.273-23.273V162.909C341.333,150.056,330.913,139.636,318.061,139.636z"
                />
              </g>
            </g>
            <g>
              <g>
                <path
                  d="M193.939,139.636c-12.853,0-23.273,10.42-23.273,23.273v186.182c0,12.853,10.42,23.273,23.273,23.273
                    c12.853,0,23.273-10.42,23.273-23.273V162.909C217.212,150.056,206.792,139.636,193.939,139.636z"
                />
              </g>
            </g>
          </svg>
        )}
      </Button>
    </div>
  );
});

export default CountdownBar;
