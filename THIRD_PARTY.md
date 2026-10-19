# Recursos de terceiros

## Dados e imagens dos agentes

- Fonte: [Valorant-API](https://valorant-api.com/), um projeto da comunidade.
- Endpoint usado: `https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=pt-BR`.
- Origem dos retratos: URLs retornadas pela API no domínio `media.valorant-api.com`.
- Cópia inicial obtida em: 19/10/2026.
- Arquivos relacionados: `agents.js` e `assets/*.webp`.
- Tratamento local: redimensionamento e conversão para WebP para reduzir o tamanho dos arquivos.

As imagens e os personagens são recursos de terceiros relacionados ao Valorant e à Riot Games. Este projeto não reivindica autoria sobre esses materiais nem representa um produto oficial.

## Referência visual

Interface baseada no [layout criado no Paper](https://app.paper.design/file/01M5AYX8K9ZR2S69S7WNZ03BBT/p-1-0).

## Ferramenta opcional

O script `scripts/update_agents.py` utiliza [Pillow](https://python-pillow.github.io/) para processar imagens. Pillow é instalado separadamente; seu código não está incluído nesta distribuição.
