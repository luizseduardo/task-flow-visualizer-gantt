
import React from 'react';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GanttTaskProps {
  task: Task;
  position: {
    left: number;
    width: number;
    duration: number;
  };
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const GanttTask: React.FC<GanttTaskProps> = ({
  task,
  position,
  isDragging,
  onMouseDown,
  onEdit,
  onDelete
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-gray-400 hover:bg-gray-500';
      case 'em progresso':
        return 'bg-blue-400 hover:bg-blue-500';
      case 'concluída':
        return 'bg-green-400 hover:bg-green-500';
      default:
        return 'bg-gray-400 hover:bg-gray-500';
    }
  };

  // ✅ MELHORIA: Cores mais sutis e modernas por responsável
  const getUserAccent = (userId?: number) => {
    if (!userId) return { bg: '', text: '' };
    
    const accents = [
      { bg: 'bg-blue-50', text: 'text-blue-900' },
      { bg: 'bg-green-50', text: 'text-green-900' }, 
      { bg: 'bg-purple-50', text: 'text-purple-900' },
      { bg: 'bg-orange-50', text: 'text-orange-900' },
      { bg: 'bg-pink-50', text: 'text-pink-900' },
      { bg: 'bg-indigo-50', text: 'text-indigo-900' },
      { bg: 'bg-red-50', text: 'text-red-900' },
      { bg: 'bg-yellow-50', text: 'text-yellow-900' }
    ];
    
    return accents[userId % accents.length];
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'em progresso':
        return 'Em Progresso';
      case 'concluída':
        return 'Concluída';
      default:
        return status;
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const userAccent = getUserAccent(task.assigned_to);

  return (
    <div
      className={cn(
        'absolute top-2 h-12 rounded cursor-move transition-all duration-200 group',
        getStatusColor(task.status),
        userAccent.bg,
        isDragging && 'opacity-70 scale-105 shadow-lg z-10'
      )}
      style={{
        left: position.left,
        width: Math.max(position.width, 120),
        zIndex: isDragging ? 10 : 1
      }}
      onMouseDown={onMouseDown}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-center justify-between h-full px-2 text-sm">
        <div className="flex-1 min-w-0">
          <div className={cn("font-medium truncate", userAccent.text || "text-white")}>
            {task.name}
          </div>
          <div className={cn("text-xs opacity-75", userAccent.text || "text-white")}>
            {getStatusText(task.status)} • {position.duration} dias úteis
          </div>
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-6 w-6 p-0 hover:bg-black/10",
              userAccent.text || "text-white hover:bg-white/20"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-6 w-6 p-0 hover:bg-black/10",
              userAccent.text || "text-white hover:bg-white/20"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
