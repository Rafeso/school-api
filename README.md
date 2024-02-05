<h1 align="center">Objetivo do repositório</h1>

  Este repositório foi criado inicialmente com o projeto final do primeiro módulo da [Formação Typescript](https://formacaots.com.br/ 'Primeiro curso completo de TypeScript do Brasil'), lecionado por [Lucas Santos](https://blog.lsantos.dev/ 'Conteúdos sobre desenvolvimento e tecnologia').
  E a partir deste projeto fui além e implementei algumas coisas a mais.

  Meu objetivo é continuar fazendo commits neste repositório aprimorando minhas habilidades com o Typescript e migrando este projeto para diferentes runtimes e aprimorar cada vez mais a infraestrutura do projeto adicionando uma complexidade proprocional ao conhecimento adquirido durante o processo.

<h2 align="center">Como executar o projeto</h2>

  Este arquivo está divido em camadas, para saber mais sobre a arquitetura leia este handbook dos autores desta camada [Developer Handbook](https://github.com/nxcd/developer-handbook/blob/master/Arquitetura/Arquitetura-de-C%C3%B3digo.md 'Sobre a arquitetura de código')

  Primeiro clone o projeto e instale as dependências
  ```shell
  $ git clone git@github.com:Rafeso/school-api.git
  $ cd school-api/
  $ npm ci
  ```

  Certifique-se de ter o NodeJs na versão >=20.*
  ```shell
  $ node -v
    v20.11.0
  ```

  Para executar as camadas do projeto será necessário ter o docker instalado e um container com a imagem de um banco de dados mongodb
  ```shell
  $ docker -v
    Docker version 25.0.2, build 29cf629
  
  # Execute o script para iniciar a infraestrutura do projeto e criar um container com a imagem do banco de dados
  $ npm run infra:up

  # Executando a camada rest
  # A aplicação ira iniciar na porta 3000 por padrão. Para mudar a porta configue o arquivo .env
  $ npm run dev:rest

  # Executando a camada CLI
  $ npm run dev:cli
  # ou execute o binário
  # OBS: para conseguir executar o binário será necessário executar o comando de build antes
  $ npm run build
  $ school
  ```

<h2 align="center">Lista de ideias</h2>
  <p>Irei adicionando itens a esta lista conforme for lembrando ou encontrando mais coisas para testar.</p>
  
- [ ] Migrar o projeto para o [Deno](https://deno.com/) runtime
- [ ] Implementar testes no projeto 
