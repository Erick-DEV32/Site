// ==========================================
// VERIFICAR LOGIN
// ==========================================

// Impede o acesso de usuários que não possuem uma sessão ativa.
protegerPagina();

// Obtém o link da área administrativa.
const menuAdministracao = document.getElementById("menuAdministracao");

// Esconde o link quando o usuário atual não é administrador.
if (!usuarioEhAdmin()) {
  menuAdministracao.hidden = true;
}

// ==========================================
// CARREGAR TAREFAS
// ==========================================

// Recupera as tarefas salvas ou começa com uma lista vazia.
let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];

// ==========================================
// ADICIONAR TAREFA
// ==========================================

// Valida e adiciona uma nova tarefa à lista.
function adicionarTarefa() {
  // Obtém o campo onde o usuário digita a tarefa.
  const input = document.getElementById("inputTarefa");

  // Remove espaços extras para evitar tarefas aparentemente vazias.
  const texto = input.value.trim();

  // Interrompe a operação quando não há texto válido.
  if (texto === "") {
    alert("Digite uma tarefa!");

    return;
  }

  // Monta o objeto que representa a nova tarefa.
  const novaTarefa = {
    // Usa o horário atual como identificador da tarefa.
    id: Date.now(),

    // Guarda o texto já limpo.
    texto: texto,

    // Toda tarefa começa pendente.
    concluida: false,
  };

  // Adiciona a tarefa ao conjunto em memória.
  tarefas.push(novaTarefa);

  // Persiste a alteração no armazenamento do navegador.
  salvarTarefas();

  // Limpa o campo após o cadastro.
  input.value = "";

  // Devolve o foco ao campo para permitir novos cadastros rapidamente.
  input.focus();

  // Atualiza a lista visível na tela.
  mostrarTarefas();
}

// ==========================================
// MOSTRAR TAREFAS
// ==========================================

// Renderiza o resumo e a lista de tarefas na página.
function mostrarTarefas() {
  // Obtém os elementos que serão atualizados.
  const lista = document.getElementById("listaTarefas");
  const resumo = document.getElementById("resumoTarefas");
  // Lê o termo de pesquisa em minúsculas para permitir comparação sem diferença de caixa.
  const termoPesquisa = document.getElementById("pesquisaTarefas").value.trim().toLowerCase();

  // Conta quantas tarefas estão concluídas.
  const concluidas = tarefas.filter(function (tarefa) {
    return tarefa.concluida;
  }).length;

  // Calcula as pendentes como o total menos as concluídas.
  const pendentes = tarefas.length - concluidas;

  // Calcula o percentual concluído, evitando divisão por zero.
  const percentualConcluidas = tarefas.length === 0
    ? 0
    : Math.round((concluidas / tarefas.length) * 100);

  // Calcula o percentual pendente, também tratando a lista vazia.
  const percentualPendentes = tarefas.length === 0
    ? 0
    : Math.round((pendentes / tarefas.length) * 100);

  // Exibe os números resumidos para o usuário.
  resumo.textContent = `Concluídas: ${concluidas} (${percentualConcluidas}%) | Pendentes: ${pendentes} (${percentualPendentes}%)`;

  // Limpa a renderização anterior antes de criar a lista atualizada.
  lista.innerHTML = "";

  // Informa quando ainda não existe nenhuma tarefa cadastrada.
  if (tarefas.length === 0) {
    lista.innerHTML = `

        <p class="sem-tarefas">

            Nenhuma tarefa cadastrada.

        </p>

    `;

    return;
  }

  // Mantém apenas as tarefas cujo texto contém o termo pesquisado.
  const tarefasFiltradas = tarefas.filter(function (tarefa) {
    return tarefa.texto.toLowerCase().includes(termoPesquisa);
  });

  // Informa quando a pesquisa não encontrou resultados.
  if (tarefasFiltradas.length === 0) {
    lista.innerHTML = `

        <p class="sem-tarefas">

            Nenhuma tarefa encontrada.

        </p>

    `;

    return;
  }

  // Cria os elementos visuais de cada tarefa filtrada.
  tarefasFiltradas.forEach(function (tarefa) {
    // Cria o contêiner da tarefa.
    const item = document.createElement("div");

    // Aplica a classe base de layout e aparência.
    item.classList.add("tarefa");

    // Marca visualmente tarefas concluídas.
    if (tarefa.concluida) {
      item.classList.add("concluida");
    }

    // Cria a caixa de seleção usada para concluir a tarefa.
    const checkbox = document.createElement("input");

    // Define o tipo do campo como checkbox.
    checkbox.type = "checkbox";

    // Sincroniza a marcação com o estado salvo.
    checkbox.checked = tarefa.concluida;

    // Alterna o estado da tarefa quando a caixa é modificada.
    checkbox.addEventListener("change", function () {
      concluirTarefa(tarefa.id);
    });

    // Cria o texto que identifica a tarefa.
    const texto = document.createElement("span");

    // Insere o texto como conteúdo seguro, sem interpretar HTML.
    texto.textContent = tarefa.texto;

    // Cria o botão de edição.
    const botaoEditar = document.createElement("button");

    // Define o rótulo exibido no botão.
    botaoEditar.textContent = "Editar";

    // Liga o botão à tarefa correspondente.
    botaoEditar.addEventListener("click", function () {
      editarTarefa(tarefa.id);
    });

    // Cria o botão de exclusão.
    const botaoApagar = document.createElement("button");

    // Define o rótulo exibido no botão.
    botaoApagar.textContent = "Apagar";

    // Liga o botão à função que remove a tarefa correspondente.
    botaoApagar.addEventListener("click", function () {
      apagarTarefa(tarefa.id);
    });

    // Insere os elementos na ordem em que aparecem na interface.
    item.appendChild(checkbox);

    item.appendChild(texto);

    item.appendChild(botaoEditar);

    item.appendChild(botaoApagar);

    lista.appendChild(item);
  });
}

// ==========================================
// CONCLUIR TAREFA
// ==========================================

// Inverte o estado de conclusão da tarefa identificada.
function concluirTarefa(id) {
  // Cria uma nova lista atualizando apenas a tarefa escolhida.
  tarefas = tarefas.map(function (tarefa) {
    if (tarefa.id === id) {
      // Alterna entre concluída e pendente.
      tarefa.concluida = !tarefa.concluida;
    }

    // Mantém cada tarefa na lista resultante.
    return tarefa;
  });

  // Salva o novo estado e atualiza a tela.
  salvarTarefas();

  mostrarTarefas();
}

// ==========================================
// EDITAR TAREFA
// ==========================================

// Altera o texto da tarefa escolhida.
function editarTarefa(id) {
  // Procura a tarefa pelo identificador único.
  const tarefa = tarefas.find(function (tarefa) {
    return tarefa.id === id;
  });

  // Encerra sem alterações se a tarefa não existir mais.
  if (!tarefa) {
    return;
  }

  // Solicita o novo texto mantendo o valor atual como sugestão.
  const novoTexto = prompt("Edite sua tarefa:", tarefa.texto);

  // Cancela quando o usuário fecha a caixa ou deixa o texto vazio.
  if (novoTexto === null || novoTexto.trim() === "") {
    return;
  }

  // Substitui o texto por sua versão sem espaços extras.
  tarefa.texto = novoTexto.trim();

  // Persiste e renderiza a alteração.
  salvarTarefas();

  mostrarTarefas();
}

// ==========================================
// APAGAR TAREFA
// ==========================================

// Remove uma tarefa depois de pedir confirmação.
function apagarTarefa(id) {
  // Pergunta ao usuário antes de executar uma ação irreversível.
  const confirmar = confirm("Deseja realmente apagar esta tarefa?");

  // Cancela a operação quando a confirmação não foi dada.
  if (!confirmar) {
    return;
  }

  // Mantém todas as tarefas, exceto a escolhida.
  tarefas = tarefas.filter(function (tarefa) {
    return tarefa.id !== id;
  });

  // Persiste e renderiza a nova lista.
  salvarTarefas();

  mostrarTarefas();
}

// ==========================================
// SALVAR TAREFAS
// ==========================================

// Serializa e guarda as tarefas no armazenamento do navegador.
function salvarTarefas() {
  localStorage.setItem(
    "tarefas",

    JSON.stringify(tarefas),
  );
}

// ==========================================
// ADICIONAR COM ENTER
// ==========================================

// Obtém os campos de criação e pesquisa.
const inputTarefa = document.getElementById("inputTarefa");
const pesquisaTarefas = document.getElementById("pesquisaTarefas");

// Permite cadastrar a tarefa pressionando Enter.
inputTarefa.addEventListener("keypress", function (event) {
  // Só dispara o cadastro quando a tecla pressionada for Enter.
  if (event.key === "Enter") {
    adicionarTarefa();
  }
});

// Atualiza os resultados sempre que o texto da pesquisa muda.
pesquisaTarefas.addEventListener("input", mostrarTarefas);

// ==========================================
// CARREGAR A PÁGINA
// ==========================================

// Faz a primeira renderização assim que o script termina de carregar.
mostrarTarefas();
