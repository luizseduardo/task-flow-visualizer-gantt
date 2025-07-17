
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskFormData } from '@/types/task';
import { toast } from 'sonner';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          user:users(id, name, email)
        `)
        .order('start_date', { ascending: true });

      if (error) throw error;
      
      const tasksWithUser = data?.map(task => ({
        ...task,
        user: task.user
      })) || [];
      
      setTasks(tasksWithUser);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: TaskFormData) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select(`
          *,
          user:users(id, name, email)
        `)
        .single();

      if (error) throw error;
      
      const newTask = {
        ...data,
        user: data.user
      };
      
      setTasks(prev => [...prev, newTask]);
      toast.success('Tarefa criada com sucesso!');
      return newTask;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
      throw error;
    }
  };

  const updateTask = async (id: number, updates: Partial<TaskFormData>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          user:users(id, name, email)
        `)
        .single();

      if (error) throw error;
      
      const updatedTask = {
        ...data,
        user: data.user
      };
      
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
      toast.success('Tarefa atualizada com sucesso!');
      return updatedTask;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
      throw error;
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Tarefa excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast.error('Erro ao excluir tarefa');
      throw error;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks
  };
};
