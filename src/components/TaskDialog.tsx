
import React from 'react';
import { useForm } from 'react-hook-form';
import { Task, TaskFormData, User } from '@/types/task';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  task?: Task | null;
  users: User[];
  loading?: boolean;
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  users,
  loading = false
}) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TaskFormData>({
    defaultValues: task ? {
      name: task.name,
      start_date: task.start_date,
      end_date: task.end_date,
      assigned_to: task.assigned_to,
      status: task.status
    } : {
      name: '',
      start_date: '',
      end_date: '',
      assigned_to: 1,
      status: 'pendente'
    }
  });

  React.useEffect(() => {
    if (task) {
      reset({
        name: task.name,
        start_date: task.start_date,
        end_date: task.end_date,
        assigned_to: task.assigned_to,
        status: task.status
      });
    } else {
      reset({
        name: '',
        start_date: '',
        end_date: '',
        assigned_to: users[0]?.id || 1,
        status: 'pendente'
      });
    }
  }, [task, users, reset]);

  const onFormSubmit = async (data: TaskFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Tarefa</Label>
            <Input
              id="name"
              {...register('name', { required: 'Nome é obrigatório' })}
              placeholder="Digite o nome da tarefa"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de Início</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date', { required: 'Data de início é obrigatória' })}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500">{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Data de Término</Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date', { 
                  required: 'Data de término é obrigatória',
                  validate: (value) => {
                    const startDate = watch('start_date');
                    if (startDate && value && new Date(value) < new Date(startDate)) {
                      return 'Data de término deve ser posterior à data de início';
                    }
                    return true;
                  }
                })}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_to">Responsável</Label>
            <Select 
              value={watch('assigned_to')?.toString()} 
              onValueChange={(value) => setValue('assigned_to', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={watch('status')} 
              onValueChange={(value: 'pendente' | 'em progresso' | 'concluída') => setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em progresso">Em Progresso</SelectItem>
                <SelectItem value="concluída">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : task ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
