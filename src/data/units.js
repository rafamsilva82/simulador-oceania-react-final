export const M2 = 15886;
export const TETO_SFH = 2250000;

export const APTOS = [
  { id: 'AP 01', area: 207.33, fach: 'Sul/SE · Vazado', sol: 'all', sM: 4, sT: 5 },
  { id: 'AP 02', area: 95.55, fach: 'Oeste · Poente', sol: 'hot', sM: 1, sT: 5 },
  { id: 'AP 03', area: 107.30, fach: 'Leste/NE · Nasc.', sol: 'nasc', sM: 5, sT: 1 },
  { id: 'AP 04', area: 93.45, fach: 'Leste · Nascente', sol: 'nasc', sM: 5, sT: 1 },
  { id: 'AP 05', area: 93.45, fach: 'SE · Canto Nasc.', sol: 'canto', sM: 5, sT: 3 },
  { id: 'AP 06', area: 107.30, fach: 'Oeste · Poen/Vaz', sol: 'poen', sM: 2, sT: 5 },
  { id: 'AP 07', area: 95.55, fach: 'Oeste · Poente', sol: 'hot', sM: 1, sT: 5 },
  { id: 'AP 08', area: 107.30, fach: 'Oeste · Poen/Vaz', sol: 'poen', sM: 2, sT: 5 },
  { id: 'AP 09', area: 107.30, fach: 'Norte · Canto/Vaz', sol: 'misto', sM: 2, sT: 4 },
  { id: 'AP 10', area: 95.55, fach: 'Leste/NE · Nasc.', sol: 'nasc', sM: 5, sT: 1 },
  { id: 'AP 11', area: 95.55, fach: 'Leste/NE · Nasc.', sol: 'nasc', sM: 5, sT: 1 },
];

export const COLUNA_POR_APTO = {
  'AP 01': 'C1', 'AP 02': 'C2', 'AP 03': 'C36', 'AP 04': 'C45', 'AP 05': 'C45',
  'AP 06': 'C36', 'AP 07': 'C2', 'AP 08': 'C36', 'AP 09': 'C36', 'AP 10': 'C2', 'AP 11': 'C2',
};

export const VALORES_VENDA = {
  C1: [2360083.18, 2384289.17, 2408495.15, 2432701.12, 2456907.10, 2481113.09],
  C2: [1173683.92, 1185721.70, 1197759.49, 1209797.27, 1221835.06, 1233872.83],
  C36: [1328840.90, 1341618.21, 1354395.53, 1367172.84, 1379950.15, 1405504.79],
  C45: [1130880.59, 1142479.36, 1154078.14, 1165676.91, 1177275.69, 1188874.46],
};

export const SOL = {
  nasc: { bg: 'var(--sol-nasc)', tx: 'var(--sol-nasc-t)', label: 'Nascente' },
  canto: { bg: 'var(--sol-canto)', tx: 'var(--sol-canto-t)', label: 'Nasc/Canto' },
  all: { bg: 'var(--sol-all)', tx: 'var(--sol-all-t)', label: 'Dia todo' },
  misto: { bg: 'var(--sol-misto)', tx: 'var(--sol-misto-t)', label: 'Misto' },
  poen: { bg: 'var(--sol-poen)', tx: 'var(--sol-poen-t)', label: 'Poente/Vaz' },
  hot: { bg: 'var(--sol-hot)', tx: 'var(--sol-hot-t)', label: 'Poente' },
};

export const TIPOLOGIAS = [
  { lbl: 'Coluna 01', area: 207.33 },
  { lbl: 'Colunas 02/07/10/11', area: 95.55 },
  { lbl: 'Colunas 03/06/08/09', area: 107.30 },
  { lbl: 'Colunas 04/05', area: 93.45 },
];

export function getValorVenda(aptoId, andar) {
  return VALORES_VENDA[COLUNA_POR_APTO[aptoId]][andar - 1];
}
