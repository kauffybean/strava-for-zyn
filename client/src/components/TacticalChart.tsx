import React from 'react';

type TacticalChartProps = {
  data: number[];
};

const TacticalChart: React.FC<TacticalChartProps> = ({ data }) => {
  // Ensure data has 7 values (one for each day of the week)
  const chartData = data.length === 7 ? data : Array(7).fill(0);
  
  // Find the maximum value for scaling
  const maxValue = Math.max(...chartData, 1);
  
  // Days of the week (short military style)
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  return (
    <div className="w-full bg-card rounded-ios p-3 border border-border/70">
      <div className="flex items-end justify-between h-32 mb-2 relative">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="border-t border-border/30 w-full"
              style={{ height: '25%' }}
            />
          ))}
        </div>
        
        {/* Bars */}
        {chartData.map((value, index) => {
          const height = value === 0 ? 5 : (value / maxValue) * 100;
          
          return (
            <div 
              key={index} 
              className="relative flex flex-col items-center px-1 z-10"
              style={{ width: `${100 / 7}%` }}
            >
              <div 
                className={`w-full rounded-t ${value > 0 ? 'bg-accent' : 'bg-border/40'}`}
                style={{ 
                  height: `${height}%`,
                  minHeight: '4px',
                }}
              />
              
              {/* Value label */}
              {value > 0 && (
                <div className="absolute -top-5 text-xs font-medium">
                  {value}
                </div>
              )}
              
              {/* Day label */}
              <div className="text-xs font-mono mt-1 text-muted">
                {days[index]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TacticalChart;