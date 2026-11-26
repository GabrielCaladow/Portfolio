const FEEDBACK_MS = 3000;

// Jeito antigo de copiar, para navegadores que bloqueiam a API da área de transferência:
// seleciona o texto na tela e pede a cópia da seleção.
function copyBySelection(node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  const copied = document.execCommand("copy");
  selection.removeAllRanges();
  return copied;
}

async function copy(text, node) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return copyBySelection(node);
  }
}

// Muita gente não tem um app de e-mail configurado, e aí o mailto: não abre nada.
// Por isso o clique também copia o endereço e avisa na tela. Quem tem o app, vê ele abrir.
export function initContact() {
  document.querySelectorAll("[data-copy-email]").forEach((link) => {
    const label = link.querySelector(".contact-email-label");
    const address = link.querySelector(".contact-email-address");
    const original = label.textContent;
    let timer;

    link.addEventListener("click", async () => {
      const copied = await copy(link.dataset.copyEmail, address);
      label.textContent = copied ? "E-mail copiado! É só colar." : "Copie o endereço abaixo";

      clearTimeout(timer);
      timer = setTimeout(() => {
        label.textContent = original;
      }, FEEDBACK_MS);
    });
  });
}
