import React from "react";

interface UptimeBarProps {
  percent: number;
}

const UptimeBar: React.FC<UptimeBarProps> = ({ percent }) => {
  const safe = Math.max(0, Math.min(100, Math.round(percent)));

  const intensity = safe >= 90 ? "from-success to-success" : "from-destructive to-destructive";

  return (
    <div className="w-full" aria-label={`Uptime ${safe}%`}>
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${intensity}`}
          style={{ width: `${safe}%` }}
        />
      </div>
      
    </div>
  );
};

export default UptimeBar;
