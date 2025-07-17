
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/task';
import { toast } from 'sonner';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: { name: string; email?: string }) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;
      
      setUsers(prev => [...prev, data]);
      toast.success('Responsável adicionado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao adicionar responsável');
      throw error;
    }
  };

  const deleteUser = async (id: number) => {
    try {
      // Verificar se o usuário tem tarefas associadas
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('assigned_to', id);

      if (tasksError) throw tasksError;

      if (tasksData && tasksData.length > 0) {
        toast.error('Não é possível excluir responsável com tarefas associadas');
        return;
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setUsers(prev => prev.filter(user => user.id !== id));
      toast.success('Responsável removido com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao remover responsável');
      throw error;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    createUser,
    deleteUser,
    refetch: fetchUsers
  };
};
