// Recupera o tema salvo ou usa o tema claro como padrão.
const temaSalvo = localStorage.getItem("tema") || "claro";

// Aplica visualmente o tema recebido à página atual.
function aplicarTema(tema) {
  // Adiciona ou remove a classe que ativa as cores do tema escuro.
  document.body.classList.toggle("tema-escuro", tema === "escuro");

  // Procura o botão responsável pela troca de tema.
  const botaoTema = document.getElementById("botaoTema");

  // Atualiza o botão somente quando ele existir na página.
  if (botaoTema) {
    // Alterna o texto para indicar o tema que pode ser ativado.
    botaoTema.textContent = tema === "escuro" ? "Tema claro" : "Tema escuro";
    // Atualiza a descrição para leitores de tela.
    botaoTema.setAttribute(
      "aria-label",
      tema === "escuro" ? "Alterar para o tema claro" : "Alterar para o tema escuro",
    );
  }
}

// Alterna entre os temas claro e escuro.
function alternarTema() {
  // Descobre o tema oposto ao que está aplicado atualmente.
  const novoTema = document.body.classList.contains("tema-escuro")
    ? "claro"
    : "escuro";

  // Salva a escolha para que ela continue nas próximas páginas.
  localStorage.setItem("tema", novoTema);

  // Aplica imediatamente a escolha ao documento atual.
  aplicarTema(novoTema);
}

// Aplica o tema salvo assim que o script é carregado.
aplicarTema(temaSalvo);
