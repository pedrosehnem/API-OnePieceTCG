# API de Cartas — One Piece TCG

Projeto desenvolvido para a disciplina de Back-end, utilizando C# e ASP.NET Core (.NET 10) com Minimal API.

A aplicação consiste em uma API REST para o cadastro e gerenciamento de cartas do One Piece Card Game, permitindo realizar operações CRUD (Create, Read, Update e Delete).

Na AP2, o projeto foi ampliado com a implementação de persistência de dados utilizando Entity Framework Core e SQLite, substituindo o armazenamento temporário em memória da AP1.

Também foi desenvolvido um frontend utilizando HTML, CSS e JavaScript, permitindo realizar as operações diretamente pelo navegador, através de requisições HTTP à API.

## Funcionalidades

- Verificar o funcionamento da API.
- Listar todas as cartas cadastradas.
- Buscar uma carta pelo ID.
- Cadastrar novas cartas.
- Atualizar o nome de uma carta existente.
- Excluir cartas cadastradas.
- Confirmar a exclusão consultando o ID removido (HTTP 404).
- Persistir os registros no SQLite, mantendo os dados após reiniciar a aplicação.
- Gerenciar as cartas através do frontend integrado à API.

## Tecnologias utilizadas

### Backend
- C#
- .NET 10
- ASP.NET Core Minimal API
- Entity Framework Core
- SQLite
- Migrations
- HTTP e JSON

### Frontend
- HTML5
- CSS3
- JavaScript
- Fetch API

### Ferramentas
- Visual Studio Code
- Bruno (testes HTTP)
- Git
- GitHub

## Estrutura e persistência dos dados

A persistência é realizada utilizando o Entity Framework Core, responsável pelo mapeamento entre os objetos C# e o banco de dados SQLite.

O projeto utiliza os seguintes componentes:

- **CartaEntity (Model):** define a estrutura dos dados das cartas, contendo ID e nome.
- **ApiDbContext:** gerencia a comunicação da aplicação com o banco por meio do Entity Framework Core.
- **DbSet:** representa o conjunto de cartas disponíveis para consulta e manipulação.
- **SQLite:** armazena os registros permanentemente em um arquivo local.
- **Migrations:** permitem criar e atualizar a estrutura do banco de dados.

As operações de cadastro, atualização e exclusão são persistidas utilizando o método `SaveChangesAsync()`.

Diferentemente da AP1, que utilizava uma lista em memória, os dados agora são armazenados em um banco SQLite, permanecendo disponíveis mesmo após o encerramento da aplicação.

## Rotas da API

| Método | Endpoint | Funcionalidade | Resposta HTTP |
|---|---|---|---|
| GET | `/api/cartas` | Listar todas as cartas | 200 |
| GET | `/api/cartas/{id}` | Buscar carta pelo ID | 200 ou 404 |
| POST | `/api/cartas` | Cadastrar uma nova carta | 201 |
| PUT | `/api/cartas/{id}` | Atualizar uma carta existente | 200 ou 404 |
| DELETE | `/api/cartas/{id}` | Excluir uma carta | 204 ou 404 |

### GET — Listar cartas

Retorna todas as cartas cadastradas no banco de dados.

Endpoint:

`GET /api/cartas`

Resposta esperada: HTTP 200 OK.

### GET — Buscar carta por ID

Consulta uma carta específica através do seu identificador.

Endpoint:

`GET /api/cartas/{id}`

Respostas possíveis:

- HTTP 200 OK: carta encontrada.
- HTTP 404 Not Found: carta inexistente.

### POST — Cadastrar carta

Cadastra uma nova carta no banco de dados.

Endpoint:

`POST /api/cartas`

Exemplo de JSON:

```json
{
  "nomeDaCarta": "Monkey D. Luffy OP05-060"
}
```

O ID é gerado automaticamente pelo banco de dados.

Resposta esperada: HTTP 201 Created.

### PUT — Atualizar carta

Atualiza o nome de uma carta já cadastrada.

Endpoint:

`PUT /api/cartas/{id}`

Exemplo de JSON:

```json
{
  "nomeDaCarta": "Roronoa Zoro OP06-118"
}
```

Respostas possíveis:

- HTTP 200 OK: carta atualizada.
- HTTP 404 Not Found: carta inexistente.

### DELETE — Excluir carta

Remove uma carta do banco de dados através do seu ID.

Endpoint:

`DELETE /api/cartas/{id}`

Respostas possíveis:

- HTTP 204 No Content: exclusão realizada.
- HTTP 404 Not Found: carta inexistente.

### Confirmação de exclusão

Após excluir uma carta, é realizada uma nova consulta GET pelo mesmo ID.

Caso a exclusão tenha sido realizada corretamente, a API retorna HTTP 404 Not Found, confirmando que o registro não existe mais no banco de dados.

Essa verificação utiliza o próprio endpoint GET por ID, sem a necessidade de criar uma rota adicional.

## Como executar o projeto

### 1. Pré-requisitos

Para executar a aplicação, é necessário possuir:

- .NET SDK 10 instalado.
- Git instalado.
- Ferramenta dotnet-ef para executar as migrations.

### 2. Clonar o repositório

```bash
git clone https://github.com/pedrosehnem/API-OnePieceTCG.git
```

Entrar na pasta do projeto:

```bash
cd API-OnePieceTCG
```

### 3. Restaurar as dependências

```bash
dotnet restore
```

### 4. Preparar o banco SQLite

Caso a ferramenta do Entity Framework Core ainda não esteja instalada:

```bash
dotnet tool install --global dotnet-ef --version "10.*"
```

Aplicar as migrations existentes:

```bash
dotnet ef database update
```

Esse comando prepara o banco SQLite conforme a estrutura definida nas migrations do projeto.

A migration inicial, denominada `BancoInicial`, é responsável pela criação da tabela `Cartas`, contendo os campos `Id` e `NomeDaCarta`.

O arquivo local do banco SQLite não é incluído no repositório, pois pode ser recriado a partir das migrations.

### 5. Compilar o projeto

```bash
dotnet build
```

### 6. Executar a aplicação

```bash
dotnet run
```

A aplicação ficará disponível no endereço informado pelo terminal.

## Frontend integrado

O projeto possui uma interface desenvolvida com HTML, CSS e JavaScript.

O frontend utiliza a Fetch API para realizar requisições HTTP aos endpoints do backend.

A interface permite:

- Visualizar todas as cartas cadastradas.
- Cadastrar novas cartas.
- Buscar cartas pelo ID.
- Editar o nome de cartas existentes.
- Excluir cartas.
- Confirmar a exclusão através de uma consulta ao ID removido.
- Atualizar a listagem de cartas.

Todas as operações utilizam os endpoints reais da API, sem depender de dados simulados.

Para atender ao requisito de mesma origem da AP2, o frontend deve ser servido pela própria aplicação ASP.NET Core, utilizando os arquivos estáticos da pasta `wwwroot`.

Com essa configuração, basta iniciar a API e acessar seu endereço local no navegador para utilizar a interface.

## Testes da API

Os testes dos endpoints são realizados utilizando o Bruno.

A Collection de testes deve conter:

1. GET — Listar todas as cartas.
2. GET — Buscar uma carta por ID.
3. POST — Cadastrar uma nova carta.
4. PUT — Atualizar uma carta existente.
5. DELETE — Excluir uma carta.

### Procedimento de teste

1. Executar POST para cadastrar uma carta.
2. Executar GET para verificar se a carta aparece na listagem.
3. Executar GET por ID para consultar a carta cadastrada.
4. Executar PUT para modificar o nome da carta.
5. Executar GET novamente para confirmar a atualização.
6. Executar DELETE para excluir a carta.
7. Executar GET pelo ID excluído e verificar o retorno HTTP 404.

Os mesmos procedimentos também podem ser realizados através da interface do frontend.

## Persistência dos dados

Na AP1, a API utilizava uma lista em memória para armazenar as cartas.

Na AP2, o armazenamento foi substituído pelo banco de dados SQLite, utilizando Entity Framework Core.

O processo de persistência funciona da seguinte forma:

1. A API recebe uma requisição HTTP.
2. Os dados são representados por objetos da classe CartaEntity.
3. O ApiDbContext gerencia as operações utilizando o Entity Framework Core.
4. O EF Core realiza as operações necessárias no SQLite.
5. As alterações são gravadas permanentemente no banco de dados.

Nas operações de cadastro, atualização e exclusão, o método SaveChangesAsync() é responsável por efetivar as alterações no banco.

### Teste de persistência

Para comprovar a persistência dos dados:

1. Cadastrar uma nova carta.
2. Consultar a carta pelo Bruno ou pelo frontend.
3. Encerrar a execução da API.
4. Iniciar novamente a aplicação.
5. Consultar a listagem de cartas.
6. Verificar se a carta cadastrada anteriormente continua disponível.

Esse procedimento demonstra que os registros são armazenados no SQLite e não dependem da memória temporária da aplicação.

## Organização do projeto

O repositório contém os principais componentes necessários para executar e testar a aplicação:

- Código-fonte do backend ASP.NET Core.
- Model CartaEntity.
- ApiDbContext e configuração do Entity Framework Core.
- Arquivos do frontend (HTML, CSS e JavaScript).
- Migrations para criação da estrutura do SQLite.
- Arquivo .csproj com as dependências.
- Collection de testes HTTP do Bruno.
- README com instruções de execução e documentação da API.

Os arquivos temporários de compilação, como `bin/` e `obj/`, e o banco SQLite local com dados de teste não devem ser versionados.

## Vídeo de demonstração — AP2

Link do Vídeo: https://drive.google.com/file/d/1YZP21NBrdICrHzPj0ZTUb7P7vLEXeYGH/view?usp=sharing

A demonstração apresenta:

- Organização do projeto e do repositório.
- Funcionamento da API com Entity Framework Core e SQLite.
- Explicação do Model e do DbContext.
- Execução das operações CRUD pelo Bruno.
- Demonstração dos códigos de resposta HTTP.
- Confirmação de exclusão através do retorno HTTP 404.
- Integração do frontend com os endpoints reais.
- Cadastro, listagem, edição e exclusão pelo navegador.
- Persistência dos registros após reiniciar a aplicação.

O vídeo deve estar disponível através de um link público, sem necessidade de solicitar permissão de acesso.

## Vídeo de demonstração — AP1

A primeira versão do projeto utilizava uma lista em memória para realizar as operações CRUD.

O vídeo abaixo apresenta o funcionamento inicial da API, antes da implementação da persistência com SQLite.

[Assistir à demonstração da AP1](https://drive.google.com/file/d/1jBip5JQ53p4yxzNvvhRhEpsOierDu8kd/view?usp=sharing)

---

Projeto acadêmico desenvolvido para a disciplina de Back-end — AP1 e AP2.