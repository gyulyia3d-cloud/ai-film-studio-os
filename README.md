# AI Film Studio OS — protótipo (Núcleo Criativo)

SaaS de desenvolvimento criativo e pré-produção audiovisual baseado em IA. Este
repositório contém o **MVP de validação**: onboarding inteligente + uma
writers' room multiagente (Diretor, Roteirista, Script Doctor, Produtor
Executivo) que transforma uma ideia em logline, sinopse, tratamento, beat
sheet, personagens e um outline de roteiro — com memória por projeto e
exportação em Markdown.

Fora de escopo neste MVP (propositalmente): geração de imagem/vídeo,
moodboards visuais, shot list, orçamento/cronograma detalhado, exportação
Final Draft/Fountain, billing e múltiplos usuários por projeto.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript, Tailwind CSS v4)
- [Supabase](https://supabase.com) (Postgres + Auth) para persistência e login
- [Claude API](https://console.anthropic.com) (Anthropic SDK) orquestrando os agentes

## Como rodar localmente

### 1. Crie um projeto no Supabase

1. Crie um projeto em https://supabase.com/dashboard.
2. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.
3. Em **SQL Editor**, rode o conteúdo de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   para criar as tabelas (`projects`, `project_briefs`, `documents`, `agent_runs`) e as
   policies de RLS (cada usuário só acessa os próprios projetos).
4. (Opcional, recomendado para testar sozinha) Em **Authentication → Providers → Email**,
   desative a confirmação por email para não precisar clicar em link de confirmação
   a cada conta de teste.

### 2. Pegue uma chave da Anthropic

Crie uma chave em https://console.anthropic.com/settings/keys.

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e
`ANTHROPIC_API_KEY` no `.env.local`.

### 4. Instale e rode

```bash
npm install
npm run dev
```

Abra http://localhost:3000, crie uma conta em `/signup` e clique em
"+ Novo projeto".

## Fluxo do MVP

1. **Onboarding** — chat guiado pela IA (papel de Produtor Executivo) até montar
   um brief estruturado (objetivo, público, formato, orçamento, prazo, idioma,
   referências, estilo narrativo, recursos e pipeline de produção).
2. **Writers' Room** — pipeline sequencial de agentes (`src/lib/agents/pipeline.ts`):
   Diretor define a visão criativa → Roteirista escreve o pacote narrativo completo
   → Script Doctor refina ritmo/subtexto/estrutura → Produtor Executivo ajusta
   viabilidade frente ao brief. O progresso é transmitido em tempo real via streaming.
3. **Painel do projeto** — abas com Logline, Sinopse, Tratamento, Beat Sheet,
   Personagens e Roteiro, com exportação em Markdown.

## Estrutura relevante

```
src/
  app/
    login/, signup/          # autenticação
    dashboard/                # lista de projetos e página de cada projeto
    api/
      projects/                        # criar projeto
      onboarding/                      # turno de chat do onboarding
      projects/[id]/generate/          # streaming da writers' room (SSE)
      projects/[id]/export/            # export em Markdown
  components/                 # Chat, WritersRoom, MarkdownView, Nav, etc.
  lib/
    agents/
      prompts.ts               # system prompts de cada papel
      onboarding.ts            # lógica do turno de onboarding
      pipeline.ts               # orquestrador da writers' room
    supabase/                  # clients browser/server
    types.ts
supabase/migrations/0001_init.sql  # schema do banco
```

## Próximos passos sugeridos (pós-validação do MVP)

- Moodboards e prompts detalhados para Midjourney/Flux/Runway/Veo/Kling
- Shot list, decupagem técnica, plano de filmagem e orçamento estimado
- Exportação para Final Draft (.fdx) e Fountain
- Versionamento completo com diff entre versões dos documentos
- Multi-usuário/colaboração por projeto e billing
