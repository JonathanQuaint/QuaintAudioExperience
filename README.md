
# Sense Audio Terrain

Visualizador 3D em p5.js que converte o áudio do sistema em ondas poligonais e anima um humanoide wireframe sobre o terreno sonoro.

## Funcionalidades
- Captura o áudio do computador via compartilhamento de tela usando a API `getDisplayMedia`.
- Gera uma malha de terreno que reage em tempo real às frequências graves, médias e agudas.
- Humanoide articulado salta com os graves e "respira" no ritmo da música.
- Controle de órbita para explorar a cena e plano de fundo que muda com o espectro de frequências.

## Como executar
1. Inicie um servidor local (ex.: `npx http-server` ou `python3 -m http.server`).
2. Abra `index.html` no navegador.
3. Clique em **"Capturar áudio do sistema"** e selecione a aba ou tela cujo áudio deseja analisar.
4. Observe o terreno e o humanoide reagindo ao som.

## Estrutura
- `index.html` – carrega p5.js/p5.sound e apresenta o botão para capturar áudio do sistema.
- `sketch.js` – lógica do visualizador: análise de áudio, geração do terreno e desenho do humanoide.
- `style.css` – estilos básicos para o botão e instruções na tela.

## Requisitos
- Navegador moderno com suporte a WebGL e à API de captura de tela.
- Acesso ao áudio do sistema (necessário conceder permissão ao navegador).

## Licença
Projeto distribuído sem garantia; adapte livremente conforme necessário.
