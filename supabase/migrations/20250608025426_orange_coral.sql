/*
  # Adicionar campo de quantidade na tabela sales

  1. Alterações
    - Adicionar coluna `quantity` na tabela `sales`
    - Definir valor padrão como 1
    - Atualizar registros existentes

  2. Segurança
    - Manter todas as políticas RLS existentes
*/

-- Adicionar coluna quantity na tabela sales
ALTER TABLE sales ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1 NOT NULL;

-- Atualizar registros existentes para ter quantidade 1
UPDATE sales SET quantity = 1 WHERE quantity IS NULL;

-- Adicionar comentário na coluna
COMMENT ON COLUMN sales.quantity IS 'Quantidade de itens vendidos';