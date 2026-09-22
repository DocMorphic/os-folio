"use client";

import { useState, useEffect } from "react";

export interface ClockValue {
  full: string;
  time: string;
}

export function useClock(): ClockValue {
  // A prerendered page may be opened hours later and in another timezone.
  // Server markup and the first browser render must not contain different dates.
  const [time, setTime] = useState<ClockValue>({ full: "", time: "" });

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      setTime(formatTime());
      const now = new Date();
      timeout = setTimeout(tick, (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 10);
    };
    timeout = setTimeout(tick, 0);
    return () => clearTimeout(timeout);
  }, []);

  return time;
}

function formatTime(): ClockValue {
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "short" });
  const date = now.getDate();
  const month = now.toLocaleDateString("en-US", { month: "short" });
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const tzAbbr = now
    .toLocaleTimeString("en-US", { timeZoneName: "short" })
    .split(" ")
    .pop() || "";
  return {
    full: `${day} ${date} ${month} ${time} ${tzAbbr}`,
    time,
  };
}
