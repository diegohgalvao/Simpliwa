# 🔐 Sistema de Segurança e Roles - SimpliWa

Este documento detalha o sistema completo de segurança, roles e permissões implementado no SimpliWa.

## 🎯 Visão Geral

O SimpliWa implementa um sistema de segurança em camadas com **3 níveis de acesso** e **restrições rigorosas** para garantir que cada usuário acesse apenas os dados apropriados.

## 👥 Níveis de Acesso

### 🔴 Super Admin (Nível 1)
- **Quantidade:** Apenas 1 no sistema (restrição de segurança)
- **Acesso:** Total e irrestrito
- **Responsabilidades:**
  - Visão estratégica de todo o negócio SimpliWa
  - Análise de dados consolidados
  - Gerenciamento de usuários do sistema
  - Monitoramento de todas as empresas

**Funcionalidades Exclusivas:**
- ✅ Dashboard de Business Intelligence
- ✅ Análise consolidada de todas as empresas
- ✅ Gerenciamento de usuários do sistema
- ✅ Métricas de crescimento da plataforma
- ✅ Identificação de oportunidades de upsell
- ✅ Análise de receita por empresa/funcionário

### 🔵 Admin (Nível 2)
- **Quantidade:** 1 por empresa
- **Acesso:** Completo dentro da sua empresa
- **Responsabilidades:**
  - Gestão operacional da empresa
  - Controle de equipe e permissões
  - Análise de performance da empresa

**Funcionalidades:**
- ✅ Dashboard completo da empresa
- ✅ Gestão de vendas, clientes, produtos
- ✅ Gerenciamento da equipe
- ✅ Relatórios e análises da empresa
- ✅ Configurações da empresa
- ❌ Dados de outras empresas
- ❌ Usuários do sistema

### 🟢 User (Nível 3)
- **Quantidade:** Ilimitado por empresa
- **Acesso:** Limitado dentro da empresa
- **Responsabilidades:**
  - Operações do dia a dia
  - Atendimento e vendas
  - Consulta de dados básicos

**Funcionalidades:**
- ✅ Dashboard básico da empresa
- ✅ Gestão de clientes (limitada)
- ✅ Registro de vendas
- ✅ Mensagens do WhatsApp
- ❌ Gestão de equipe
- ❌ Configurações da empresa
- ❌ Relatórios avançados

## 🛡️ Implementação de Segurança

### Row Level Security (RLS)
Todas as tabelas implementam RLS com políticas específicas:

```sql
-- Exemplo: Política para vendas
CREATE POLICY "company_members_own_sales_access"
  ON sales
  FOR ALL
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM company_members 
      WHERE user_id = auth.uid()
    )
  );
```

### Restrições de Super Admin
```sql
-- Trigger que garante apenas 1 super admin
CREATE TRIGGER ensure_single_super_admin
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_single_super_admin();
```

### Validação de Permissões
```sql
-- Função para verificar acesso à empresa
CREATE FUNCTION user_has_company_access(target_company_id uuid)
RETURNS boolean;

-- Função para verificar se é admin da empresa
CREATE FUNCTION user_is_company_admin(target_company_id uuid)
RETURNS boolean;
```

## 🔄 Fluxo de Acesso

### 1. Autenticação
```
Usuário → Supabase Auth → Verificação de Email → Profile Lookup
```

### 2. Autorização
```
Profile Role → Company Membership → RLS Policies → Data Access
```

### 3. Navegação
```
Role Check → Menu Rendering → Route Protection → Component Access
```

## 📊 Matriz de Permissões

| Funcionalidade | Super Admin | Admin | User |
|----------------|-------------|-------|------|
| **Dashboard Próprio** | ✅ | ✅ | ✅ |
| **Dashboard Outras Empresas** | ✅ | ❌ | ❌ |
| **Vendas (Própria)** | ✅ | ✅ | ✅ |
| **Vendas (Outras)** | ✅ | ❌ | ❌ |
| **Clientes (Próprios)** | ✅ | ✅ | ✅ |
| **Clientes (Outros)** | ✅ | ❌ | ❌ |
| **Produtos** | ✅ | ✅ | 📝 |
| **Mensagens** | ✅ | ✅ | ✅ |
| **Equipe (Própria)** | ✅ | ✅ | 👁️ |
| **Equipe (Outras)** | ✅ | ❌ | ❌ |
| **Relatórios (Próprios)** | ✅ | ✅ | 👁️ |
| **Relatórios (Consolidados)** | ✅ | ❌ | ❌ |
| **Configurações (Próprias)** | ✅ | ✅ | 👁️ |
| **Usuários do Sistema** | ✅ | ❌ | ❌ |
| **Empresas do Sistema** | ✅ | ❌ | ❌ |

**Legenda:**
- ✅ Acesso completo
- 👁️ Apenas visualização
- 📝 Acesso limitado
- ❌ Sem acesso

## 🚨 Alertas de Segurança

### Para Super Admin
- Acesso a dados sensíveis de todas as empresas
- Responsabilidade por privacidade e LGPD
- Logs de auditoria automáticos

### Para Admin
- Responsabilidade pelos dados da empresa
- Gestão adequada da equipe
- Proteção de informações comerciais

### Para User
- Acesso limitado e monitorado
- Responsabilidade pelos próprios dados
- Uso adequado das funcionalidades

## 🔧 Configuração e Manutenção

### Criação de Super Admin
```sql
-- Apenas 1 permitido no sistema
SELECT promote_to_super_admin('admin@simpliwa.com');
```

### Gestão de Empresa
```sql
-- Admin pode gerenciar sua equipe
INSERT INTO company_members (user_id, company_id, role)
VALUES (user_id, company_id, 'user');
```

### Auditoria
```sql
-- Verificar super admins
SELECT * FROM list_super_admins();

-- Verificar acessos por empresa
SELECT * FROM company_members WHERE company_id = 'uuid';
```

## 📈 Monitoramento

### Métricas de Segurança
- Tentativas de acesso negado
- Escalação de privilégios
- Acessos fora do horário
- Múltiplos logins simultâneos

### Logs de Auditoria
- Todas as ações de super admin
- Mudanças de roles
- Acessos a dados sensíveis
- Operações críticas

## 🆘 Procedimentos de Emergência

### Comprometimento de Super Admin
1. Revogar acesso imediatamente
2. Criar novo super admin
3. Auditoria completa do sistema
4. Notificação de todas as empresas

### Vazamento de Dados
1. Identificar escopo do vazamento
2. Notificar autoridades (LGPD)
3. Comunicar empresas afetadas
4. Implementar correções

### Falha de Segurança
1. Isolar sistema afetado
2. Análise de impacto
3. Correção emergencial
4. Teste de segurança completo

---

**⚠️ IMPORTANTE:** Este sistema de segurança é crítico para a operação do SimpliWa. Qualquer alteração deve ser cuidadosamente testada e documentada.