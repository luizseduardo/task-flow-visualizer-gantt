
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, User, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User as UserType } from '@/types/task';

interface GanttControlsProps {
  startDate: Date;
  endDate: Date;
  users: UserType[];
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  onAddUser: (userData: { name: string; email?: string }) => void;
  onRemoveUser: (userId: number) => void;
  onNewTask: () => void;
  customStartDate?: Date | null;
  customEndDate?: Date | null;
}

export const GanttControls: React.FC<GanttControlsProps> = ({
  startDate,
  endDate,
  users,
  onDateRangeChange,
  onAddUser,
  onRemoveUser,
  onNewTask,
  customStartDate,
  customEndDate
}) => {
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [tempStartDate, setTempStartDate] = useState((customStartDate || startDate).toISOString().split('T')[0]);
  const [tempEndDate, setTempEndDate] = useState((customEndDate || endDate).toISOString().split('T')[0]);

  const handleDateRangeUpdate = () => {
    const newStart = new Date(tempStartDate);
    const newEnd = new Date(tempEndDate);
    
    if (newStart <= newEnd) {
      onDateRangeChange(newStart, newEnd);
      setIsDateDialogOpen(false);
    }
  };

  const handleAddUser = () => {
    if (newUserName.trim()) {
      onAddUser({
        name: newUserName.trim(),
        email: newUserEmail.trim() || undefined
      });
      setNewUserName('');
      setNewUserEmail('');
      setIsUserDialogOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mb-4 p-4 bg-white rounded-lg shadow-sm border">
      <Button onClick={onNewTask} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Nova Tarefa
      </Button>

      <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Período do Gráfico
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir Período do Gráfico</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="start-date">Data de Início</Label>
              <Input
                id="start-date"
                type="date"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Data de Término</Label>
              <Input
                id="end-date"
                type="date"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                min={tempStartDate}
              />
            </div>
            <Button onClick={handleDateRangeUpdate} className="w-full">
              Atualizar Período
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Gerenciar Responsáveis
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Responsáveis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Nome do Responsável</Label>
              <Input
                id="user-name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Digite o nome..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email (opcional)</Label>
              <Input
                id="user-email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Digite o email..."
              />
            </div>
            <Button onClick={handleAddUser} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Responsável
            </Button>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Responsáveis Existentes</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      {user.email && <div className="text-sm text-gray-500">{user.email}</div>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveUser(user.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="text-sm text-gray-600 ml-auto">
        🗓️ {(customStartDate || startDate).toLocaleDateString('pt-BR')} - {(customEndDate || endDate).toLocaleDateString('pt-BR')}
      </div>
    </div>
  );
};
