-- =====================================================
-- SEPARAÇÃO COMPLETA DO SUPER ADMIN DAS EMPRESAS
-- =====================================================

/*
  # Separação do Super Admin das Empresas

  1. Problema Identificado
    - Super admin estava sendo atrelado a empresas específicas
    - Dashboard mostrava dados de empresa específica em vez de BI

  2. Solução
    - Super admin não deve ter company_members
    - Dashboard diferenciado para super admin (Business Intelligence)
    - Acesso total via RLS sem dependência de company_members

  3. Mudanças
    - Remover super admin de company_members se existir
    - Garantir que RLS funcione para super admin sem company_members
    - Dashboard focado em gestão do negócio SimpliWa
*/

-- Remover super admin de qualquer company_members (se existir)
DELETE FROM company_members 
WHERE user_id IN (
  SELECT id FROM profiles WHERE role = 'super_admin'
);

-- Garantir que super admin não pode ser adicionado a company_members
CREATE OR REPLACE FUNCTION prevent_super_admin_company_membership()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar se o usuário é super admin
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = NEW.user_id AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Super administradores não podem ser membros de empresas específicas. Eles têm acesso total ao sistema.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para prevenir super admin em company_members
DROP TRIGGER IF EXISTS prevent_super_admin_membership ON company_members;
CREATE TRIGGER prevent_super_admin_membership
  BEFORE INSERT OR UPDATE ON company_members
  FOR EACH ROW
  EXECUTE FUNCTION prevent_super_admin_company_membership();

-- Atualizar função user_has_company_access para ser mais clara
CREATE OR REPLACE FUNCTION user_has_company_access(target_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Buscar role do usuário
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  -- Super admin tem acesso a tudo (sem precisar ser membro)
  IF user_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Outros usuários precisam ser membros da empresa
  RETURN EXISTS (
    SELECT 1 
    FROM company_members 
    WHERE user_id = auth.uid() 
    AND company_id = target_company_id
  );
END;
$$;

-- Atualizar função user_is_company_admin para ser mais clara
CREATE OR REPLACE FUNCTION user_is_company_admin(target_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Buscar role do usuário
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  -- Super admin tem privilégios de admin em tudo
  IF user_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Outros usuários precisam ser admin da empresa específica
  RETURN EXISTS (
    SELECT 1 
    FROM company_members 
    WHERE user_id = auth.uid() 
    AND company_id = target_company_id 
    AND role = 'admin'
  );
END;
$$;

-- Comentários para documentação
COMMENT ON FUNCTION prevent_super_admin_company_membership() IS 'Previne que super admins sejam adicionados como membros de empresas específicas';
COMMENT ON FUNCTION user_has_company_access(uuid) IS 'Verifica acesso à empresa: super admin sempre true, outros verificam membership';
COMMENT ON FUNCTION user_is_company_admin(uuid) IS 'Verifica se é admin da empresa: super admin sempre true, outros verificam role admin';

-- Verificação final: garantir que não há super admin em company_members
DO $$
DECLARE
  super_admin_count integer;
BEGIN
  SELECT COUNT(*) INTO super_admin_count
  FROM company_members cm
  JOIN profiles p ON cm.user_id = p.id
  WHERE p.role = 'super_admin';
  
  IF super_admin_count > 0 THEN
    RAISE NOTICE 'ATENÇÃO: Ainda existem % super admins em company_members. Removendo...', super_admin_count;
    
    DELETE FROM company_members 
    WHERE user_id IN (
      SELECT id FROM profiles WHERE role = 'super_admin'
    );
    
    RAISE NOTICE 'Super admins removidos de company_members com sucesso.';
  ELSE
    RAISE NOTICE 'Verificação OK: Nenhum super admin encontrado em company_members.';
  END IF;
END;
$$;