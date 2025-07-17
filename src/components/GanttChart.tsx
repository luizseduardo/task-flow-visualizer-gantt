
import React, { useState, useMemo, useCallback } from 'react';
import { Task } from '@/types/task';
import { GanttDateHeader } from './gantt/GanttDateHeader';
import { GanttTimeline } from './gantt/GanttTimeline';
import { GanttControls } from './gantt/GanttControls';
import { format, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, addDays, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User } from '@/types/task';

interface GanttChartProps {
  tasks: Task[];
  users: User[];
  onTaskUpdate: (taskId: number, updates: { start_date: string; end_date: string }) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
  onNewTask: () => void;
  onAddUser: (userData: { name: string; email?: string }) => void;
  onRemoveUser: (userId: number) => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  users,
  onTaskUpdate,
  onTaskEdit,
  onTaskDelete,
  onNewTask,
  onAddUser,
  onRemoveUser
}) => {
  const [draggedTask, setDraggedTask] = useState<number | null>(null);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  const { startDate, endDate, dateRange, dayWidth } = useMemo(() => {
    let start: Date;
    let end: Date;

    if (customStartDate && customEndDate) {
      start = startOfWeek(customStartDate, { locale: ptBR });
      end = endOfWeek(customEndDate, { locale: ptBR });
    } else if (tasks.length === 0) {
      const today = new Date();
      start = startOfWeek(today, { locale: ptBR });
      end = endOfWeek(addMonths(today, 3), { locale: ptBR });
    } else {
      const dates = tasks.flatMap(task => [new Date(task.start_date), new Date(task.end_date)]);
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      
      start = startOfWeek(addDays(minDate, -7), { locale: ptBR });
      end = endOfWeek(addDays(maxDate, 7), { locale: ptBR });
    }

    const range = eachDayOfInterval({ start, end });
    
    return {
      startDate: start,
      endDate: end,
      dateRange: range,
      dayWidth: Math.max(35, Math.min(60, 1400 / range.length))
    };
  }, [tasks, customStartDate, customEndDate]);

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

  const handleTaskDrag = useCallback((taskId: number, newStartDate: Date) => {
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
  }, [tasks, onTaskUpdate]);

  const handleMouseDown = useCallback((e: React.MouseEvent, taskId: number) => {
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
  }, [draggedTask, dayWidth, startDate, handleTaskDrag]);

  const handleDateRangeChange = (newStartDate: Date, newEndDate: Date) => {
    setCustomStartDate(newStartDate);
    setCustomEndDate(newEndDate);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <GanttControls
        startDate={startDate}
        endDate={endDate}
        users={users}
        onDateRangeChange={handleDateRangeChange}
        onAddUser={onAddUser}
        onRemoveUser={onRemoveUser}
        onNewTask={onNewTask}
      />
      
      <div className="flex">
        {/* Header de usuários */}
        <div className="w-64 bg-gray-50 border-r">
          <div className="p-4 border-b bg-gray-100" style={{ height: '100px' }}>
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
          <GanttDateHeader
            startDate={startDate}
            endDate={endDate}
            dayWidth={dayWidth}
          />
          
          <GanttTimeline
            tasks={tasks}
            startDate={startDate}
            endDate={endDate}
            dayWidth={dayWidth}
            groupedTasks={groupedTasks}
            draggedTask={draggedTask}
            onTaskUpdate={onTaskUpdate}
            onTaskEdit={onTaskEdit}
            onTaskDelete={onTaskDelete}
            onMouseDown={handleMouseDown}
          />
        </div>
      </div>
    </div>
  );
};
