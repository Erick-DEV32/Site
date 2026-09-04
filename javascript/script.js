const formulario = document.getElementById("formLogin");

const mensagem = document.getElementById("mensagem");

const usuarios = carregarUsuarios();

formulario.addEventListener("submit", function (event) {
  event.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();

  const senha = document.getElementById("senha").value;

  const usuarioEncontrado = usuarios.find(function (item) {
    return item.usuario === usuario
      && item.senha === senha
      && item.status === "ativo";
  });

  if (usuarioEncontrado) {
    mensagem.textContent = "Login realizado com sucesso!";

    mensagem.style.color = "green";

    localStorage.setItem("usuarioLogado", usuarioEncontrado.usuario);

    setTimeout(function () {
      window.location.href = "Tarefas.html";
    }, 500);
  } else {
    const usuarioInativo = usuarios.some(function (item) {
      return item.usuario === usuario && item.status === "inativo";
    });

    mensagem.textContent = usuarioInativo
      ? "Este usuário está inativo. Procure um administrador."
      : "Usuário ou senha incorretos.";

    mensagem.style.color = "red";
  }
});
