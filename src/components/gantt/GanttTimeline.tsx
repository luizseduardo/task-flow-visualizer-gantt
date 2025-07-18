
import React, { useState, useRef } from 'react';
import { Task } from '@/types/task';
import { GanttTask } from '../GanttTask';
import { calculateWorkingDays, addWorkingDays } from '@/utils/workingDays';
import { differenceInDays, eachDayOfInterval, isWeekend, format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GanttTimelineProps {
  tasks: Task[];
  startDate: Date;
  endDate: Date;
  dayWidth: number;
  groupedTasks: { [key: string]: Task[] };
  draggedTask: number | null;
  onTaskUpdate: (taskId: number, updates: { start_date: string; end_date: string; assigned_to?: number }) => void;
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
  const [dropTargetUser, setDropTargetUser] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.start_date + 'T00:00:00');
    const taskEnd = new Date(task.end_date + 'T00:00:00');
    const ganttStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    
    const daysFromStart = differenceInDays(taskStart, ganttStart);
    const totalDays = differenceInDays(taskEnd, taskStart) + 1;
    const workingDays = calculateWorkingDays(taskStart, taskEnd);
    
    return {
      left: Math.max(0, daysFromStart * dayWidth),
      width: Math.max(dayWidth, totalDays * dayWidth),
      duration: workingDays
    };
  };

  const handleDragOver = (e: React.DragEvent, userKey: string) => {
    e.preventDefault();
    setDropTargetUser(userKey);
  };

  const handleDragLeave = () => {
    setDropTargetUser(null);
  };

  const handleDrop = (e: React.DragEvent, userKey: string) => {
    e.preventDefault();
    setDropTargetUser(null);
    
    if (!draggedTask) return;

    const task = tasks.find(t => t.id === draggedTask);
    if (!task) return;

    // Encontrar o novo responsável baseado na userKey
    const user = Object.values(groupedTasks).flat().find(t => t.user?.name === userKey)?.user;
    const newUserId = user?.id || Object.keys(groupedTasks).indexOf(userKey) + 1;
    
    // Calcular nova posição baseada no drop
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const dayIndex = Math.round(x / dayWidth);
    const ganttStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const newStartDate = addDays(ganttStart, dayIndex);
    
    // Calcular nova data final baseada na duração da tarefa
    const originalStart = new Date(task.start_date + 'T00:00:00');
    const originalEnd = new Date(task.end_date + 'T00:00:00');
    const originalDuration = calculateWorkingDays(originalStart, originalEnd);
    const newEndDate = addWorkingDays(newStartDate, originalDuration - 1);

    console.log('🖱️ Drop da tarefa:', {
      taskId: draggedTask,
      userKey,
      newUserId,
      originalDuration,
      newStartDate: format(newStartDate, 'yyyy-MM-dd'),
      newEndDate: format(newEndDate, 'yyyy-MM-dd')
    });

    onTaskUpdate(draggedTask, {
      start_date: format(newStartDate, 'yyyy-MM-dd'),
      end_date: format(newEndDate, 'yyyy-MM-dd'),
      assigned_to: newUserId
    });
  };

  return (
    <div ref={timelineRef} className="gantt-timeline" style={{ width: dateRange.length * dayWidth }}>
      {Object.keys(groupedTasks).map(userKey => (
        <div 
          key={userKey} 
          className={`border-b transition-colors duration-200 ${
            dropTargetUser === userKey ? 'bg-blue-50' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, userKey)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, userKey)}
        >
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
