import { useMemo } from 'react';
import ChartCanvas from './ChartCanvas.jsx';
import { M2 } from '../data/units.js';
import { fmtR, pBRL } from '../utils/formatters.js';
import { calcIdade, getTaxa, prazoMaximoPorIdade, simularFinanciamento } from '../utils/financial.js';

export default function Comparativo({ unidade, form }) {
  const avaliacao = unidade.apt.area * M2;
  const idade = calcIdade(form.nascimento);
  const prazo = Math.min(Number(form.prazo) || 360, prazoMaximoPorIdade(idade));
  const financiamento = Math.max(0, avaliacao - pBRL(form.entrada));
  const taxa = getTaxa(avaliacao, form.indexador);
  const corr = (parseFloat(String(form.indexador === 'TR' ? form.tr : form.ipca).replace(',', '.')) || 0) / 100;
  const corrAnual = form.indexador === 'IPCA';

  const comparacoes = useMemo(() => {
    if (!taxa || !financiamento || !prazo) return [];
    return ['SACRE','SAC','PRICE'].map((sistema) => {
      const res = simularFinanciamento({ financiamento, avaliacao, idadeInicial: idade, prazo, sistema, taxa, correcao: corr, correcaoAnual: corrAnual });
      return { sistema, res, total: res.reduce((a, b) => a + b.encargo, 0) };
    });
  }, [taxa, financiamento, prazo, avaliacao, idade, corr, corrAnual]);

  const step = Math.max(1, Math.floor(prazo / 50));
  const labels = comparacoes[0]?.res.filter((_, i) => i % step === 0).map((r) => `M${r.mes}`) || [];
  const data = { labels, datasets: comparacoes.map((c, i) => ({ label: c.sistema, data: c.res.filter((_, idx) => idx % step === 0).map((r) => r.encargo), borderColor: ['#0D1B2A','#F4A261','#2A9D8F'][i], tension: .15, pointRadius: 0, borderWidth: 2, fill: false, ...(c.sistema === 'SAC' ? { borderDash: [6,3] } : {}) })) };
  const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { boxWidth: 9, font: { size: 10 } } }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${fmtR(c.parsed.y)}` } } }, scales: { y: { ticks: { callback: (v) => `R$${Math.round(v/1000)}k`, font: { size: 10 } }, beginAtZero: false }, x: { ticks: { font: { size: 9 }, maxTicksLimit: 8 } } } };

  return (
    <div>
      <div className="card"><div className="sec">Parâmetros (sincronizados com o Simulador)</div><div className="g2">
        <div className="field"><label>UH selecionada</label><input type="text" value={`${unidade.andar}º · ${unidade.apt.id}`} readOnly /></div>
        <div className="field"><label>Valor a financiar</label><input type="text" value={fmtR(financiamento).replace('R$ ', '')} readOnly /></div>
        <div className="field"><label>Indexador</label><input type="text" value={form.indexador === 'TR' ? 'TR (0,1679%/mês)' : 'IPCA (4,14%)'} readOnly /></div>
        <div className="field"><label>Idade / Prazo</label><input type="text" value={`${idade} anos · ${prazo}m`} readOnly /></div>
      </div></div>
      <div className="cmp3">{comparacoes.map((c, i) => <div key={c.sistema} className="card" style={{ borderTop: `3px solid ${['var(--mid)','var(--accent)','var(--green)'][i]}` }}><div className="sec" style={{ color: ['var(--mid)','var(--accent)','var(--green)'][i] }}>{c.sistema}</div><div className="cr"><span>1º encargo</span><span>{fmtR(c.res[0]?.encargo)}</span></div><div className="cr"><span>Último</span><span>{fmtR(c.res.at(-1)?.encargo)}</span></div><div className="cr tot"><span>Total pago</span><span>{fmtR(c.total)}</span></div></div>)}</div>
      <div className="card"><div className="sec">Evolução — SACRE × SAC × Price</div><div className="chart-box" style={{ height: 280 }}>{comparacoes.length > 0 && <ChartCanvas data={data} options={options} />}</div></div>
    </div>
  );
}
