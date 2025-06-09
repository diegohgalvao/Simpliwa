/*
  # Populando dados de exemplo para demonstração

  1. Empresas de exemplo
    - Diferentes segmentos e tamanhos
    - Variação de planos e status
    - Dados realistas de receita e funcionários

  2. Usuários e perfis
    - Admins para cada empresa
    - Usuários regulares
    - Estrutura de permissões

  3. Dados operacionais
    - Clientes, vendas, mensagens
    - Relacionamentos corretos
    - Dados para análises
*/

-- Inserir empresas de exemplo
INSERT INTO companies (id, name, segment, plan, monthly_revenue, employees, status, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Boutique Elegance', 'Moda e Vestuário', 'professional', 45680, 8, 'active', '2024-01-05 10:00:00+00', now()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Santos Construções', 'Construção Civil', 'enterprise', 125000, 25, 'active', '2024-01-08 14:30:00+00', now()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Beauty Center', 'Beleza e Estética', 'professional', 32500, 12, 'active', '2024-01-10 09:15:00+00', now()),
  ('550e8400-e29b-41d4-a716-446655440004', 'TechFix Assistência', 'Assistência Técnica', 'starter', 18900, 5, 'active', '2024-01-12 16:45:00+00', now()),
  ('550e8400-e29b-41d4-a716-446655440005', 'Padaria Delícia', 'Alimentação', 'starter', 22300, 6, 'trial', '2024-01-14 08:20:00+00', now()),
  ('550e8400-e29b-41d4-a716-446655440006', 'Auto Center Lima', 'Automotivo', 'professional', 67890, 15, 'active', '2024-01-16 11:30:00+00', now()),
  ('550e8400-e29b-41d4-a716-446655440007', 'Clínica Vida Saudável', 'Saúde', 'enterprise', 89500, 20, 'active', '2024-01-18 13:45:00+00', now()),
  ('550e8400-e29b-41d4-a716-446655440008', 'Escola Futuro Brilhante', 'Educação', 'professional', 54200, 18, 'active', '2024-01-20 15:20:00+00', now()),
  ('550e8400-e29b-41d4-a716-446655440009', 'Restaurante Sabor & Arte', 'Alimentação', 'starter', 28700, 9, 'trial', '2024-01-22 12:10:00+00', now()),
  ('550e8400-e29b-41d4-a716-446655440010', 'Imobiliária Prime', 'Imobiliário', 'enterprise', 156000, 30, 'active', '2024-01-25 10:45:00+00', now())
ON CONFLICT (id) DO NOTHING;

-- Inserir clientes de exemplo
INSERT INTO customers (id, company_id, name, email, phone, total_purchases, last_purchase_date, status, created_at, updated_at) VALUES
  -- Clientes da Boutique Elegance
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Maria Oliveira', 'maria.oliveira@email.com', '+55 11 99999-1234', 3450.00, '2024-01-15', 'active', '2024-01-05', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Ana Costa', 'ana.costa@email.com', '+55 11 98888-5678', 2340.00, '2024-01-10', 'active', '2024-01-06', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'Carla Santos', 'carla.santos@email.com', '+55 11 97777-9012', 1890.00, '2024-01-12', 'active', '2024-01-07', now()),
  
  -- Clientes da Santos Construções
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'João Silva', 'joao.silva@email.com', '+55 11 96666-3456', 45000.00, '2024-01-14', 'active', '2024-01-08', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Roberto Lima', 'roberto.lima@email.com', '+55 11 95555-7890', 32000.00, '2024-01-13', 'active', '2024-01-09', now()),
  
  -- Clientes do Beauty Center
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Lucia Ferreira', 'lucia.ferreira@email.com', '+55 11 94444-1234', 1250.00, '2024-01-15', 'active', '2024-01-10', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'Patricia Souza', 'patricia.souza@email.com', '+55 11 93333-5678', 890.00, '2024-01-11', 'active', '2024-01-11', now()),
  
  -- Clientes do TechFix
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'Carlos Mendes', 'carlos.mendes@email.com', '+55 11 92222-9012', 450.00, '2024-01-14', 'active', '2024-01-12', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'Fernando Alves', 'fernando.alves@email.com', '+55 11 91111-3456', 320.00, '2024-01-13', 'active', '2024-01-13', now()),
  
  -- Clientes da Padaria Delícia
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', 'Sandra Rocha', 'sandra.rocha@email.com', '+55 11 90000-7890', 180.00, '2024-01-15', 'active', '2024-01-14', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', 'Miguel Torres', 'miguel.torres@email.com', '+55 11 89999-1234', 220.00, '2024-01-14', 'active', '2024-01-15', now())
ON CONFLICT (id) DO NOTHING;

-- Inserir vendas de exemplo
INSERT INTO sales (id, company_id, amount, product, customer_name, payment_method, status, sale_date, created_at, updated_at) VALUES
  -- Vendas da Boutique Elegance
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 1250.00, 'Vestido Festa Premium', 'Maria Oliveira', 'Cartão de Crédito', 'completed', '2024-01-15', '2024-01-15 14:30:00+00', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 890.00, 'Conjunto Casual', 'Ana Costa', 'PIX', 'completed', '2024-01-15', '2024-01-15 13:45:00+00', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 2100.00, 'Vestido de Noiva', 'Carla Santos', 'Transferência', 'pending', '2024-01-15', '2024-01-15 12:20:00+00', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 450.00, 'Blusa Social', 'Maria Oliveira', 'Dinheiro', 'completed', '2024-01-14', '2024-01-14 16:15:00+00', now()),
  
  -- Vendas da Santos Construções
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 15000.00, 'Projeto Residencial', 'João Silva', 'Transferência', 'completed', '2024-01-14', '2024-01-14 10:30:00+00', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 25000.00, 'Reforma Comercial', 'Roberto Lima', 'Cheque', 'completed', '2024-01-13', '2024-01-13 15:45:00+00', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 8500.00, 'Consultoria Técnica', 'João Silva', 'PIX', 'pending', '2024-01-15', '2024-01-15 11:20:00+00', now()),
  
  -- Vendas do Beauty Center
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 450.00, 'Tratamento Facial', 'Lucia Ferreira', 'Dinheiro', 'completed', '2024-01-15', '2024-01-15 09:30:00+00', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 320.00, 'Massagem Relaxante', 'Patricia Souza', 'PIX', 'completed', '2024-01-14', '2024-01-14 14:20:00+00', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 680.00, 'Pacote Completo', 'Lucia Ferreira', 'Cartão de Crédito', 'completed', '2024-01-13', '2024-01-13 16:45:00+00', now()),
  
  -- Vendas do TechFix
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 320.00, 'Reparo Smartphone', 'Carlos Mendes', 'PIX', 'completed', '2024-01-15', '2024-01-15 10:15:00+00', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 180.00, 'Troca de Tela', 'Fernando Alves', 'Dinheiro', 'completed', '2024-01-14', '2024-01-14 13:30:00+00', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 450.00, 'Reparo Notebook', 'Carlos Mendes', 'Cartão de Débito', 'pending', '2024-01-15', '2024-01-15 15:20:00+00', now()),
  
  -- Vendas da Padaria Delícia
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', 85.00, 'Encomenda Bolo', 'Sandra Rocha', 'PIX', 'completed', '2024-01-15', '2024-01-15 08:45:00+00', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', 120.00, 'Kit Café da Manhã', 'Miguel Torres', 'Dinheiro', 'completed', '2024-01-14', '2024-01-14 07:30:00+00', now()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', 65.00, 'Pães Especiais', 'Sandra Rocha', 'PIX', 'completed', '2024-01-13', '2024-01-13 18:15:00+00', now())
ON CONFLICT (id) DO NOTHING;

-- Inserir mensagens de exemplo
INSERT INTO messages (id, company_id, customer_phone, customer_name, content, type, status, timestamp, created_at) VALUES
  -- Mensagens da Boutique Elegance
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', '+55 11 99999-1234', 'Maria Oliveira', 'Olá! Gostaria de saber sobre os vestidos de festa.', 'incoming', 'read', '2024-01-15 14:30:00+00', '2024-01-15 14:30:00+00'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', '+55 11 99999-1234', 'Maria Oliveira', 'Olá Maria! Temos várias opções lindas. Para qual ocasião?', 'outgoing', 'read', '2024-01-15 14:32:00+00', '2024-01-15 14:32:00+00'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', '+55 11 98888-5678', 'Ana Costa', 'Vocês têm vestidos para casamento?', 'incoming', 'read', '2024-01-15 13:15:00+00', '2024-01-15 13:15:00+00'),
  
  -- Mensagens da Santos Construções
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', '+55 11 96666-3456', 'João Silva', 'Preciso de um orçamento para reforma da cozinha.', 'incoming', 'read', '2024-01-15 13:15:00+00', '2024-01-15 13:15:00+00'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', '+55 11 96666-3456', 'João Silva', 'Claro! Vamos agendar uma visita técnica. Qual o melhor horário?', 'outgoing', 'delivered', '2024-01-15 13:20:00+00', '2024-01-15 13:20:00+00'),
  
  -- Mensagens do Beauty Center
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', '+55 11 94444-1234', 'Lucia Ferreira', 'Qual o valor do tratamento para acne?', 'incoming', 'delivered', '2024-01-15 15:45:00+00', '2024-01-15 15:45:00+00'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', '+55 11 93333-5678', 'Patricia Souza', 'Gostaria de agendar uma massagem.', 'incoming', 'read', '2024-01-14 16:20:00+00', '2024-01-14 16:20:00+00'),
  
  -- Mensagens do TechFix
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', '+55 11 92222-9012', 'Carlos Mendes', 'Meu celular não está carregando. Vocês consertam?', 'incoming', 'read', '2024-01-15 10:30:00+00', '2024-01-15 10:30:00+00'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', '+55 11 91111-3456', 'Fernando Alves', 'Quanto custa para trocar a tela do iPhone?', 'incoming', 'delivered', '2024-01-14 14:15:00+00', '2024-01-14 14:15:00+00'),
  
  -- Mensagens da Padaria Delícia
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', '+55 11 90000-7890', 'Sandra Rocha', 'Vocês fazem bolo de aniversário por encomenda?', 'incoming', 'read', '2024-01-15 09:20:00+00', '2024-01-15 09:20:00+00'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', '+55 11 89999-1234', 'Miguel Torres', 'Que horas vocês abrem?', 'incoming', 'read', '2024-01-14 07:45:00+00', '2024-01-14 07:45:00+00')
ON CONFLICT (id) DO NOTHING;

-- Atualizar totais de compras dos clientes baseado nas vendas
UPDATE customers SET 
  total_purchases = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM sales 
    WHERE sales.customer_name = customers.name 
    AND sales.company_id = customers.company_id 
    AND sales.status = 'completed'
  ),
  last_purchase_date = (
    SELECT MAX(sale_date)::timestamptz
    FROM sales 
    WHERE sales.customer_name = customers.name 
    AND sales.company_id = customers.company_id 
    AND sales.status = 'completed'
  ),
  updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM sales 
  WHERE sales.customer_name = customers.name 
  AND sales.company_id = customers.company_id
);

-- Comentários para documentação
COMMENT ON TABLE companies IS 'Empresas cadastradas na plataforma SimpliWa com dados realistas para demonstração';
COMMENT ON TABLE customers IS 'Clientes das empresas com histórico de compras e relacionamentos';
COMMENT ON TABLE sales IS 'Vendas realizadas pelas empresas com diferentes status e métodos de pagamento';
COMMENT ON TABLE messages IS 'Mensagens do WhatsApp entre empresas e clientes para demonstração do sistema';