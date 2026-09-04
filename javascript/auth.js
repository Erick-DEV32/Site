const CHAVE_USUARIOS = "usuarios";

function carregarUsuarios() {
  let usuarios;

  try {
    usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS));
  } catch (erro) {
    usuarios = null;
  }

  if (!Array.isArray(usuarios) || usuarios.length === 0) {
    usuarios = [
      {
        usuario: "admin",
        senha: "123",
        perfil: "admin",
        status: "ativo",
      },
    ];

    salvarUsuarios(usuarios);
  } else {
    let usuariosAtualizados = false;

    usuarios.forEach(function (usuario) {
      if (!usuario.status) {
        usuario.status = "ativo";
        usuariosAtualizados = true;
      }

      if (usuario.usuario === "admin" && usuario.status !== "ativo") {
        usuario.status = "ativo";
        usuariosAtualizados = true;
      }
    });

    if (usuariosAtualizados) {
      salvarUsuarios(usuarios);
    }
  }

  return usuarios;
}

function salvarUsuarios(usuarios) {
  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
}

function obterUsuarioAtual() {
  const usuarioLogado = localStorage.getItem("usuarioLogado");

  return usuarioLogado === "true" ? "admin" : usuarioLogado;
}

function usuarioEhAdmin() {
  const usuarioAtual = obterUsuarioAtual();
  const usuario = carregarUsuarios().find(function (item) {
    return item.usuario === usuarioAtual;
  });

  return usuario && usuario.perfil === "admin";
}

function protegerPagina() {
  const usuarioAtual = obterUsuarioAtual();
  const usuario = carregarUsuarios().find(function (item) {
    return item.usuario === usuarioAtual;
  });

  if (!usuarioAtual || !usuario || usuario.status !== "ativo") {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
  }
}

function sair() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}
