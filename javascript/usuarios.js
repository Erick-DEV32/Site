protegerPagina();

if (!usuarioEhAdmin()) {
  window.location.href = "Tarefas.html";
}

const listaUsuarios = document.getElementById("listaUsuarios");
const formularioUsuario = document.getElementById("formUsuario");
const mensagem = document.getElementById("mensagem");

function mostrarMensagem(texto, erro) {
  mensagem.textContent = texto;
  mensagem.classList.toggle("erro", erro);
}

function mostrarRelatorio() {
  const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  const concluidas = tarefas.filter(function (tarefa) {
    return tarefa.concluida;
  }).length;
  const pendentes = tarefas.length - concluidas;
  const percentualConcluidas = tarefas.length === 0
    ? 0
    : Math.round((concluidas / tarefas.length) * 100);
  const percentualPendentes = tarefas.length === 0
    ? 0
    : Math.round((pendentes / tarefas.length) * 100);

  document.getElementById("totalTarefas").textContent = `${tarefas.length} ${tarefas.length === 1 ? "tarefa" : "tarefas"}`;
  document.getElementById("tarefasConcluidas").textContent = concluidas;
  document.getElementById("percentualConcluidas").textContent = `${percentualConcluidas}%`;
  document.getElementById("tarefasPendentes").textContent = pendentes;
  document.getElementById("percentualPendentes").textContent = `${percentualPendentes}%`;
}

function mostrarUsuarios() {
  const usuarios = carregarUsuarios();
  const usuarioAtual = obterUsuarioAtual();
  const termoPesquisa = document.getElementById("pesquisaUsuarios").value.trim().toLowerCase();
  const usuariosFiltrados = usuarios.filter(function (usuario) {
    const perfil = usuario.perfil === "admin" ? "administrador" : "usuário";
    const status = usuario.status === "ativo" ? "ativo" : "inativo";

    return usuario.usuario.toLowerCase().includes(termoPesquisa)
      || perfil.includes(termoPesquisa)
      || status.includes(termoPesquisa);
  });

  document.getElementById("totalUsuarios").textContent = `${usuarios.length} ${usuarios.length === 1 ? "usuário" : "usuários"}`;
  listaUsuarios.innerHTML = "";

  if (usuariosFiltrados.length === 0) {
    listaUsuarios.innerHTML = "<p class=\"sem-usuarios\">Nenhum usuário encontrado.</p>";
    return;
  }

  usuariosFiltrados.forEach(function (usuario) {
    const item = document.createElement("div");
    item.className = "usuario-item";

    const dados = document.createElement("div");
    dados.className = "dados-usuario";

    const nome = document.createElement("strong");
    nome.textContent = usuario.usuario;

    const perfil = document.createElement("span");
    perfil.textContent = usuario.perfil === "admin" ? "Administrador" : "Usuário";

    const status = document.createElement("span");
    status.className = usuario.status === "ativo" ? "status-ativo" : "status-inativo";
    status.textContent = usuario.status === "ativo" ? "Ativo" : "Inativo";

    dados.appendChild(nome);
    dados.appendChild(perfil);
    dados.appendChild(status);
    item.appendChild(dados);

    if (usuario.usuario !== "admin" && usuario.usuario !== usuarioAtual) {
      const botaoStatus = document.createElement("button");
      botaoStatus.className = "botao-status";
      botaoStatus.type = "button";
      botaoStatus.textContent = usuario.status === "ativo" ? "Desativar" : "Ativar";
      botaoStatus.addEventListener("click", function () {
        alternarStatus(usuario.usuario);
      });

      const botaoExcluir = document.createElement("button");
      botaoExcluir.className = "botao-excluir";
      botaoExcluir.type = "button";
      botaoExcluir.textContent = "Excluir";
      botaoExcluir.addEventListener("click", function () {
        excluirUsuario(usuario.usuario);
      });
      item.appendChild(botaoStatus);
      item.appendChild(botaoExcluir);
    } else {
      const status = document.createElement("span");
      status.className = "usuario-protegido";
      status.textContent = usuario.usuario === "admin" ? "Protegido" : "Você";
      item.appendChild(status);
    }

    listaUsuarios.appendChild(item);
  });
}

function alternarStatus(nomeUsuario) {
  const usuarios = carregarUsuarios();
  const usuario = usuarios.find(function (item) {
    return item.usuario === nomeUsuario;
  });

  if (!usuario) {
    return;
  }

  usuario.status = usuario.status === "ativo" ? "inativo" : "ativo";
  salvarUsuarios(usuarios);
  mostrarUsuarios();
  mostrarMensagem(`Usuário ${usuario.status === "ativo" ? "ativado" : "inativado"} com sucesso.`, false);
}

function excluirUsuario(nomeUsuario) {
  if (!confirm(`Deseja excluir o usuário "${nomeUsuario}"?`)) {
    return;
  }

  const usuarios = carregarUsuarios().filter(function (usuario) {
    return usuario.usuario !== nomeUsuario;
  });

  salvarUsuarios(usuarios);
  mostrarUsuarios();
  mostrarMensagem("Usuário excluído com sucesso.", false);
}

formularioUsuario.addEventListener("submit", function (event) {
  event.preventDefault();

  const nomeUsuario = document.getElementById("novoUsuario").value.trim();
  const senha = document.getElementById("novaSenha").value;
  const perfil = document.getElementById("novoPerfil").value;
  const status = document.getElementById("novoStatus").value;
  const usuarios = carregarUsuarios();

  if (usuarios.some(function (usuario) {
    return usuario.usuario.toLowerCase() === nomeUsuario.toLowerCase();
  })) {
    mostrarMensagem("Este usuário já está cadastrado.", true);
    return;
  }

  usuarios.push({
    usuario: nomeUsuario,
    senha: senha,
    perfil: perfil,
    status: status,
  });

  salvarUsuarios(usuarios);
  formularioUsuario.reset();
  mostrarUsuarios();
  mostrarMensagem("Usuário cadastrado com sucesso.", false);
});

document.getElementById("pesquisaUsuarios").addEventListener("input", mostrarUsuarios);

mostrarRelatorio();
mostrarUsuarios();
