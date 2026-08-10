# Pílulas de Reflexão

Biblioteca pública de microexperiências psicoeducativas em português do Brasil.

## Propósito

A página organiza conteúdos breves para apoiar reflexão, psicoeducação e prática de habilidades psicológicas. O projeto não substitui avaliação, diagnóstico ou acompanhamento profissional individualizado.

## Arquitetura

- `index.html` — estrutura semântica da aplicação.
- `assets/css/styles.css` — design system e responsividade.
- `assets/js/app.js` — catálogo, filtros, recomendações, player e progresso local.
- `data/pilulas.json` — fonte editorial única do catálogo.
- `assets/brand/mark.svg` — marca vetorial própria.
- `manifest.webmanifest` — metadados para experiência instalável.

Os arquivos MP3 legados permanecem na raiz para preservar compatibilidade com o acervo existente.

## Princípios do produto

1. Áudio é uma mídia, não o produto inteiro.
2. Cada pílula precisa ter objetivo, habilidade, trilha, descrição, leitura e reflexão.
3. A navegação deve partir de necessidades cotidianas, não de diagnósticos.
4. O usuário pode ouvir, ler, refletir e sair sem fornecer dados pessoais.
5. Progresso simples é mantido somente no navegador (`localStorage`).
6. Conteúdo público não deve receber dados clínicos identificáveis por URL ou formulário.
7. Novas mídias só são publicadas quando existem de fato; não são criados links fictícios.

## Modelo editorial de uma pílula

Campos principais em `data/pilulas.json`:

- `id`
- `slug`
- `title`
- `track`
- `skill`
- `duration`
- `format`
- `description`
- `reading`
- `reflection`
- `audioUrl` quando houver áudio
- `visual` quando houver microvisual
- `transcriptStatus` enquanto a transcrição literal estiver em revisão

## Governança clínica e editorial

Antes da publicação definitiva de uma nova pílula, revisar:

- objetivo clínico/psicoeducativo;
- limites e riscos de interpretação;
- clareza e adequação da linguagem;
- coerência com a trilha;
- acessibilidade;
- referências quando necessárias;
- versão e data de revisão.

Para áudios existentes sem transcrição literal validada, a interface apresenta um resumo para leitura e informa explicitamente que ele não é transcrição.

## Acessibilidade

Alvo do projeto: WCAG 2.2 AA.

A interface inclui navegação por teclado, foco visível, redução de movimento, layout responsivo, conteúdo textual complementar e controles próprios de áudio. A transcrição integral dos áudios legados permanece como pendência editorial até validação humana.

## Privacidade

A página pública não deve armazenar dados clínicos, diagnósticos, respostas terapêuticas ou identificação do paciente. Favoritos, posições de áudio e conclusão são locais ao dispositivo e não são enviados a servidor pela aplicação atual.

## Roadmap

- revisar e transcrever integralmente os oito áudios legados;
- normalizar loudness e cadeia de voz do acervo;
- produzir microvídeos apenas para conceitos que realmente ganham com visualização;
- adicionar testes automatizados de HTML, JSON, links e acessibilidade;
- avaliar service worker após estabilização do catálogo;
- integrar futuramente com a plataforma clínica apenas por IDs de conteúdo, mantendo dados do paciente fora do site público.
