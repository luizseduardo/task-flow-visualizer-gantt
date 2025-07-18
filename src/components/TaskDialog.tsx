
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Task, TaskFormData, User } from '@/types/task';
import { addWorkingDays, calculateWorkingDays, parseLocalDate, formatLocalDate } from '@/utils/workingDays';
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
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TaskFormData & { duration: number }>({
    defaultValues: {
      name: '',
      start_date: '',
      end_date: '',
      duration: 1,
      assigned_to: users[0]?.id || 1,
      status: 'pendente'
    }
  });

  const watchStartDate = watch('start_date');
  const watchDuration = watch('duration');
  const watchEndDate = watch('end_date');

  // Calcular data final baseada na data inicial e duração
  useEffect(() => {
    if (watchStartDate && watchDuration && watchDuration > 0) {
      console.log('🧮 Calculando data final:', { startDate: watchStartDate, duration: watchDuration });
      
      const startDate = parseLocalDate(watchStartDate);
      const endDate = addWorkingDays(startDate, watchDuration - 1);
      const formattedEndDate = formatLocalDate(endDate);
      
      console.log('🧮 Resultado:', { startDate, endDate, formattedEndDate });
      setValue('end_date', formattedEndDate);
    }
  }, [watchStartDate, watchDuration, setValue]);

  // Calcular duração baseada nas datas inicial e final
  useEffect(() => {
    if (watchStartDate && watchEndDate && !watchDuration) {
      const startDate = parseLocalDate(watchStartDate);
      const endDate = parseLocalDate(watchEndDate);
      const duration = calculateWorkingDays(startDate, endDate);
      setValue('duration', duration);
    }
  }, [watchStartDate, watchEndDate, watchDuration, setValue]);

  useEffect(() => {
    if (task) {
      const startDate = parseLocalDate(task.start_date);
      const endDate = parseLocalDate(task.end_date);
      const duration = calculateWorkingDays(startDate, endDate);
      
      reset({
        name: task.name,
        start_date: task.start_date,
        end_date: task.end_date,
        duration: duration,
        assigned_to: task.assigned_to,
        status: task.status
      });
    } else {
      reset({
        name: '',
        start_date: '',
        end_date: '',
        duration: 1,
        assigned_to: users[0]?.id || 1,
        status: 'pendente'
      });
    }
  }, [task, users, reset]);

  const onFormSubmit = async (data: TaskFormData & { duration: number }) => {
    try {
      console.log('📝 Submetendo tarefa:', data);
      const { duration, ...taskData } = data;
      await onSubmit(taskData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
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
              <Label htmlFor="duration">Duração (dias úteis)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                {...register('duration', { 
                  required: 'Duração é obrigatória',
                  min: { value: 1, message: 'Duração deve ser pelo menos 1 dia' }
                })}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">Data de Término (calculada automaticamente)</Label>
            <Input
              id="end_date"
              type="date"
              value={watch('end_date')}
              readOnly
              className="bg-gray-100"
            />
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
