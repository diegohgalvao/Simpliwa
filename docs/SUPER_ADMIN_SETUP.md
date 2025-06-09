# 🔐 Como Criar Super Admin

Este guia explica como criar o primeiro super administrador no sistema SimpliWa.

## 📋 Pré-requisitos

1. ✅ Banco de dados Supabase configurado
2. ✅ Migrações aplicadas
3. ✅ Usuário já cadastrado no sistema (através da tela de login)

## 🚀 Métodos para Criar Super Admin

### Método 1: Via Dashboard Supabase (RECOMENDADO)

1. **Acesse o Dashboard do Supabase:**
   - Vá para [supabase.com](https://supabase.com)
   - Entre no seu projeto

2. **Encontre o ID do usuário:**
   - Vá para `Authentication` → `Users`
   - Encontre o usuário que será super admin
   - Copie o `User UID`

3. **Atualize o perfil:**
   - Vá para `Table Editor` → `profiles`
   - Se o usuário já tem um perfil:
     - Clique para editar
     - Mude `role` para `super_admin`
   - Se não tem perfil:
     - Clique `Insert` → `Insert row`
     - Cole o `User UID` no campo `id`
     - Preencha `name` com o nome do admin
     - Defina `role` como `super_admin`

### Método 2: Via SQL Editor

1. **Abra o SQL Editor no Supabase**

2. **Execute este comando:**
```sql
-- Substitua 'admin@empresa.com' pelo email real
UPDATE profiles 
SET role = 'super_admin', updated_at = now()
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@empresa.com'
);

-- Se o perfil não existir, use este comando:
INSERT INTO profiles (id, name, role, created_at, updated_at)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', email),
  'super_admin',
  now(),
  now()
FROM auth.users 
WHERE email = 'admin@empresa.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'super_admin',
  updated_at = now();
```

### Método 3: Via Aplicação (Desenvolvimento)

Se você tem acesso ao código e quer automatizar:

```typescript
// Função para promover usuário (apenas em desenvolvimento)
const promoteToSuperAdmin = async (email: string) => {
  const { data, error } = await supabase.rpc('promote_to_super_admin', {
    user_email: email
  });
  
  if (error) {
    console.error('Erro ao promover usuário:', error);
    return false;
  }
  
  return data;
};
```

## ✅ Verificação

Após criar o super admin:

1. **Faça logout e login novamente**
2. **Verifique se aparece:**
   - 👑 Ícone de coroa no sidebar
   - Menu "Empresas" disponível
   - Menu "Usuários" disponível
   - Texto "Super Admin" no perfil

## 🔒 Segurança

### ⚠️ IMPORTANTE:
- **Apenas crie super admins para pessoas de extrema confiança**
- **Super admins têm acesso total ao sistema**
- **Podem ver e gerenciar todas as empresas**
- **Podem promover/rebaixar outros usuários**

### 🛡️ Boas Práticas:
- Use emails corporativos para super admins
- Mantenha o número de super admins mínimo
- Documente quem são os super admins
- Revise periodicamente os acessos

## 🆘 Problemas Comuns

### "Usuário não encontrado"
- ✅ Certifique-se que o usuário se cadastrou primeiro
- ✅ Verifique se o email está correto
- ✅ Confirme que o email foi verificado

### "Perfil não criado"
- ✅ Use o comando INSERT com ON CONFLICT
- ✅ Verifique se as migrações foram aplicadas
- ✅ Confirme que a tabela profiles existe

### "Ainda não vejo as opções de super admin"
- ✅ Faça logout e login novamente
- ✅ Limpe o cache do navegador
- ✅ Verifique se o role foi salvo corretamente

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique os logs do Supabase
2. Confirme que todas as migrações foram aplicadas
3. Teste com um usuário de teste primeiro