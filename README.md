# Portfólio · Gabriel Calado

Meu portfólio pessoal. Sou estudante de Ciência da Computação na CESAR School, em Recife, e construí este site do zero, só com HTML, CSS e JavaScript, para mostrar meus projetos e o jeito como eu escrevo código.

## As decisões

- **Sem framework e sem build.** O navegador lê os arquivos como eles estão. Quis entender cada linha antes de usar uma ferramenta que esconde o que acontece por baixo.
- **Um arquivo por responsabilidade.** As cores, fontes e medidas ficam todas em [`tokens.css`](assets/css/tokens.css); o resto do CSS só usa essas variáveis. Por isso o tema escuro é um bloco só, que troca os valores.
- **JavaScript em módulos pequenos.** [`main.js`](assets/js/main.js) só liga as partes; cada comportamento tem o seu arquivo.
- **Conteúdo que muda fica fora do HTML.** Posts, eventos e vídeos vêm de arquivos em [`assets/data/`](assets/data), que podem ser atualizados sem mexer no código.

## O que vale a pena olhar

| Arquivo | O que tem de interessante |
|---|---|
| [`nav.js`](assets/js/nav.js) | O menu marca a seção que está na tela com `IntersectionObserver`, sem escutar cada rolagem. O JS só troca um atributo (`aria-current`); a animação é do CSS. |
| [`header.js`](assets/js/header.js) | O header vira uma pílula flutuante quando a página rola: um elemento invisível no topo avisa quando saiu da tela. |
| [`marquee.js`](assets/js/marquee.js) | A faixa de ferramentas mede a largura de uma volta, cria as cópias necessárias para nunca ficar buraco e pausa quando sai da tela. |
| [`feed.js`](assets/js/feed.js) | Lê os JSON, confere cada item (formato da data, links permitidos, caminho das imagens) e monta tudo com `textContent`, nunca com `innerHTML`. |
| [`theme.js`](assets/js/theme.js) | Roda no `<head>` antes de a página aparecer, para o tema escuro não piscar. |
| [`contact.js`](assets/js/contact.js) | O botão de e-mail também copia o endereço, porque muita gente não tem um app de e-mail configurado. |
| [`update-videos.mjs`](scripts/update-videos.mjs) e [`update-videos.yml`](.github/workflows/update-videos.yml) | Uma GitHub Action roda todo dia, lê o feed público do meu canal no YouTube, baixa as capas para dentro do site e faz o commit só se algo mudou. |

## Segurança

- Nenhum script ou estilo escrito dentro do HTML, para a política de segurança de conteúdo (CSP) poder bloquear tudo o que não vem do próprio site.
- Nenhuma dependência de terceiros: fonte, ícones e capas dos vídeos ficam no repositório.
- Tudo o que vem dos JSON é validado e entra como texto.
- Links externos com `rel="noopener noreferrer"`. Fotos sem metadados.

## Acessibilidade

- Tags semânticas, um `<h1>` por página e link para pular direto ao conteúdo.
- Foco visível no teclado, com os mesmos efeitos do mouse.
- Contraste conferido nos dois temas, e animações desligadas para quem pede menos movimento no sistema.

## Como foi feito

Planejei antes de codar: um documento de design com a arquitetura, as decisões e a ordem de construção, e depois uma seção por vez, cada uma com o seu commit. Usei IA (Claude Code) como parceira de projeto.

## Licença

O código está sob a [licença MIT](LICENSE). Textos, fotos e estudos de caso são de uso exclusivo do autor.

## Créditos

- Fonte [Geist](https://github.com/vercel/geist-font), da Vercel, sob a SIL Open Font License 1.1 (`assets/fonts/OFL.txt`).
- Ícones das ferramentas do [Simple Icons](https://simpleicons.org), sob a licença CC0. As marcas pertencem aos seus donos.
- Ícones do LinkedIn e do YouTube do [Bootstrap Icons](https://icons.getbootstrap.com), sob a licença MIT.
