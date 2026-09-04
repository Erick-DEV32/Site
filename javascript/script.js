const formulario = document.getElementById("formLogin");

const mensagem = document.getElementById("mensagem");

formulario.addEventListener("submit", function (event) {
  event.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();

  const senha = document.getElementById("senha").value;

  if (usuario === "admin" && senha === "123") {
    mensagem.textContent = "Login realizado com sucesso!";

    mensagem.style.color = "green";

    localStorage.setItem("usuarioLogado", "true");

    setTimeout(function () {
      window.location.href = "Tarefas.html";
    }, 500);
  } else {
    mensagem.textContent = "Usuário ou senha incorretos.";

    mensagem.style.color = "red";
  }
});
