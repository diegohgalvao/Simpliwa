-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  category text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "users_can_access_company_products"
  ON products
  FOR ALL
  TO authenticated
  USING (user_has_company_access(company_id) OR user_is_super_admin())
  WITH CHECK (user_has_company_access(company_id) OR user_is_super_admin());

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir produtos de exemplo
INSERT INTO products (company_id, name, description, price, stock, category, status) VALUES
  -- Produtos da Boutique Elegance
  ('550e8400-e29b-41d4-a716-446655440001', 'Vestido Festa Premium', 'Vestido elegante para ocasiões especiais, tecido de alta qualidade', 1250.00, 15, 'Vestidos', 'active'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Conjunto Casual Verão', 'Conjunto confortável para o dia a dia, ideal para o verão', 890.00, 23, 'Conjuntos', 'active'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Blusa Social Executiva', 'Blusa profissional para trabalho, corte moderno', 600.00, 8, 'Blusas', 'active'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Saia Midi Clássica', 'Saia versátil para diversas ocasiões', 450.00, 3, 'Saias', 'active'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Vestido de Noiva Exclusivo', 'Vestido de noiva sob medida', 3500.00, 2, 'Vestidos', 'active'),
  
  -- Produtos do Beauty Center
  ('550e8400-e29b-41d4-a716-446655440003', 'Kit Tratamento Facial', 'Kit completo para cuidados faciais', 280.00, 12, 'Acessórios', 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Creme Anti-idade Premium', 'Creme com tecnologia avançada', 450.00, 8, 'Acessórios', 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Sérum Vitamina C', 'Sérum clareador e antioxidante', 180.00, 15, 'Acessórios', 'active'),
  
  -- Produtos da Padaria Delícia
  ('550e8400-e29b-41d4-a716-446655440005', 'Bolo de Chocolate Especial', 'Bolo artesanal de chocolate belga', 85.00, 5, 'Acessórios', 'active'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Kit Café da Manhã', 'Pães, bolos e doces variados', 120.00, 10, 'Acessórios', 'active'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Torta de Frutas Vermelhas', 'Torta gourmet com frutas frescas', 95.00, 3, 'Acessórios', 'active')
ON CONFLICT (id) DO NOTHING;

-- Comentários
COMMENT ON TABLE products IS 'Catálogo de produtos das empresas com controle de estoque';
COMMENT ON COLUMN products.price IS 'Preço unitário do produto em reais';
COMMENT ON COLUMN products.stock IS 'Quantidade disponível em estoque';
COMMENT ON COLUMN products.status IS 'Status do produto: active (ativo) ou inactive (inativo)';