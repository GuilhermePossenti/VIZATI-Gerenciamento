const EQUIPAMENTOS_BASE = [
  { id: 1, codigo: 'NB-001', nome: 'Notebook Dell Latitude 5420', categoria: 'Notebook', quantidade: 8, minimo: 3, status: 'Disponível', local: 'Matriz' },
  { id: 2, codigo: 'MON-014', nome: 'Monitor LG 24 polegadas', categoria: 'Monitor', quantidade: 2, minimo: 4, status: 'Estoque baixo', local: 'Matriz' },
  { id: 3, codigo: 'RTR-006', nome: 'Roteador MikroTik', categoria: 'Rede', quantidade: 5, minimo: 2, status: 'Disponível', local: 'Loja Centro' },
  { id: 4, codigo: 'IMP-003', nome: 'Impressora térmica Elgin', categoria: 'Impressora', quantidade: 0, minimo: 2, status: 'Sem estoque', local: 'Loja Norte' },
];

const CATALOGO_ESTOQUE = [
  'Fonte com cabo',
  'Fonte sem cabo',
  'Fonte ATX',
  'Teclado USB',
  'Emenda RJ45',
  'Kit teclado e mouse com fio',
  'Mouse sem fio',
  'Kit teclado e mouse sem fio',
  'Placa de vídeo',
  'Memória 16GB',
  'SSD',
  'NVMe',
  'Adaptador HDMI-VGA',
  'Adaptador DisplayPort-HDMI',
  'Headset fiscal remoto',
  'Impressora Argox',
  'Epson TM-T20X',
  'Switch Gigabit 5 portas',
  'Switch Gigabit 8 portas',
  'Switch Gigabit 10 portas',
  'Cabo VGA',
  'Cabo HDMI 2m',
  'Cabo HDMI 5m',
  'Cabo HDMI 10m',
  'Telefone IP',
  'Telefone com fio',
  'Telefone sem fio',
  'Caixas de som',
  'Leitor de mão',
  'Leitor fixo',
  'Régua de energia',
  'Balança checkout pequena',
  'Balança checkout grande',
  'Balança Prix 5 Plus',
  'Nobreak 700VA novo',
  'Nobreak 700VA revisado',
  'Monitor 19” usado',
  'Monitor 24” usado',
  'Cabeça de impressão para balança',
  'Controle Aceno',
  'Tinta preta',
  'Tinta ciano',
  'Tinta amarela',
  'Tinta magenta',
  'UniFi AC Pro',
  'Relógio de ponto',
  'Epson L3250',
  'Epson L14150 usada',
  'Gaveta nova',
  'Gaveta revisada',
  'Pinpad',
  'Monitor Custom 10”',
  'Monitor Custom 19”',
  'PC completo novo',
  'PC completo revisado',
  'Processador 9400F',
  'Placa-mãe LGA 1151',
  'Placa-mãe LGA 1200',
  'Processador 10ª geração',
  'Air cooler LGA 1200',
  'Cabo para telefone RJ11',
  'Baterias para nobreak',
  'Multímetro',
  'Bateria para telefone sem fio',
];

function categoriaDoItem(nome) {
  const item = nome.toLowerCase();
  if (item.includes('cabo') || item.includes('adaptador') || item.includes('emenda')) return 'Cabos e adaptadores';
  if (item.includes('impressora') || item.includes('epson') || item.includes('tinta') || item.includes('cabeça')) return 'Impressão';
  if (item.includes('switch') || item.includes('unifi')) return 'Rede';
  if (item.includes('monitor')) return 'Monitor';
  if (item.includes('telefone') || item.includes('headset')) return 'Telefonia';
  if (item.includes('balança') || item.includes('leitor') || item.includes('pinpad') || item.includes('gaveta')) return 'Frente de caixa';
  if (item.includes('nobreak') || item.includes('energia') || item.includes('bateria')) return 'Energia';
  if (item.includes('placa') || item.includes('processador') || item.includes('memória') || item.includes('ssd') || item.includes('nvme') || item.includes('cooler') || item.includes('pc completo')) return 'Componentes';
  return 'Periféricos';
}

const ITENS_CATALOGO = CATALOGO_ESTOQUE.map((nome, indice) => ({
  id: 100 + indice,
  codigo: `TI-${String(indice + 1).padStart(3, '0')}`,
  nome,
  categoria: categoriaDoItem(nome),
  quantidade: 0,
  minimo: 1,
  status: 'Sem estoque',
  local: 'Matriz',
}));

export const EQUIPAMENTOS_INICIAIS = [...EQUIPAMENTOS_BASE, ...ITENS_CATALOGO];
export const LOJAS_INICIAIS = [
  { id: 1, codigo: '601', nome: 'Fábrica' },
  { id: 2, codigo: 'FRIG', nome: 'Frigorífico' },
  { id: 3, codigo: '001', nome: 'Loja 01 - Videira' },
  { id: 4, codigo: '002', nome: 'Loja 02 - Campos Novos' },
  { id: 5, codigo: '003', nome: 'Loja 03 - Fraiburgo' },
  { id: 6, codigo: '201', nome: 'Loja 07 - Atacado Videira' },
  { id: 7, codigo: '004', nome: 'Loja 09 - Caçador' },
  { id: 8, codigo: '006', nome: 'Loja 10 - CDR Superpão' },
  { id: 9, codigo: '202', nome: 'Loja 11 - Atacado Chapecó' },
  { id: 10, codigo: '401', nome: 'Loja 12 - Pato Branco' },
  { id: 11, codigo: '005', nome: 'Loja 13 - Joaçaba' },
  { id: 12, codigo: '204', nome: 'Loja 14 - Atacado Caçador' },
  { id: 13, codigo: '205', nome: 'Loja 15 - Atacado Lages' },
  { id: 14, codigo: '203', nome: 'Loja 16 - Santa Cecília' },
];
export const CHAMADOS_INICIAIS = [
  { id: 1, codigo: '1', tecnico: 'Carlos Henrique', cargo: 'Técnico de TI', descricao: 'Instalação e configuração de PDV', loja: 'Loja Centro', prioridade: 'Alta', status: 'Em andamento', data: '26/08/2026' },
  { id: 2, codigo: '2', tecnico: 'Marina Oliveira', cargo: 'Analista de Suporte', descricao: 'Troca de impressora térmica', loja: 'Loja Norte', prioridade: 'Média', status: 'Aberto', data: '25/08/2026' },
];
export function carregar(chave, inicial) {
  if (typeof window === 'undefined') return inicial;
  try {
    const salvos = JSON.parse(localStorage.getItem(chave));
    if (!Array.isArray(salvos)) return inicial;
    if (chave !== 'nexati_equipamentos') return salvos;

    const codigosSalvos = new Set(salvos.map((item) => item.codigo));
    return [...salvos, ...inicial.filter((item) => !codigosSalvos.has(item.codigo))];
  } catch {
    return inicial;
  }
}
export function salvar(chave, valor) { localStorage.setItem(chave, JSON.stringify(valor)); }
