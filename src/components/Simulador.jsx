import { useMemo } from 'react';
import ChartCanvas from './ChartCanvas.jsx';
import UnitGrid from './UnitGrid.jsx';
import { M2, TETO_SFH, getValorVenda } from '../data/units.js';
import { fPct, fmtR, maskBRLString, pBRL } from '../utils/formatters.js';
import { calcIdade, getFaixaLabel, getTaxa, prazoMaximoPorIdade, simularFinanciamento } from '../utils/financial.js';

function buildLineData(resultado, prazo) {
  const step = Math.max(1, Math.floor(prazo / 50));
  const amostra = resultado.filter((_, i) => i % step === 0);
  return {
    labels: amostra.map((r) => `M${r.mes}`),
    datasets: [
      { label: 'Encargo total', data: amostra.map((r) => r.encargo), borderColor: '#0D1B2A', backgroundColor: 'rgba(13,27,42,.07)', fill: true, tension: .15, pointRadius: 0, borderWidth: 2 },
      { label: 'Prestação', data: amostra.map((r) => r.prestacao), borderColor: '#2E86AB', tension: .15, pointRadius: 0, borderWidth: 1.5, borderDash: [5, 3] },
      { label: 'Seguros', data: amostra.map((r) => r.mip + r.dfi), borderColor: '#F4A261', tension: .15, pointRadius: 0, borderWidth: 1.5, borderDash: [2, 3] },
    ],
  };
}

export default function Simulador({ unidade, setUnidade, form, setForm, simulacao }) {
  const ap = unidade.apt;
  const avaliacao = ap.area * M2;
  const venda = getValorVenda(ap.id, unidade.andar);
  const idade = calcIdade(form.nascimento);
  const prazoMax = prazoMaximoPorIdade(idade);
  const prazo = Math.min(Number(form.prazo) || 360, prazoMax);
  const entrada = pBRL(form.entrada);
  const financiamento = Math.max(0, venda - entrada);
  const taxa = getTaxa(avaliacao, form.indexador);
  const correcaoRaw = (parseFloat(String(form.indexador === 'TR' ? form.tr : form.ipca).replace(',', '.')) || 0) / 100;
  const correcaoAnual = form.indexador === 'IPCA';
  const msgs = [];
  if (avaliacao > TETO_SFH) msgs.push(`Avaliação ${fmtR(avaliacao)} supera o teto de R$ 2.250.000,00 — NÃO financiável pela CCCPM.`);
  if (entrada > venda) msgs.push(`Entrada ${fmtR(entrada)} supera o valor de venda.`);

  const resultado = useMemo(() => {
    if (!taxa || !financiamento || !prazo || msgs.some((m) => m.includes('NÃO'))) return [];
    return simularFinanciamento({ financiamento, avaliacao, idadeInicial: idade, prazo, sistema: form.sistema, taxa, correcao: correcaoRaw, correcaoAnual });
  }, [taxa, financiamento, prazo, avaliacao, idade, form.sistema, correcaoRaw, correcaoAnual]);

  const primeiro = resultado[0];
  const ultimo = resultado.at(-1);
  const totalPago = resultado.reduce((acc, r) => acc + r.encargo, 0);
  const totalJuros = resultado.reduce((acc, r) => acc + r.juros, 0);
  const corrAnual = correcaoAnual ? correcaoRaw : ((1 + correcaoRaw) ** 12 - 1);
  const efetivo = taxa ? taxa + corrAnual + taxa * correcaoAnual : null;
  const chartData = resultado.length ? buildLineData(resultado, prazo) : null;
  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { boxWidth: 9, font: { size: 10 } } }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${fmtR(c.parsed.y)}` } } }, scales: { y: { ticks: { callback: (v) => `R$${Math.round(v / 1000)}k`, font: { size: 10 } }, beginAtZero: false }, x: { ticks: { font: { size: 9 }, maxTicksLimit: 8 } } } };

  function update(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  return (
    <div>
      <UnitGrid unidade={unidade} setUnidade={setUnidade} />
      <div className="uh-bar">
        <div><span className="lbl">Unidade</span><strong>{unidade.andar}º andar · {unidade.andar * 100 + parseInt(ap.id.split(' ')[1])}</strong></div>
        <div><span className="lbl">Área</span><strong>{ap.area.toFixed(2).replace('.', ',')}m²</strong></div>
        <div><span className="lbl">Orientação</span><strong>{ap.fach}</strong></div>
        <div><span className="lbl">Valor de venda</span><strong>{fmtR(venda)}</strong></div>
      </div>
      <div className="aval-card">
        <div className="aval-label">Valor de avaliação · base do financiamento · Art. 11-A Res. CMN 4.676/2018</div>
        <div className="aval-valor">{fmtR(avaliacao)}</div>
        <div className="aval-sub">{ap.area.toFixed(2).replace('.', ',')}m² × R$ 15.886,00/m² (IVG-R/BCB · NOV/2025)</div>
      </div>

      <div className="g2 mt12">
        <div className="card">
          <div className="sec">Dados do mutuário e financiamento</div>
          <div className="field"><label>Data de nascimento</label><input type="date" value={form.nascimento} max="2008-04-25" onChange={(e) => update('nascimento', e.target.value)} /><div className="hint">Idade: {idade} anos · Prazo máximo: {prazoMax} meses ({Math.floor(prazoMax / 12)} anos)</div></div>
          <div className="field"><label>Entrada (R$) — 0 = sem entrada</label><input type="text" value={form.entrada} inputMode="decimal" onChange={(e) => update('entrada', maskBRLString(e.target.value))} onBlur={() => update('entrada', entrada > 0 ? fmtR(entrada).replace('R$ ', '') : '0,00')} /><div className="hint">{fmtR(venda)} (venda) − {fmtR(entrada)} (entrada) = {fmtR(financiamento)}</div></div>
          <div className="field"><label>Valor a financiar (R$)</label><input type="text" value={fmtR(financiamento).replace('R$ ', '')} readOnly /><div className="hint">Calculado automaticamente (Venda - Entrada)</div></div>
          <div className="field"><label>Prazo (meses)</label><input type="number" value={prazo} min="12" max={prazoMax} step="12" onChange={(e) => update('prazo', e.target.value)} /><div className="hint">{prazo} meses = {Math.floor(prazo / 12)} anos · Máximo com {idade} anos: {prazoMax} meses</div></div>
          <div className="field"><label>Sistema de amortização</label><select value={form.sistema} onChange={(e) => update('sistema', e.target.value)}><option value="SACRE">SACRE — Amortização Crescente (CCCPM)</option><option value="SAC">SAC — Amortização Constante</option><option value="PRICE">Price — Prestação Constante</option></select><div className="hint">SACRE/SAC: até 90% da avaliação</div></div>
          <div className="field"><label>Correção do saldo devedor</label><select value={form.indexador} onChange={(e) => update('indexador', e.target.value)}><option value="TR">TR — Taxa Referencial</option><option value="IPCA">IPCA — Índice de Preços</option></select></div>
          {form.indexador === 'TR' ? <div className="field"><label>TR esperada (% ao mês) <span style={{ color: 'var(--green)', fontSize: 10 }}>● Oficial</span></label><input type="text" value={form.tr} onChange={(e) => update('tr', e.target.value)} /><div className="hint">TR mensal (abr/2026): <strong>0,1679%</strong> · BCB · Acum. 12m: 2,02% a.a.</div></div> : <div className="field"><label>IPCA esperado (% a.a.) <span style={{ color: 'var(--green)', fontSize: 10 }}>● Oficial</span></label><input type="text" value={form.ipca} onChange={(e) => update('ipca', e.target.value)} /><div className="hint">12 meses (mar/2026): <strong>4,14%</strong> · Focus BCB 2026: 4,71% · IBGE/BCB</div></div>}
        </div>

        <div>
          {msgs.length > 0 && <div className="alrt on">{msgs.map((m) => <div key={m}>{m}</div>)}</div>}
          {taxa && <div className="ibox on"><strong>{getFaixaLabel(avaliacao, form.indexador)}</strong> · Juros: {fPct(taxa)} · Correção {form.indexador}: {correcaoAnual ? `${fPct(correcaoRaw)} a.a.` : `${fPct(correcaoRaw)}/mês (≈${fPct(corrAnual)} a.a.)`} · <strong>Custo efetivo ≈ {fPct(efetivo)}</strong></div>}
          <div className="metrics">
            <div className="met"><div className="ml">Taxa juros</div><div className="mv">{taxa ? fPct(taxa) : '—'}</div><div className="ms">{taxa ? getFaixaLabel(avaliacao, form.indexador) : 'NÃO FINANCIÁVEL'}</div></div>
            <div className="met grn"><div className="ml">Custo efetivo</div><div className="mv">{efetivo ? fPct(efetivo) : '—'}</div><div className="ms">% a.a. real projetado</div></div>
            <div className="met org"><div className="ml">1º encargo</div><div className="mv">{primeiro ? fmtR(primeiro.encargo) : '—'}</div><div className="ms">Mês 1</div></div>
            <div className="met"><div className="ml">Último encargo</div><div className="mv">{ultimo ? fmtR(ultimo.encargo) : '—'}</div><div className="ms">{ultimo ? `Mês ${prazo}` : '—'}</div></div>
            <div className="met red"><div className="ml">Total pago</div><div className="mv">{resultado.length ? fmtR(totalPago) : '—'}</div><div className="ms">Juros: {resultado.length ? fmtR(totalJuros) : '—'}</div></div>
            <div className="met"><div className="ml">Renda mínima (30%)</div><div className="mv">{primeiro ? fmtR(primeiro.encargo / .30) : '—'}</div><div className="ms">Lei 8.692/1993</div></div>
          </div>
          <div className="card"><div className="sec">Composição do 1º encargo</div><div className="comp">
            <div className="comp-s prest"><div className="comp-t" style={{ color: 'var(--blue)' }}>Prestação Mensal</div><div className="comp-sub">Afeta o saldo devedor</div><div className="cr"><span>Amortização</span><span>{primeiro ? fmtR(primeiro.amortizacao) : '—'}</span></div><div className="cr"><span>Juros</span><span>{primeiro ? fmtR(primeiro.juros) : '—'}</span></div>{primeiro?.correcaoValor > .01 && !correcaoAnual && <div className="cr"><span>Correção</span><span>{fmtR(primeiro.correcaoValor)}</span></div>}<div className="cr tot"><span>Subtotal</span><span>{primeiro ? fmtR(primeiro.prestacao) : '—'}</span></div></div>
            <div className="comp-s aces"><div className="comp-t" style={{ color: 'var(--accent)' }}>Encargos Acessórios</div><div className="comp-sub">Repassados à seguradora</div><div className="cr"><span>MIP</span><span>{primeiro ? fmtR(primeiro.mip) : '—'}</span></div><div className="cr"><span>DFI</span><span>{primeiro ? fmtR(primeiro.dfi) : '—'}</span></div><div className="cr"><span>Taxa adm.</span><span>{primeiro ? fmtR(primeiro.adm) : '—'}</span></div><div className="cr tot"><span>Subtotal</span><span>{primeiro ? fmtR(primeiro.mip + primeiro.dfi + primeiro.adm) : '—'}</span></div></div>
            <div className="comp-bar"><span>Encargo total — 1º mês</span><span>{primeiro ? fmtR(primeiro.encargo) : '—'}</span></div></div></div>
          <div className="card"><div className="sec">Evolução do encargo mensal</div><div className="chart-box">{chartData && <ChartCanvas data={chartData} options={chartOptions} />}</div></div>
        </div>
      </div>
      <div className="notas"><strong>Base:</strong> Financiamento sobre <strong>valor de avaliação</strong> (não venda) · Art. 11-A Res. CMN 4.676/2018 · <strong>MIP:</strong> saldo × taxa × 1,038 + R$ 0,80 · <strong>DFI:</strong> avaliação × 0,004684%/mês · <strong>Admin:</strong> R$ 25/mês · <strong>Renda mín.:</strong> encargo ÷ 30% (Lei 8.692/1993)</div>
    </div>
  );
}
