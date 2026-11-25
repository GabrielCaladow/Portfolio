const SPEED_PX_PER_SECOND = 30;

export function initMarquee() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll("[data-marquee]").forEach((marquee) => {
    const track = marquee.querySelector(".tools-track");
    const originals = [...track.children];

    marquee.classList.add("is-animated");

    // Uma volta = a largura exata da lista original. A animação anda essa distância
    // e recomeça; como o que entra é igual ao que saiu, o recomeço não aparece.
    const loopWidth = track.scrollWidth;

    // Cópias suficientes para a faixa nunca ficar com buraco, mesmo com a janela maximizada.
    const visibleWidth = Math.max(marquee.clientWidth, window.screen.width);
    const copies = Math.ceil(visibleWidth / loopWidth) + 1;

    for (let i = 0; i < copies; i++) {
      originals.forEach((item) => {
        const copy = item.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        track.append(copy);
      });
    }

    track.style.setProperty("--loop-width", `${loopWidth}px`);
    track.style.setProperty("--loop-duration", `${loopWidth / SPEED_PX_PER_SECOND}s`);
  });
}
