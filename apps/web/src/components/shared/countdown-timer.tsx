"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@alaya/ui";

interface CountdownTimerProps {
  endDate: string | Date;
  className?: string;
  size?: "sm" | "md" | "lg";
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(endDate: Date): TimeLeft {
  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownTimer({
  endDate,
  className,
  size = "md",
}: CountdownTimerProps) {
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const [timeLeft, setTimeLeft] = React.useState<TimeLeft>(
    calculateTimeLeft(end)
  );

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(end));
    }, 1000);

    return () => clearInterval(timer);
  }, [end]);

  const sizeClasses = {
    sm: "text-xs gap-1",
    md: "text-sm gap-2",
    lg: "text-lg gap-3",
  };

  const digitClasses = {
    sm: "min-w-[24px]",
    md: "min-w-[32px]",
    lg: "min-w-[40px]",
  };

  const labelSize = {
    sm: "text-[8px]",
    md: "text-[10px]",
    lg: "text-xs",
  };

  const totalSeconds = timeLeft.days * 86400 + timeLeft.hours * 3600 +
    timeLeft.minutes * 60 + timeLeft.seconds;

  if (totalSeconds <= 0) {
    return (
      <span className={cn("text-coral font-ui font-semibold", className)}>
        Deal expired
      </span>
    );
  }

  return (
    <div className={cn("flex items-center", sizeClasses[size], className)}>
      {[
        { value: timeLeft.days, label: "Days" },
        { value: timeLeft.hours, label: "Hrs" },
        { value: timeLeft.minutes, label: "Min" },
        { value: timeLeft.seconds, label: "Sec" },
      ].map((unit, i) => (
        <React.Fragment key={unit.label}>
          <div className="flex flex-col items-center">
            <motion.span
              key={unit.value}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={cn(
                "font-ui font-bold tabular-nums text-softWhite",
                digitClasses[size]
              )}
            >
              {unit.value.toString().padStart(2, "0")}
            </motion.span>
            <span className={cn("text-muted uppercase font-ui", labelSize[size])}>
              {unit.label}
            </span>
          </div>
          {i < 3 && (
            <span className="text-muted/30 font-ui font-bold mb-3">:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
