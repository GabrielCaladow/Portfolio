# Portfólio · Gabriel Calado

Portfólio pessoal de Gabriel Calado, estudante de Ciência da Computação na CESAR School, em Recife.

Feito só com HTML, CSS e JavaScript, sem framework e sem etapa de build: o navegador lê os arquivos como estão.

## Automação dos vídeos do YouTube

Os últimos vídeos do canal aparecem sozinhos no site:

1. Todo dia às 06:00 (Brasília), a GitHub Action [`update-videos.yml`](.github/workflows/update-videos.yml) roda o script [`scripts/update-videos.mjs`](scripts/update-videos.mjs).
2. O script lê o feed público (RSS) do canal, pega os 3 vídeos mais recentes e baixa as capas para `assets/img/videos/`.
3. Ele grava `assets/data/videos.json`. Se algo mudou, a Action faz o commit, e o site publica a nova versão.
4. No navegador, o `feed.js` lê o JSON, confere cada vídeo e monta os cards.

As capas ficam dentro do site, então a política de segurança (CSP) não precisa liberar imagens de fora. Para ligar, configure a variável `YOUTUBE_CHANNEL_ID` em *Settings → Secrets and variables → Actions → Variables*. Também dá para rodar na hora pelo botão *Run workflow*, na aba Actions.

## Licença

O código está sob a [licença MIT](LICENSE). Textos, fotos e estudos de caso são de uso exclusivo do autor.

## Créditos

- Fonte [Geist](https://github.com/vercel/geist-font), da Vercel, sob a SIL Open Font License 1.1 (`assets/fonts/OFL.txt`).
- Ícones das ferramentas do [Simple Icons](https://simpleicons.org), sob a licença CC0. As marcas pertencem aos seus donos.
- Ícones do LinkedIn e do YouTube do [Bootstrap Icons](https://icons.getbootstrap.com), sob a licença MIT.