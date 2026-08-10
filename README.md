# Pílulas de Reflexão

Biblioteca pública de microexperiências psicoeducativas em português do Brasil.

## Versão atual — V3

A V3 transforma cada pílula em uma microexperiência composta por compreensão, exemplo cotidiano, prática breve, reflexão e áudio quando houver mídia validada.

A publicação foi desenhada para ser progressiva: o conteúdo editorial e a nova experiência visual podem evoluir sem criar links fictícios de mídia. Um áudio V3 só entra na interface quando existe de fato em `data/audio-v3.json`; enquanto isso, os áudios legados continuam disponíveis como fallback.

## Arquitetura

- `index.html` — estrutura semântica da aplicação.
- `assets/css/styles.css` — design system base e responsividade.
- `assets/css/v3.css` — camada visual/editorial V3.
- `assets/js/app.js` — catálogo, filtros, recomendações, modal multimídia, player e progresso local.
- `data/pilulas.json` — catálogo editorial base.
- `data/pilulas-v3-extra.json` — síntese, exemplo e prática das 20 pílulas.
- `data/audio-v3.json` — manifesto exclusivo de masters de áudio V3 realmente publicados.
- `content/audio/scripts/` — roteiros completos das 20 pílulas.
- `scripts/render-tts-openai.mjs` — síntese neural com direção vocal específica por pílula.
- `scripts/audio-master.mjs` — masterização com FFmpeg.
- `scripts/audio-qc.mjs` — controle técnico de duração, loudness e true peak.
- `scripts/audio-build.mjs` — orquestra síntese, masterização, manifesto e QC.
- `tests/validate-v3.mjs` — validação estrutural do catálogo e da experiência V3.

## Experiência de cada pílula

A estrutura prioritária é:

1. compreender um conceito por vez;
2. visualizar uma síntese ou microvisual quando útil;
3. reconhecer um exemplo cotidiano;
4. experimentar uma prática pequena e observável;
5. responder a uma pergunta de reflexão;
6. ouvir a versão em áudio quando a mídia estiver validada;
7. seguir para uma pílula relacionada, sem sequência obrigatória.

## Áudio V3

Os pilotos definidos são:

- `pr-001` — Pensamento não é fato;
- `pr-008` — Antes da irritação explodir;
- `pr-013` — Uma pausa para retornar ao presente.

A cadeia de produção foi preparada para:

1. usar roteiro específico para fala, não simples leitura do texto da página;
2. aplicar direção de voz por tema;
3. gerar fonte WAV;
4. masterizar para alvo de aproximadamente -16 LUFS, true peak de -1 dBTP e LRA 7;
5. exportar MP3 de distribuição;
6. executar QC automático;
7. publicar o arquivo e atualizar o manifesto somente quando o QC técnico passar.

A geração usa a variável secreta `OPENAI_API_KEY`. O repositório nunca deve armazenar a chave no código, README, histórico Git ou JavaScript público.

Com a credencial configurada no GitHub Actions, o fluxo piloto pode ser executado com:

```bash
npm run audio:pilot
```

O lote completo possui uma trava explícita de custo e só é liberado por:

```bash
npm run audio:all
```

## Princípios do produto

1. Áudio é uma mídia, não o produto inteiro.
2. Cada pílula deve continuar útil mesmo quando a pessoa prefere ler.
3. A navegação parte de situações cotidianas, não de diagnósticos.
4. O usuário pode ouvir, ler, refletir e sair sem fornecer dados pessoais.
5. Progresso e posição do áudio ficam somente no navegador (`localStorage`).
6. Conteúdo público não deve receber dados clínicos identificáveis por URL ou formulário.
7. Nenhuma mídia é anunciada como disponível antes de o arquivo existir e ser validado.

## Governança clínica e editorial

Antes de uma nova pílula ou nova mídia entrar em produção, revisar:

- objetivo psicoeducativo;
- limites e riscos de interpretação;
- clareza e adequação da linguagem;
- coerência com a trilha;
- qualidade do roteiro falado;
- naturalidade e pronúncia do áudio;
- acessibilidade e alternativa textual;
- versão e data de revisão.

## Acessibilidade

Alvo: WCAG 2.2 AA.

A interface inclui navegação por teclado, foco visível, redução de movimento, layout responsivo, conteúdo textual complementar, controles próprios de áudio e validação automática de HTML/estrutura.

## Privacidade

A página pública não armazena dados clínicos, diagnósticos, respostas terapêuticas ou identificação do paciente. Posição de áudio e conclusão são locais ao dispositivo e não são enviados a servidor pela aplicação atual.

## Estado do rollout de áudio

A infraestrutura, os 20 roteiros, os pilotos, a masterização e o QC estão implementados. Os novos MP3 V3 só serão acrescentados ao manifesto depois da geração com credencial TTS e da validação da identidade vocal. Até esse ponto, a página mantém os áudios legados sem interromper a experiência atual.
