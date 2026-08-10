# Fábrica de áudio V2.5

## Fonte de verdade

- `audio-manifest.json` define estado, origem e nome de saída de 20 pílulas.
- `scripts/*.md` contém roteiros de narração, não meras cópias do texto de leitura.
- `media/source/` recebe WAV de gravação ou síntese.
- `media/masters/` recebe WAV master e MP3 de distribuição. Ambos ficam fora do Git.

## Fluxo

1. revisão clínica e editorial do roteiro;
2. renderização/gravação da voz;
3. edição humana quando necessária;
4. masterização em dois passes (`-16 LUFS`, `TP -1 dBTP`, `LRA 7` como alvo interno);
5. QC automático;
6. escuta humana em fone de referência, fone comum, celular e volume baixo;
7. reconciliação da transcrição com o master;
8. publicação privada no storage;
9. mudança do `audioState` para `master-approved` somente após aprovação.

## TTS

O script `../../scripts/render-tts-openai.mjs` usa `/v1/audio/speech` e é parametrizado por `OPENAI_TTS_MODEL` e `OPENAI_TTS_VOICE`. A chave nunca é versionada. A saída de voz sintetizada deve ser identificada conforme as obrigações aplicáveis ao provedor e ao produto.

Exemplo individual:

```bash
OPENAI_API_KEY=... pnpm audio:build pr-001
```

Lote completo, com confirmação explícita de custo:

```bash
OPENAI_API_KEY=... pnpm audio:build --all --confirm-cost
```

## Direção de voz

- português brasileiro;
- adulto, próximo, natural e sóbrio;
- nada de voz de anúncio, guru ou meditação caricatural;
- psicoeducação: aproximadamente 140–155 palavras/min;
- práticas guiadas: aproximadamente 110–125 palavras/min;
- pausas variáveis e semanticamente justificadas;
- música é exceção, não padrão.

## Oito legados

Os oito MP3 históricos permanecem apenas como referência/ponte. Todos estão marcados para reescrita ou substituição e não devem ser promovidos a mídia premium protegida. O master V2.5 é sempre gerado de fonte nova, nunca re-masterizado a partir do MP3 antigo.
