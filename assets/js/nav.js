export function initNav() {
  const links = [...document.querySelectorAll(".nav-link")];
  const sections = links
    .map((link) => document.querySelector(link.hash))
    .filter(Boolean);

  const markCurrent = (id) => {
    links.forEach((link) => {
      if (link.hash === `#${id}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  // A margem encolhe a área observada para uma faixa no meio da tela:
  // a seção vira "atual" quando passa por essa faixa, não quando aparece na borda.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) markCurrent(entry.target.id);
      });
    },
    { rootMargin: "-45% 0px -55% 0px" },
  );

  sections.forEach((section) => observer.observe(section));
}
