/**
 * Schema da Pesquisa de Tempos e Movimentos
 * Extraído de "Protótipo questionário Tempos & Movimentos.xlsx"
 * Este arquivo é a única fonte de verdade da estrutura do formulário.
 * Alterar aqui reflete automaticamente na UI (app.js lê este schema).
 */

// Setor, Loja e Canal não aparecem aqui: são definidos na tela de
// identificação (login), a partir do catálogo de assignação (catalogo.js),
// e ficam gravados em state.cadastro.setor / loja / canal / cidade / estado.
const CADASTRO_FIELDS = [
  { key: 'promotor', label: 'Nome do promotor', type: 'text', required: true, placeholder: 'Nome completo' },
  { key: 'conducao', label: 'Meio de condução', type: 'select', options: ['Motorizado', 'Não motorizado'], required: true },
  { key: 'data', label: 'Data da visita', type: 'date', required: true },
  { key: 'porte', label: 'Porte da loja', type: 'select', options: ['P', 'M', 'G'], required: true },
  { key: 'visita_atual', label: 'Nº da visita (atual)', type: 'number', half: true, min: 1 },
  { key: 'visita_total', label: 'Total de visitas no dia', type: 'number', half: true, min: 1 },
];

const BLOCKS = [
  {
    key: 'pre_chegada', title: 'Pré-Chegada',
    subtitle: 'Do momento em que sai da origem até chegar à loja',
    activities: [
      { id: 1, nome: 'Saída da origem (casa/base/loja anterior)', obs: [
        { key: 'origem', label: 'Origem', type: 'text', placeholder: 'Ex: casa, base, loja anterior' },
      ]},
      { id: 2, nome: 'Espera pelo transporte', obs: [
        { key: 'meio', label: 'Meio', type: 'select', options: ['Carro', 'Ônibus', 'Trem', 'Misto', 'A pé'] },
      ]},
      { id: 3, nome: 'Deslocamento até a região da loja', obs: [
        { key: 'distancia', label: 'Distância', type: 'number', unit: 'km', min: 0, step: '0.1' },
        { key: 'integracoes', label: 'Nº integrações', type: 'number', min: 0 },
      ]},
      { id: 4, nome: 'Estacionamento / procura por vaga', obs: [
        { key: 'dificuldade', label: 'Dificuldade', type: 'select', options: ['Baixa', 'Média', 'Alta'] },
      ]},
      { id: 5, nome: 'Trajeto a pé até a loja', obs: [
        { key: 'tempo', label: 'Tempo aprox.', type: 'number', unit: 'min', min: 0 },
      ]},
    ],
    extra: [
      { key: 'ocorrencias_trajeto', label: 'Ocorrências no trajeto', type: 'text' },
      { key: 'dificuldade_acesso', label: 'Dificuldade de acesso ao local', type: 'select', options: ['Fácil', 'Moderado', 'Difícil'] },
    ],
  },
  {
    key: 'entrada', title: 'Entrada',
    subtitle: 'Chegada e liberação de acesso à loja',
    activities: [
      { id: 1, nome: 'Chegada à loja (portaria/entrada)' },
      { id: 2, nome: 'Espera para autorização / cadastro / liberação', obs: [
        { key: 'motivo', label: 'Motivo', type: 'text' },
      ]},
      { id: 3, nome: 'Registro de entrada (app / sistema do cliente)' },
      { id: 4, nome: 'Guardar pertences / retirar equipamentos / EPIs' },
      { id: 5, nome: 'Localizar o setor / estoque / responsável' },
    ],
  },
  {
    key: 'abertura', title: 'Abertura',
    subtitle: 'Reconhecimento inicial da loja e do setor',
    activities: [
      { id: 1, nome: 'Conferir encarte, Guia de PDV e MOP' },
      { id: 2, nome: 'Cumprimentar gerente / encarregado' },
      { id: 3, nome: 'Passar por todas as categorias puxando frentes' },
      { id: 4, nome: 'Identificar pontos de atenção / rupturas' },
      { id: 5, nome: 'Pegar relatório de estoque para conferência' },
    ],
  },
  {
    key: 'estoque', title: 'Estoque',
    subtitle: 'Movimentação e organização no estoque',
    activities: [
      { id: 1, nome: 'Deslocamento até o estoque' },
      { id: 2, nome: 'Localizar produtos no estoque', obs: [
        { key: 'dificuldade', label: 'Dificuldade', type: 'select', options: ['Fácil', 'Média', 'Alta'] },
      ]},
      { id: 3, nome: 'Organização / arrumação do estoque' },
      { id: 4, nome: 'Separação de itens para abastecimento' },
      { id: 5, nome: 'Retorno ao setor com os produtos' },
    ],
  },
  {
    key: 'checkout', title: 'Check Out',
    subtitle: 'Abastecimento padrão do setor',
    activities: [
      { id: 1, nome: 'Limpeza dos móveis antes do abastecimento' },
      { id: 2, nome: 'Abastecer seguindo o guia de execução' },
      { id: 3, nome: "Conferir KBD's (Direcionamentos Chaves)" },
      { id: 4, nome: 'Precificar todos os itens' },
    ],
  },
  {
    key: 'ponto_natural', title: 'Ponto Natural',
    subtitle: 'Reposição no ponto natural da categoria',
    activities: [
      { id: 1, nome: 'Buscar itens faltantes no estoque' },
      { id: 2, nome: 'Contar estoque e comparar com relatório', obs: [
        { key: 'qtd_divergente', label: 'Qtd. divergente', type: 'number', unit: 'und', min: 0 },
      ]},
      { id: 3, nome: 'Limpeza antes do abastecimento' },
      { id: 4, nome: 'Abastecimento e organização (Layout/KBDs etc)' },
      { id: 5, nome: 'Precificar todos os itens' },
    ],
  },
  {
    key: 'ponto_extra', title: 'Ponto Extra',
    subtitle: 'Montagem e abastecimento de ponto extra',
    activities: [
      { id: 1, nome: 'Limpeza do móvel / display' },
      { id: 2, nome: 'Montagem do display / ponto extra', obs: [
        { key: 'tipo', label: 'Tipo', type: 'select', options: ['Chão', 'Gôndola', 'Ilha', 'Balcão'] },
      ]},
      { id: 3, nome: "Abastecer seguindo guia de execução + KBD's" },
      { id: 4, nome: 'Precificar todos os itens' },
    ],
  },
  {
    key: 'outras', title: 'Outras Atividades',
    subtitle: 'Atividades que não se encaixam nos blocos anteriores',
    activities: [
      { id: 1, nome: 'Leitura de loja (checklist / auditoria)' },
      { id: 2, nome: 'Negociação com encarregado / gerente', obs: [
        { key: 'assunto', label: 'Assunto', type: 'text' },
      ]},
      { id: 3, nome: 'Tratamento de divergências (estoque/preço/validade)' },
      { id: 4, nome: 'Busca de produtos ou materiais em outros setores' },
      { id: 5, nome: 'Deslocamento interno dentro da loja' },
    ],
  },
  {
    key: 'saida', title: 'Saída',
    subtitle: 'Encerramento das atividades na loja',
    activities: [
      { id: 1, nome: 'Guardar equipamentos / materiais' },
      { id: 2, nome: 'Deixar o setor / estoque' },
      { id: 3, nome: 'Deslocamento até a saída da loja' },
      { id: 4, nome: 'Saída da loja (portaria/catraca)' },
    ],
  },
];

// Bloco 8 — Categorias: uma matriz categoria x fase, cada fase com início/término
const CATEGORIAS = [
  'Lâminas Masculinas', 'Lâminas Femininas', 'Escovas', 'Antissépticos',
  'Fios Dentais', 'Cremes Dentais', 'Desodorantes Masculinos', 'Desodorantes Femininos',
  'Pantene / Head & Shoulders', 'Absorventes / Protetores / Internos',
  'Fraldas / Lenços Umedecidos', 'Amaciantes Downy', 'Detergente Líquido Ariel',
];

const FASES_CATEGORIA = [
  { key: 'busca_estoque', label: 'Buscar itens faltantes no estoque' },
  { key: 'conf_estoque_virtual', label: 'Conferência do estoque virtual' },
  { key: 'limpeza_pn', label: 'Limpeza antes do abastecimento' },
  { key: 'abastecimento_pn', label: 'Abastecimento / organização (Ponto Natural)' },
  { key: 'precificacao_pn', label: 'Precificação (Ponto Natural)' },
  { key: 'montagem_pe', label: 'Montagem PE / Móvel / Display' },
  { key: 'limpeza_pe', label: 'Limpeza do móvel / display / PE' },
  { key: 'abastecimento_pe', label: 'Abastecimento PE / Móvel / Display' },
  { key: 'precificacao_pe', label: 'Precificação PE / Móvel / Display' },
];

const FECHAMENTO_FIELDS = [
  { key: 'saida_ultima_loja', label: 'Horário de saída da última loja', type: 'time' },
  { key: 'chegada_casa', label: 'Horário de chegada em casa / base', type: 'time' },
  { key: 'total_lojas', label: 'Nº total de lojas visitadas no dia', type: 'number', min: 0 },
  { key: 'km_total', label: 'Quilometragem total percorrida', type: 'number', unit: 'km', hint: 'se aplicável', min: 0, step: '0.1' },
  { key: 'total_horas', label: 'Total de horas trabalhadas no dia', type: 'text', placeholder: 'Ex: 8h 30min', autoHint: true },
  { key: 'observacoes_gerais', label: 'Observações gerais do dia', type: 'textarea' },
];
