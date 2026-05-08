export function fmtR(v) {
  if (!Number.isFinite(v)) return '—';
  const negativo = v < 0;
  const [inteiro, decimal] = Math.abs(v).toFixed(2).split('.');
  return `${negativo ? '-' : ''}R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimal}`;
}

export function pBRL(valor) {
  return parseFloat(String(valor || 0).replace(/\./g, '').replace(',', '.')) || 0;
}

export function fPct(v) {
  return `${(v * 100).toFixed(2).replace('.', ',')}%`;
}

export function maskBRLString(raw) {
  let v = String(raw || '').replace(/[^\d,]/g, '');
  const partes = v.split(',');
  let inteiro = partes[0] || '';
  let decimal = partes.length > 1 ? partes.slice(1).join('') : '';
  if (decimal.length > 2) decimal = decimal.substring(0, 2);
  inteiro = inteiro.replace(/^0+(?=\d)/, '');
  const formatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return formatado + (v.includes(',') ? `,${decimal}` : '');
}
