# CLAUDE.md · Portfólio PINAS.studio

Site portfólio interativo do Kauê / PINAS.studio. Objetivo: marca pessoal + aquisição de clientes (meta: 2 clientes a R$ 1.500). Conversão: diagnóstico gratuito (`/questionario`) + WhatsApp.

## Leia antes de trabalhar
Vault: `G:\Users\kauek\Desktop\claude\AI Memory\AI Memory\`
- Plano do site (fonte da verdade): `01-Agencia/Portfolio-Site-Plano.md`
- Ficha da agência: `01-Agencia/_Agencia.md`
- Tom de voz: `01-Agencia/Processos/Tom-de-voz-e-prospeccao.md`
- Regras gerais: `CLAUDE.md` da vault
- Decisões: `01-Agencia/decisoes.md`

Se este arquivo discordar do plano, o plano vence.

## Economia de contexto
- Nunca reescrever arquivos inteiros nas respostas.
- Retornar só funções, métodos ou trechos modificados/adicionados.
- Direto e conciso, sem explicação teórica longa.
- Comentários curtos no código quando precisar explicar lógica.
- Erros de terminal: focar só nas linhas apontadas no stack trace.

## Regras de texto (obrigatórias)
- Português brasileiro, tom natural de dono para dono, frases curtas.
- **Nunca usar travessão (— ou –)** em copy, alt, meta tags, comentários visíveis. Use vírgula, ponto, dois-pontos ou parênteses.
- Sem cara de IA: nada de frases de efeito genéricas, trios de adjetivos, excesso de emoji/negrito, corporativês ("alavancar", "sinergia").
- Só números reais e verificáveis.
- **Nunca mostrar valores em dinheiro** (preço, verba, faturamento) no portfólio. Decisão do Kauê em 2026-10-29.
- Pink Luxo, Petiva, Bem Zanza são clientes da Alby: não expor nome/números sem confirmação do Kauê.

## Identidade
| Token | Hex | Uso |
|---|---|---|
| `--red` | `#E10600` | CTAs, palavras-chave, mascote |
| `--black` | `#0B0B0B` | fundos imersivos |
| `--paper` | `#F6F3EE` | fundos editoriais |
| `--graphite` | `#2A2A2A` | texto secundário, cards no escuro |
| `--yellow` | `#FFD23F` | só selos/adesivos, máx. 5% da tela |

- Fontes: display Bricolage Grotesque ExtraBold (ou Lilita One, a decidir), manuscrita Caveat Brush, texto Inter.
- Estilo: editorial + neo-brutalismo leve (contorno 3px, sombra dura, adesivos, grão). Ritmo preto, branco, preto.
- 1 ideia por tela, título máx. 6 palavras.

## Stack
- Astro + CSS próprio com tokens (`src/styles/global.css`), hospedagem Netlify. Formulário via Netlify Forms.
- GSAP + ScrollTrigger, Lenis. 3D: Three.js (máx. 1 cena WebGL por página, `.glb` < 1 MB).
- Projetos como conteúdo (Markdown/JSON com ficha fixa), admin via Decap CMS em `/admin`.
- Respeitar `prefers-reduced-motion`. Mobile: alvos ≥ 44px, LCP < 2,5s em 4G.

## Estrutura da home (resumo)
Preloader, Navbar, Hero (Atenção), Marquee, Manifesto, Problema/Solução, Carrossel 3D de cases (Prova), Números, Método, Serviços, Sobre, Depoimentos, FAQ, CTA final vermelho, Rodapé. Botão WhatsApp flutuante. Páginas: `/projetos`, `/projetos/<nome>`, `/questionario`.

## Ao publicar
Lembrar o Kauê de registrar o link publicado na vault (`01-Agencia/_Agencia.md` e `decisoes.md`).

## Pendências do plano
- Clientes autorizados a aparecer
- Prints/mockups de 4 a 6 cases
- Mascote e acrônimo do método
- Fonte display final
