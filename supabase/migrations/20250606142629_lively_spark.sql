/*
  # Dados Iniciais para Demonstração

  1. Empresas de exemplo
  2. Usuário super admin
  3. Dados de demonstração
*/

-- Inserir empresas de exemplo
INSERT INTO companies (id, name, segment, plan, monthly_revenue, employees, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Boutique Elegance', 'Moda e Vestuário', 'professional', 45680.00, 8, 'active'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Santos Construções', 'Construção Civil', 'enterprise', 125000.00, 25, 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Beauty Center', 'Beleza e Estética', 'professional', 32500.00, 12, 'active'),
  ('550e8400-e29b-41d4-a716-446655440004', 'TechFix', 'Assistência Técnica', 'starter', 18900.00, 5, 'active'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Padaria Delícia', 'Alimentação', 'starter', 22300.00, 6, 'trial');

-- Inserir clientes de exemplo para Boutique Elegance
INSERT INTO customers (company_id, name, email, phone, total_purchases, last_purchase_date, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Maria Oliveira', 'maria.oliveira@email.com', '+55 11 99999-1234', 3450.00, '2024-01-15', 'active'),
  ('550e8400-e29b-41d4-a716-446655440001', 'João Silva', 'joao.silva@email.com', '+55 11 98888-5678', 1890.00, '2024-01-12', 'active'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Ana Costa', 'ana.costa@email.com', '+55 11 97777-9012', 2340.00, '2024-01-10', 'active'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Carlos Mendes', 'carlos.mendes@email.com', '+55 11 96666-3456', 890.00, '2024-01-08', 'inactive');

-- Inserir vendas de exemplo
INSERT INTO sales (company_id, amount, product, customer_name, payment_method, status, sale_date) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 1250.00, 'Vestido Festa Premium', 'Maria Oliveira', 'Cartão de Crédito', 'completed', '2024-01-15'),
  ('550e8400-e29b-41d4-a716-446655440001', 890.00, 'Conjunto Casual', 'João Silva', 'PIX', 'completed', '2024-01-15'),
  ('550e8400-e29b-41d4-a716-446655440002', 15000.00, 'Projeto Residencial', 'Família Santos', 'Transferência', 'pending', '2024-01-14'),
  ('550e8400-e29b-41d4-a716-446655440003', 450.00, 'Tratamento Facial', 'Ana Silva', 'Dinheiro', 'completed', '2024-01-15'),
  ('550e8400-e29b-41d4-a716-446655440004', 320.00, 'Reparo Smartphone', 'João Costa', 'PIX', 'completed', '2024-01-15');

-- Inserir mensagens de exemplo
INSERT INTO messages (company_id, customer_phone, customer_name, content, type, status, timestamp) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '+55 11 99999-1234', 'Maria Oliveira', 'Olá! Gostaria de saber sobre os vestidos de festa.', 'incoming', 'read', '2024-01-15 14:30:00'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Boutique Elegance', 'Boutique Elegance', 'Olá Maria! Temos várias opções lindas. Qual ocasião?', 'outgoing', 'read', '2024-01-15 14:32:00'),
  ('550e8400-e29b-41d4-a716-446655440002', '+55 11 98888-5678', 'João Santos', 'Preciso de um orçamento para reforma da cozinha.', 'incoming', 'read', '2024-01-15 13:15:00'),
  ('550e8400-e29b-41d4-a716-446655440003', '+55 11 97777-9012', 'Ana Costa', 'Qual o valor do tratamento para acne?', 'incoming', 'delivered', '2024-01-15 15:45:00');