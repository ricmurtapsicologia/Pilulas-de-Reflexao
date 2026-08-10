# Media workspace

Diretório lógico da fábrica audiovisual. Os binários gerados ficam fora do Git.

- `work/` — partes temporárias de TTS/renderização.
- `source/` — WAV fonte aprovado para edição/masterização.
- `masters/` — WAV master + MP3 de distribuição.
- `renders/` — vídeos finais derivados do Remotion.

Os oito MP3 históricos permanecem na raiz do repositório apenas para compatibilidade com a versão pública antiga. Eles não constituem masters V2.5.

## Regras

1. Nunca inserir chave, token ou URL assinada em metadata versionada.
2. Nunca publicar arquivo premium antes do `audio:qc` e da escuta humana.
3. Nunca produzir novo master a partir de MP3 legado; usar nova gravação/síntese em WAV.
4. Arte, áudio e vídeo usam versão vinculada ao `contentId`.
5. Mídia premium é publicada em storage privado e servida por rota autorizada.
