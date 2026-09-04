const temaSalvo = localStorage.getItem("tema") || "claro";

function aplicarTema(tema) {
  document.body.classList.toggle("tema-escuro", tema === "escuro");

  const botaoTema = document.getElementById("botaoTema");

  if (botaoTema) {
    botaoTema.textContent = tema === "escuro" ? "Tema claro" : "Tema escuro";
    botaoTema.setAttribute(
      "aria-label",
      tema === "escuro" ? "Alterar para o tema claro" : "Alterar para o tema escuro",
    );
  }
}

function alternarTema() {
  const novoTema = document.body.classList.contains("tema-escuro")
    ? "claro"
    : "escuro";

  localStorage.setItem("tema", novoTema);

  aplicarTema(novoTema);
}

aplicarTema(temaSalvo);
