// Garante que somente usuários autenticados acessem a página.
protegerPagina();

// Redireciona usuários autenticados que não são administradores.
if (!usuarioEhAdmin()) {
  window.location.href = "Tarefas.html";
}

// Obtém a lista onde os usuários serão renderizados.
const listaUsuarios = document.getElementById("listaUsuarios");
// Obtém o formulário usado para cadastrar novos usuários.
const formularioUsuario = document.getElementById("formUsuario");
// Obtém o elemento que exibe mensagens de sucesso ou erro.
const mensagem = document.getElementById("mensagem");

// Exibe uma mensagem e aplica a classe visual de erro quando necessário.
function mostrarMensagem(texto, erro) {
  // Define o conteúdo textual da mensagem.
  mensagem.textContent = texto;
  // Liga ou desliga o estilo de erro conforme o segundo argumento.
  mensagem.classList.toggle("erro", erro);
}

// Calcula e exibe os números gerais das tarefas.
function mostrarRelatorio() {
  // Recupera as tarefas salvas ou inicia uma lista vazia.
  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  // Conta as tarefas concluídas.
  const concluidas = tarefas.filter(function (tarefa) {
    return tarefa.concluida;
  }).length;
  // Obtém o total de tarefas pendentes.
  const pendentes = tarefas.length - concluidas;
  // Calcula o percentual concluído sem dividir por zero.
  const percentualConcluidas = tarefas.length === 0
    ? 0
    : Math.round((concluidas / tarefas.length) * 100);
  // Calcula o percentual pendente sem dividir por zero.
  const percentualPendentes = tarefas.length === 0
    ? 0
    : Math.round((pendentes / tarefas.length) * 100);

  // Atualiza o total com singular ou plural adequado.
  document.getElementById("totalTarefas").textContent = `${tarefas.length} ${tarefas.length === 1 ? "tarefa" : "tarefas"}`;
  // Atualiza a quantidade de tarefas concluídas.
  document.getElementById("tarefasConcluidas").textContent = concluidas;
  // Atualiza o percentual de conclusão.
  document.getElementById("percentualConcluidas").textContent = `${percentualConcluidas}%`;
  // Atualiza a quantidade de tarefas pendentes.
  document.getElementById("tarefasPendentes").textContent = pendentes;
  // Atualiza o percentual de pendências.
  document.getElementById("percentualPendentes").textContent = `${percentualPendentes}%`;
}

// Filtra e renderiza os usuários cadastrados.
function mostrarUsuarios() {
  // Carrega a lista atualizada de usuários.
  const usuarios = carregarUsuarios();
  // Identifica o usuário que está visualizando a administração.
  const usuarioAtual = obterUsuarioAtual();
  // Lê o texto de pesquisa sem diferenciar letras maiúsculas e minúsculas.
  const termoPesquisa = document.getElementById("pesquisaUsuarios").value.trim().toLowerCase();
  // Mantém usuários cujo nome, perfil ou status corresponde à pesquisa.
  const usuariosFiltrados = usuarios.filter(function (usuario) {
    // Traduz o valor interno do perfil para o texto pesquisável.
    const perfil = usuario.perfil === "admin" ? "administrador" : "usuário";
    // Normaliza o status para a busca.
    const status = usuario.status === "ativo" ? "ativo" : "inativo";

    return usuario.usuario.toLowerCase().includes(termoPesquisa)
      || perfil.includes(termoPesquisa)
      || status.includes(termoPesquisa);
  });

  // Atualiza a quantidade total com a forma correta da palavra.
  document.getElementById("totalUsuarios").textContent = `${usuarios.length} ${usuarios.length === 1 ? "usuário" : "usuários"}`;
  // Limpa a renderização anterior.
  listaUsuarios.innerHTML = "";

  // Informa quando nenhum usuário corresponde à pesquisa.
  if (usuariosFiltrados.length === 0) {
    listaUsuarios.innerHTML = "<p class=\"sem-usuarios\">Nenhum usuário encontrado.</p>";
    return;
  }

  // Cria a linha visual de cada usuário filtrado.
  usuariosFiltrados.forEach(function (usuario) {
    // Cria o contêiner da linha.
    const item = document.createElement("div");
    // Aplica a classe responsável pelo layout da linha.
    item.className = "usuario-item";

    // Cria o bloco que reúne nome, perfil e status.
    const dados = document.createElement("div");
    dados.className = "dados-usuario";

    // Cria e preenche o nome do usuário.
    const nome = document.createElement("strong");
    nome.textContent = usuario.usuario;

    // Cria o texto do perfil com uma descrição amigável.
    const perfil = document.createElement("span");
    perfil.textContent = usuario.perfil === "admin" ? "Administrador" : "Usuário";

    // Cria o status e escolhe sua classe de cor.
    const status = document.createElement("span");
    status.className = usuario.status === "ativo" ? "status-ativo" : "status-inativo";
    status.textContent = usuario.status === "ativo" ? "Ativo" : "Inativo";

    // Organiza as informações no bloco de dados.
    dados.appendChild(nome);
    dados.appendChild(perfil);
    dados.appendChild(status);
    item.appendChild(dados);

    // Impede alterações na conta admin e na própria conta do administrador atual.
    if (usuario.usuario !== "admin" && usuario.usuario !== usuarioAtual) {
      // Cria o botão que alterna o status do usuário.
      const botaoStatus = document.createElement("button");
      botaoStatus.className = "botao-status";
      botaoStatus.type = "button";
      // Ajusta o texto conforme o próximo estado possível.
      botaoStatus.textContent = usuario.status === "ativo" ? "Desativar" : "Ativar";
      // Liga o botão à função de alteração de status.
      botaoStatus.addEventListener("click", function () {
        alternarStatus(usuario.usuario);
      });

      // Cria o botão de exclusão do usuário.
      const botaoExcluir = document.createElement("button");
      botaoExcluir.className = "botao-excluir";
      botaoExcluir.type = "button";
      botaoExcluir.textContent = "Excluir";
      // Liga o botão à função que remove o usuário.
      botaoExcluir.addEventListener("click", function () {
        excluirUsuario(usuario.usuario);
      });
      item.appendChild(botaoStatus);
      item.appendChild(botaoExcluir);
    } else {
      // Exibe o motivo pelo qual a conta não pode ser alterada.
      const status = document.createElement("span");
      status.className = "usuario-protegido";
      status.textContent = usuario.usuario === "admin" ? "Protegido" : "Você";
      item.appendChild(status);
    }

    // Insere a linha pronta na lista da página.
    listaUsuarios.appendChild(item);
  });
}

// Alterna entre ativo e inativo para um usuário específico.
function alternarStatus(nomeUsuario) {
  // Carrega a lista atual para alterar o registro correto.
  const usuarios = carregarUsuarios();
  // Procura o usuário pelo nome recebido.
  const usuario = usuarios.find(function (item) {
    return item.usuario === nomeUsuario;
  });

  // Não faz nada quando o usuário não foi encontrado.
  if (!usuario) {
    return;
  }

  // Inverte o status atual.
  usuario.status = usuario.status === "ativo" ? "inativo" : "ativo";
  // Persiste a alteração e atualiza a lista exibida.
  salvarUsuarios(usuarios);
  mostrarUsuarios();
  mostrarMensagem(`Usuário ${usuario.status === "ativo" ? "ativado" : "inativado"} com sucesso.`, false);
}

// Exclui um usuário depois de solicitar confirmação.
function excluirUsuario(nomeUsuario) {
  // Interrompe a operação se o administrador cancelar a confirmação.
  if (!confirm(`Deseja excluir o usuário "${nomeUsuario}"?`)) {
    return;
  }

  // Cria uma lista sem o usuário escolhido.
  const usuarios = carregarUsuarios().filter(function (usuario) {
    return usuario.usuario !== nomeUsuario;
  });

  // Persiste a lista, atualiza a tela e informa o resultado.
  salvarUsuarios(usuarios);
  mostrarUsuarios();
  mostrarMensagem("Usuário excluído com sucesso.", false);
}

// Processa o cadastro de um novo usuário.
formularioUsuario.addEventListener("submit", function (event) {
  // Evita o recarregamento padrão do formulário.
  event.preventDefault();

  // Lê e normaliza os dados preenchidos.
  const nomeUsuario = document.getElementById("novoUsuario").value.trim();
  const senha = document.getElementById("novaSenha").value;
  const perfil = document.getElementById("novoPerfil").value;
  const status = document.getElementById("novoStatus").value;
  const usuarios = carregarUsuarios();

  // Impede nomes duplicados ignorando diferenças entre maiúsculas e minúsculas.
  if (usuarios.some(function (usuario) {
    return usuario.usuario.toLowerCase() === nomeUsuario.toLowerCase();
  })) {
    mostrarMensagem("Este usuário já está cadastrado.", true);
    return;
  }

  // Adiciona o novo cadastro à lista em memória.
  usuarios.push({
    usuario: nomeUsuario,
    senha: senha,
    perfil: perfil,
    status: status,
  });

  // Salva o cadastro, limpa o formulário e atualiza a interface.
  salvarUsuarios(usuarios);
  formularioUsuario.reset();
  mostrarUsuarios();
  mostrarMensagem("Usuário cadastrado com sucesso.", false);
});

// Refaz a filtragem a cada alteração no campo de pesquisa.
document.getElementById("pesquisaUsuarios").addEventListener("input", mostrarUsuarios);

// Renderiza o relatório e os usuários no carregamento inicial.
mostrarRelatorio();
mostrarUsuarios();
