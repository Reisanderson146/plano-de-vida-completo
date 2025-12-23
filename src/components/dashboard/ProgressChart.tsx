import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { LIFE_AREAS, LifeArea, AREA_HEX_COLORS } from '@/lib/constants';

interface ProgressChartProps {
  data: Record<LifeArea, { total: number; completed: number }>;
}

// Helper to lighten a hex color
const lightenColor = (hex: string | undefined, percent: number): string => {
  if (!hex) return '#888888';
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
};

export function ProgressChart({ data }: ProgressChartProps) {
  const chartData = LIFE_AREAS.map((area) => {
    const areaData = data[area.id];
    const percentage = areaData.total > 0 
      ? Math.round((areaData.completed / areaData.total) * 100) 
      : 0;
    
    return {
      area: area.label,
      areaId: area.id,
      value: percentage,
      total: areaData.total,
      completed: areaData.completed,
      fullMark: 100,
      color: AREA_HEX_COLORS[area.id],
    };
  });

  // Custom tick component with colored labels
  const CustomTick = ({ payload, x, y, textAnchor, ...props }: any) => {
    const areaData = chartData.find(d => d.area === payload.value);
    const color = areaData?.color || 'hsl(var(--foreground))';
    
    return (
      <text
        {...props}
        x={x}
        y={y}
        textAnchor={textAnchor}
        fill={color}
        fontSize={11}
        fontWeight={600}
      >
        {payload.value}
      </text>
    );
  };

  // Custom tooltip with area details
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const item = payload[0].payload;
    
    return (
      <div 
        className="px-3 py-2 rounded-lg shadow-lg border"
        style={{
          backgroundColor: 'hsl(var(--card))',
          borderColor: item.color,
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ 
              background: `linear-gradient(135deg, ${lightenColor(item.color, 30)} 0%, ${item.color} 100%)` 
            }}
          />
          <span className="font-semibold text-sm text-foreground">{item.area}</span>
        </div>
        <div className="space-y-0.5 text-xs">
          <p className="text-muted-foreground">
            Progresso: <span className="font-medium text-foreground">{item.value}%</span>
          </p>
          <p className="text-muted-foreground">
            Metas: <span className="font-medium text-foreground">{item.completed}/{item.total}</span>
          </p>
        </div>
      </div>
    );
  };

  // Custom dot component for radar points with gradient
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload || !payload.color) return null;
    
    const gradientId = `dotGradient-${payload.areaId}`;
    const lightColor = lightenColor(payload.color, 40);
    
    return (
      <g>
        <defs>
          <radialGradient id={gradientId} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor={lightColor} />
            <stop offset="100%" stopColor={payload.color} />
          </radialGradient>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill={`url(#${gradientId})`}
          stroke="hsl(var(--background))"
          strokeWidth={2}
          className="cursor-pointer"
          style={{
            filter: `drop-shadow(0 2px 6px ${payload.color}50)`,
          }}
        />
      </g>
    );
  };

  // Active dot on hover with gradient
  const ActiveDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload || !payload.color) return null;
    
    const gradientId = `activeDotGradient-${payload.areaId}`;
    const lightColor = lightenColor(payload.color, 50);
    
    return (
      <g>
        <defs>
          <radialGradient id={gradientId} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor={lightColor} />
            <stop offset="100%" stopColor={payload.color} />
          </radialGradient>
        </defs>
        {/* Outer glow ring */}
        <circle
          cx={cx}
          cy={cy}
          r={14}
          fill={payload.color}
          fillOpacity={0.15}
          className="animate-pulse-soft"
        />
        {/* Middle glow */}
        <circle
          cx={cx}
          cy={cy}
          r={10}
          fill={payload.color}
          fillOpacity={0.25}
        />
        {/* Main dot with gradient */}
        <circle
          cx={cx}
          cy={cy}
          r={7}
          fill={`url(#${gradientId})`}
          stroke="hsl(var(--background))"
          strokeWidth={2}
          style={{
            filter: `drop-shadow(0 3px 10px ${payload.color}80)`,
          }}
        />
        {/* Shine effect */}
        <circle
          cx={cx - 2}
          cy={cy - 2}
          r={2}
          fill="white"
          fillOpacity={0.6}
        />
      </g>
    );
  };

  return (
    <div className="w-full">
      <div className="w-full h-[250px] sm:h-[320px] lg:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="60%" data={chartData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="area" 
              tick={<CustomTick />}
              tickLine={false}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 8 }}
              tickCount={5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Progresso"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={<ActiveDot />}
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend with area colors and gradients */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-2 px-2">
        {LIFE_AREAS.map((area) => (
          <div key={area.id} className="flex items-center gap-1.5">
            <div 
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ 
                background: `linear-gradient(135deg, ${lightenColor(AREA_HEX_COLORS[area.id], 30)} 0%, ${AREA_HEX_COLORS[area.id]} 100%)`,
                boxShadow: `0 1px 3px ${AREA_HEX_COLORS[area.id]}40`
              }}
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">{area.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}