// ==========================================
// VERIFICAR LOGIN
// ==========================================

protegerPagina();

const menuAdministracao = document.getElementById("menuAdministracao");

if (!usuarioEhAdmin()) {
  menuAdministracao.hidden = true;
}

// ==========================================
// CARREGAR TAREFAS
// ==========================================

let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];

// ==========================================
// ADICIONAR TAREFA
// ==========================================

function adicionarTarefa() {
  const input = document.getElementById("inputTarefa");

  const texto = input.value.trim();

  if (texto === "") {
    alert("Digite uma tarefa!");

    return;
  }

  const novaTarefa = {
    id: Date.now(),

    texto: texto,

    concluida: false,
  };

  tarefas.push(novaTarefa);

  salvarTarefas();

  input.value = "";

  input.focus();

  mostrarTarefas();
}

// ==========================================
// MOSTRAR TAREFAS
// ==========================================

function mostrarTarefas() {
  const lista = document.getElementById("listaTarefas");
  const resumo = document.getElementById("resumoTarefas");
  const termoPesquisa = document.getElementById("pesquisaTarefas").value.trim().toLowerCase();

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

  resumo.textContent = `Concluídas: ${concluidas} (${percentualConcluidas}%) | Pendentes: ${pendentes} (${percentualPendentes}%)`;

  lista.innerHTML = "";

  if (tarefas.length === 0) {
    lista.innerHTML = `

        <p class="sem-tarefas">

            Nenhuma tarefa cadastrada.

        </p>

    `;

    return;
  }

  const tarefasFiltradas = tarefas.filter(function (tarefa) {
    return tarefa.texto.toLowerCase().includes(termoPesquisa);
  });

  if (tarefasFiltradas.length === 0) {
    lista.innerHTML = `

        <p class="sem-tarefas">

            Nenhuma tarefa encontrada.

        </p>

    `;

    return;
  }

  tarefasFiltradas.forEach(function (tarefa) {
    const item = document.createElement("div");

    item.classList.add("tarefa");

    if (tarefa.concluida) {
      item.classList.add("concluida");
    }

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";

    checkbox.checked = tarefa.concluida;

    checkbox.addEventListener("change", function () {
      concluirTarefa(tarefa.id);
    });

    const texto = document.createElement("span");

    texto.textContent = tarefa.texto;

    const botaoEditar = document.createElement("button");

    botaoEditar.textContent = "Editar";

    botaoEditar.addEventListener("click", function () {
      editarTarefa(tarefa.id);
    });

    const botaoApagar = document.createElement("button");

    botaoApagar.textContent = "Apagar";

    botaoApagar.addEventListener("click", function () {
      apagarTarefa(tarefa.id);
    });

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

function concluirTarefa(id) {
  tarefas = tarefas.map(function (tarefa) {
    if (tarefa.id === id) {
      tarefa.concluida = !tarefa.concluida;
    }

    return tarefa;
  });

  salvarTarefas();

  mostrarTarefas();
}

// ==========================================
// EDITAR TAREFA
// ==========================================

function editarTarefa(id) {
  const tarefa = tarefas.find(function (tarefa) {
    return tarefa.id === id;
  });

  if (!tarefa) {
    return;
  }

  const novoTexto = prompt("Edite sua tarefa:", tarefa.texto);

  if (novoTexto === null || novoTexto.trim() === "") {
    return;
  }

  tarefa.texto = novoTexto.trim();

  salvarTarefas();

  mostrarTarefas();
}

// ==========================================
// APAGAR TAREFA
// ==========================================

function apagarTarefa(id) {
  const confirmar = confirm("Deseja realmente apagar esta tarefa?");

  if (!confirmar) {
    return;
  }

  tarefas = tarefas.filter(function (tarefa) {
    return tarefa.id !== id;
  });

  salvarTarefas();

  mostrarTarefas();
}

// ==========================================
// SALVAR TAREFAS
// ==========================================

function salvarTarefas() {
  localStorage.setItem(
    "tarefas",

    JSON.stringify(tarefas),
  );
}

// ==========================================
// ADICIONAR COM ENTER
// ==========================================

const inputTarefa = document.getElementById("inputTarefa");
const pesquisaTarefas = document.getElementById("pesquisaTarefas");

inputTarefa.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    adicionarTarefa();
  }
});

pesquisaTarefas.addEventListener("input", mostrarTarefas);

// ==========================================
// CARREGAR A PÁGINA
// ==========================================

mostrarTarefas();
