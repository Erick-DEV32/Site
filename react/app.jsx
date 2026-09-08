import { useEffect, useState } from "react";

// Usuário criado automaticamente quando o navegador ainda não possui cadastros.
const initialUsers = [
  { usuario: "admin", senha: "123", perfil: "admin", status: "ativo" },
];

// Lê JSON do localStorage sem interromper a aplicação quando o conteúdo estiver inválido.
function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}

// Carrega usuários e adiciona status ativo aos registros antigos.
function getUsers() {
  const users = readStorage("usuarios", initialUsers);
  const normalizedUsers =
    Array.isArray(users) && users.length > 0 ? users : initialUsers;

  return normalizedUsers.map((user) => ({
    ...user,
    status: user.status || "ativo",
  }));
}

// Carrega as tarefas existentes ou inicia uma lista vazia.
function getTasks() {
  const tasks = readStorage("tarefas", []);
  return Array.isArray(tasks) ? tasks : [];
}

// Componente raiz: concentra sessão, tema, dados persistidos e navegação.
function App() {
  // O tema é mantido entre recarregamentos do navegador.
  const [theme, setTheme] = useState(localStorage.getItem("tema") || "claro");
  // Recupera a identidade da sessão atual e trata o valor legado "true".
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("usuarioLogado");
    return savedUser === "true" ? "admin" : savedUser;
  });
  // Define qual área do painel está visível.
  const [view, setView] = useState("dashboard");
  // Estados principais da aplicação, carregados uma vez na inicialização.
  const [tasks, setTasks] = useState(getTasks);
  const [users, setUsers] = useState(getUsers);

  // Aplica o tema no elemento body e salva a preferência.
  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("tema", theme);
  }, [theme]);

  // Persiste toda alteração feita nas tarefas.
  useEffect(() => {
    localStorage.setItem("tarefas", JSON.stringify(tasks));
  }, [tasks]);

  // Persiste toda alteração feita nos usuários.
  useEffect(() => {
    localStorage.setItem("usuarios", JSON.stringify(users));
  }, [users]);

  // Localiza o cadastro associado à sessão para definir permissões.
  const loggedUser = users.find((user) => user.usuario === currentUser);
  const isAdmin = loggedUser?.perfil === "admin";

  // Valida as credenciais e inicia uma sessão ativa.
  function login(username, password) {
    const user = users.find(
      (item) => item.usuario === username && item.senha === password,
    );

    if (!user) return "Usuário ou senha incorretos.";
    if (user.status !== "ativo") return "Este usuário está inativo.";

    localStorage.setItem("usuarioLogado", user.usuario);
    setCurrentUser(user.usuario);
    return "";
  }

  // Encerra a sessão e retorna ao formulário de login.
  function logout() {
    localStorage.removeItem("usuarioLogado");
    setCurrentUser(null);
  }

  // Usuários sem sessão válida só podem visualizar o login.
  if (!currentUser || !loggedUser) {
    return (
      <Login
        onLogin={login}
        theme={theme}
        onTheme={() => setTheme(theme === "escuro" ? "claro" : "escuro")}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        view={view}
        setView={setView}
        isAdmin={isAdmin}
        onLogout={logout}
      />
      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">
              {isAdmin ? "Visão administrativa" : "Seu espaço de foco"}
            </span>
            <h1>
              {view === "users"
                ? "Pessoas"
                : view === "report"
                  ? "Relatórios"
                  : "Minhas tarefas"}
            </h1>
          </div>
          <div className="topbar-actions">
            <span className="user-chip">
              <span className="avatar">{currentUser[0].toUpperCase()}</span>
              {currentUser}
            </span>
            <button
              className="icon-button"
              onClick={() => setTheme(theme === "escuro" ? "claro" : "escuro")}
              aria-label="Alternar tema"
            >
              {theme === "escuro" ? "☼" : "◐"}
            </button>
          </div>
        </header>
        {view === "users" && isAdmin ? (
          <UsersView users={users} setUsers={setUsers} />
        ) : null}
        {view === "report" && isAdmin ? (
          <ReportView tasks={tasks} users={users} />
        ) : null}
        {view === "dashboard" ? (
          <TaskView
            tasks={tasks}
            setTasks={setTasks}
            currentUser={currentUser}
            isAdmin={isAdmin}
          />
        ) : null}
      </main>
    </div>
  );
}

// Tela de autenticação e alternância do tema.
function Login({ onLogin, theme, onTheme }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Envia as credenciais para o componente raiz.
  function submit(event) {
    event.preventDefault();
    const message = onLogin(username.trim(), password);
    setError(message);
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand-mark">F</div>
        <span className="eyebrow">Flowtask</span>
        <h1>
          Organize o trabalho. <em>Libere espaço.</em>
        </h1>
        <p className="muted">
          Um painel simples para transformar intenção em progresso.
        </p>
        <form className="login-form" onSubmit={submit}>
          <label>
            Usuário
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit">
            Entrar no painel <span>→</span>
          </button>
        </form>
        <button className="theme-link" onClick={onTheme}>
          {theme === "escuro" ? "Usar tema claro" : "Usar tema escuro"}
        </button>
      </section>
      <aside className="login-aside">
        <span>01</span>
        <strong>
          Menos ruído.
          <br />
          Mais entrega.
        </strong>
        <p>Seu trabalho importante, em um só lugar.</p>
      </aside>
    </main>
  );
}

// Navegação lateral, com menus administrativos condicionais ao perfil.
function Sidebar({ view, setView, isAdmin, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">F</div>
        <strong>flowtask</strong>
      </div>
      <nav>
        <span className="nav-label">Workspace</span>
        <button
          className={view === "dashboard" ? "nav-item active" : "nav-item"}
          onClick={() => setView("dashboard")}
        >
          <span>▦</span> Tarefas
        </button>
        {isAdmin && (
          <>
            <span className="nav-label">Administração</span>
            <button
              className={view === "report" ? "nav-item active" : "nav-item"}
              onClick={() => setView("report")}
            >
              <span>◒</span> Relatórios
            </button>
            <button
              className={view === "users" ? "nav-item active" : "nav-item"}
              onClick={() => setView("users")}
            >
              <span>♧</span> Usuários
            </button>
          </>
        )}
      </nav>
      <button className="logout-button" onClick={onLogout}>
        ↪ <span>Sair</span>
      </button>
    </aside>
  );
}

// Área de tarefas: filtros, indicadores, cadastro e lista.
function TaskView({ tasks, setTasks, currentUser, isAdmin }) {
  // Filtros controlados pela interface.
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("todas");
  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState("media");
  const [newCategory, setNewCategory] = useState("geral");
  const [newDeadline, setNewDeadline] = useState("");
  // Administradores veem tudo; usuários comuns veem apenas suas tarefas.
  const visibleTasks = isAdmin
    ? tasks
    : tasks.filter((task) => task.usuario === currentUser);
  // Aplica a busca textual e o filtro de status antes da renderização.
  const filtered = visibleTasks.filter((task) => {
    const matchesQuery = task.texto.toLowerCase().includes(query.toLowerCase());
    const matchesStatus =
      status === "todas" ||
      (status === "concluidas" ? task.concluida : !task.concluida);
    return matchesQuery && matchesStatus;
  });
  const done = visibleTasks.filter((task) => task.concluida).length;
  const progress = visibleTasks.length
    ? Math.round((done / visibleTasks.length) * 100)
    : 0;

  // Cria uma tarefa com seus metadados e uma coleção vazia de subtarefas.
  function addTask(event) {
    event.preventDefault();
    if (!newTask.trim()) return;
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        texto: newTask.trim(),
        concluida: false,
        usuario: currentUser,
        prioridade: newPriority,
        categoria: newCategory,
        prazo: newDeadline,
        subtarefas: [],
      },
    ]);
    setNewTask("");
    setNewPriority("media");
    setNewCategory("geral");
    setNewDeadline("");
  }

  // Alterna uma tarefa entre concluída e pendente.
  function toggleTask(id) {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, concluida: !task.concluida } : task,
      ),
    );
  }
  // Remove a tarefa pelo identificador.
  function removeTask(id) {
    setTasks(tasks.filter((task) => task.id !== id));
  }
  // Atualiza somente os campos alterados, preservando os demais.
  function updateTask(id, changes) {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, ...changes } : task)),
    );
  }
  // Adiciona uma subtarefa dentro da tarefa principal.
  function addSubtask(task, text) {
    const texto = text.trim();

    if (!texto) return;

    updateTask(task.id, {
      subtarefas: [
        ...(task.subtarefas || []),
        { id: Date.now(), texto, concluida: false },
      ],
    });
  }
  // Alterna a conclusão de uma subtarefa específica.
  function toggleSubtask(task, subtaskId) {
    updateTask(task.id, {
      subtarefas: (task.subtarefas || []).map((subtask) =>
        subtask.id === subtaskId
          ? { ...subtask, concluida: !subtask.concluida }
          : subtask,
      ),
    });
  }
  // Remove uma subtarefa sem remover a tarefa principal.
  function removeSubtask(task, subtaskId) {
    updateTask(task.id, {
      subtarefas: (task.subtarefas || []).filter(
        (subtask) => subtask.id !== subtaskId,
      ),
    });
  }

  return (
    <>
      <section className="stats-row">
        <div className="stat-card accent">
          <span>Progresso geral</span>
          <strong>{progress}%</strong>
          <div className="progress">
            <i style={{ width: `${progress}%` }} />
          </div>
          <small>
            {done} de {visibleTasks.length} concluídas
          </small>
        </div>
        <div className="stat-card">
          <span>Total de tarefas</span>
          <strong>{visibleTasks.length}</strong>
          <small>neste workspace</small>
        </div>
        <div className="stat-card">
          <span>Em andamento</span>
          <strong>{visibleTasks.length - done}</strong>
          <small>pedem sua atenção</small>
        </div>
      </section>
      <section className="task-section">
        <div className="section-header">
          <div>
            <h2>Lista de tarefas</h2>
            <p className="muted">Acompanhe o que precisa acontecer hoje.</p>
          </div>
          <span className="date-label">
            {new Date().toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        </div>
        <form className="quick-add" onSubmit={addTask}>
          <input
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            placeholder="O que precisa ser feito?"
            aria-label="Descrição da tarefa"
            required
          />
          <select
            value={newPriority}
            onChange={(event) => setNewPriority(event.target.value)}
            aria-label="Prioridade da tarefa"
          >
            <option value="baixa">Prioridade baixa</option>
            <option value="media">Prioridade média</option>
            <option value="alta">Prioridade alta</option>
          </select>
          <select
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            aria-label="Categoria da tarefa"
          >
            <option value="geral">Geral</option>
            <option value="trabalho">Trabalho</option>
            <option value="estudos">Estudos</option>
            <option value="pessoal">Pessoal</option>
          </select>
          <input
            type="date"
            value={newDeadline}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(event) => setNewDeadline(event.target.value)}
            aria-label="Prazo da tarefa"
          />
          <button className="primary-button" type="submit">
            Adicionar <span>+</span>
          </button>
        </form>
        <div className="filter-row">
          <input
            className="search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="⌕  Buscar tarefa"
          />
          <div className="segmented">
            {[
              ["todas", "Todas"],
              ["pendentes", "Pendentes"],
              ["concluidas", "Concluídas"],
            ].map(([value, label]) => (
              <button
                className={status === value ? "selected" : ""}
                key={value}
                onClick={() => setStatus(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="task-list">
          {filtered.length ? (
            filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onUpdate={(changes) => updateTask(task.id, changes)}
                onDelete={() => removeTask(task.id)}
                onAddSubtask={addSubtask}
                onToggleSubtask={toggleSubtask}
                onRemoveSubtask={removeSubtask}
              />
            ))
          ) : (
            <div className="empty-state">
              <span>⌁</span>
              <strong>Nenhuma tarefa encontrada</strong>
              <p>Tente outro termo ou adicione uma nova tarefa.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// Cartão de tarefa com edição, subtarefas e ações de status.
function TaskCard({
  task,
  onToggle,
  onUpdate,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onRemoveSubtask,
}) {
  const [subtaskText, setSubtaskText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.texto);
  const [editPriority, setEditPriority] = useState(task.prioridade || "media");
  const [editCategory, setEditCategory] = useState(task.categoria || "geral");
  const [editDeadline, setEditDeadline] = useState(task.prazo || "");
  // Garante compatibilidade com tarefas antigas sem subtarefas.
  const subtasks = Array.isArray(task.subtarefas) ? task.subtarefas : [];
  const completedSubtasks = subtasks.filter(
    (subtask) => subtask.concluida,
  ).length;
  const subtaskProgress = subtasks.length
    ? Math.round((completedSubtasks / subtasks.length) * 100)
    : 0;

  // Envia o formulário de nova subtarefa e limpa o campo.
  function submitSubtask(event) {
    event.preventDefault();
    onAddSubtask(task, subtaskText);
    setSubtaskText("");
  }

  function startEditing() {
    setEditText(task.texto);
    setEditPriority(task.prioridade || "media");
    setEditCategory(task.categoria || "geral");
    setEditDeadline(task.prazo || "");
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  function saveEditing(event) {
    event.preventDefault();

    if (!editText.trim()) return;

    onUpdate({
      texto: editText.trim(),
      prioridade: editPriority,
      categoria: editCategory,
      prazo: editDeadline,
    });
    setEditing(false);
  }

  return (
    <article className={task.concluida ? "task-item done" : "task-item"}>
      <button className="check" onClick={onToggle} aria-label="Concluir tarefa">
        {task.concluida ? "✓" : ""}
      </button>
      <div className="task-content">
        {editing ? (
          <form className="task-edit-form" onSubmit={saveEditing}>
            <input
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
              aria-label="Texto da tarefa"
              autoFocus
              required
            />
            <div className="task-edit-fields">
              <select
                value={editPriority}
                onChange={(event) => setEditPriority(event.target.value)}
                aria-label="Prioridade"
              >
                <option value="baixa">Prioridade baixa</option>
                <option value="media">Prioridade média</option>
                <option value="alta">Prioridade alta</option>
              </select>
              <select
                value={editCategory}
                onChange={(event) => setEditCategory(event.target.value)}
                aria-label="Categoria"
              >
                <option value="geral">Geral</option>
                <option value="trabalho">Trabalho</option>
                <option value="estudos">Estudos</option>
                <option value="pessoal">Pessoal</option>
              </select>
              <input
                type="date"
                value={editDeadline}
                onChange={(event) => setEditDeadline(event.target.value)}
                aria-label="Prazo"
              />
            </div>
            <div className="task-edit-actions">
              <button className="text-button" type="submit">
                Salvar
              </button>
              <button
                className="text-button"
                type="button"
                onClick={cancelEditing}
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="task-copy">
            <strong>{task.texto}</strong>
            <span>
              {task.categoria || "geral"} · {task.prioridade || "media"}
              {task.prazo ? ` · Prazo: ${task.prazo}` : ""}
            </span>
          </div>
        )}
        <div className="subtasks">
          <div className="subtask-heading">
            <span>
              Subtarefas
              {SubtasksLabel(
                completedSubtasks,
                subtasks.length,
                subtaskProgress,
              )}
            </span>
            {subtasks.length > 0 && (
              <div className="subtask-progress">
                <i style={{ width: `${subtaskProgress}%` }} />
              </div>
            )}
          </div>
          {subtasks.map((subtask) => (
            <div className="subtask-row" key={subtask.id}>
              <button
                className="mini-check"
                onClick={() => onToggleSubtask(task, subtask.id)}
              >
                {subtask.concluida ? "✓" : ""}
              </button>
              <span className={subtask.concluida ? "subtask-done" : ""}>
                {subtask.texto}
              </span>
              <button
                className="subtask-remove"
                onClick={() => onRemoveSubtask(task, subtask.id)}
              >
                ×
              </button>
            </div>
          ))}
          <form className="subtask-form" onSubmit={submitSubtask}>
            <input
              value={subtaskText}
              onChange={(event) => setSubtaskText(event.target.value)}
              placeholder="Adicionar subtarefa"
              aria-label={`Adicionar subtarefa em ${task.texto}`}
            />
            <button type="submit" aria-label="Adicionar subtarefa">
              +
            </button>
          </form>
        </div>
      </div>
      {!editing && (
        <button className="text-button" onClick={startEditing}>
          Editar
        </button>
      )}
      <button
        className="delete-button visible"
        onClick={onDelete}
        aria-label="Excluir tarefa"
      >
        ×
      </button>
    </article>
  );
}

// Formata o resumo numérico exibido ao lado de "Subtarefas".
function SubtasksLabel(completed, total, progress) {
  return total > 0 ? ` ${completed}/${total} · ${progress}%` : "";
}

// Área administrativa de consulta, cadastro, edição e status de usuários.
function UsersView({ users, setUsers }) {
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState("usuario");
  const [status, setStatus] = useState("ativo");
  const [editingUser, setEditingUser] = useState(null);
  const filtered = users.filter((user) =>
    user.usuario.toLowerCase().includes(query.toLowerCase()),
  );
  // Limpa o formulário e sai do modo de edição.
  function resetForm() {
    setName("");
    setPassword("");
    setProfile("usuario");
    setStatus("ativo");
    setEditingUser(null);
  }

  // Decide entre criar um cadastro ou salvar uma edição existente.
  function submitUser(event) {
    event.preventDefault();
    const username = name.trim();

    if (
      !username ||
      (!editingUser && users.some((user) => user.usuario === username))
    )
      return;

    if (editingUser) {
      setUsers(
        users.map((user) =>
          user.usuario === editingUser
            ? {
                ...user,
                senha: password || user.senha,
                perfil: editingUser === "admin" ? "admin" : profile,
                status: editingUser === "admin" ? "ativo" : status,
              }
            : user,
        ),
      );
    } else {
      setUsers([
        ...users,
        { usuario: username, senha: password, perfil: profile, status },
      ]);
    }

    resetForm();
  }

  // Preenche o formulário com os dados do usuário escolhido.
  function startEditing(user) {
    setEditingUser(user.usuario);
    setName(user.usuario);
    setPassword("");
    setProfile(user.perfil);
    setStatus(user.status);
  }

  // Alterna o status sem permitir que o administrador principal seja bloqueado.
  function toggleUser(username) {
    setUsers(
      users.map((user) =>
        user.usuario === username && username !== "admin"
          ? { ...user, status: user.status === "ativo" ? "inativo" : "ativo" }
          : user,
      ),
    );
  }

  return (
    <section className="task-section">
      <div className="section-header">
        <div>
          <h2>Usuários cadastrados</h2>
          <p className="muted">Gerencie quem participa do workspace.</p>
        </div>
        <span className="count-badge">{users.length} pessoas</span>
      </div>
      <div className="filter-row">
        <input
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="⌕  Buscar usuário"
        />
      </div>
      <form className="user-form" onSubmit={submitUser}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={editingUser ? "Usuário em edição" : "Novo usuário"}
          readOnly={Boolean(editingUser)}
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={editingUser ? "Nova senha (opcional)" : "Senha"}
          required={!editingUser}
        />
        <select
          value={profile}
          onChange={(event) => setProfile(event.target.value)}
          disabled={editingUser === "admin"}
        >
          <option value="usuario">Usuário</option>
          <option value="admin">Administrador</option>
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          disabled={editingUser === "admin"}
        >
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
        <button className="primary-button" type="submit">
          {editingUser ? "Salvar edição" : "Cadastrar"}
        </button>
        {editingUser && (
          <button className="text-button" type="button" onClick={resetForm}>
            Cancelar
          </button>
        )}
      </form>
      <div className="task-list">
        {filtered.map((user) => (
          <article className="user-item" key={user.usuario}>
            <span className="avatar">{user.usuario[0].toUpperCase()}</span>
            <div className="task-copy">
              <strong>{user.usuario}</strong>
              <span>
                {user.perfil === "admin" ? "Administrador" : "Usuário"}
              </span>
            </div>
            <span
              className={
                user.status === "ativo" ? "status active" : "status inactive"
              }
            >
              {user.status}
            </span>
            <div className="user-actions">
              <button
                className="text-button"
                onClick={() => startEditing(user)}
              >
                Editar
              </button>
              {user.usuario !== "admin" && (
                <button
                  className="text-button"
                  onClick={() => toggleUser(user.usuario)}
                >
                  {user.status === "ativo" ? "Inativar" : "Ativar"}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// Relatório geral calculado a partir dos dados atuais do painel.
function ReportView({ tasks, users }) {
  const done = tasks.filter((task) => task.concluida).length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  return (
    <>
      <section className="stats-row">
        <div className="stat-card accent">
          <span>Conclusão geral</span>
          <strong>{progress}%</strong>
          <div className="progress">
            <i style={{ width: `${progress}%` }} />
          </div>
          <small>{done} tarefas concluídas</small>
        </div>
        <div className="stat-card">
          <span>Total de tarefas</span>
          <strong>{tasks.length}</strong>
          <small>em todos os usuários</small>
        </div>
        <div className="stat-card">
          <span>Usuários ativos</span>
          <strong>
            {users.filter((user) => user.status === "ativo").length}
          </strong>
          <small>de {users.length} cadastrados</small>
        </div>
      </section>
      <section className="task-section report-panel">
        <div className="section-header">
          <div>
            <h2>Resumo do workspace</h2>
            <p className="muted">Uma leitura rápida da operação.</p>
          </div>
        </div>
        <div className="report-bar">
          <span>Concluídas</span>
          <b>{done}</b>
          <i>
            <em style={{ width: `${progress}%` }} />
          </i>
          <small>{progress}%</small>
        </div>
        <div className="report-bar">
          <span>Pendentes</span>
          <b>{tasks.length - done}</b>
          <i>
            <em style={{ width: `${100 - progress}%` }} />
          </i>
          <small>{100 - progress}%</small>
        </div>
      </section>
    </>
  );
}

export default App;
