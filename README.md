# API de Cartas — One Piece TCG

Projeto acadêmico desenvolvido para a disciplina de **Desenvolvimento Back-end**, utilizando **C#**, **ASP.NET Core (.NET 10)** e **Minimal API**.

A aplicação disponibiliza uma API REST para cadastro e gerenciamento de cartas do **One Piece Card Game**, com operações CRUD (*Create, Read, Update e Delete*), armazenamento persistente em SQLite e uma interface web em HTML, CSS e JavaScript.

## Evolução do projeto

- **AP1:** implementação inicial das rotas CRUD com uma lista em memória.
- **AP2:** integração com Entity Framework Core e SQLite, criação de migrations e frontend para consumir a API.
- **AS (avaliação semestral):** organização dos tipos em pastas e arquivos, manutenção do CRUD persistente, confirmação de ausência de carta por HTTP 404, tratamento global de exceções e testes no Bruno.

O tema, as funcionalidades e o repositório original foram preservados ao longo das avaliações.

## Funcionalidades

- Verificar se a API está em execução.
- Listar todas as cartas cadastradas.
- Consultar uma carta pelo ID.
- Cadastrar novas cartas.
- Atualizar o nome de uma carta.
- Excluir uma carta pelo ID.
- Consultar um endpoint de **confirmação de exclusão**, verificando se o ID não está mais no banco (HTTP 404).
- Armazenar dados no SQLite, preservando os registros após reiniciar a aplicação.
- Tratar exceções inesperadas com uma resposta HTTP 500 padronizada.
- Realizar operações pela interface web e testar os endpoints pelo Bruno.

## Tecnologias e ferramentas

**Backend:** C#, .NET 10, ASP.NET Core Minimal API, Entity Framework Core, SQLite, migrations, HTTP e JSON.

**Frontend:** HTML5, CSS3, JavaScript e Fetch API.

**Desenvolvimento e testes:** Visual Studio Code, Bruno, Git e GitHub.

## Organização do projeto

Estrutura dos principais componentes:

```text
API-OnePieceTCG/
├── Data/
│   └── ApiDbContext.cs
├── DTOs/
│   ├── CartaDTO.cs
│   └── CartaEntradaDto.cs
├── Models/
│   └── CartaEntity.cs
├── Migrations/
│   ├── 20261013154404_BancoInicial.cs
│   ├── 20261013154404_BancoInicial.Designer.cs
│   └── ApiDbContextModelSnapshot.cs
├── wwwroot/                  # Arquivos da interface web
├── bruno/                    # Requisições de teste
├── Program.cs
├── appsettings.json
└── ApiOnePieceTCG.csproj
```

- **Models (`CartaEntity`):** representa a carta armazenada no banco, com `Id` e `NomeDaCarta`.
- **DTOs (`CartaEntradaDto` e `CartaDTO`):** tipos usados para organizar a transferência de dados, separando-a da entidade persistida. O DTO de entrada permite receber o nome da carta sem exigir seu ID.
- **Data (`ApiDbContext`):** contexto do Entity Framework Core, responsável por gerenciar as operações de persistência. O `DbSet<CartaEntity> Cartas` representa o conjunto de cartas.
- **Migrations:** registram a estrutura do banco e permitem aplicá-la ou evoluí-la. A migration inicial é chamada `BancoInicial`.
- **Namespaces:** organizam os tipos logicamente, enquanto os `using` permitem utilizá-los nos demais arquivos.
- **Program.cs:** configura a aplicação, registra o contexto, define os middlewares e mapeia os endpoints.
- **wwwroot:** contém os arquivos estáticos do frontend, servidos pela própria aplicação.
- **bruno:** guarda as requisições utilizadas nos testes HTTP.

O EF Core traduz operações sobre objetos C# em comandos para o SQLite. Alterações de cadastro, edição e exclusão são efetivadas com `SaveChangesAsync()`.

## Endpoints da API

| Método | Rota | Descrição | Resposta esperada |
|---|---|---|---|
| GET | `/api/status` | Verifica se a API está em execução | 200 OK |
| GET | `/api/cartas` | Lista as cartas | 200 OK |
| GET | `/api/cartas/{id}` | Busca uma carta pelo ID | 200 OK ou 404 Not Found |
| POST | `/api/cartas` | Cadastra uma carta | 201 Created |
| PUT | `/api/cartas/{id}` | Atualiza o nome de uma carta | 200 OK ou 404 Not Found |
| DELETE | `/api/cartas/{id}` | Exclui uma carta | 204 No Content ou 404 Not Found |
| GET | `/api/cartas/confirmarexclusao/{id}` | Verifica se a carta ainda existe | 200 OK ou 404 Not Found |

### Cadastro de carta — POST

**Rota:** `POST /api/cartas`

Exemplo de corpo JSON:

```json
{
  "nomeDaCarta": "Monkey D. Luffy OP05-060"
}
```

**Resposta esperada:** `201 Created`, com os dados da carta cadastrada e o ID gerado pelo banco.

### Atualização de carta — PUT

**Rota:** `PUT /api/cartas/{id}`

Exemplo de corpo JSON:

```json
{
  "nomeDaCarta": "Roronoa Zoro OP06-118"
}
```

**Respostas esperadas:** `200 OK` se a carta existir; `404 Not Found` se o ID não for encontrado.

### Exclusão — DELETE

**Rota:** `DELETE /api/cartas/{id}`

A API procura a carta, remove o registro e salva a alteração no SQLite. Retorna `204 No Content` em caso de sucesso ou `404 Not Found` se o ID não existir.

### Confirmação de exclusão — GET

**Rota:** `GET /api/cartas/confirmarexclusao/{id}`

Após executar o DELETE, uma nova requisição consulta a existência da carta no banco utilizando o ID removido.

- **200 OK:** a carta ainda existe.
- **404 Not Found:** a carta não foi encontrada no banco.

Exemplo de corpo retornado quando a carta não é encontrada:

```json
{
  "mensagem": "Carta não encontrada. Exclusão confirmada."
}
```

**Observação:** o código 404 confirma que o registro está ausente, mas, isoladamente, não diferencia uma carta excluída de um ID que nunca existiu. No teste, a confirmação é realizada após cadastrar e excluir uma carta conhecida.

## Tratamento global de exceções

A API utiliza o middleware `UseExceptionHandler` no `Program.cs` para capturar exceções não tratadas durante o processamento das requisições. Quando ocorre uma falha interna, ele retorna uma resposta padronizada, sem expor detalhes técnicos ao cliente.

**Status:** `500 Internal Server Error`

**Corpo JSON:**

```json
{
  "mensagem": "Ocorreu um erro interno. Tente novamente mais tarde."
}
```

O middleware não impede a ocorrência da falha: ele trata a resposta HTTP gerada a partir dela. Situações normais, como consultar um ID inexistente, são respondidas com `404 Not Found` pelo próprio endpoint, sem depender do tratamento de exceções.

### Demonstração do tratamento de erro

Para testar uma exceção real, foi alterado **temporariamente** o caminho do arquivo SQLite na connection string `DefaultConnection`, apontando para uma pasta inexistente. Após reiniciar a aplicação, a requisição `GET /api/cartas` gerou uma falha de acesso ao banco, capturada pelo middleware, que respondeu com `500` e o JSON personalizado.

Após o teste, a connection string original foi restaurada e a consulta voltou a funcionar normalmente. Nenhuma alteração permanente na conexão é necessária para executar o projeto.

## Como executar

### 1. Pré-requisitos

- .NET SDK 10.
- Git.
- Ferramenta `dotnet-ef` para aplicar as migrations, caso ainda não esteja disponível.

### 2. Clonar o repositório

```bash
git clone https://github.com/pedrosehnem/API-OnePieceTCG.git
cd API-OnePieceTCG
```

### 3. Restaurar as dependências

```bash
dotnet restore
```

### 4. Preparar o banco SQLite

Caso necessário, instalar a ferramenta:

```bash
dotnet tool install --global dotnet-ef --version "10.*"
```

Aplicar as migrations existentes:

```bash
dotnet ef database update
```

O comando cria ou atualiza a estrutura do banco definida pelas migrations. A conexão utilizada pela aplicação é lida de `ConnectionStrings:DefaultConnection` nas configurações.

### 5. Compilar e executar

```bash
dotnet build
dotnet run
```

A URL local será informada no terminal. Utilize esse endereço tanto no navegador quanto no Bruno.

## Frontend integrado

A interface foi desenvolvida com HTML, CSS e JavaScript e consome os endpoints por meio da Fetch API. Os arquivos estáticos são servidos pela própria aplicação ASP.NET Core, a partir de `wwwroot`.

O frontend permite consultar, cadastrar, editar e excluir cartas, além de atualizar a listagem e realizar a verificação de ausência após uma exclusão. Não foi necessário criar um novo frontend para a AS.

## Testes com Bruno

As requisições HTTP foram testadas com o **Bruno**, e os arquivos da collection são mantidos no repositório para permitir a reprodução dos testes.

### Fluxo de teste do CRUD

1. Executar `POST /api/cartas` e verificar `201 Created`.
2. Executar `GET /api/cartas` e verificar `200 OK`.
3. Consultar a carta cadastrada com `GET /api/cartas/{id}` e verificar `200 OK`.
4. Executar `PUT /api/cartas/{id}` e verificar `200 OK`.
5. Consultar novamente a carta para conferir a atualização.
6. Executar `DELETE /api/cartas/{id}` e verificar `204 No Content`.
7. Executar `GET /api/cartas/confirmarexclusao/{id}` e verificar `404 Not Found`.
8. Testar um ID inexistente nas operações de busca, edição e exclusão e verificar os retornos `404` correspondentes.

### Teste de persistência

1. Cadastrar uma carta.
2. Consultar o registro no Bruno ou na interface.
3. Encerrar a aplicação e iniciá-la novamente.
4. Consultar a listagem e confirmar que a carta continua armazenada no SQLite.

### Teste do middleware

1. Apontar temporariamente a connection string para um caminho inválido do SQLite.
2. Reiniciar a aplicação e executar `GET /api/cartas` no Bruno, **sem corpo JSON**.
3. Verificar o retorno `500 Internal Server Error` com a mensagem padronizada.
4. Restaurar a configuração original e confirmar que a API voltou a responder normalmente.

## Histórico de demonstrações

### AS — avaliação semestral

A demonstração final apresenta a organização dos arquivos em `Models`, `DTOs` e `Data`, a função das migrations e namespaces, o CRUD persistente, a confirmação de exclusão com `404` e o tratamento de exceções com `500`.

**Link do vídeo da AS:** https://drive.google.com/file/d/1QwemlUXWfclO3T5vrbEG8xXFlT0aHj1c/view?usp=sharing

### AP2 — persistência e frontend

[Assistir à demonstração da AP2](https://drive.google.com/file/d/1YZP21NBrdICrHzPj0ZTUb7P7vLEXeYGH/view?usp=sharing)

A AP2 apresentou a integração com Entity Framework Core e SQLite, as operações CRUD no Bruno, a interface web e a persistência dos dados.

### AP1 — versão inicial

[Assistir à demonstração da AP1](https://drive.google.com/file/d/1jBip5JQ53p4yxzNvvhRhEpsOierDu8kd/view?usp=sharing)

A AP1 apresentou as primeiras rotas e operações CRUD com armazenamento temporário em memória.

---

Projeto acadêmico desenvolvido para a disciplina de Desenvolvimento Back-end — **AP1, AP2 e AS**.
