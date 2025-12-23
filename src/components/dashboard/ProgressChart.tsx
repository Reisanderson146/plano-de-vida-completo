import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { LIFE_AREAS, LifeArea, AREA_HEX_COLORS } from '@/lib/constants';

interface ProgressChartProps {
  data: Record<LifeArea, { total: number; completed: number }>;
}

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
            style={{ backgroundColor: item.color }}
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

  // Custom dot component for radar points
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={payload.color}
        stroke="hsl(var(--background))"
        strokeWidth={2}
        className="cursor-pointer transition-all duration-200 hover:r-7"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        }}
      />
    );
  };

  // Active dot on hover
  const ActiveDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={10}
          fill={payload.color}
          fillOpacity={0.2}
          className="animate-pulse-soft"
        />
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill={payload.color}
          stroke="hsl(var(--background))"
          strokeWidth={2}
          style={{
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
          }}
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
      
      {/* Legend with area colors */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-2 px-2">
        {LIFE_AREAS.map((area) => (
          <div key={area.id} className="flex items-center gap-1.5">
            <div 
              className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
              style={{ backgroundColor: AREA_HEX_COLORS[area.id] }}
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">{area.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}