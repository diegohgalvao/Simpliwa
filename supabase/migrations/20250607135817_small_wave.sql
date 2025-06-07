/*
  # Dados de Exemplo para Demonstração - SimpliWa

  1. Empresas de Exemplo
    - Diferentes segmentos e tamanhos
    - Planos variados
    - Status diversos

  2. Usuários de Exemplo
    - Diferentes roles
    - Membros das empresas

  3. Dados Operacionais
    - Produtos, clientes, vendas, mensagens
    - Dados realistas para demonstração
*/

-- Inserir empresas de exemplo
INSERT INTO companies (id, name, segment, plan, monthly_revenue, employees, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Boutique Elegance', 'Moda e Vestuário', 'professional', 45680, 8, 'active'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Santos Construções', 'Construção Civil', 'enterprise', 125000, 25, 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Beauty Center', 'Beleza e Estética', 'professional', 32500, 12, 'active'),
  ('550e8400-e29b-41d4-a716-446655440004', 'TechFix', 'Assistência Técnica', 'starter', 18900, 5, 'active'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Padaria Delícia', 'Alimentação', 'starter', 22300, 6, 'trial')
ON CONFLICT (id) DO NOTHING;

-- Inserir produtos de exemplo
INSERT INTO products (company_id, name, description, price, stock, category, status) VALUES
  -- Boutique Elegance
  ('550e8400-e29b-41d4-a716-446655440001', 'Vestido Festa Premium', 'Vestido elegante para ocasiões especiais', 1250.00, 15, 'Vestidos', 'active'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Conjunto Casual', 'Conjunto confortável para o dia a dia', 890.00, 25, 'Conjuntos', 'active'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Blusa Social', 'Blusa elegante para trabalho', 320.00, 30, 'Blusas', 'active'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Saia Midi', 'Saia versátil para diversas ocasiões', 280.00, 20, 'Saias', 'active'),
  
  -- TechFix
  ('550e8400-e29b-41d4-a716-446655440004', 'Reparo Smartphone', 'Serviço de reparo para smartphones', 150.00, 999, 'Serviços', 'active'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Troca de Tela', 'Substituição de tela de celular', 280.00, 999, 'Serviços', 'active'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Limpeza Notebook', 'Limpeza completa de notebook', 120.00, 999, 'Serviços', 'active'),
  
  -- Beauty Center
  ('550e8400-e29b-41d4-a716-446655440003', 'Tratamento Facial', 'Limpeza de pele profissional', 180.00, 999, 'Tratamentos', 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Massagem Relaxante', 'Massagem terapêutica', 220.00, 999, 'Massagens', 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Corte e Escova', 'Corte de cabelo com escova', 85.00, 999, 'Cabelo', 'active'),
  
  -- Padaria Delícia
  ('550e8400-e29b-41d4-a716-446655440005', 'Pão Francês', 'Pão francês tradicional', 0.80, 200, 'Pães', 'active'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Bolo de Chocolate', 'Bolo caseiro de chocolate', 35.00, 8, 'Bolos', 'active'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Sanduíche Natural', 'Sanduíche com ingredientes frescos', 12.50, 25, 'Lanches', 'active')
ON CONFLICT DO NOTHING;

-- Inserir clientes de exemplo
INSERT INTO customers (company_id, name, email, phone, total_purchases, status) VALUES
  -- Boutique Elegance
  ('550e8400-e29b-41d4-a716-446655440001', 'Maria Oliveira', 'maria.oliveira@email.com', '+55 11 99999-1234', 2340.00, 'active'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Ana Silva', 'ana.silva@email.com', '+55 11 98888-5678', 1890.00, 'active'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Carla Santos', 'carla.santos@email.com', '+55 11 97777-9012', 3200.00, 'active'),
  
  -- TechFix
  ('550e8400-e29b-41d4-a716-446655440004', 'João Costa', 'joao.costa@email.com', '+55 11 96666-3456', 450.00, 'active'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Pedro Lima', 'pedro.lima@email.com', '+55 11 95555-7890', 280.00, 'active'),
  
  -- Beauty Center
  ('550e8400-e29b-41d4-a716-446655440003', 'Fernanda Rocha', 'fernanda.rocha@email.com', '+55 11 94444-2345', 680.00, 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Juliana Mendes', 'juliana.mendes@email.com', '+55 11 93333-6789', 520.00, 'active'),
  
  -- Padaria Delícia
  ('550e8400-e29b-41d4-a716-446655440005', 'Roberto Silva', 'roberto.silva@email.com', '+55 11 92222-1234', 125.50, 'active'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Lucia Ferreira', 'lucia.ferreira@email.com', '+55 11 91111-5678', 89.30, 'active')
ON CONFLICT DO NOTHING;

-- Inserir vendas de exemplo
INSERT INTO sales (company_id, amount, product, customer_name, payment_method, status, sale_date) VALUES
  -- Boutique Elegance
  ('550e8400-e29b-41d4-a716-446655440001', 1250.00, 'Vestido Festa Premium', 'Maria Oliveira', 'Cartão de Crédito', 'completed', '2024-01-15'),
  ('550e8400-e29b-41d4-a716-446655440001', 890.00, 'Conjunto Casual', 'Ana Silva', 'PIX', 'completed', '2024-01-14'),
  ('550e8400-e29b-41d4-a716-446655440001', 320.00, 'Blusa Social', 'Carla Santos', 'Dinheiro', 'completed', '2024-01-13'),
  ('550e8400-e29b-41d4-a716-446655440001', 280.00, 'Saia Midi', 'Maria Oliveira', 'PIX', 'pending', '2024-01-15'),
  
  -- TechFix
  ('550e8400-e29b-41d4-a716-446655440004', 150.00, 'Reparo Smartphone', 'João Costa', 'PIX', 'completed', '2024-01-15'),
  ('550e8400-e29b-41d4-a716-446655440004', 280.00, 'Troca de Tela', 'Pedro Lima', 'Cartão de Débito', 'completed', '2024-01-14'),
  ('550e8400-e29b-41d4-a716-446655440004', 120.00, 'Limpeza Notebook', 'João Costa', 'Dinheiro', 'pending', '2024-01-15'),
  
  -- Beauty Center
  ('550e8400-e29b-41d4-a716-446655440003', 180.00, 'Tratamento Facial', 'Fernanda Rocha', 'PIX', 'completed', '2024-01-15'),
  ('550e8400-e29b-41d4-a716-446655440003', 220.00, 'Massagem Relaxante', 'Juliana Mendes', 'Cartão de Crédito', 'completed', '2024-01-14'),
  ('550e8400-e29b-41d4-a716-446655440003', 85.00, 'Corte e Escova', 'Fernanda Rocha', 'Dinheiro', 'completed', '2024-01-13'),
  
  -- Padaria Delícia
  ('550e8400-e29b-41d4-a716-446655440005', 24.00, 'Pão Francês', 'Roberto Silva', 'Dinheiro', 'completed', '2024-01-15'),
  ('550e8400-e29b-41d4-a716-446655440005', 35.00, 'Bolo de Chocolate', 'Lucia Ferreira', 'PIX', 'completed', '2024-01-15'),
  ('550e8400-e29b-41d4-a716-446655440005', 12.50, 'Sanduíche Natural', 'Roberto Silva', 'Dinheiro', 'completed', '2024-01-14')
ON CONFLICT DO NOTHING;

-- Inserir mensagens de exemplo
INSERT INTO messages (company_id, customer_phone, customer_name, content, type, status, timestamp) VALUES
  -- Boutique Elegance
  ('550e8400-e29b-41d4-a716-446655440001', '+55 11 99999-1234', 'Maria Oliveira', 'Olá! Gostaria de saber sobre os vestidos de festa.', 'incoming', 'read', '2024-01-15 14:30:00'),
  ('550e8400-e29b-41d4-a716-446655440001', '+55 11 99999-1234', 'Maria Oliveira', 'Olá Maria! Temos várias opções lindas. Qual ocasião?', 'outgoing', 'read', '2024-01-15 14:32:00'),
  ('550e8400-e29b-41d4-a716-446655440001', '+55 11 98888-5678', 'Ana Silva', 'Vocês têm conjuntos casuais?', 'incoming', 'read', '2024-01-15 15:45:00'),
  
  -- TechFix
  ('550e8400-e29b-41d4-a716-446655440004', '+55 11 96666-3456', 'João Costa', 'Meu celular está com a tela quebrada. Vocês consertam?', 'incoming', 'read', '2024-01-15 13:15:00'),
  ('550e8400-e29b-41d4-a716-446655440004', '+55 11 96666-3456', 'João Costa', 'Sim! Fazemos troca de tela. Qual o modelo do seu celular?', 'outgoing', 'delivered', '2024-01-15 13:17:00'),
  
  -- Beauty Center
  ('550e8400-e29b-41d4-a716-446655440003', '+55 11 94444-2345', 'Fernanda Rocha', 'Qual o valor do tratamento facial?', 'incoming', 'read', '2024-01-15 16:20:00'),
  ('550e8400-e29b-41d4-a716-446655440003', '+55 11 94444-2345', 'Fernanda Rocha', 'O tratamento facial custa R$ 180. Inclui limpeza completa!', 'outgoing', 'read', '2024-01-15 16:22:00'),
  
  -- Padaria Delícia
  ('550e8400-e29b-41d4-a716-446655440005', '+55 11 92222-1234', 'Roberto Silva', 'Vocês fazem entrega?', 'incoming', 'delivered', '2024-01-15 08:30:00'),
  ('550e8400-e29b-41d4-a716-446655440005', '+55 11 91111-5678', 'Lucia Ferreira', 'Têm bolo de chocolate hoje?', 'incoming', 'sent', '2024-01-15 09:15:00')
ON CONFLICT DO NOTHING;