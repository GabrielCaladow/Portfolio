// Carregado no <head> sem defer: o tema é aplicado antes de a página aparecer,
// então ela não pisca no tema errado. Não é módulo porque módulos rodam depois.
(() => {
  const KEY = "theme";
  const root = document.documentElement;

  let saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch {
    // Sem acesso ao armazenamento (modo privado, por exemplo): fica no tema claro.
  }
  root.dataset.theme = saved === "dark" ? "dark" : "light";

  document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector("[data-theme-toggle]");
    if (!button) return;

    const sync = () => button.setAttribute("aria-pressed", String(root.dataset.theme === "dark"));
    sync();

    button.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(KEY, root.dataset.theme);
      } catch {
        // Sem armazenamento, a troca vale só até recarregar a página.
      }
      sync();
    });
  });
})();
