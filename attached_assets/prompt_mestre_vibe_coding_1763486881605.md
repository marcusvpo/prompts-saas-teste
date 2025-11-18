# PROMPT MESTRE EXTREMAMENTE COMPLETO
## Framework de Desenvolvimento Aumentado com Vibe Coding

**Data:** 18 de Novembro, 2025  
**Versão:** 1.0  
**Metodologia:** Desenvolvimento Aumentado + Vibe Coding + Context Layering  
**Público:** Plataformas de AI Coding (Lovable AI, Cursor AI, v0.dev)

---

## 🎯 CONTEXTO GERAL E FILOSOFIA

Você está trabalhando com um Framework Mestre de Desenvolvimento Aumentado, que é uma abordagem profissional e rigorosa para geração de código assistida por IA. Este não é Vibe Coding amador ("se funcionar, está bom"). 

**A Filosofia:**
- O desenvolvedor "esquece que o código existe" e foca em descrever intenção via linguagem natural
- A IA não é um oráculo mágico, mas um "membro sênior da equipe" que requer briefing preciso
- Ambiguidade é amplificada pela IA → clareza estratégica é o PRIMEIRO requisito técnico
- Estrutura em 4 módulos sequenciais: Estratégia → Design → Engenharia de Prompt → Execução

**Context Layering (Empilhamento de Contexto):** Cada módulo gera artefatos que se tornam contexto imutável para o próximo módulo. Isso garante coerência conforme complexidade aumenta.

---

## 📋 ESPECIFICAÇÃO TÉCNICA DA PLATAFORMA

A plataforma que você deve construir é um **Guia Refinado Interativo** para estruturar prompts seguindo este Framework. É essencialmente um "assistente de vibe coding" que ensina o usuário A PENSAR de forma estruturada.

### Requisitos Funcionais Principais:

1. **Gestão de Projetos**
   - Criar novo projeto (somente título inicialmente)
   - Listar projetos existentes
   - Exibir roadmap completo do framework por projeto

2. **Roadmap Modular Vertical**
   - 4 módulos principais (I-IV) exibidos como etapas de uma jornada vertical
   - Cada módulo contém múltiplas fases
   - Cada fase tem instruções, template de prompt e campos para preenchimento
   - Indicador visual de progresso (concluído / em progresso / não iniciado)

3. **Templates e Prompts Pré-criados**
   - Instruções exatas para cada etapa (do PDF framework)
   - Templates de prompts para cada fase
   - Exemplos de output esperado
   - Restrições e constraints de cada etapa

4. **Persistência de Dados**
   - Salvar anotações, prompts criados, respostas e artefatos
   - Editar conteúdo criado
   - Exportar projeto completo (JSON ou MD)

5. **Design e UX**
   - Simples, intuitivo, moderno
   - Minimalista (sem excesso de elementos)
   - Light Mode / Dark Mode
   - Responsivo (mobile-friendly)

### Stack Tecnológica Recomendada:
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend/Database:** Supabase (PostgreSQL) - SEM Auth RLS por enquanto
- **UI Components:** shadcn/ui
- **Deployment:** Vercel

### Banco de Dados (Supabase):

Tabelas necessárias:

```sql
-- Projetos do usuário
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Módulos e fases preenchidas
CREATE TABLE module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  module_number INT NOT NULL (1-4),
  module_title TEXT NOT NULL,
  phase_number INT NOT NULL,
  phase_title TEXT NOT NULL,
  content TEXT,
  prompt_created TEXT,
  status TEXT DEFAULT 'not_started',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Artefatos mestres (PRD, Style Guide, etc)
CREATE TABLE master_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL,
  artifact_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notas e anotações do usuário
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🏗️ ARQUITETURA DA INTERFACE

### Layout Principal (Vertical Roadmap):

```
┌─────────────────────────────────────────────────────┐
│                      HEADER                          │
│  Logo | Projeto: [Selecionado] | Dark Mode Toggle  │
└─────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                 BARRA LATERAL (LEFT)                 │
│                                                       │
│  📁 PROJETOS                                          │
│   ├─ [Projeto 1]  ✅                                 │
│   ├─ [Projeto 2]  🔄                                 │
│   └─ [+ Novo Projeto]                               │
│                                                       │
│  📊 PROGRESSO: 35%                                   │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                  ÁREA PRINCIPAL (CENTER)             │
│                                                       │
│  ROADMAP FRAMEWORK VERTICAL                          │
│                                                       │
│  ┌─ MÓDULO I: Estratégia                            │
│  │  ├─ [Fase 1] PRD            ⭕ Em Progresso     │
│  │  ├─ [Fase 2] Análise Comp.  ⭕ Em Progresso     │
│  │  └─ [Expandir para editar]                       │
│  │                                                   │
│  ├─ MÓDULO II: Design          ⭕ Não Iniciado    │
│  │  ├─ [Fase 1] Vibe -> Style  ⭕ Bloqueado        │
│  │  ├─ [Fase 2] Motion UX      ⭕ Bloqueado        │
│  │  └─ [Fase 3] Acessibilidade ⭕ Bloqueado        │
│  │                                                   │
│  ├─ MÓDULO III: Eng. Prompt    ⭕ Não Iniciado    │
│  │  └─ [...]                                        │
│  │                                                   │
│  └─ MÓDULO IV: Execução        ⭕ Não Iniciado    │
│     └─ [...]                                        │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### Quando Usuário Clica em uma Fase:

```
┌──────────────────────────────────────────────────────┐
│  MÓDULO I / FASE 1: PRD - Geração do Artefato Mestre│
├──────────────────────────────────────────────────────┤
│                                                       │
│  📝 INSTRUÇÕES:                                      │
│  "O PRD funciona como memória de longo prazo inicial│
│   da IA. Use uma LLM como 'Arquiteto de Soluções   │
│   Sênior'. Esta é uma etapa CRÍTICA."              │
│                                                       │
│  🎯 OBJETIVO:                                       │
│  Gerar um Documento de Requisitos de Produto       │
│  contendo: Personas, User Flows, Funcionalidades, │
│  Esquema de Dados, Stack Tecnológica               │
│                                                       │
│  ╔═══════════════════════════════════════════════╗  │
│  ║ TEMPLATE DE PROMPT (CLICÁVEL PARA COPIAR)    ║  │
│  ╚═══════════════════════════════════════════════╝  │
│                                                       │
│  "Atue como um Arquiteto de Soluções Sênior.      │
│   Com base na visão do projeto: '[VISÃO]',        │
│   gere um PRD estruturado contendo:                │
│   1) Personas detalhadas...                        │
│   [...]"                                            │
│                                                       │
│  📌 EXEMPLO DE OUTPUT ESPERADO:                    │
│  [Exemplo expandível]                              │
│                                                       │
│  💾 SALVAR PROGRESSO                               │
│  ┌─────────────────────────────────────────────┐  │
│  │ Você já preencheu esta fase? Salve aqui:  │  │
│  │ [Textarea para copiar/colar PRD gerado]   │  │
│  │ [Botão: Salvar PRD] [Botão: Sair]        │  │
│  └─────────────────────────────────────────────┘  │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## 📊 CONTEÚDO DETALHADO POR MÓDULO

### MÓDULO I: ESTRATÉGIA E ENGENHARIA DE REQUISITOS

**Foco:** Porquê e O Quê  
**Artefato de Saída:** Contexto I - PRD (Product Requirements Document)

#### FASE 1.1: Geração do PRD como Artefato Mestre de Contexto

**Instrução Base:**
> O PRD funciona como a "memória de longo prazo" inicial da IA. Ele não é um guia para humanos, mas o primeiro Artefato de Contexto. A inovação crítica é a RECURSIVIDADE: usar IA para gerar o contexto que alimentará a própria IA. Isso garante alinhamento linguístico e estrutural.

**Template de Prompt:**
```
Atue como um Arquiteto de Soluções Sênior.

Com base na visão do projeto: "[VISÃO DO USUÁRIO]"

Gere um PRD (Product Requirements Document) estruturado que contenha:

1. PERSONAS E AUDIÊNCIA
   - Crie 2-3 personas detalhadas incluindo:
     * Dados demográficos
     * Comportamentos e motivações
     * Dores e frustrações
     * Objetivos principais
   - O Design Centrado no Usuário deve estar no centro do processo

2. JORNADA DO USUÁRIO (USER FLOW)
   - Descreva o caminho crítico do usuário
   - Identifique explicitamente "pontos de frustração"
   - Identifique "oportunidades de melhoria"
   - Não apenas replique fluxos padrão, otimize para experiência

3. FUNCIONALIDADES PRIORITÁRIAS
   - Lista de features ordenadas por impacto
   - MVP (Minimum Viable Product) vs Nice-to-Have
   - Critérios de aceitação para cada feature

4. ESQUEMA DE DADOS INICIAL
   - Entidades principais e relacionamentos
   - Tipos de dados para cada campo
   - Restrições e validações

5. STACK TECNOLÓGICA RECOMENDADA
   - Frontend: React + TypeScript + Tailwind CSS
   - Backend: Supabase (PostgreSQL)
   - Componentes: shadcn/ui
   - Bibliotecas adicionais conforme necessário

Formato: Documento estruturado em Markdown com seções claras e exemplos.
```

**Checklist de Validação:**
- [ ] Personas descrevem usuários reais, não personas genéricas
- [ ] User Flow identifica 3+ pontos de frustração
- [ ] Funcionalidades estão priorizadas por valor
- [ ] Esquema de dados é claro e escalável
- [ ] Stack escolhida é justificada

---

#### FASE 1.2: Análise Competitiva e Princípios de Mercado

**Instrução Base:**
> Uma etapa frequentemente negligenciada em Vibe Coding amador. Aqui, você aprenderá com concorrentes existentes usando Few-Shot Learning implícito. Isso carrega em seu contexto padrões de design e funcionalidades consideradas "padrão de indústria".

**Template de Prompt:**
```
Atue como um Analista de Mercado Estratégico.

Você deve analisar três aplicativos concorrentes líderes no espaço de: "[CATEGORIA/MERCADO]"

Aplicativos a analisar:
1. [APLICATIVO 1]
2. [APLICATIVO 2]
3. [APLICATIVO 3]

Para cada aplicativo, identifique:

1. PONTOS FORTES EM UX/UI
   - Quais funcionalidades / patterns funcionam bem?
   - Por que eles melhoram a experiência?

2. PONTOS FRACOS
   - Quais são os gargalos?
   - Que frustrações causam aos usuários?

3. PADRÕES DE ACESSIBILIDADE
   - Como implementam WCAG?
   - Quais são as lacunas?

4. GAPS E OPORTUNIDADES NÃO EXPLORADAS
   - O que todos fazem igual (commoditized)?
   - O que ninguém faz bem?
   - Onde há espaço para inovação?

OUTPUT FINAL - 5 PRINCÍPIOS DE DESIGN ACIONÁVEIS:
Baseado na análise, extraia 5 princípios que nosso produto deve:
- ADOTAR (best practices confirmadas)
- EVITAR (armadilhas comuns)
- INOVAR (gaps identificados)

Cada princípio deve ser concreto e acionável para a implementação.
```

**Checklist de Validação:**
- [ ] Análise é objetiva, não opinativa
- [ ] Gaps identificados são reais e validáveis
- [ ] Princípios são específicos, não genéricos
- [ ] Princípios dirão a IA O QUE FAZER no design/código

---

### MÓDULO II: BLUEPRINT DE DESIGN UX/UI

**Foco:** Materialização da "Vibe"  
**Artefato de Saída:** Contexto II - Style Guide + Design System

#### FASE 2.1: Do Sentimento ao Style Guide

**Instrução Base:**
> Vibe Design desafia a abordagem design-first rígida tradicional. A interface deve emergir do sentimento desejado. Você traduzirá adjetivos abstratos em especificações de UI concretas.

**Template de Prompt:**
```
Atue como um Especialista em Vibe Design.

A intenção emocional do produto é transmitir:
[ADJETIVOS: ex: "segurança e institucionalidade", "agilidade e modernidade", "diversão e criatividade"]

Com base nesta "vibe", gere um STYLE GUIDE profissional que contenha:

1. PALETA DE CORES
   - Cor Primária: [Descrição semântica e HEX]
     Justificativa: Por que ela transmite a vibe?
   - Cor Secundária: [HEX]
   - Cores Destrutivas (erro/aviso/sucesso): [HEXs]
   - Cores de Status (info/pending/disabled): [HEXs]
   - Cores Neutras (backgrounds, borders): [HEXs]

2. TIPOGRAFIA
   - Font Family Principal: [Nome]
     Justificativa: Reflete a vibe porque...
   - Font Family Secundária/Monospace: [Nome]
   - Escalas de Tamanho: [xs, sm, base, md, lg, xl, 2xl, 3xl, 4xl]
   - Pesos: [normal: 400, medium: 500, semibold: 550, bold: 600]
   - Line-Height padrão: [1.2 tight, 1.5 normal]

3. COMPONENTIZAÇÃO (Tailwind CSS + shadcn/ui)
   - Buttons (primary, secondary, outline, danger)
     Especificação completa (padding, border-radius, hover, active states)
   - Inputs e Textareas
     Placeholder text style, focus states, validation states
   - Cards e Containers
     Border radius, shadows, spacing
   - Modals / Dialogs
     Overlay opacity, backdrop blur, animations
   - Forms
     Label style, error messages, success states

4. ELEVAÇÃO / SOMBRAS
   - Shadows para criar hierarquia visual
   - Depth levels (xs, sm, md, lg)

5. ESPAÇAMENTO (Spacing Scale)
   - Define todos os valores de margin/padding usados no projeto
   - Ex: 0, 1px, 2px, 4px, 6px, 8px, 12px, 16px, 20px, 24px, 32px

6. BORDER RADIUS
   - xs: 6px (small elements)
   - base: 8px (standard)
   - md: 10px (larger elements)
   - lg: 12px (containers)
   - full: 9999px (pills)

WIREFRAMES VISUAIS:
- Gere wireframes de alta fidelidade para:
  * Página inicial / dashboard
  * Formulário principal
  * Modal de sucesso/erro
  
Use v0.dev ou ASCII art detalhado para representação.

OUTPUT: Arquivo CSS Tailwind completo com variáveis CSS personalizadas
que implementam este Design System.
```

**Checklist de Validação:**
- [ ] Cores transmitem a vibe/emoção intencionada
- [ ] Tipografia é legível e coerente
- [ ] Componentes seguem biblioteca padrão (shadcn/ui)
- [ ] Espaçamento cria ritmo visual
- [ ] Wireframes validam a estética

---

#### FASE 2.2: Motion UX e Microcopy

**Instrução Base:**
> Motion UX e Microcopy não são ornamentos, mas componentes funcionais críticos. Eles transmitem a agilidade percebida e a empatia do sistema.

**Template de Prompt:**
```
Atue como um Especialista em UX Microinteractions e Tone of Voice.

Com base no Style Guide anterior e na persona do usuário: "[PERSONA]"

Gere especificações de:

1. MOTION UX (Usando Framer Motion)
   
   a) Carregamentos
      - Skeleton loaders vs. spinners: qual é mais apropriado?
      - Duração de animação: [200-400ms]
      - Easing: spring vs. easeInOut
      
   b) Feedback Visual
      - Ao clicar botão: scale feedback
      - Ao enviar forma: success toast com duração
      - Ao erro: shake animation ou color pulse
      
   c) Transições de Página/Modal
      - Entrada: fade-in ou slide-up?
      - Duração: [300-500ms]
      - Stagger para múltiplos elementos?
      
   d) Hover/Focus States
      - Elevação ao passar mouse
      - Color shift
      - Underline animation em links
      
   Cada animação deve transmitir "[VIBE]" - rápida/segura/lúdica

2. MICROCOPY (Redação de Interface)
   
   a) Mensagens de Erro
      - Evite: "Error 404"
      - Prefira: "Não conseguimos encontrar esta página. [Link: Voltar ao início]"
      
   b) Placeholders
      - Input de email: "seu.email@exemplo.com"
      - Input de data: "dd/mm/yyyy"
      - Textarea: "Descreva seu projeto em detalhes..."
      
   c) Botões
      - Primário: [Ação positiva e clara]
      - Secundário: [Alternativa]
      - Destrutivo: "Deletar para sempre"
      
   d) Toasts e Notificações
      - Sucesso: "✅ Perfil atualizado com sucesso!"
      - Aviso: "⚠️ Esta ação não pode ser desfeita"
      - Erro: "❌ Algo deu errado. Tente novamente"
      
   e) Estados Vazios
      - "Nenhum projeto criado ainda"
      - "Comece criando seu primeiro projeto"
      - "[+ Novo Projeto]"

Tonalidade: [PERSONA define tom: formal/casual/amigável/técnico]

OUTPUT:
- Código React/Framer Motion implementando 3-5 microinterações
- Arquivo CSV ou JSON com todas as strings de microcopy
```

**Checklist de Validação:**
- [ ] Animações reforçam a vibe (rápidas/lentas conforme apropriado)
- [ ] Microcopy é empática, não robótica
- [ ] Todas as states (loading, error, success, empty) estão cobertas
- [ ] Duração de animações está na faixa 200-500ms

---

#### FASE 2.3: Acessibilidade como Restrição de Ancoragem

**Instrução Base:**
> WCAG não é um checklist pós-desenvolvimento. É uma RESTRIÇÃO INQUEBÁVEL injetada desde o design. Isso garante que o código nasça inclusivo.

**Template de Prompt:**
```
Atue como um Auditor de Acessibilidade WCAG 2.1 Nível AA.

Revise o Style Guide e layouts propostos anteriormente.

Verifique conformidade em:

1. CONTRASTE DE CORES
   - Texto normal: 4.5:1 (AA), 7:1 (AAA)
   - Texto grande: 3:1 (AA), 4.5:1 (AAA)
   - Componentes UI (borders, icons): 3:1
   Tool: WebAIM Contrast Checker
   CORREÇÕES NECESSÁRIAS: [Listar]

2. NAVEGAÇÃO POR TECLADO
   - Todos os elementos interativos são alcançáveis via Tab
   - Tab order é lógico (esquerda → direita, topo → base)
   - Focus estado é visível (outline claro)
   - Shortcuts de teclado funcionam (Enter, Space, Escape)

3. ATRIBUTOS ARIA
   - aria-label para ícones sem texto
   - aria-describedby para inputs com instruções
   - aria-live para notificações dinâmicas
   - role="button" para elementos clickáveis não-nativos

4. COMPATIBILIDADE COM LEITORES DE TELA
   - Estrutura HTML semântica (<header>, <nav>, <main>, <article>)
   - Headings hierárquicos (h1, h2, h3...)
   - Alt text descritivo para imagens
   - Não usar "clique aqui" em links genéricos

5. SUPORTE A ZOOM
   - Interface permanece usável em 200% zoom
   - Sem overflow horizontal

OUTPUT:
- Relatório de Conformidade WCAG detalhado
- Lista de correções obrigatórias
- Código HTML/CSS corrigido demonstrando compliance

RESTRIÇÃO INQUEBÁVEL:
"Todo código gerado DEVE estar em conformidade WCAG AA mínimo.
Nenhuma exceção. Acessibilidade não é opcional."
```

**Checklist de Validação:**
- [ ] Contraste validado com WebAIM (≥ 4.5:1)
- [ ] Navegação por teclado 100% funcional
- [ ] ARIA attributes corretos e semânticos
- [ ] HTML estrutura é semântica
- [ ] Funciona com NVDA / VoiceOver

---

### MÓDULO III: ENGENHARIA DE PROMPT MESTRA

**Foco:** Orquestração Técnica  
**Artefato de Saída:** Contexto III - Prompts Mestres Estruturados

#### FASE 3.1: Estruturas de Prompt - RTCF

**Instrução Base:**
> RTCF (Role, Task, Context, Format) é a fórmula fundamental para precisão. Cada elemento "prima" o modelo a acessar subconjuntos específicos do treinamento.

**Template de Prompt:**
```
Atue como um Engenheiro de Prompt Mestre.

Você deve estruturar prompts para máxima clareza e precisão usando RTCF:

RTCF = Role + Task + Context + Format

Para a seguinte instrução: "[INSTRUÇÃO DO USUÁRIO]"

Gere um prompt estruturado RTCF:

1. ROLE (Papel)
   - Qual persona da IA é mais apropriada?
   - Ex: "Arquiteto Sênior de React", "Engenheiro de QA", "Designer UX"
   - Justificativa: Por que este papel "pré-carrega" o conhecimento certo?

2. TASK (Tarefa)
   - Qual é o objetivo explícito e acionável?
   - Seja específico: "Implementar componente de login" não "criar código"
   - Resultado esperado: O que exatamente a IA deve produzir?

3. CONTEXT (Contexto)
   - PRD relevante: [Resumo breve]
   - Style Guide relevante: [Resumo breve]
   - Stack tecnológica: [Tecnologias específicas]
   - Padrões arquiteturais: [Convenções do projeto]
   - Arquivo de Pattern Seed (exemplo de código ideal): [Link/Referência]

4. FORMAT (Formato)
   - Linguagem de programação: [TypeScript/JavaScript/etc]
   - Estrutura de arquivos: [Arquivos separados? Componente único?]
   - Comentários: [Explicativos? Densos?]
   - Testes: [Jest/Vitest? Qual cobertura?]
   - Documentação: [JSDoc? README?]

OUTPUT FINAL - PROMPT RTCF COMPLETO:

"Atue como [ROLE].

Sua tarefa é [TASK].

CONTEXTO:
- PRD: [Contexto relevante]
- Design System: [Cores, tipografia, componentes]
- Stack: [Tecnologias]
- Padrões: [Conveções]

FORMATO ESPERADO:
[Descrição detalhada do output esperado]

Comece agora."
```

**Checklist de Validação:**
- [ ] Role é específico (não "desenvolvedor", mas "Arquiteto React")
- [ ] Task é acionável (tem output claro)
- [ ] Context contém PRD, Style Guide, Stack, Patterns
- [ ] Format especifica linguagem, estrutura, testes

---

#### FASE 3.2: Estruturas de Prompt - CRISPA

**Instrução Base:**
> CRISPA é uma versão expandida que não esquece de nenhuma dimensão: Capacidade, Requerimento, Informação, Sistema, Perspectiva, Audiência.

**Template de Prompt:**
```
Atue como um Engenheiro de Prompt Avançado.

CRISPA = Capacidade + Requerimento + Informação + Sistema + Perspectiva + Audiência

Para a seguinte instrução: "[INSTRUÇÃO DO USUÁRIO]"

Gere um prompt estruturado CRISPA:

1. CAPACIDADE
   - Quais habilidades específicas a IA precisa usar?
   - Ex: "Compreensão de TypeScript strict", "Design de arquitetura React"

2. REQUERIMENTO
   - Requisitos funcionais específicos
   - Ex: "Componente deve suportar 5+ tamanhos"

3. INFORMAÇÃO
   - Dados contextuais a fornecer
   - Ex: "Incluir PRD na íntegra", "Listar tipos TypeScript"

4. SISTEMA
   - Restrições sistêmicas (bibliotecas, convenções)
   - Ex: "Usar APENAS shadcn/ui", "Sem 'any' em TypeScript"

5. PERSPECTIVA
   - Modo de pensamento específico
   - Ex: "Chain-of-Thought: pense passo a passo", "Defensive programming"

6. AUDIÊNCIA
   - Quem consumirá o output?
   - Ex: "Para desenvolvedores inexperientes", "Para code review"

OUTPUT FINAL - PROMPT CRISPA COMPLETO:

"Sua CAPACIDADE deve incluir: [...]
REQUERIMENTO funcional: [...]
INFORMAÇÃO a considerar: [...]
SISTEMA e restrições: [...]
PERSPECTIVA e modo de pensamento: [...]
AUDIÊNCIA alvo: [...]"
```

**Checklist de Validação:**
- [ ] Todos os 6 elementos de CRISPA estão cobertos
- [ ] Sistema/restrições são explicitas (NUNCA implícitas)
- [ ] Perspectiva força melhor raciocínio (Chain-of-Thought)

---

#### FASE 3.3: Context Layering - Empilhamento de Contexto

**Instrução Base:**
> Context Layering é a técnica mais sofisticada. Você estrutura informação em camadas hierárquicas para que a IA execute triangulação (negócio + design + técnica + operacional).

**Template de Prompt:**
```
Atue como um Arquiteto de Contexto.

CONTEXT LAYERING = 5 Camadas Hierárquicas

Você deve estruturar o contexto do projeto em 5 camadas para máxima coerência:

CAMADA 1 - CONTEXTO DE NEGÓCIO
   - PRD completo (personas, user flows, features, dados)
   - Problema a ser resolvido
   - Sucesso do projeto = O quê?
   Responsabilidade: Defini O O QUÊ

CAMADA 2 - CONTEXTO DE DESIGN
   - Style Guide (cores, tipografia, componentes)
   - Motion UX especificações
   - Microcopy e tom de voz
   - Acessibilidade (WCAG AA)
   Responsabilidade: Define O COMO SE PARECE

CAMADA 3 - CONTEXTO TÉCNICO
   - Stack technológico (React, TypeScript, Supabase, Tailwind)
   - Padrões arquiteturais (pastas, naming, estrutura)
   - Pattern Seeds (exemplos de código ideal)
   - Constraint Anchoring (regras inquebráveis)
   Responsabilidade: Define O COMO SE IMPLEMENTA

CAMADA 4 - CONTEXTO OPERACIONAL
   - Estado atual do código (arquivos existentes)
   - Estrutura do projeto (package.json, tsconfig.json)
   - Commits recentes (para entender evolução)
   - Dependências e versões
   Responsabilidade: Mantém CONTINUIDADE entre sessões

CAMADA 5 - META-PROMPTING
   - Refinamento automático de prompts
   - Feedback loops
   - Validação de qualidade iterativa
   Responsabilidade: OTIMIZA a qualidade de instrução

TRIANGULAÇÃO = IA entende simultaneamente:
   ✓ O requisito de negócio (Camada 1)
   ✓ Como deve parecer (Camada 2)
   ✓ Como deve ser implementado (Camada 3)
   ✓ O que já existe (Camada 4)

OUTPUT:
- Estrutura de contexto documentada em 5 seções
- Cada seção com conteúdo específico a anexar
- Ordem correta de empilhamento
```

**Checklist de Validação:**
- [ ] Todas as 5 camadas estão documentadas
- [ ] Conteúdo de cada camada é relevante e não redundante
- [ ] Ordem de empilhamento é lógica
- [ ] IA consegue fazer triangulação (negócio + design + técnica)

---

#### FASE 3.4: Constraint Anchoring e Pattern Seeds

**Instrução Base:**
> Constraint Anchoring = regras inquebráveis. Pattern Seeds = exemplos de código ideal. Juntos, controlam qualidade e segurança.

**Template de Prompt:**
```
Atue como um Guardião da Qualidade e Segurança.

CONSTRAINT ANCHORING = Regras Inquebráveis

Defina restrições para o projeto que são IMPOSSÍVEIS violar:

EXEMPLOS DE CONSTRAINTS:

TYPESCRIPT:
  - Nunca usar 'any' type
  - Strict mode = true SEMPRE
  - Null checks explícitos
  - Types para funções e variáveis

SEGURANÇA:
  - Validação de input obrigatória
  - NUNCA armazenar secrets em código
  - NUNCA usar eval() ou innerHTML para dados do usuário
  - OWASP Top 10 compliance

ACESSIBILIDADE:
  - WCAG AA mínimo SEMPRE
  - Atributos ARIA onde necessário
  - Alt text para imagens

ARQUITETURA:
  - Componentes < 300 linhas
  - Uma responsabilidade por módulo
  - Sem imports circulares

ESTILOS:
  - APENAS Tailwind CSS
  - APENAS componentes shadcn/ui
  - Sem CSS customizado para UI base

SUAS CONSTRAINTS:
[Listar 8-12 constraints específicas do projeto]

---

PATTERN SEEDS = Exemplos de Código Ideal

Forneça exemplos de como código DEVE ser escrito:

EXEMPLO 1: React Component Bem Estruturado
```typescript
import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';

interface ProjectFormProps {
  onSubmit: (title: string) => Promise<void>;
}

export const ProjectForm: FC<ProjectFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(title);
      setTitle('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nome do projeto..."
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Project title"
        disabled={isLoading}
      />
      {error && <span className="text-red-500 text-sm">{error}</span>}
      <Button type="submit" disabled={isLoading} isLoading={isLoading}>
        {isLoading ? 'Criando...' : 'Criar Projeto'}
      </Button>
    </form>
  );
};
```

EXEMPLO 2: Chamada Supabase Segura
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function createProject(title: string): Promise<Project> {
  if (!title || typeof title !== 'string') {
    throw new Error('Título inválido');
  }

  const { data, error } = await supabase
    .from('projects')
    .insert([{ title: title.trim() }])
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar projeto: ${error.message}`);
  }

  return data;
}
```

OUTPUT:
- 3-5 Pattern Seeds mostrando code ideal
- Cada pattern comentado explicando por que está assim
- IA deve mimetizar este padrão SEMPRE
```

**Checklist de Validação:**
- [ ] 8-12 constraints definidas, específicas ao projeto
- [ ] Constraints cobrem TypeScript, Segurança, Acessibilidade, Arquitetura, Estilos
- [ ] 3-5 Pattern Seeds fornecidos e bem comentados
- [ ] Cada pattern é real e implementável

---

### MÓDULO IV: EXECUÇÃO E VALIDAÇÃO

**Foco:** Materialização e Ciclo Vibe Loop  
**Artefato de Saída:** Contexto IV - Código validado + Testes + Documentação

#### FASE 4.1: Vibe Loop - Ciclo de Correção Colaborativo

**Instrução Base:**
> Vibe Loop substitui debugging manual solitário por diálogo colaborativo. Quando erro ocorre, não mergulhe no código. Alimente o erro de volta para a IA com contexto.

**Template de Prompt:**
```
Atue como um Debugger Colaborativo e Engenheiro de Solução.

VIBE LOOP = Conversação Estruturada para Correção

Paradigma Tradicional: Escrever -> Compilar -> Depurar (solitário)
Paradigma Vibe Loop: Prompt -> Gerar -> Refletir -> Corrigir (colaborativo)

Quando receberá um erro, forneça:

1. STACK TRACE
   [Cole o erro completo aqui]

2. COMPORTAMENTO OBSERVADO
   "Quando clico em [ação], esperava [resultado], mas [o que realmente acontece]"

3. CAPTURA DE TELA (se visual)
   [Descrição do visual incorreto]

4. CONTEXTO
   "Este erro ocorre em [componente/função]"
   "Relacionado a [Módulo I/II/III feature]"

ESTRUTURA DE RESPOSTA DO DEBUGGER:

"🔍 ANÁLISE DA CAUSA RAIZ:
[Explicar por que o erro ocorreu]

💡 SOLUÇÃO PROPOSTA:
[Descrever a correção de alto nível]

✅ CÓDIGO CORRIGIDO:
[Apenas o trecho que precisa mudar]

🎯 VERIFICAÇÃO:
[Como validar que a correção funciona]

📋 GARANTIAS:
✓ Segue o padrão de codificação do projeto
✓ Mantém compatibilidade com Design System
✓ Não introduz dívida técnica"

IMPORTANTE: Nunca forneça "gambiarras" (quick fixes sujos).
SEMPRE alinhe a correção com:
  - Constraint Anchoring (regras inquebráveis)
  - Pattern Seeds (padrão de código)
  - Design System (estilos e componentes)
```

**Checklist de Validação:**
- [ ] Causa raiz está clara
- [ ] Solução não viola constraints
- [ ] Código segue Pattern Seeds
- [ ] Correção é permanente, não temporária

---

#### FASE 4.2: Chain-of-Thought Planejamento

**Instrução Base:**
> Antes de gerar grandes blocos de código, PLANEJE. Chain-of-Thought força a IA a externalizar raciocínio, melhorando drasticamente a qualidade.

**Template de Prompt:**
```
Atue como um Arquiteto de Implementação.

Sua tarefa é PLANEJAR antes de EXECUTAR.

Para a seguinte funcionalidade: "[FUNCIONALIDADE/REQUISITO]"

PLANEJAMENTO - Responda passo a passo (ANTES de gerar código):

1. ARQUIVOS
   - Quais arquivos precisam ser criados?
   - Quais precisam ser modificados?
   - Qual a estrutura final esperada?

2. COMPONENTES / FUNÇÕES
   - Quais componentes React serão criados?
   - Quais funções utilitárias?
   - Interfaces/Types TypeScript necessários?

3. LÓGICA DE DADOS
   - Como os dados fluem?
   - Quais são as transformações?
   - Há queries Supabase? Quais serão?

4. FLUXO DE USUÁRIO
   - Passo 1: [ação do usuário]
   - Passo 2: [processamento]
   - Passo 3: [feedback visual]

5. INTEGRAÇÃO COM SISTEMA EXISTENTE
   - Há impacto em componentes existentes?
   - Novo estado global necessário?
   - Efeitos colaterais?

6. CONSIDERAÇÕES DE SEGURANÇA
   - Validação de input necessária?
   - Secrets envolvidos?

7. CONSIDERAÇÕES DE ACESSIBILIDADE
   - ARIA attributes necessários?
   - Navegação por teclado OK?

OUTPUT: Um plano detalhado em linguagem natural.
Apenas depois de EU VALIDAR este plano, você gerará o código.

Inicie o planejamento agora.
```

**Checklist de Validação:**
- [ ] Arquivos e estrutura estão claros
- [ ] Fluxo de usuário está mapeado
- [ ] Impactos em sistema existente identificados
- [ ] Segurança e acessibilidade consideradas

---

#### FASE 4.3: QA, Segurança e TDD

**Instrução Base:**
> IA não apenas escreve código. Ela também atua como QA, Auditor de Segurança e engenheiro de testes.

**Template de Prompt - QA:**
```
Atue como um Engenheiro de QA Sênior.

Você recebeu o seguinte código/funcionalidade: "[CÓDIGO OU DESCRIÇÃO]"

TESTE AS SEGUINTES DIMENSÕES:

1. CASOS FELIZES (Happy Path)
   - Cenário 1: Dados válidos, resultado esperado?
   - Cenário 2: Fluxo normal do usuário funciona?

2. EDGE CASES
   - Strings vazias?
   - Null/undefined?
   - Arrays vazios?
   - Valores extremos (números muito grandes)?

3. ERROS E EXCEÇÕES
   - O que acontece se [API falha]?
   - O que acontece se [banco de dados indisponível]?
   - Mensagem de erro é clara ao usuário?

4. PERFORMANCE
   - Há N+1 queries?
   - Rendering desnecessário?
   - Carregamento de dados é otimizado?

5. CONSISTÊNCIA
   - Estado é consistente após operações?
   - Dados em cache estão sincronizados?

OUTPUT:
- Lista de bugs encontrados (se houver)
- Lista de testes a adicionar
- Recomendações de melhoria
```

**Template de Prompt - Segurança:**
```
Atue como um Auditor de Segurança Sênior.

AUDITORIA DE SEGURANÇA - Código: "[CÓDIGO]"

VERIFICAÇÕES OWASP TOP 10:

1. INJEÇÃO
   - SQL Injection? (Supabase parameterized queries?)
   - NoSQL Injection?
   - Command Injection?

2. XSS (Cross-Site Scripting)
   - Dados do usuário são escapados?
   - innerHTML usado com dados não-trusted?
   - Content Security Policy em place?

3. AUTENTICAÇÃO
   - Tokens armazenados seguramente?
   - Expiração de sessão?
   - Password reset seguro?

4. QUEBRA DE CONTROLE DE ACESSO
   - Dados privados protegidos por RLS?
   - Usuário A não consegue acessar dados de Usuário B?

5. CONFIGURAÇÃO DE SEGURANÇA
   - Variáveis de ambiente não expostas?
   - API keys não hardcoded?
   - CORS configurado corretamente?

6. CRIPTOGRAFIA
   - Dados em trânsito (HTTPS)?
   - Dados sensíveis em repouso (criptografados)?

OUTPUT:
- Vulnerabilidades encontradas (severidade: crítica, alta, média, baixa)
- Recomendações de correção com código
```

**Template de Prompt - TDD:**
```
Atue como um Engenheiro de Testes Unitários.

GERE TESTES COMPLETOS para o seguinte código: "[CÓDIGO/FUNÇÃO]"

USANDO: Jest ou Vitest

COBERTURA:

1. TESTES DE CASO FELIZ (Happy Path)
   describe('Component/Function X', () => {
     it('should [comportamento esperado]', () => {
       // Arrange
       // Act
       // Assert
     });
   });

2. TESTES DE EDGE CASES
   it('should handle empty string', () => { ... });
   it('should handle null values', () => { ... });

3. TESTES DE ERRO
   it('should throw error when [condição]', () => { ... });

4. MOCKS E FIXTURES
   - Mock de Supabase calls
   - Fixture de dados de teste

TARGET: >80% code coverage

OUTPUT:
- Arquivo .test.ts/.spec.ts completo
- Pronto para rodar: npm test
```

**Checklist de Validação:**
- [ ] QA cobriu happy path, edge cases, errors
- [ ] Segurança verificou OWASP Top 10
- [ ] Testes têm >80% cobertura
- [ ] Testes são descritivos (bom nome, claro intent)

---

#### FASE 4.4: CI/CD e Deploy

**Instrução Base:**
> Código não é "pronto" até ser deployado. Configure automação para testes, build e deploy.

**Template de Prompt:**
```
Atue como um Engenheiro de DevOps.

CONFIGURE PIPELINE CI/CD para [PLATAFORMA: Vercel/Netlify]

PIPELINE STAGES:

1. TRIGGER
   - On push to main branch
   - On pull request

2. INSTALL & LINT
   npm install
   npm run lint

3. BUILD
   npm run build
   
   Falhar se: TypeScript errors, build fails

4. TEST
   npm test -- --coverage
   
   Falhar se: Coverage < 80%

5. SECURITY SCAN
   npm audit (ou similar)
   
   Falhar se: Vulnerabilidades críticas/altas

6. DEPLOY
   Deploy to Vercel/Netlify
   
   Configurar:
   - Environment variables (NEXT_PUBLIC_SUPABASE_URL, etc)
   - Build command: npm run build
   - Output directory: .next

7. POST-DEPLOY
   - Run smoke tests
   - Notify on Slack/Email

ARQUIVOS DE CONFIGURAÇÃO:

- vercel.json (ou netlify.toml)
- .github/workflows/ci.yml (se usando GitHub Actions)
- .env.example (documenta variáveis necessárias)

OUTPUT:
- Arquivo de configuração completo
- Instruções para setup
```

**Checklist de Validação:**
- [ ] CI/CD pipeline está documentado
- [ ] Linting, testes, build rodam automaticamente
- [ ] Environment variables são seguros (não hardcoded)
- [ ] Deploy é automático em main branch

---

## 🎓 FLUXO COMPLETO DO USUÁRIO NA PLATAFORMA

### Cenário: Usuário cria novo projeto

1. **CRIA PROJETO**
   - Input: Título "Quiz Platform para Cartórios"
   - Sistema cria entrada em tabela `projects`
   - UI mostra novo projeto na sidebar

2. **EXPANDE MÓDULO I**
   - Usuário clica em "MÓDULO I: Estratégia"
   - Sistema exibe:
     - Instruções gerais do módulo
     - FASE 1.1 (PRD) com:
       - Explicação da fase
       - Template de prompt (copiável)
       - Exemplo de output
       - Campo para salvar PRD gerado

3. **PREENCHE FASE 1.1**
   - Usuário copia template de prompt
   - Envia para Claude/GPT/Gemini
   - Recebe PRD estruturado
   - Cola PRD no campo "Salvar PRD"
   - Clica "Salvar"
   - Sistema salva em `master_artifacts` table
   - UI marca FASE 1.1 como "✅ Concluída"

4. **CONTINUA PARA FASE 1.2**
   - Usuário clica em FASE 1.2 (Análise Competitiva)
   - Template solicita nomes de 3 competidores
   - Usuário entra apps, recebe análise
   - Salva

5. **DESBLOQUEIO DE MÓDULO II**
   - Uma vez Módulo I completo, Módulo II desbloqueado
   - Processo repete para cada fase

6. **MÓDULO III: ENGENHARIA DE PROMPT**
   - Sistema oferece RTCF vs CRISPA
   - Usuário pode gerar prompts mestres estruturados
   - Sistema mostra preview de prompt completo

7. **MÓDULO IV: EXECUÇÃO**
   - Usuário gera código usando prompts do Módulo III
   - Submete código para QA/Segurança/Testes
   - Sistema fornece checklist

---

## 🎨 DESIGN MINIMALISTA E MODERNO

**Princípios:**
- Sem excesso de elementos
- Hierarquia clara (títulos, subtítulos, conteúdo)
- Espaçamento generoso
- Cores significativas (sucesso = verde, erro = vermelho)
- Dark mode automático com toggle simples

**Componentes Principais:**
- Sidebar com lista de projetos
- Barra de progresso do roadmap
- Cards modulares para cada fase
- Modais para expansão de conteúdo
- Botões de ação simples

---

## 📝 CONCLUSÃO

Este é um **Prompt Mestre Extremamente Completo** que capacita uma IA a:

1. ✅ Entender 100% o Framework de Desenvolvimento Aumentado
2. ✅ Aplicar Vibe Coding de forma profissional e rigorosa
3. ✅ Gerar código de qualidade corporativa (seguro, testado, acessível)
4. ✅ Estruturar conhecimento em camadas de contexto
5. ✅ Iterar através de Vibe Loop colaborativo

**Próximas Etapas:**
1. Enviar este prompt + schema_framework.json para Lovable/Cursor/v0
2. Implementar plataforma seguindo especificações UI/UX
3. Integrar Supabase com tabelas definidas
4. Testar fluxo completo de criação de projeto → navegação roadmap

---

**Versão 1.0 | Framework Mestre de Desenvolvimento Aumentado**  
**Baseado em:** Relatório Compreensivo sobre Estruturas de Desenvolvimento Aumentado  
**Data de Criação:** 18 de Novembro, 2025
