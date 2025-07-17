
export interface User {
  id: number;
  name: string;
  email?: string;
  created_at?: string;
}

export interface Task {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  duration?: number; // duração em dias úteis
  assigned_to: number;
  status: 'pendente' | 'em progresso' | 'concluída';
  created_at?: string;
  updated_at?: string;
  user?: User;
}

export interface TaskFormData {
  name: string;
  start_date: string;
  end_date: string;
  duration?: number;
  assigned_to: number;
  status: 'pendente' | 'em progresso' | 'concluída';
}
