
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users } from 'lucide-react';
import { GanttChart } from '@/components/GanttChart';
import { TaskDialog } from '@/components/TaskDialog';
import { useTasks } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import { Task, TaskFormData } from '@/types/task';

const Index = () => {
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask } = useTasks();
  const { users, loading: usersLoading } = useUsers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  console.log('Index component - tasks:', tasks, 'users:', users);

  const handleCreateTask = async (data: TaskFormData) => {
    console.log('Creating task:', data);
    await createTask(data);
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    if (editingTask) {
      console.log('Updating task:', editingTask.id, data);
      await updateTask(editingTask.id, data);
      setEditingTask(null);
    }
  };

  const handleTaskDrag = async (taskId: number, updates: { start_date: string; end_date: string }) => {
    console.log('Dragging task:', taskId, updates);
    await updateTask(taskId, updates);
  };

  const handleEditTask = (task: Task) => {
    console.log('Editing task:', task);
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      console.log('Deleting task:', taskId);
      await deleteTask(taskId);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  if (tasksLoading || usersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-8 w-8 text-primary" />
              Gráfico de Gantt
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas tarefas de forma visual e interativa
            </p>
          </div>
          
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium">Total de Tarefas</span>
            </div>
            <p className="text-2xl font-bold mt-1">{tasks.length}</p>
          </div>
          
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Em Progresso</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-blue-500">
              {tasks.filter(t => t.status === 'em progresso').length}
            </p>
          </div>
          
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-green-500 rounded-full"></div>
              <span className="font-medium">Concluídas</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-500">
              {tasks.filter(t => t.status === 'concluída').length}
            </p>
          </div>
        </div>

        {/* Gráfico de Gantt */}
        {tasks.length > 0 ? (
          <GanttChart
            tasks={tasks}
            onTaskUpdate={handleTaskDrag}
            onTaskEdit={handleEditTask}
            onTaskDelete={handleDeleteTask}
          />
        ) : (
          <div className="bg-card rounded-lg p-12 text-center border">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando sua primeira tarefa para visualizar o gráfico de Gantt
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Tarefa
            </Button>
          </div>
        )}

        {/* Dialog de criação/edição */}
        <TaskDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          task={editingTask}
          users={users}
        />
      </div>
    </div>
  );
};

export default Index;
