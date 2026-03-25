"use client";

import { motion } from "framer-motion";

interface ScoreBreakdown {
  hard_conditions?: number;
  skill_match?: number;
  industry_exp?: number;
  potential?: number;
}

interface CandidateRadarChartProps {
  scoreBreakdown?: ScoreBreakdown;
  candidateName: string;
}

export default function CandidateRadarChart({
  scoreBreakdown,
  candidateName,
}: CandidateRadarChartProps) {
  // 默认数据（如果没有score_breakdown）
  const data = [
    { label: "硬性条件", value: scoreBreakdown?.hard_conditions ?? 75, color: "#06B6D4" },
    { label: "技能匹配", value: scoreBreakdown?.skill_match ?? 80, color: "#10B981" },
    { label: "行业经验", value: scoreBreakdown?.industry_exp ?? 70, color: "#F59E0B" },
    { label: "发展潜力", value: scoreBreakdown?.potential ?? 85, color: "#8B5CF6" },
  ];

  const size = 200;
  const center = size / 2;
  const radius = 70;
  const levels = 5;

  // 计算多边形顶点
  const getPoint = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const distance = (value / 100) * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  };

  // 生成多边形点字符串
  const polygonPoints = data
    .map((d, i) => {
      const point = getPoint(d.value, i, data.length);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  // 生成背景网格多边形
  const gridPolygons = Array.from({ length: levels }, (_, i) => {
    const levelRadius = (radius * (i + 1)) / levels;
    return Array.from({ length: data.length }, (_, j) => {
      const angle = (Math.PI * 2 * j) / data.length - Math.PI / 2;
      return `${center + levelRadius * Math.cos(angle)},${center + levelRadius * Math.sin(angle)}`;
    }).join(" ");
  });

  return (
    <div className="bg-[#111827] rounded-xl p-4 border border-gray-700">
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        竞争力雷达图
      </h4>
      <div className="flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* 背景网格 */}
          {gridPolygons.map((points, i) => (
            <polygon
              key={i}
              points={points}
              fill="none"
              stroke="#374151"
              strokeWidth="1"
              opacity={0.5}
            />
          ))}

          {/* 轴线 */}
          {data.map((_, i) => {
            const point = getPoint(100, i, data.length);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={point.x}
                y2={point.y}
                stroke="#374151"
                strokeWidth="1"
                opacity={0.5}
              />
            );
          })}

          {/* 数据多边形 */}
          <motion.polygon
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            points={polygonPoints}
            fill="rgba(6, 182, 212, 0.2)"
            stroke="#06B6D4"
            strokeWidth="2"
          />

          {/* 数据点 */}
          {data.map((d, i) => {
            const point = getPoint(d.value, i, data.length);
            return (
              <motion.circle
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={d.color}
                stroke="#111827"
                strokeWidth="2"
              />
            );
          })}

          {/* 标签 */}
          {data.map((d, i) => {
            const point = getPoint(100, i, data.length);
            const labelRadius = radius + 20;
            const labelX = center + labelRadius * Math.cos((Math.PI * 2 * i) / data.length - Math.PI / 2);
            const labelY = center + labelRadius * Math.sin((Math.PI * 2 * i) / data.length - Math.PI / 2);

            let textAnchor: "start" | "middle" | "end" = "middle";
            if (labelX < center - 10) textAnchor = "end";
            else if (labelX > center + 10) textAnchor = "start";

            return (
              <text
                key={i}
                x={labelX}
                y={labelY}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                fill="#9CA3AF"
                fontSize="11"
              >
                {d.label}
              </text>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-3">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-gray-400">
              {d.label}: {d.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
