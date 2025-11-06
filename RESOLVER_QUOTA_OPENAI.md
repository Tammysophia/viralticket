# 💳 Como Resolver: "Quota Exceeded" - OpenAI

## ❌ Erro Encontrado

```
Error 429: You exceeded your current quota, please check your plan and billing details.
```

## 🎯 O Que Significa?

Sua conta da OpenAI:
- **Não tem créditos** disponíveis
- OU atingiu o **limite de uso gratuito**
- OU o **método de pagamento falhou**

## ✅ Como Resolver

### **Opção 1: Adicionar Créditos (RECOMENDADO)**

1. Acesse: https://platform.openai.com/account/billing/overview
2. Faça login com a conta que gerou a chave
3. Clique em **"Add payment method"**
4. Adicione um cartão de crédito
5. Clique em **"Add to credit balance"**
6. Adicione no mínimo **$5-10** (recomendo $20 para começar)
7. Aguarde 1-2 minutos para processar
8. Tente gerar a oferta novamente

### **Opção 2: Criar Nova Conta OpenAI**

Novas contas ganham **$5 grátis** de crédito:

1. Acesse: https://platform.openai.com/signup
2. Crie uma conta com **NOVO email** (diferente da atual)
3. Verifique o email
4. Vá em: https://platform.openai.com/api-keys
5. Clique em **"Create new secret key"**
6. **COPIE A CHAVE** (você só verá uma vez!)
7. Cole no sistema ViralTicket

### **Opção 3: Verificar Uso Atual**

Veja quanto você já usou:

1. Acesse: https://platform.openai.com/usage
2. Verifique o uso do mês atual
3. Se atingiu limite, adicione mais créditos ou aguarde novo ciclo

---

## 💰 Custos Esperados

### GPT-4 (modelo usado no ViralTicket)
- **Input:** $0.03 / 1K tokens
- **Output:** $0.06 / 1K tokens
- **Por oferta gerada:** ~$0.03-0.05 (3 a 5 centavos)

### Exemplo de uso:
- 100 ofertas geradas = ~$3-5
- $20 de crédito = ~400-600 ofertas

---

## 🔄 Após Adicionar Créditos

1. Aguarde 1-2 minutos
2. Recarregue a página do ViralTicket (F5)
3. Tente gerar uma oferta novamente
4. Deve funcionar! ✅

---

## 🆘 Se Ainda Não Funcionar

### Verifique:

1. **Método de pagamento ativo?**
   - https://platform.openai.com/account/billing/payment-methods

2. **Créditos disponíveis?**
   - https://platform.openai.com/account/billing/overview
   - Deve mostrar saldo positivo

3. **Chave correta?**
   - A chave deve ser da mesma conta que tem créditos
   - Cole o script abaixo no console para confirmar:

```javascript
// Verificar chave atual
const keys = JSON.parse(localStorage.getItem('viralticket_api_keys'));
const openaiKey = keys.find(k => k.type === 'openai');
console.log('Chave OpenAI atual:', openaiKey.key.substring(0, 15) + '...');
console.log('Verifique se é a chave da conta COM créditos!');
```

---

## 📊 Status Atual do Sistema

✅ **O que está funcionando:**
- Sistema ViralTicket: 100% operacional
- Chave YouTube: Funcionando (extraindo comentários)
- Chave OpenAI: Válida (formato correto)

❌ **O que NÃO está funcionando:**
- Conta OpenAI sem créditos (erro 429)

**Solução:** Adicione créditos na conta OpenAI! 💳

---

## 💡 Dica

Se você vai usar o sistema frequentemente, recomendo:
- Adicionar **$50-100** de créditos
- Configurar **alerta de uso** em 80%
- Monitorar uso mensalmente

Acesse: https://platform.openai.com/account/billing/limits
