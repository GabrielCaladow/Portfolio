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

    // Cópias suficientes para a faixa nunca ficar com buraco: vale para a janela
    // maximizada e para o celular virado de lado (por isso a altura da tela também entra).
    const widest = Math.max(marquee.clientWidth, window.screen.width, window.screen.height);
    const copies = Math.ceil(widest / loopWidth) + 1;

    // As cópias entram de uma vez só, num fragmento, em vez de uma por uma na página.
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < copies; i++) {
      originals.forEach((item) => {
        const copy = item.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        fragment.append(copy);
      });
    }
    track.append(fragment);

    track.style.setProperty("--loop-width", `${loopWidth}px`);
    track.style.setProperty("--loop-duration", `${loopWidth / SPEED_PX_PER_SECOND}s`);

    // Fora da tela, a faixa para de animar e não gasta processamento à toa.
    const observer = new IntersectionObserver(([entry]) => {
      marquee.classList.toggle("is-offscreen", !entry.isIntersecting);
    });
    observer.observe(marquee);
  });
}
