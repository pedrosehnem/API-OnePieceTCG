/**
 * ==========================================================================
 * One Piece TCG - Integração com a API (JavaScript Puro)
 *
 * Endpoints utilizados (conforme collection Bruno validada):
 * - GET    /api/cartas         -> Listar cartas cadastradas
 * - POST   /api/cartas         -> Adicionar nova carta { "nomeDaCarta": "..." }
 * - PUT    /api/cartas/{id}    -> Atualizar nome da carta { "nomeDaCarta": "..." }
 * - DELETE /api/cartas/{id}    -> Excluir carta por ID
 *
 * Todos os valores dinâmicos são inseridos exclusivamente via textContent.
 * Sem dados fictícios, sem frameworks, sem dependências externas.
 * ==========================================================================
 */

(function () {
  'use strict';

  // Configuração do Endpoint base (respeita a porta 5223 da collection Bruno)
  const API_BASE_URL = window.location.origin.includes('localhost:5223')
    ? ''
    : 'http://localhost:5223';
  const API_URL = `${API_BASE_URL}/api/cartas`;

  // Elementos do DOM
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const endpointDisplay = document.getElementById('endpoint-display');

  // Formulário
  const formSection = document.getElementById('form-section');
  const formCarta = document.getElementById('form-carta');
  const inputNome = document.getElementById('nome-carta');
  const inputIdEdicao = document.getElementById('carta-id-edicao');
  const formHeadingText = document.getElementById('form-title-text');
  const formIcon = document.getElementById('form-icon');
  const formDescription = document.getElementById('form-description');
  const modeBadge = document.getElementById('mode-badge');
  const btnSubmit = document.getElementById('btn-submit');
  const btnSubmitText = document.getElementById('btn-submit-text');
  const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');
  const btnLimpar = document.getElementById('btn-limpar');
  const feedbackEl = document.getElementById('form-feedback');

  // Listagem e Tabela
  const btnRecarregar = document.getElementById('btn-recarregar');
  const inputBuscaId = document.getElementById('busca-id');
const btnBuscarId = document.getElementById('btn-buscar-id');
const btnMostrarTodas = document.getElementById('btn-mostrar-todas');
const buscaFeedback = document.getElementById('busca-feedback');
  const cardCounter = document.getElementById('card-counter');
  const tableContainer = document.getElementById('table-container');
  const tabelaCartas = document.getElementById('tabela-cartas');
  const listaBody = document.getElementById('lista-cartas-body');
  const emptyStateEl = document.getElementById('empty-state');
  const apiErrorPanel = document.getElementById('api-error-panel');
  const errorTitle = document.getElementById('error-title');
  const errorMessage = document.getElementById('error-message');
  const btnRetry = document.getElementById('btn-retry');

  // Estado interno em memória apenas para controle do fluxo de UI
  let estaCarregando = false;
  let feedbackTimer = null;

  // Atualiza exibição do endpoint na barra superior
  if (endpointDisplay) {
    endpointDisplay.textContent = API_URL;
  }

  /**
   * Atualiza a barra de status visual da conexão com a API
   * @param {'connecting'|'connected'|'error'} estado
   * @param {string} texto
   */
  function atualizarStatusConexao(estado, texto) {
    statusDot.className = 'status-dot';
    if (estado === 'connected') {
      statusDot.classList.add('connected');
    } else if (estado === 'error') {
      statusDot.classList.add('error');
    }
    statusText.textContent = texto;
  }

  /**
   * Exibe mensagens de feedback com sanitização via textContent
   * @param {string} mensagem
   * @param {'success'|'error'|'info'} tipo
   */
  function exibirFeedback(mensagem, tipo) {
    if (feedbackTimer) {
      clearTimeout(feedbackTimer);
    }
    feedbackEl.textContent = mensagem;
    feedbackEl.className = `form-feedback ${tipo}`;

    feedbackTimer = setTimeout(() => {
      feedbackEl.textContent = '';
      feedbackEl.className = 'form-feedback';
    }, 5000);
  }

  /**
   * Exibe ou oculta o painel de erro de comunicação com a API
   * @param {boolean} exibir
   * @param {string} titulo
   * @param {string} detalhe
   */
  function alternarPainelErro(exibir, titulo, detalhe) {
    if (exibir) {
      errorTitle.textContent = titulo || 'Falha na comunicação com a API';
      errorMessage.textContent = detalhe || 'Verifique se o backend está em execução.';
      apiErrorPanel.style.display = 'flex';
    } else {
      apiErrorPanel.style.display = 'none';
    }
  }

  /**
   * Alterna a interface entre Modo Cadastro e Modo Edição
   * @param {number|null} id
   * @param {string} nomeAtual
   */
  function definirModoFormulario(id, nomeAtual) {
    if (id !== null && id !== undefined) {
      // Modo Edição
      inputIdEdicao.value = String(id);
      inputNome.value = nomeAtual || '';
      formHeadingText.textContent = `Editar Carta #${id}`;
      formIcon.textContent = '✏️';
      formDescription.textContent = `Atualize os dados da carta #${id} e clique em Salvar Alterações.`;
      btnSubmitText.textContent = 'Salvar Alterações';
      btnSubmit.classList.add('btn-editing');
      btnCancelarEdicao.style.display = 'inline-flex';
      modeBadge.style.display = 'inline-block';
      formSection.classList.add('editing-mode');
      inputNome.focus();
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Modo Cadastro
      inputIdEdicao.value = '';
      inputNome.value = '';
      formHeadingText.textContent = 'Cadastrar Nova Carta';
      formIcon.textContent = '➕';
      formDescription.textContent = 'Informe o nome da carta para registrar no banco de dados através da API.';
      btnSubmitText.textContent = 'Cadastrar Carta';
      btnSubmit.classList.remove('btn-editing');
      btnCancelarEdicao.style.display = 'none';
      modeBadge.style.display = 'none';
      formSection.classList.remove('editing-mode');
    }
  }

  /**
   * 1. LISTAR CARTAS (GET /api/cartas)
   */
  async function carregarCartas() {
    estaCarregando = true;
    alternarPainelErro(false);
    btnRecarregar.disabled = true;

    // Linha de carregamento na tabela
    listaBody.innerHTML = '';
    const trLoading = document.createElement('tr');
    const tdLoading = document.createElement('td');
    tdLoading.className = 'td-status-row';
    tdLoading.colSpan = 3;
    tdLoading.textContent = 'Carregando cartas da API...';
    trLoading.appendChild(tdLoading);
    listaBody.appendChild(trLoading);

    tableContainer.style.display = 'block';
    emptyStateEl.style.display = 'none';
    cardCounter.textContent = 'Buscando...';

    try {
      atualizarStatusConexao('connecting', 'Consultando GET /api/cartas...');
      const resposta = await fetch(API_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!resposta.ok) {
        throw new Error(`A API retornou status HTTP ${resposta.status} (${resposta.statusText})`);
      }

      const cartas = await resposta.json();
      atualizarStatusConexao('connected', `API Conectada (${API_URL})`);
      renderizarTabela(cartas);

    } catch (erro) {
      atualizarStatusConexao('error', 'Falha ao conectar com a API');
      listaBody.innerHTML = '';
      tableContainer.style.display = 'none';
      cardCounter.textContent = 'Erro';

      const detalheErro = erro.name === 'TypeError'
        ? `Não foi possível alcançar ${API_URL}. Certifique-se de que a API está rodando ('dotnet run') na porta 5223.`
        : erro.message;

      alternarPainelErro(true, 'Erro ao carregar lista de cartas', detalheErro);
    } finally {
      estaCarregando = false;
      btnRecarregar.disabled = false;
    }
  }

  /**
   * Renderiza a lista de cartas usando textContent para garantir segurança
   * @param {Array} cartas
   */
  // BUSCAR CARTA POR ID
async function buscarCartaPorId() {

    const id = Number(inputBuscaId.value);

    if (!Number.isInteger(id) || id <= 0) {
        buscaFeedback.textContent = "Digite um ID válido.";
        return;
    }

    btnBuscarId.disabled = true;
    buscaFeedback.textContent = "Buscando carta...";

    try {
        const resposta = await fetch(`${API_URL}/${id}`);

        if (resposta.status === 404) {
            buscaFeedback.textContent = `Carta com ID ${id} não encontrada.`;
            return;
        }

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        const carta = await resposta.json();

        renderizarTabela([carta]);

        buscaFeedback.textContent = `Carta #${id} encontrada!`;

    } catch (erro) {
        buscaFeedback.textContent = `Erro ao buscar carta: ${erro.message}`;
    } finally {
        btnBuscarId.disabled = false;
    }
}
  function renderizarTabela(cartas) {
    listaBody.innerHTML = '';

    if (!Array.isArray(cartas) || cartas.length === 0) {
      cardCounter.textContent = '0 cartas';
      tableContainer.style.display = 'none';
      emptyStateEl.style.display = 'block';
      return;
    }

    cardCounter.textContent = `Total: ${cartas.length} ${cartas.length === 1 ? 'carta' : 'cartas'}`;
    tableContainer.style.display = 'block';
    emptyStateEl.style.display = 'none';

    cartas.forEach((carta) => {
      // Suporta propriedades camelCase ou PascalCase retornadas pelo serializer .NET
      const id = carta.id ?? carta.Id;
      const nome = carta.nomeDaCarta ?? carta.NomeDaCarta ?? '';

      const tr = document.createElement('tr');

      // Coluna ID
      const tdId = document.createElement('td');
      tdId.className = 'td-id';
      tdId.textContent = `#${String(id).padStart(3, '0')}`;

      // Coluna Nome da Carta (inserido estritamente via textContent)
      const tdNome = document.createElement('td');
      tdNome.className = 'td-nome';
      tdNome.textContent = nome;

      // Coluna Ações
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'td-acoes';

      const groupAcoes = document.createElement('div');
      groupAcoes.className = 'table-actions-group';

      // Botão Editar
      const btnEditar = document.createElement('button');
      btnEditar.type = 'button';
      btnEditar.className = 'btn-table-action btn-edit';
      btnEditar.textContent = '✏️ Editar';
      btnEditar.setAttribute('aria-label', `Editar carta #${id}`);
      btnEditar.addEventListener('click', () => {
        definirModoFormulario(id, nome);
      });

      // Botão Excluir
      const btnExcluir = document.createElement('button');
      btnExcluir.type = 'button';
      btnExcluir.className = 'btn-table-action btn-delete';
      btnExcluir.textContent = '🗑️ Excluir';
      btnExcluir.setAttribute('aria-label', `Excluir carta #${id}`);
      btnExcluir.addEventListener('click', () => {
        executarExclusao(id, nome);
      });

      groupAcoes.appendChild(btnEditar);
      groupAcoes.appendChild(btnExcluir);
      tdAcoes.appendChild(groupAcoes);

      tr.appendChild(tdId);
      tr.appendChild(tdNome);
      tr.appendChild(tdAcoes);

      listaBody.appendChild(tr);
    });
  }

  /**
   * 2. CRIAR NOVA CARTA (POST /api/cartas)
   * @param {string} nomeDaCarta
   */
  async function cadastrarCarta(nomeDaCarta) {
    btnSubmit.disabled = true;
    btnSubmitText.textContent = 'Cadastrando...';

    try {
      const resposta = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ nomeDaCarta: nomeDaCarta })
      });

      if (resposta.status === 201) {
        let criada = null;
        try {
          criada = await resposta.json();
        } catch (_) {}

        const idCriado = criada?.id ?? criada?.Id ?? '';
        exibirFeedback(`Carta criada com sucesso! (HTTP 201${idCriado ? ` - ID #${idCriado}` : ''})`, 'success');
        definirModoFormulario(null);
        await carregarCartas();
      } else if (resposta.status === 400) {
        exibirFeedback('Erro ao criar: Dados inválidos (HTTP 400 Bad Request).', 'error');
      } else {
        exibirFeedback(`Erro ao criar carta: HTTP ${resposta.status} (${resposta.statusText})`, 'error');
      }
    } catch (erro) {
      exibirFeedback(`Falha de comunicação ao cadastrar carta: ${erro.message}`, 'error');
    } finally {
      btnSubmit.disabled = false;
      btnSubmitText.textContent = 'Cadastrar Carta';
    }
  }

  /**
   * 3. EDITAR CARTA (PUT /api/cartas/{id})
   * @param {number} id
   * @param {string} nomeDaCarta
   */
  async function atualizarCarta(id, nomeDaCarta) {
    btnSubmit.disabled = true;
    btnSubmitText.textContent = 'Salvando...';

    try {
      const resposta = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ nomeDaCarta: nomeDaCarta })
      });

      if (resposta.ok) {
        exibirFeedback(`Carta #${id} atualizada com sucesso! (HTTP ${resposta.status})`, 'success');
        definirModoFormulario(null);
        await carregarCartas();
      } else if (resposta.status === 404) {
        exibirFeedback(`Carta #${id} não foi encontrada no banco de dados (HTTP 404 Not Found).`, 'error');
        await carregarCartas();
      } else {
        exibirFeedback(`Erro ao atualizar carta #${id}: HTTP ${resposta.status} (${resposta.statusText})`, 'error');
      }
    } catch (erro) {
      exibirFeedback(`Falha de comunicação ao atualizar carta #${id}: ${erro.message}`, 'error');
    } finally {
      btnSubmit.disabled = false;
      btnSubmitText.textContent = inputIdEdicao.value ? 'Salvar Alterações' : 'Cadastrar Carta';
    }
  }
// CONFIRMAR EXCLUSÃO PELO GET POR ID
async function confirmarExclusao(id) {

    const resposta = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    });

    return resposta.status;
}
  /**
   * 4. EXCLUIR CARTA (DELETE /api/cartas/{id})
   * @param {number} id
   * @param {string} nome
   */
  async function executarExclusao(id, nome) {

    const confirmacao = window.confirm(
        `Deseja realmente excluir a carta #${id} ("${nome}")?`
    );

    if (!confirmacao) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (resposta.status === 204) {

            if (inputIdEdicao.value === String(id)) {
                definirModoFormulario(null);
            }

            await carregarCartas();

            // Confirma a exclusão consultando o ID
            const verificacao = await fetch(`${API_URL}/${id}`);

            if (verificacao.status === 404) {
                exibirFeedback(
                    `Carta #${id} excluída! DELETE 204 e GET 404. Exclusão confirmada!`,
                    'success'
                );
            } else {
                exibirFeedback(
                    `DELETE retornou 204, mas a verificação retornou ${verificacao.status}.`,
                    'error'
                );
            }

        } else if (resposta.status === 404) {

            exibirFeedback(
                `Carta #${id} não encontrada para exclusão.`,
                'error'
            );

        } else {

            exibirFeedback(
                `Erro ao excluir: HTTP ${resposta.status}`,
                'error'
            );
        }

    } catch (erro) {

        exibirFeedback(
            `Erro de comunicação: ${erro.message}`,
            'error'
        );
    }
}

  /**
   * Manipulador de submissão do formulário
   * @param {Event} event
   */
  function submeterFormulario(event) {
    event.preventDefault();

    const nomeFormatado = inputNome.value.trim();

    if (!nomeFormatado) {
      exibirFeedback('O campo "Nome da Carta" é obrigatório.', 'error');
      inputNome.focus();
      return;
    }

    const idEmEdicao = inputIdEdicao.value ? parseInt(inputIdEdicao.value, 10) : null;

    if (idEmEdicao !== null && !isNaN(idEmEdicao)) {
      // Executa edição
      atualizarCarta(idEmEdicao, nomeFormatado);
    } else {
      // Executa cadastro
      cadastrarCarta(nomeFormatado);
    }
  }

  // Event Listeners
  formCarta.addEventListener('submit', submeterFormulario);
  // Botão buscar por ID
  btnBuscarId.addEventListener('click', buscarCartaPorId);


// Permite buscar pressionando Enter
inputBuscaId.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        buscarCartaPorId();
    }
});

// Botão mostrar todas as cartas
btnMostrarTodas.addEventListener('click', () => {
    inputBuscaId.value = '';
    buscaFeedback.textContent = '';
    carregarCartas();
});

  btnCancelarEdicao.addEventListener('click', () => {
    definirModoFormulario(null);
    exibirFeedback('Edição cancelada.', 'info');
  });

  btnLimpar.addEventListener('click', () => {
    inputNome.value = '';
    feedbackEl.textContent = '';
    feedbackEl.className = 'form-feedback';
    inputNome.focus();
  });

  btnRecarregar.addEventListener('click', carregarCartas);
  btnRetry.addEventListener('click', carregarCartas);

  // Inicialização: carrega os dados reais da API ao abrir a página
  carregarCartas();
})();
