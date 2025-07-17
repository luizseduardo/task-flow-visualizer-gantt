
import React, { useState, useMemo } from 'react';
import { Task } from '@/types/task';
import { GanttTask } from './GanttTask';
import { format, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GanttChartProps {
  tasks: Task[];
  onTaskUpdate: (taskId: number, updates: { start_date: string; end_date: string }) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  onTaskUpdate,
  onTaskEdit,
  onTaskDelete
}) => {
  const [draggedTask, setDraggedTask] = useState<number | null>(null);

  const { startDate, endDate, dateRange, dayWidth } = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date();
      const start = startOfWeek(today, { locale: ptBR });
      const end = endOfWeek(addDays(today, 30), { locale: ptBR });
      return {
        startDate: start,
        endDate: end,
        dateRange: eachDayOfInterval({ start, end }),
        dayWidth: 40
      };
    }

    const dates = tasks.flatMap(task => [new Date(task.start_date), new Date(task.end_date)]);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const start = startOfWeek(addDays(minDate, -7), { locale: ptBR });
    const end = endOfWeek(addDays(maxDate, 7), { locale: ptBR });
    const range = eachDayOfInterval({ start, end });
    
    return {
      startDate: start,
      endDate: end,
      dateRange: range,
      dayWidth: Math.max(30, Math.min(60, 1200 / range.length))
    };
  }, [tasks]);

  const groupedTasks = useMemo(() => {
    const groups: { [key: string]: Task[] } = {};
    tasks.forEach(task => {
      const userKey = task.user?.name || `Usuário ${task.assigned_to}`;
      if (!groups[userKey]) {
        groups[userKey] = [];
      }
      groups[userKey].push(task);
    });
    return groups;
  }, [tasks]);

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.end_date);
    const daysFromStart = differenceInDays(taskStart, startDate);
    const duration = differenceInDays(taskEnd, taskStart) + 1;
    
    return {
      left: daysFromStart * dayWidth,
      width: duration * dayWidth,
      duration
    };
  };

  const handleTaskDrag = (taskId: number, newStartDate: Date) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const originalStart = new Date(task.start_date);
    const originalEnd = new Date(task.end_date);
    const duration = differenceInDays(originalEnd, originalStart);
    const newEndDate = addDays(newStartDate, duration);

    onTaskUpdate(taskId, {
      start_date: format(newStartDate, 'yyyy-MM-dd'),
      end_date: format(newEndDate, 'yyyy-MM-dd')
    });
  };

  const handleMouseDown = (e: React.MouseEvent, taskId: number) => {
    e.preventDefault();
    setDraggedTask(taskId);

    const handleMouseMove = (e: MouseEvent) => {
      if (draggedTask === null) return;
      
      const rect = (e.target as HTMLElement).closest('.gantt-timeline')?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const dayIndex = Math.round(x / dayWidth);
      const newStartDate = addDays(startDate, dayIndex);
      
      handleTaskDrag(taskId, newStartDate);
    };

    const handleMouseUp = () => {
      setDraggedTask(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex">
        {/* Header de usuários */}
        <div className="w-64 bg-gray-50 border-r">
          <div className="p-4 border-b bg-gray-100">
            <h3 className="font-semibold text-gray-700">Responsáveis</h3>
          </div>
          {Object.keys(groupedTasks).map(userKey => (
            <div key={userKey} className="border-b">
              <div className="p-4 bg-gray-50">
                <h4 className="font-medium text-gray-800">{userKey}</h4>
              </div>
              {groupedTasks[userKey].map(task => (
                <div key={task.id} className="p-2 pl-6 bg-white border-b border-gray-100">
                  <div className="text-sm text-gray-600">{task.name}</div>
                  <div className="text-xs text-gray-400">
                    {format(new Date(task.start_date), 'dd/MM', { locale: ptBR })} - {format(new Date(task.end_date), 'dd/MM', { locale: ptBR })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-x-auto">
          <div className="gantt-timeline" style={{ width: dateRange.length * dayWidth }}>
            {/* Header de datas */}
            <div className="flex border-b bg-gray-100" style={{ height: '60px' }}>
              {dateRange.map(date => (
                <div
                  key={date.toISOString()}
                  className="border-r border-gray-200 text-xs text-center p-2 flex flex-col justify-center"
                  style={{ width: dayWidth, minWidth: dayWidth }}
                >
                  <div className="font-medium">{format(date, 'dd')}</div>
                  <div className="text-gray-500">{format(date, 'EEE', { locale: ptBR })}</div>
                </div>
              ))}
            </div>

            {/* Timeline das tarefas */}
            {Object.keys(groupedTasks).map(userKey => (
              <div key={userKey} className="border-b">
                {/* Header do usuário */}
                <div className="h-12 bg-gray-50 border-b flex items-center relative">
                  {dateRange.map(date => (
                    <div
                      key={date.toISOString()}
                      className="border-r border-gray-200 h-full"
                      style={{ width: dayWidth, minWidth: dayWidth }}
                    />
                  ))}
                </div>
                
                {/* Tarefas do usuário */}
                {groupedTasks[userKey].map((task, index) => {
                  const position = getTaskPosition(task);
                  return (
                    <div key={task.id} className="relative h-16 border-b border-gray-100">
                      {/* Grid de fundo */}
                      {dateRange.map(date => (
                        <div
                          key={date.toISOString()}
                          className="absolute top-0 h-full border-r border-gray-100"
                          style={{ 
                            left: differenceInDays(date, startDate) * dayWidth,
                            width: dayWidth 
                          }}
                        />
                      ))}
                      
                      {/* Barra da tarefa */}
                      <GanttTask
                        task={task}
                        position={position}
                        isDragging={draggedTask === task.id}
                        onMouseDown={(e) => handleMouseDown(e, task.id)}
                        onEdit={() => onTaskEdit(task)}
                        onDelete={() => onTaskDelete(task.id)}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
