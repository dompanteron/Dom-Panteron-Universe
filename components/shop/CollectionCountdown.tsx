"use client";

import { useEffect, useState } from "react";

function formatCountdown(ms: number) {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

export default function CollectionCountdown({
  revealAt,
  compact
}: {
  revealAt: string;
  compact?: boolean;
}) {
  const target = new Date(revealAt).getTime();
  const [msLeft, setMsLeft] = useState(() =>
    Number.isNaN(target) ? 0 : Math.max(0, target - Date.now())
  );

  useEffect(() => {
    if (Number.isNaN(target)) {
      return;
    }
    const tick = () => setMsLeft(Math.max(0, target - Date.now()));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [target]);

  if (msLeft <= 0) {
    return null;
  }

  const { days, hours, minutes, seconds } = formatCountdown(msLeft);
  const unitClass = compact ? "text-xl md:text-2xl" : "text-2xl md:text-3xl";

  return (
    <div className={`flex flex-wrap gap-4 ${compact ? "gap-3" : "gap-4 md:gap-6"}`}>
      {[
        ["Days", days],
        ["Hours", hours],
        ["Min", minutes],
        ["Sec", seconds]
      ].map(([label, value]) => (
        <div key={label as string} className="flex flex-col items-center">
          <span className={`font-display tabular-nums text-white ${unitClass}`}>
            {value as number}
          </span>
          <span className="text-xs uppercase tracking-wider text-zinc-500">{label as string}</span>
        </div>
      ))}
    </div>
  );
}
