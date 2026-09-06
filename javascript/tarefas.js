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

// Define valores padrão para tarefas criadas antes dos novos campos.
tarefas = tarefas.map(function (tarefa) {
  return {
    ...tarefa,
    prioridade: tarefa.prioridade || "media",
    categoria: tarefa.categoria || "geral",
    prazo: tarefa.prazo || "",
    usuario: tarefa.usuario || obterUsuarioAtual() || "admin",
    subtarefas: Array.isArray(tarefa.subtarefas) ? tarefa.subtarefas : [],
  };
});

// Persiste a migração para que os valores padrão não precisem ser recriados.
salvarTarefas();

// Guarda a ordem numérica usada para comparar prioridades.
const pesoPrioridade = {
  alta: 3,
  media: 2,
  baixa: 1,
};

// Guarda a ação e a tarefa atualmente abertas no modal.
let acaoModal = null;
let tarefaModalId = null;

// Devolve a data atual no formato usado pelo campo date.
function obterDataAtual() {
  return new Date().toISOString().slice(0, 10);
}

// Verifica se uma tarefa possui prazo anterior ao dia atual e ainda está pendente.
function tarefaEstaAtrasada(tarefa) {
  return Boolean(tarefa.prazo)
    && tarefa.prazo < obterDataAtual()
    && !tarefa.concluida;
}

// ==========================================
// ADICIONAR TAREFA
// ==========================================

// Valida e adiciona uma nova tarefa à lista.
function adicionarTarefa() {
  // Obtém o campo onde o usuário digita a tarefa.
  const input = document.getElementById("inputTarefa");

  // Remove espaços extras para evitar tarefas aparentemente vazias.
  const texto = input.value.trim();
  const prioridade = document.getElementById("prioridadeTarefa").value;
  const categoria = document.getElementById("categoriaTarefa").value;
  const prazo = document.getElementById("prazoTarefa").value;

  // Interrompe a operação quando não há texto válido.
  if (texto === "") {
    abrirModal("A tarefa precisa de um texto", "Digite uma descrição antes de adicionar.", null, false);

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

    // Registra a prioridade escolhida.
    prioridade: prioridade,

    // Registra a categoria escolhida.
    categoria: categoria,

    // Registra o prazo opcional.
    prazo: prazo,

    // Relaciona a tarefa ao usuário que a criou.
    usuario: obterUsuarioAtual(),

    // Começa a tarefa sem subtarefas.
    subtarefas: [],
  };

  // Adiciona a tarefa ao conjunto em memória.
  tarefas.push(novaTarefa);

  // Persiste a alteração no armazenamento do navegador.
  salvarTarefas();

  // Limpa o campo após o cadastro.
  input.value = "";

  // Volta os campos opcionais para seus valores padrão.
  document.getElementById("prioridadeTarefa").value = "media";
  document.getElementById("categoriaTarefa").value = "geral";
  document.getElementById("prazoTarefa").value = "";

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
  const filtroStatus = document.getElementById("filtroStatus").value;
  const filtroPrioridade = document.getElementById("filtroPrioridade").value;
  const filtroCategoria = document.getElementById("filtroCategoria").value;
  const ordenacao = document.getElementById("ordenacaoTarefas").value;

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

  // Mantém apenas as tarefas compatíveis com pesquisa e filtros selecionados.
  const tarefasFiltradas = tarefas.filter(function (tarefa) {
    const correspondeTexto = tarefa.texto.toLowerCase().includes(termoPesquisa);
    const correspondeStatus = filtroStatus === "todas"
      || (filtroStatus === "pendentes" && !tarefa.concluida)
      || (filtroStatus === "concluidas" && tarefa.concluida)
      || (filtroStatus === "atrasadas" && tarefaEstaAtrasada(tarefa));
    const correspondePrioridade = filtroPrioridade === "todas"
      || tarefa.prioridade === filtroPrioridade;
    const correspondeCategoria = filtroCategoria === "todas"
      || tarefa.categoria === filtroCategoria;

    return correspondeTexto
      && correspondeStatus
      && correspondePrioridade
      && correspondeCategoria;
  }).sort(function (primeiraTarefa, segundaTarefa) {
    if (ordenacao === "prazo") {
      return (primeiraTarefa.prazo || "9999-12-31")
        .localeCompare(segundaTarefa.prazo || "9999-12-31");
    }

    if (ordenacao === "prioridade") {
      return pesoPrioridade[segundaTarefa.prioridade]
        - pesoPrioridade[primeiraTarefa.prioridade];
    }

    if (ordenacao === "nome") {
      return primeiraTarefa.texto.localeCompare(segundaTarefa.texto);
    }

    return segundaTarefa.id - primeiraTarefa.id;
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

    // Cria uma descrição com categoria, prioridade e prazo.
    const detalhes = document.createElement("small");
    const prazoTexto = tarefa.prazo ? `Prazo: ${tarefa.prazo}` : "Sem prazo";
    detalhes.textContent = `${tarefa.categoria} | ${tarefa.prioridade} | ${prazoTexto}`;
    detalhes.className = "detalhes-tarefa";

    // Marca visualmente tarefas cujo prazo já passou.
    if (tarefaEstaAtrasada(tarefa)) {
      item.classList.add("atrasada");
      detalhes.textContent += " | Atrasada";
    }

    // Cria o botão de edição.
    const botaoEditar = document.createElement("button");

    // Define o rótulo exibido no botão.
    botaoEditar.textContent = "Editar";

    // Liga o botão à tarefa correspondente.
    botaoEditar.addEventListener("click", function () {
      abrirEdicao(tarefa.id);
    });

    // Cria o botão de exclusão.
    const botaoApagar = document.createElement("button");

    // Define o rótulo exibido no botão.
    botaoApagar.textContent = "Apagar";

    // Liga o botão à função que remove a tarefa correspondente.
    botaoApagar.addEventListener("click", function () {
      abrirExclusao(tarefa.id);
    });

    // Insere os elementos na ordem em que aparecem na interface.
    item.appendChild(checkbox);

    item.appendChild(texto);

    item.appendChild(detalhes);

    // Cria a área de subtarefas da tarefa principal.
    const areaSubtarefas = document.createElement("div");
    areaSubtarefas.className = "subtarefas";

    // Exibe o progresso das subtarefas quando existem itens internos.
    if (tarefa.subtarefas.length > 0) {
      const subtarefasConcluidas = tarefa.subtarefas.filter(function (subtarefa) {
        return subtarefa.concluida;
      }).length;
      const percentualSubtarefas = Math.round(
        (subtarefasConcluidas / tarefa.subtarefas.length) * 100,
      );
      const progresso = document.createElement("small");
      const barraProgresso = document.createElement("progress");
      progresso.className = "progresso-subtarefas";
      progresso.textContent = `${subtarefasConcluidas}/${tarefa.subtarefas.length} subtarefas concluídas (${percentualSubtarefas}%)`;
      barraProgresso.className = "barra-subtarefas";
      barraProgresso.max = 100;
      barraProgresso.value = percentualSubtarefas;
      barraProgresso.setAttribute("aria-label", `${percentualSubtarefas}% das subtarefas concluídas`);
      areaSubtarefas.appendChild(progresso);
      areaSubtarefas.appendChild(barraProgresso);
    }

    // Renderiza cada subtarefa dentro do cartão principal.
    tarefa.subtarefas.forEach(function (subtarefa) {
      const linhaSubtarefa = document.createElement("div");
      const checkboxSubtarefa = document.createElement("input");
      const textoSubtarefa = document.createElement("span");
      const botaoRemover = document.createElement("button");

      linhaSubtarefa.className = "subtarefa";
      checkboxSubtarefa.type = "checkbox";
      checkboxSubtarefa.checked = subtarefa.concluida;
      checkboxSubtarefa.setAttribute("aria-label", `Concluir subtarefa ${subtarefa.texto}`);
      textoSubtarefa.textContent = subtarefa.texto;
      botaoRemover.type = "button";
      botaoRemover.className = "botao-remover-subtarefa";
      botaoRemover.textContent = "Remover";
      botaoRemover.setAttribute("aria-label", `Remover subtarefa ${subtarefa.texto}`);

      checkboxSubtarefa.addEventListener("change", function () {
        alternarSubtarefa(tarefa.id, subtarefa.id);
      });
      botaoRemover.addEventListener("click", function () {
        removerSubtarefa(tarefa.id, subtarefa.id);
      });

      linhaSubtarefa.appendChild(checkboxSubtarefa);
      linhaSubtarefa.appendChild(textoSubtarefa);
      linhaSubtarefa.appendChild(botaoRemover);
      areaSubtarefas.appendChild(linhaSubtarefa);
    });

    // Cria o campo para adicionar uma nova subtarefa.
    const formularioSubtarefa = document.createElement("form");
    const inputSubtarefa = document.createElement("input");
    const botaoSubtarefa = document.createElement("button");

    formularioSubtarefa.className = "form-subtarefa";
    inputSubtarefa.type = "text";
    inputSubtarefa.placeholder = "Adicionar subtarefa";
    inputSubtarefa.setAttribute("aria-label", `Adicionar subtarefa em ${tarefa.texto}`);
    botaoSubtarefa.type = "submit";
    botaoSubtarefa.textContent = "Adicionar";

    formularioSubtarefa.addEventListener("submit", function (event) {
      event.preventDefault();
      adicionarSubtarefa(tarefa.id, inputSubtarefa.value);
    });

    formularioSubtarefa.appendChild(inputSubtarefa);
    formularioSubtarefa.appendChild(botaoSubtarefa);
    areaSubtarefas.appendChild(formularioSubtarefa);
    item.appendChild(areaSubtarefas);

    item.appendChild(botaoEditar);

    item.appendChild(botaoApagar);

    lista.appendChild(item);
  });
}

// Adiciona uma subtarefa dentro da tarefa principal.
function adicionarSubtarefa(tarefaId, texto) {
  const textoLimpo = texto.trim();
  const tarefa = tarefas.find(function (item) {
    return item.id === tarefaId;
  });

  if (!tarefa || textoLimpo === "") {
    return;
  }

  tarefa.subtarefas.push({
    id: Date.now(),
    texto: textoLimpo,
    concluida: false,
  });
  salvarTarefas();
  mostrarTarefas();
}

// Alterna o estado de conclusão de uma subtarefa.
function alternarSubtarefa(tarefaId, subtarefaId) {
  const tarefa = tarefas.find(function (item) {
    return item.id === tarefaId;
  });

  if (!tarefa) {
    return;
  }

  const subtarefa = tarefa.subtarefas.find(function (item) {
    return item.id === subtarefaId;
  });

  if (!subtarefa) {
    return;
  }

  subtarefa.concluida = !subtarefa.concluida;
  salvarTarefas();
  mostrarTarefas();
}

// Remove uma subtarefa da tarefa principal.
function removerSubtarefa(tarefaId, subtarefaId) {
  const tarefa = tarefas.find(function (item) {
    return item.id === tarefaId;
  });

  if (!tarefa) {
    return;
  }

  tarefa.subtarefas = tarefa.subtarefas.filter(function (subtarefa) {
    return subtarefa.id !== subtarefaId;
  });
  salvarTarefas();
  mostrarTarefas();
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

// Abre o modal com os dados da tarefa escolhida.
function abrirEdicao(id) {
  // Procura a tarefa pelo identificador único.
  const tarefa = tarefas.find(function (tarefa) {
    return tarefa.id === id;
  });

  // Encerra sem alterações se a tarefa não existir mais.
  if (!tarefa) {
    return;
  }

  abrirModal("Editar tarefa", "Atualize o texto da tarefa.", tarefa, true);
}

// ==========================================
// APAGAR TAREFA
// ==========================================

// Abre o modal de confirmação para excluir uma tarefa.
function abrirExclusao(id) {
  const tarefa = tarefas.find(function (item) {
    return item.id === id;
  });

  if (!tarefa) {
    return;
  }

  abrirModal("Excluir tarefa", `Deseja realmente apagar "${tarefa.texto}"?`, tarefa, false);
}

// Executa a exclusão da tarefa confirmada no modal.
function apagarTarefa(id) {

  // Mantém todas as tarefas, exceto a escolhida.
  tarefas = tarefas.filter(function (tarefa) {
    return tarefa.id !== id;
  });

  // Persiste e renderiza a nova lista.
  salvarTarefas();

  mostrarTarefas();
}

// Abre o modal no modo de edição ou confirmação.
function abrirModal(titulo, mensagem, tarefa, permiteTexto) {
  const modal = document.getElementById("modalTarefa");
  const valor = document.getElementById("valorModal");
  const rotulo = document.getElementById("rotuloModal");

  document.getElementById("tituloModal").textContent = titulo;
  document.getElementById("mensagemModal").textContent = mensagem;
  acaoModal = permiteTexto ? "editar" : tarefa ? "excluir" : "aviso";
  tarefaModalId = tarefa ? tarefa.id : null;
  valor.value = tarefa ? tarefa.texto : "";
  valor.hidden = !permiteTexto;
  rotulo.hidden = !permiteTexto;
  document.getElementById("confirmarModal").hidden = acaoModal === "aviso";
  modal.hidden = false;

  if (permiteTexto) {
    valor.focus();
  } else {
    document.getElementById("cancelarModal").focus();
  }
}

// Fecha o modal e limpa a ação pendente.
function fecharModal() {
  document.getElementById("modalTarefa").hidden = true;
  acaoModal = null;
  tarefaModalId = null;
}

// Executa a ação escolhida no modal.
function confirmarModal() {
  const tarefa = tarefas.find(function (item) {
    return item.id === tarefaModalId;
  });

  if (acaoModal === "editar" && tarefa) {
    const novoTexto = document.getElementById("valorModal").value.trim();

    if (novoTexto === "") {
      document.getElementById("mensagemModal").textContent = "Digite um texto para a tarefa.";
      document.getElementById("valorModal").focus();
      return;
    }

    tarefa.texto = novoTexto;
    salvarTarefas();
    mostrarTarefas();
  }

  if (acaoModal === "excluir" && tarefa) {
    apagarTarefa(tarefa.id);
  }

  fecharModal();
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
const filtroStatus = document.getElementById("filtroStatus");
const filtroPrioridade = document.getElementById("filtroPrioridade");
const filtroCategoria = document.getElementById("filtroCategoria");
const ordenacaoTarefas = document.getElementById("ordenacaoTarefas");

// Permite cadastrar a tarefa pressionando Enter.
inputTarefa.addEventListener("keypress", function (event) {
  // Só dispara o cadastro quando a tecla pressionada for Enter.
  if (event.key === "Enter") {
    event.preventDefault();
    adicionarTarefa();
  }
});

// Atualiza os resultados sempre que o texto da pesquisa muda.
pesquisaTarefas.addEventListener("input", mostrarTarefas);

// Atualiza a lista quando qualquer filtro ou ordenação muda.
filtroStatus.addEventListener("change", mostrarTarefas);
filtroPrioridade.addEventListener("change", mostrarTarefas);
filtroCategoria.addEventListener("change", mostrarTarefas);
ordenacaoTarefas.addEventListener("change", mostrarTarefas);

// Configura os controles de abertura, confirmação e fechamento do modal.
document.getElementById("cancelarModal").addEventListener("click", fecharModal);
document.getElementById("confirmarModal").addEventListener("click", confirmarModal);
document.getElementById("modalTarefa").addEventListener("click", function (event) {
  if (event.target.id === "modalTarefa") {
    fecharModal();
  }
});

// Permite fechar o modal usando a tecla Escape.
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && !document.getElementById("modalTarefa").hidden) {
    fecharModal();
  }
});

// ==========================================
// CARREGAR A PÁGINA
// ==========================================

// Faz a primeira renderização assim que o script termina de carregar.
mostrarTarefas();
