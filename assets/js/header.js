export function initHeader() {
  const header = document.querySelector(".site-header");
  const sentinel = document.querySelector(".header-sentinel");

  const observer = new IntersectionObserver(([entry]) => {
    header.classList.toggle("is-floating", !entry.isIntersecting);
  });

  observer.observe(sentinel);
}
