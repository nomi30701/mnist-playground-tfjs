import React from "react";

const MetricCard = ({ label, value, valueClass, subtext }) => {
  return (
    <div className="metric-card-compact">
      <div className="metric-label-compact">{label}</div>
      <div className={`metric-value-compact ${valueClass || ""}`}>{value}</div>
      {subtext && <div className="small text-muted">{subtext}</div>}
    </div>
  );
};

export default MetricCard;
