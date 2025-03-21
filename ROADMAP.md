# FavoritePerson.app - Roadmap para MicroSaaS

## Fase 1: Correções e Melhorias Básicas

- [x] Corrigir fluxo de upload de fotos
- [x] Adicionar feedback de erro para o usuário
- [x] Melhorar atualização da lista após upload
- [x] Corrigir funcionalidade do botão de fechar no modal de upload
- [x] Implementar verificação de campos obrigatórios no upload
- [x] Otimizar solicitação de data de início do relacionamento (apenas na primeira foto)
- [x] Renomear aplicativo para FavoritePerson
- [x] Corrigir suporte para diferentes formatos de imagem (webp, heic, tiff, etc.)
- [x] Remover toggle de tema e padronizar com tema claro
- [x] Adicionar confirmação de exclusão de fotos
- [x] Implementar visualização em tela cheia
- [x] Melhorar desempenho de carregamento das imagens

## Fase 2: Autenticação e Multi-usuários

- [ ] Implementar sistema de autenticação com Supabase Auth
- [ ] Criar página de login/registro
- [ ] Implementar perfis de usuário
- [ ] Separar fotos por usuário no banco de dados
- [ ] Criar página de administração para usuário

## Fase 3: Recursos Monetizáveis

- [ ] Implementar sistema de planos (Gratuito, Básico, Premium)
- [ ] Limitar número de fotos por plano
- [ ] Implementar sistema de pagamento (Stripe)
- [ ] Adicionar recursos premium:
  - [ ] Temas personalizados
  - [ ] Exportação para PDF/álbum
  - [ ] Compartilhamento com senha
  - [ ] Comentários e colaboração

## Fase 4: Escalabilidade e Marketing

- [ ] Otimizar performance para grandes galerias
- [ ] Implementar CDN para imagens
- [ ] Configurar analytics e rastreamento de conversão
- [ ] Criar página de landing para aquisição de clientes
- [ ] Implementar sistema de referral/indicação
- [ ] Registrar domínio favoriteperson.app e configurar hospedagem

## Fase 5: Expansão de Recursos

- [ ] App mobile com React Native
- [ ] Recursos de IA para organização de fotos
- [ ] Integração com redes sociais
- [ ] Lembretes de datas importantes
- [ ] API pública para integrações

## Modelo de Negócio Proposto

### Planos e Preços

**Plano Gratuito**
- Até 20 fotos
- Design básico
- Sem exportação

**Plano Básico (R$ 9,90/mês)**
- Até 100 fotos
- Temas personalizados
- Exportação básica para PDF

**Plano Premium (R$ 19,90/mês)**
- Fotos ilimitadas
- Todos os temas
- Exportação de alta qualidade
- Compartilhamento com senha
- Comentários e colaboração
- Recursos exclusivos

### Estratégia de Monetização

1. **Modelo Freemium**: Atrair usuários com o plano gratuito e converter para planos pagos
2. **Venda de pacotes de armazenamento**: Para quem precisa de mais espaço
3. **Recursos premium**: Bloqueados para usuários gratuitos
4. **Impressão de álbuns físicos**: Parceria com gráficas

## Tecnologias Adicionais a Implementar

- Stripe para pagamentos
- Sendgrid para emails
- Vercel para hospedagem
- CloudFlare para CDN
- Sanity ou Contentful para gerenciamento de conteúdo
- Firebase Analytics ou Posthog para analytics 

## Progresso Atual

### Concluído (Fase 1)
- ✅ Estrutura base do aplicativo implementada com Next.js, TypeScript e Tailwind
- ✅ Integração com Supabase para armazenamento de imagens
- ✅ Upload de fotos com seleção de data e legenda
- ✅ Visualização de fotos em galeria estilo polaroid
- ✅ Contador de tempo de relacionamento
- ✅ Edição e exclusão de fotos existentes
- ✅ Suporte a múltiplos formatos de imagem
- ✅ Interface responsiva para dispositivos móveis e desktop
- ✅ Melhorias de UX no fluxo de upload
- ✅ Confirmação de exclusão com diálogo de alerta
- ✅ Visualização em tela cheia das imagens
- ✅ Carregamento lazy de imagens com indicador de progresso

### Próximos Passos
- 🔜 Sistema de autenticação e multi-usuários (Fase 2)
- 🔜 Registrar domínio favoriteperson.app
- 🔜 Implementação de recursos premium e monetização 