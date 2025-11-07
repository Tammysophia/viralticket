# ⚡ Teste Rápido - Gerador de Ofertas Corrigido

## 🚀 Inicie o Servidor

```bash
cd /workspace
npm run dev
```

O sistema abrirá em: `http://localhost:5173`

---

## ✅ Teste Passo a Passo (5 minutos)

### 1️⃣ Login (10 segundos)
```
→ Abra http://localhost:5173
→ Login com qualquer email/senha
→ Deve entrar no Dashboard
```

### 2️⃣ Extrair Comentários do YouTube (30 segundos)
```
→ Clique na aba "YouTube"
→ Cole um link de vídeo do YouTube
   Exemplo: https://www.youtube.com/watch?v=dQw4w9WgXcQ
→ Clique em "Extrair Comentários"
→ ✅ Deve mostrar: "X comentários extraídos!"
```

### 3️⃣ Gerar Oferta com IA (1 minuto)
```
→ Clique no botão "Usar com IA"
→ Sistema muda para aba "IA"
→ Escolha um agente (Sophia Fênix ou Sofia Universal)
→ Clique em "Gerar"
→ ⏳ Aguarde 10-30 segundos
→ ✅ Deve mostrar oferta gerada com:
   - Título
   - Subtítulo
   - Bullets (benefícios)
   - CTA
   - Bônus
→ ✅ Mensagem: "Oferta salva no Kanban!"
```

### 4️⃣ Verificar Kanban (10 segundos)
```
→ Clique na aba "Kanban"
→ ✅ Oferta deve aparecer na coluna "Em Execução"
→ ✅ Deve mostrar: título, agente, data
→ ✅ Botões "Editar" e "Excluir" visíveis
```

### 5️⃣ Editar Oferta (1 minuto)
```
→ Clique no botão "Editar" da oferta
→ ✅ Modal do editor abre com 4 abas:
   1. Detalhes
   2. Cópias
   3. Vídeos
   4. Modelagem
→ Verifique que os campos estão preenchidos
→ Clique na aba "Cópias"
→ ✅ Deve ver campos de texto com conteúdo
```

### 6️⃣ Testar Geração de Texto com IA (1 minuto)
```
→ No editor, aba "Cópias"
→ Clique no botão "✨ Gerar com IA" ao lado de "Headline"
→ ⏳ Aguarde: "🤖 Gerando com IA..."
→ ✅ Campo deve ser preenchido automaticamente
→ ✅ Mensagem: "✨ Texto gerado com IA!"
→ Repita para outros campos se quiser
```

### 7️⃣ Salvar e Verificar (20 segundos)
```
→ Clique em "Salvar" no editor
→ ✅ Mensagem: "💾 Oferta salva com sucesso!"
→ Modal fecha automaticamente
→ Volte para aba "Kanban"
→ ✅ Oferta ainda está lá, intacta
```

---

## 🐛 O Que Verificar no Console (F12)

Abra o Console do navegador (F12) e procure por:

### ✅ Logs de Sucesso:
```
✅ VT: Oferta gerada com sucesso!
📝 VT: Oferta salva no Kanban: mock_1234567890
🤖 VT: Gerando page com IA...
✅ VT: page gerado com sucesso!
💾 VT: Oferta salva com sucesso!
```

### ❌ Se Ver Erros:
```
❌ Erro ao gerar oferta
   → Verifique se a chave OpenAI está configurada
   → Vá em Admin → API Keys

❌ A chave da API está mockada
   → Configure uma chave real no painel Admin

❌ Chave da API do OpenAI não configurada
   → Vá em Admin → API Keys → Adicione chave real
```

---

## 🔑 Configurar Chaves da API (Se Necessário)

### Chave OpenAI (Para IA funcionar):
```
1. Login como admin (tamara14@gmail.com)
2. Clique em "Admin" no canto superior direito
3. Vá em "API Keys"
4. Edite a chave OpenAI
5. Cole sua chave real: sk-proj-...
6. Salve
```

### Chave YouTube (Para extração funcionar):
```
1. Mesmos passos acima
2. Edite a chave YouTube
3. Cole sua chave real: AIza...
4. Salve
```

**Não tem as chaves?**  
Veja: `CONFIGURAR_API_KEYS.md`

---

## ✅ Checklist Rápido

Marque conforme testa:

- [ ] Sistema inicia sem erros
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Extração do YouTube funciona
- [ ] Geração de oferta com IA funciona
- [ ] Oferta aparece no Kanban
- [ ] Editor de ofertas abre
- [ ] Editor carrega os dados da oferta
- [ ] Botão "Gerar com IA" funciona no editor
- [ ] Campos são preenchidos pela IA
- [ ] Salvar alterações funciona
- [ ] Drag and drop no Kanban funciona
- [ ] Excluir oferta funciona

**Se todos os itens estão ✅, o sistema está perfeito!**

---

## 🎯 Testes Avançados (Opcional)

### Teste 1: Gerar 3 Ofertas Diferentes
```
→ Extraia comentários de 3 vídeos diferentes
→ Gere uma oferta para cada
→ ✅ Todas devem aparecer no Kanban
```

### Teste 2: Mover Ofertas Entre Colunas
```
→ Arraste uma oferta de "Em Execução" para "Modelando"
→ ✅ Deve mover suavemente
→ ✅ Mensagem: "Oferta movida com sucesso!"
```

### Teste 3: Editar e Re-editar
```
→ Edite uma oferta
→ Mude o título
→ Salve
→ Edite novamente
→ ✅ Título mudado deve aparecer
```

### Teste 4: Gerar Todos os Campos com IA
```
→ Abra editor de uma oferta
→ Vá na aba "Cópias"
→ Clique "Gerar com IA" em TODOS os campos:
   1. Página de Vendas
   2. Texto Principal
   3. Headline
   4. Descrição
→ ✅ Todos devem ser preenchidos
→ Salve
```

---

## 📱 Teste Mobile (Opcional)

```
→ Abra o sistema no celular: http://[seu-ip]:5173
→ Teste o fluxo completo
→ ✅ Deve funcionar responsivamente
```

---

## ❓ Troubleshooting

### Problema: "Erro ao gerar oferta"
**Solução:** Configure chave OpenAI real

### Problema: "Oferta não aparece no Kanban"
**Solução:** 
1. Abra console (F12)
2. Procure por erros vermelhos
3. Recarregue a página

### Problema: "Botão Gerar com IA não faz nada"
**Solução:**
1. Verifique console (F12)
2. Deve ter logs de erro
3. Provavelmente chave OpenAI não configurada

### Problema: "Campos vazios no editor"
**Solução:**
1. Isso NÃO DEVE acontecer mais!
2. Se acontecer, abra console (F12)
3. Compartilhe os logs

---

## 🎉 Tudo Funcionando?

Se você conseguiu:
- ✅ Gerar uma oferta com IA
- ✅ Ver a oferta no Kanban
- ✅ Editar a oferta
- ✅ Gerar textos com IA no editor
- ✅ Salvar alterações

**PARABÉNS! 🎊**

O gerador de ofertas está **100% funcional** e pronto para uso!

---

## 📝 Próximos Passos

1. Configure chaves da API reais (se ainda não fez)
2. Teste com vídeos reais do seu nicho
3. Experimente os diferentes agentes IA
4. Refine os textos gerados conforme necessário
5. Use a funcionalidade de modelagem para rastreamento

---

**Tempo Total de Teste:** ~5 minutos  
**Dificuldade:** ⭐ Fácil  
**Resultado Esperado:** ✅ Tudo funcionando perfeitamente!
