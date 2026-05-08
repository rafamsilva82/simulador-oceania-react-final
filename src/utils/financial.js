import { TETO_SFH } from '../data/units.js';
import { ADM, CCCPM_1IM, CCCPM_PRO, DFI_R, FIPCA, FTR, IDADE_TIPICA, MIP_TABLE, RENDA, TAXA_PROMORAR } from '../data/financialTables.js';

export function getMIP(age) {
  for (const [mn, mx, taxa] of MIP_TABLE) if (age >= mn && age <= mx) return taxa;
  return MIP_TABLE[MIP_TABLE.length - 1][2];
}

export function getTaxa(avaliacao, indexador) {
  if (avaliacao > TETO_SFH) return null;
  const tabela = indexador === 'TR' ? FTR : FIPCA;
  for (const [teto, taxa] of tabela) if (avaliacao <= teto) return taxa;
  return null;
}

export function getFaixaLabel(avaliacao, indexador) {
  if (avaliacao > TETO_SFH) return 'Acima de R$ 2.250.000 — NÃO financiável';
  if (avaliacao <= 700000) return `${indexador} · até R$ 700.000,00`;
  if (avaliacao <= 950000) return `${indexador} · até R$ 950.000,00`;
  if (avaliacao <= 1500000) return `${indexador} · até R$ 1.500.000,00`;
  return `${indexador} · até R$ 2.250.000,00`;
}

export function calcIdade(nascStr, hoje = new Date()) {
  const nasc = new Date(nascStr);
  if (Number.isNaN(nasc.getTime())) return 0;
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

export function prazoMaximoPorIdade(idade) {
  return Math.max(12, Math.min(420, (80 - idade) * 12));
}

export function calcCapacidade(posto, avaliacao) {
  const renda = RENDA[posto];
  if (!renda) return null;
  const lem = renda * 0.30;
  const lemDisp = lem - 200;
  const idade = IDADE_TIPICA[posto] || 40;
  const prazo = 420;
  const taxa = TAXA_PROMORAR;
  const i = (1 + taxa) ** (1 / 12) - 1;
  const mip = getMIP(idade);
  const dfi = avaliacao * DFI_R;
  const coef = (1 / prazo) + i + mip;
  const cap = (lemDisp - dfi) / coef;
  return { renda, lem, lemDisp, idade, prazo, taxa, i, mip, dfi, cap };
}

export function calcCapacProg(posto, avaliacao, programa = 'PROMORAR') {
  const renda = RENDA[posto];
  if (!renda) return 0;
  const lemDisp = renda * 0.30 - 200;
  const idade = IDADE_TIPICA[posto] || 40;
  const prazo = 420;
  const taxa = programa === '1IM' ? getTaxa(avaliacao, 'TR') : TAXA_PROMORAR;
  if (!taxa) return 0;
  const i = (1 + taxa) ** (1 / 12) - 1;
  const mip = getMIP(idade);
  const dfi = avaliacao * DFI_R;
  return Math.max(0, (lemDisp - dfi) / ((1 / prazo) + i + mip));
}

export function simularFinanciamento({ financiamento, avaliacao, idadeInicial, prazo, sistema, taxa, correcao = 0, correcaoAnual = false }) {
  const i = (1 + taxa) ** (1 / 12) - 1;
  const c = correcaoAnual ? (1 + (correcao || 0)) ** (1 / 12) - 1 : (correcao || 0);
  let saldo = financiamento;
  const resultado = [];
  const prestacaoPrice = sistema === 'PRICE'
    ? financiamento * (i * (1 + i) ** prazo) / ((1 + i) ** prazo - 1)
    : 0;

  for (let mes = 1; mes <= prazo; mes += 1) {
    const idade = Math.floor(idadeInicial + (mes - 1) / 12);
    const mipR = getMIP(idade);
    const saldoCorrigido = saldo * (1 + c);
    const correcaoValor = saldoCorrigido - saldo;
    const juros = saldoCorrigido * i;
    let amortizacao;
    if (sistema === 'SAC') amortizacao = financiamento / prazo;
    else if (sistema === 'PRICE') amortizacao = prestacaoPrice - juros;
    else amortizacao = saldoCorrigido / (prazo - mes + 1);
    const prestacao = juros + amortizacao;
    const mip = saldoCorrigido * mipR * 1.038 + 0.80;
    const dfi = avaliacao * DFI_R;
    const encargo = prestacao + mip + dfi + ADM;
    saldo = Math.max(0, saldoCorrigido - amortizacao);
    resultado.push({ mes, idade, saldoCorrigido, correcaoValor, amortizacao, juros, prestacao, mip, dfi, adm: ADM, encargo, saldoFinal: saldo });
  }
  return resultado;
}

export function getReferenciasCCCPM(posto) {
  return { primeiroImovel: CCCPM_1IM[posto], promorar: CCCPM_PRO[posto] };
}
