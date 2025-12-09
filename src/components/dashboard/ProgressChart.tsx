import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { LIFE_AREAS, LifeArea } from '@/lib/constants';

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
      value: percentage,
      fullMark: 100,
    };
  });

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis 
            dataKey="area" 
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          <Radar
            name="Progresso"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.4}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
