
import React from 'react';
import { format, eachWeekOfInterval, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GanttDateHeaderProps {
  startDate: Date;
  endDate: Date;
  dayWidth: number;
}

export const GanttDateHeader: React.FC<GanttDateHeaderProps> = ({
  startDate,
  endDate,
  dayWidth
}) => {
  const weeks = eachWeekOfInterval(
    { start: startDate, end: endDate },
    { locale: ptBR }
  );

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Agrupar dias por mês para mostrar o cabeçalho de mês
  const monthGroups = allDays.reduce((groups, day) => {
    const monthKey = format(day, 'yyyy-MM');
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(day);
    return groups;
  }, {} as Record<string, Date[]>);

  return (
    <div className="border-b bg-gray-50">
      {/* Cabeçalho de meses */}
      <div className="flex border-b bg-gray-100" style={{ height: '40px' }}>
        {Object.entries(monthGroups).map(([monthKey, days]) => (
          <div
            key={monthKey}
            className="border-r border-gray-300 text-sm font-semibold text-center flex items-center justify-center"
            style={{ width: days.length * dayWidth, minWidth: days.length * dayWidth }}
          >
            {format(days[0], 'MMMM yyyy', { locale: ptBR })}
          </div>
        ))}
      </div>

      {/* Cabeçalho de dias da semana e dias */}
      <div className="flex" style={{ height: '60px' }}>
        {allDays.map((date, index) => {
          const isWeekStart = index === 0 || format(date, 'E', { locale: ptBR }) === 'seg';
          const isWeekendDay = isWeekend(date);
          
          return (
            <div
              key={date.toISOString()}
              className={`border-r text-xs text-center p-1 flex flex-col justify-center relative ${
                isWeekendDay ? 'bg-gray-200' : 'bg-white'
              } ${isWeekStart && index > 0 ? 'border-l-2 border-gray-400' : 'border-gray-200'}`}
              style={{ width: dayWidth, minWidth: dayWidth }}
            >
              <div className="font-medium text-gray-700">
                {format(date, 'dd')}
              </div>
              <div className={`text-xs ${isWeekendDay ? 'text-gray-600' : 'text-gray-500'}`}>
                {format(date, 'EEEEE', { locale: ptBR }).toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
