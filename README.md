# Gerenciador de Tarefas

Aplicacao de gerenciamento de tarefas feita com HTML, CSS e JavaScript puro.

## Funcionalidades

- Login com controle de sessao e perfis de usuario.
- Criacao, edicao, conclusao e exclusao de tarefas.
- Prioridade, categoria, prazo, pesquisa, filtros e ordenacao.
- Subtarefas com acompanhamento de progresso.
- Area administrativa para cadastrar, editar, ativar, inativar e excluir usuarios.
- Relatorio de tarefas por usuario.
- Tema claro e escuro salvo no navegador.
- Isolamento das tarefas: usuarios comuns veem apenas as proprias tarefas; administradores veem todas.

## Como executar

1. Abra a pasta do projeto no VS Code.
2. Abra `html/index.html` no navegador, ou use uma extensao de servidor local, como Live Server.
3. Entre com o acesso inicial:
	- Usuario: `admin`
	- Senha: `123`

Os dados ficam no `localStorage` do navegador. Isso e adequado para demonstracao local, mas nao para producao.

## Estrutura

```text
html/       Paginas da aplicacao
javascript/ Regras de autenticacao, tarefas, usuarios e tema
Style/      Folhas de estilo
tests/      Checklist de testes manuais
```

## Testes

Consulte [tests/checklist-manual.md](tests/checklist-manual.md) para validar login, permissoes, tarefas, relatorios, acessibilidade, responsividade e recuperacao de dados.

## Limites atuais

- Nao existe backend ou banco de dados.
- As senhas ficam armazenadas localmente e sem criptografia.
- Os dados nao sao sincronizados entre navegadores ou dispositivos.
- O acesso inicial deve ser alterado antes de qualquer uso real.