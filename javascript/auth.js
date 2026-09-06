// Define a chave usada para guardar a lista de usuários no armazenamento do navegador.
const CHAVE_USUARIOS = "usuarios";

// Carrega os usuários salvos e garante que exista uma conta administrativa inicial.
function carregarUsuarios() {
  // Declara a variável que receberá a lista convertida do armazenamento.
  let usuarios;

  // Tenta ler e converter os dados salvos em JSON.
  try {
    usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS));
  // Se os dados estiverem inválidos, continua com valor nulo para recriá-los.
  } catch (erro) {
    usuarios = null;
  }

  // Cria o administrador padrão quando não existe uma lista válida ou ela está vazia.
  if (!Array.isArray(usuarios) || usuarios.length === 0) {
    usuarios = [
      {
        usuario: "admin",
        senha: "123",
        perfil: "admin",
        status: "ativo",
      },
    ];

    // Persiste a lista inicial para os próximos acessos.
    salvarUsuarios(usuarios);
  } else {
    // Indica se alguma correção foi feita nos dados existentes.
    let usuariosAtualizados = false;

    // Percorre os usuários para garantir que todos tenham um status válido.
    usuarios.forEach(function (usuario) {
      // Usuários antigos sem status são considerados ativos.
      if (!usuario.status) {
        usuario.status = "ativo";
        usuariosAtualizados = true;
      }

      // Impede que a conta administrativa principal seja desativada.
      if (usuario.usuario === "admin" && usuario.status !== "ativo") {
        usuario.status = "ativo";
        usuariosAtualizados = true;
      }
    });

    // Salva novamente somente quando alguma informação foi corrigida.
    if (usuariosAtualizados) {
      salvarUsuarios(usuarios);
    }
  }

  // Devolve a lista pronta para ser usada pela página.
  return usuarios;
}

// Converte a lista de usuários para JSON e salva no navegador.
function salvarUsuarios(usuarios) {
  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
}

// Obtém o nome do usuário autenticado atualmente.
function obterUsuarioAtual() {
  // Lê o valor armazenado durante o login.
  const usuarioLogado = localStorage.getItem("usuarioLogado");

  // Mantém compatibilidade com o antigo valor booleano "true".
  return usuarioLogado === "true" ? "admin" : usuarioLogado;
}

// Verifica se o usuário atual possui perfil administrativo.
function usuarioEhAdmin() {
  // Obtém a identidade da sessão atual.
  const usuarioAtual = obterUsuarioAtual();
  // Procura o cadastro correspondente na lista de usuários.
  const usuario = carregarUsuarios().find(function (item) {
    return item.usuario === usuarioAtual;
  });

  // Retorna verdadeiro somente para usuários com perfil de administrador.
  return usuario && usuario.perfil === "admin";
}

// Bloqueia páginas protegidas para usuários ausentes, inválidos ou inativos.
function protegerPagina() {
  // Descobre qual usuário está tentando acessar a página.
  const usuarioAtual = obterUsuarioAtual();
  // Busca os dados completos desse usuário.
  const usuario = carregarUsuarios().find(function (item) {
    return item.usuario === usuarioAtual;
  });

  // Se a sessão não for válida, apaga o login e volta para a tela inicial.
  if (!usuarioAtual || !usuario || usuario.status !== "ativo") {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
  }
}

// Encerra a sessão atual e redireciona para o login.
function sair() {
  // Remove a identificação do usuário autenticado.
  localStorage.removeItem("usuarioLogado");
  // Abre novamente a página de login.
  window.location.href = "index.html";
}
