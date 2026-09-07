# Checklist de testes manuais

Como o projeto e uma aplicacao HTML/CSS/JavaScript sem framework ou servidor, estes testes podem ser executados abrindo `html/index.html` no navegador.

## Login e sessao

- [ ] O usuario `admin` com a senha `123` consegue entrar.
- [ ] Uma senha incorreta mostra uma mensagem de erro e nao redireciona.
- [ ] Um usuario inativo nao consegue entrar.
- [ ] O botao Mostrar/Ocultar alterna o campo de senha e atualiza seus atributos ARIA.
- [ ] O botao Sair remove a sessao e volta para o login.
- [ ] Abrir `html/Tarefas.html` sem login redireciona para o login.
- [ ] Abrir `html/Usuarios.html` como usuario comum redireciona para tarefas.

## Tarefas e isolamento

- [ ] O administrador consegue criar, editar, concluir, apagar e filtrar tarefas.
- [ ] Um usuario comum consegue criar uma tarefa e ve somente as tarefas associadas a ele.
- [ ] Dois usuarios diferentes nao visualizam as tarefas um do outro.
- [ ] O prazo de hoje e aceito; um prazo anterior e rejeitado.
- [ ] Filtros de status, prioridade, categoria, pesquisa e ordenacao funcionam juntos.
- [ ] Subtarefas podem ser adicionadas, concluidas e removidas.
- [ ] Ao recarregar a pagina, as tarefas continuam salvas.

## Usuarios e relatorio

- [ ] Usuario com menos de 3 caracteres ou com simbolos invalidos e rejeitado.
- [ ] Senha com menos de 6 caracteres e rejeitada.
- [ ] Usuario duplicado e rejeitado sem alterar o cadastro existente.
- [ ] Administrador consegue ativar, inativar, editar e excluir usuarios permitidos.
- [ ] A conta `admin` e a propria conta do administrador permanecem protegidas.
- [ ] O relatorio atualiza quantidades, percentuais e tarefas por usuario.

## Acessibilidade e tema

- [ ] O foco visivel aparece ao navegar usando Tab.
- [ ] O modal de editar/excluir prende o foco e fecha com `Esc`.
- [ ] Ao fechar o modal, o foco retorna ao botao que o abriu.
- [ ] O tema escolhido continua aplicado ao trocar de pagina.
- [ ] A interface permanece utilizavel em uma janela estreita de celular.

## Recuperacao de dados

- [ ] Com um valor invalido em `localStorage.tarefas`, a pagina continua abrindo sem quebrar.
- [ ] Com um valor invalido em `localStorage.usuarios`, o usuario administrativo inicial e recriado.
