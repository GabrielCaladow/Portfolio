// Tela de abertura "Gabriel Calado." — só na primeira visita, só com JavaScript
// e só para quem não pediu menos movimento no sistema.
// Roda no <head> sem defer: esconde a página antes do primeiro desenho, para ela não piscar.
(() => {
  const KEY = "intro-seen";
  const NAME = "Gabriel Calado";
  const root = document.documentElement;

  let seen = true;
  try {
    seen = localStorage.getItem(KEY) === "1";
  } catch {
    // Sem acesso ao armazenamento: melhor não mostrar do que mostrar toda vez.
  }
  if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  root.classList.add("intro");
  // Rede de segurança: se algo falhar no meio, a página nunca fica escondida.
  const safety = setTimeout(() => root.classList.remove("intro"), 4000);

  // A tela entra direto no <html>, antes de o <body> existir: assim a animação começa
  // no primeiro desenho, sem esperar o resto da página (o DOMContentLoaded espera os módulos).
  {
    const screen = document.createElement("div");
    screen.className = "intro-screen";
    screen.setAttribute("aria-hidden", "true");

    const word = document.createElement("p");
    word.className = "intro-word";
    [...NAME].forEach((char, index) => {
      const letter = document.createElement("span");
      letter.className = "intro-letter";
      letter.textContent = char === " " ? " " : char;
      letter.style.setProperty("--i", index);
      word.append(letter);
    });

    const dot = document.createElement("span");
    dot.className = "intro-dot";
    dot.textContent = ".";
    word.append(dot);

    screen.append(word);
    root.append(screen);

    // As animações das letras também disparam estes eventos, por isso o filtro pelo nome.
    screen.addEventListener("animationstart", (event) => {
      if (event.animationName === "intro-lift") root.classList.remove("intro");
    });

    screen.addEventListener("animationend", (event) => {
      if (event.animationName !== "intro-lift") return;
      screen.remove();
      clearTimeout(safety);
      try {
        localStorage.setItem(KEY, "1");
      } catch {
        // Sem armazenamento, a abertura pode aparecer de novo na próxima visita.
      }
    });
  }
})();
