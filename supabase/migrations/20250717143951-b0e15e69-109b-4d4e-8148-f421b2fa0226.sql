
-- Criar tabela de usuários/responsáveis
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar enum para status das tarefas
CREATE TYPE task_status AS ENUM ('pendente', 'em progresso', 'concluída');

-- Criar tabela de tarefas
CREATE TABLE public.tasks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  assigned_to INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
  status task_status DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar validação para garantir que end_date >= start_date
CREATE OR REPLACE FUNCTION validate_task_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_date < NEW.start_date THEN
    RAISE EXCEPTION 'Data de término não pode ser anterior à data de início';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_task_dates_trigger
  BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION validate_task_dates();

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns usuários de exemplo
INSERT INTO public.users (name, email) VALUES 
  ('João Silva', 'joao@email.com'),
  ('Maria Santos', 'maria@email.com'),
  ('Pedro Oliveira', 'pedro@email.com'),
  ('Ana Costa', 'ana@email.com');

-- Inserir algumas tarefas de exemplo
INSERT INTO public.tasks (name, start_date, end_date, assigned_to, status) VALUES 
  ('Planejamento do Projeto', '2024-01-15', '2024-01-20', 1, 'concluída'),
  ('Desenvolvimento Frontend', '2024-01-21', '2024-02-05', 2, 'em progresso'),
  ('Testes e QA', '2024-02-06', '2024-02-15', 3, 'pendente'),
  ('Deploy e Produção', '2024-02-16', '2024-02-20', 4, 'pendente');

-- Habilitar Row Level Security (mesmo sendo público, é boa prática)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir acesso público (sem autenticação necessária)
CREATE POLICY "Permitir acesso público aos usuários" ON public.users FOR ALL USING (true);
CREATE POLICY "Permitir acesso público às tarefas" ON public.tasks FOR ALL USING (true);
