// Obtém o formulário de login para interceptar o envio.
const formulario = document.getElementById("formLogin");

// Obtém o elemento usado para exibir mensagens ao usuário.
const mensagem = document.getElementById("mensagem");

// Carrega os usuários disponíveis para validar as credenciais.
const usuarios = carregarUsuarios();

// Executa a validação quando o formulário é enviado.
formulario.addEventListener("submit", function (event) {
  // Impede o recarregamento padrão da página causado pelo formulário.
  event.preventDefault();

  // Lê o usuário informado e remove espaços extras das extremidades.
  const usuario = document.getElementById("usuario").value.trim();

  // Lê a senha exatamente como foi digitada.
  const senha = document.getElementById("senha").value;

  // Procura um usuário com nome, senha e status compatíveis.
  const usuarioEncontrado = usuarios.find(function (item) {
    return item.usuario === usuario
      && item.senha === senha
      && item.status === "ativo";
  });

  // Trata o login quando as credenciais foram encontradas.
  if (usuarioEncontrado) {
    // Informa que a autenticação foi concluída.
    mensagem.textContent = "Login realizado com sucesso!";

    // Usa a cor verde para representar uma operação bem-sucedida.
    mensagem.style.color = "green";

    // Registra o usuário atual para proteger as próximas páginas.
    localStorage.setItem("usuarioLogado", usuarioEncontrado.usuario);

    // Aguarda um instante para o usuário ler a mensagem antes de navegar.
    setTimeout(function () {
      window.location.href = "Tarefas.html";
    }, 500);
  } else {
    // Verifica se o usuário existe, mas está marcado como inativo.
    const usuarioInativo = usuarios.some(function (item) {
      return item.usuario === usuario && item.status === "inativo";
    });

    // Exibe uma mensagem específica para usuário inativo ou credenciais inválidas.
    mensagem.textContent = usuarioInativo
      ? "Este usuário está inativo. Procure um administrador."
      : "Usuário ou senha incorretos.";

    // Usa a cor vermelha para indicar falha na autenticação.
    mensagem.style.color = "red";
  }
});
