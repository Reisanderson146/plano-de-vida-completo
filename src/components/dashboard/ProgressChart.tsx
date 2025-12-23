import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';
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

  return (
    <div className="w-full h-[250px] sm:h-[350px] lg:h-[400px] pb-2">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
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
          <Tooltip 
            formatter={(value: number, name: string) => [`${value}%`, 'Progresso']}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
          />
          <Radar
            name="Progresso"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Legend with area colors */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4 sm:mt-6 px-2">
        {LIFE_AREAS.map((area) => (
          <div key={area.id} className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: AREA_HEX_COLORS[area.id] }}
            />
            <span className="text-xs text-muted-foreground">{area.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
