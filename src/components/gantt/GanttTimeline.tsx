
import React from 'react';
import { Task } from '@/types/task';
import { GanttTask } from '../GanttTask';
import { differenceInDays, eachDayOfInterval, isWeekend, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GanttTimelineProps {
  tasks: Task[];
  startDate: Date;
  endDate: Date;
  dayWidth: number;
  groupedTasks: { [key: string]: Task[] };
  draggedTask: number | null;
  onTaskUpdate: (taskId: number, updates: { start_date: string; end_date: string }) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
  onMouseDown: (e: React.MouseEvent, taskId: number) => void;
}

export const GanttTimeline: React.FC<GanttTimelineProps> = ({
  tasks,
  startDate,
  endDate,
  dayWidth,
  groupedTasks,
  draggedTask,
  onTaskUpdate,
  onTaskEdit,
  onTaskDelete,
  onMouseDown
}) => {
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.end_date);
    const daysFromStart = differenceInDays(taskStart, startDate);
    
    // Calcular duração excluindo fins de semana
    const taskDays = eachDayOfInterval({ start: taskStart, end: taskEnd });
    const workingDays = taskDays.filter(day => !isWeekend(day));
    const totalDays = differenceInDays(taskEnd, taskStart) + 1;
    
    return {
      left: daysFromStart * dayWidth,
      width: totalDays * dayWidth,
      duration: workingDays.length // Duração real sem fins de semana
    };
  };

  return (
    <div className="gantt-timeline" style={{ width: dateRange.length * dayWidth }}>
      {Object.keys(groupedTasks).map(userKey => (
        <div key={userKey} className="border-b">
          {/* Header do usuário */}
          <div className="h-12 bg-gray-50 border-b flex items-center relative">
            {dateRange.map((date, index) => {
              const isWeekStart = index === 0 || format(date, 'E', { locale: ptBR }) === 'seg';
              const isWeekendDay = isWeekend(date);
              
              return (
                <div
                  key={date.toISOString()}
                  className={`h-full ${
                    isWeekendDay ? 'bg-gray-200' : 'bg-gray-50'
                  } ${isWeekStart && index > 0 ? 'border-l-2 border-gray-400' : 'border-r border-gray-200'}`}
                  style={{ width: dayWidth, minWidth: dayWidth }}
                />
              );
            })}
          </div>
          
          {/* Tarefas do usuário */}
          {groupedTasks[userKey].map((task) => {
            const position = getTaskPosition(task);
            return (
              <div key={task.id} className="relative h-16 border-b border-gray-100">
                {/* Grid de fundo */}
                {dateRange.map((date, index) => {
                  const isWeekStart = index === 0 || format(date, 'E', { locale: ptBR }) === 'seg';
                  const isWeekendDay = isWeekend(date);
                  
                  return (
                    <div
                      key={date.toISOString()}
                      className={`absolute top-0 h-full ${
                        isWeekendDay ? 'bg-gray-100' : 'bg-white'
                      } ${isWeekStart && index > 0 ? 'border-l-2 border-gray-400' : 'border-r border-gray-100'}`}
                      style={{ 
                        left: differenceInDays(date, startDate) * dayWidth,
                        width: dayWidth 
                      }}
                    />
                  );
                })}
                
                {/* Barra da tarefa */}
                <GanttTask
                  task={task}
                  position={position}
                  isDragging={draggedTask === task.id}
                  onMouseDown={(e) => onMouseDown(e, task.id)}
                  onEdit={() => onTaskEdit(task)}
                  onDelete={() => onTaskDelete(task.id)}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
