import ChartCanvas from './ChartCanvas.jsx';
import { M2, TETO_SFH, getValorVenda } from '../data/units.js';
import { POSTOS } from '../data/financialTables.js';
import { fmtR, fPct, pBRL } from '../utils/formatters.js';
import { calcCapacidade, calcCapacProg, getReferenciasCCCPM } from '../utils/financial.js';

export default function Capacidade({ unidade, form, posto, setPosto }) {
  const avaliacao = unidade.apt.area * M2;
  const entrada = pBRL(form.entrada);
  const financiamento = Math.max(0, avaliacao - entrada);
  const venda = getValorVenda(unidade.apt.id, unidade.andar);
  const cap = posto ? calcCapacidade(posto, avaliacao) : null;
  const capPrimeiro = posto ? calcCapacProg(posto, avaliacao, '1IM') : 0;
  const refs = posto ? getReferenciasCCCPM(posto) : {};
  const dif = cap ? cap.cap - financiamento : 0;
  const difRef = refs.promorar ? cap.cap - refs.promorar : null;
  const difRefPct = refs.promorar ? (difRef / refs.promorar) * 100 : null;
  const status = !cap ? { cls: 'idle', icon: '⏳', title: 'Aguardando seleção', desc: 'Selecione o posto e a unidade habitacional para verificar a viabilidade.' }
    : avaliacao > TETO_SFH ? { cls: 'stop', icon: '🚫', title: 'Imóvel não financiável pelo SFH', desc: `O valor de avaliação (${fmtR(avaliacao)}) supera o teto de R$ 2.250.000,00 da CCCPM.` }
    : dif >= 0 ? { cls: 'ok', icon: '✅', title: 'Parabéns!!', desc: 'Sua Capacidade Financeira é igual ou superior ao valor financiado pretendido.' }
    : dif >= -50000 ? { cls: 'warn', icon: '⚠️', title: 'Atenção — pequeno desvio', desc: `Capacidade (${fmtR(cap.cap)}) está ${fmtR(Math.abs(dif))} abaixo do necessário.` }
    : { cls: 'stop', icon: '🛑', title: 'Capacidade insuficiente', desc: 'Capacidade Financeira é inferior ao valor financiado pretendido. Considere entrada maior ou composição de renda.' };

  const barData = cap ? {
    labels: ['PROMORAR', '1º Imóvel', 'Financ. necessário'],
    datasets: [{ data: [cap.cap, capPrimeiro, financiamento], backgroundColor: [cap.cap >= financiamento ? 'rgba(42,157,143,.7)' : 'rgba(231,111,81,.7)', capPrimeiro >= financiamento ? 'rgba(42,157,143,.5)' : 'rgba(231,111,81,.5)', 'rgba(46,134,171,.6)'], borderWidth: 2, borderRadius: 6 }],
  } : null;
  const barOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => fmtR(c.parsed.y) } } }, scales: { y: { ticks: { callback: (v) => `R$${Math.round(v/1000)}k` }, beginAtZero: true }, x: { ticks: { font: { size: 11 } } } } };

  return (
    <div>
      <div className="posto-sel">
        <label>Posto / Graduação do Mutuário</label>
        <select value={posto} onChange={(e) => setPosto(e.target.value)}>
          <option value="">— Selecione —</option>
          {POSTOS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        {cap && <div className="lem-bar">
          <div><div className="lem-label">Renda Bruta (Sheet 1)</div><div className="lem-val">{fmtR(cap.renda)}</div></div>
          <div style={{ width: 2, height: 40, background: 'rgba(255,255,255,.2)', flexShrink: 0 }} />
          <div><div className="lem-label">LEM — 30% da Renda</div><div className="lem-val">{fmtR(cap.lem)}</div></div>
          <div style={{ width: 2, height: 40, background: 'rgba(255,255,255,.2)', flexShrink: 0 }} />
          <div><div className="lem-label">Capacidade Financeira PROMORAR</div><div className="lem-val">{fmtR(cap.cap)}</div></div>
        </div>}
      </div>

      {!cap ? <div className={`status-box ${status.cls}`}><div className="status-icon">{status.icon}</div><div><div className="status-title">{status.title}</div><div className="status-desc">{status.desc}</div></div></div> : <div className="g2">
        <div>
          <div className={`status-box ${status.cls}`}><div className="status-icon">{status.icon}</div><div><div className="status-title">{status.title}</div><div className="status-desc">{status.desc}</div></div></div>
          <div className="card"><div className="sec">Memória de Cálculo PROMORAR</div>
            <div className="cr"><span>Renda bruta (Sheet 1)</span><span>{fmtR(cap.renda)}</span></div>
            <div className="cr"><span>LEM (30% da renda)</span><span>{fmtR(cap.lem)}</span></div>
            <div className="cr"><span>Margem de segurança</span><span>− R$ 200,00</span></div>
            <div className="cr"><span>Capacidade Financeira</span><span>{fmtR(cap.lemDisp)}</span></div>
            <div className="gap" />
            <div className="cr"><span>Taxa de juros</span><span>{fPct(cap.taxa)} a.a.</span></div>
            <div className="cr"><span>Taxa mensal equivalente</span><span>{fPct(cap.i)} a.m.</span></div>
            <div className="cr"><span>Prazo máximo</span><span>{cap.prazo} meses</span></div>
            <div className="cr"><span>Idade típica do posto</span><span>{cap.idade} anos</span></div>
            <div className="cr"><span>MIP (% ao mês)</span><span>{(cap.mip * 100).toFixed(6)}%</span></div>
            <div className="cr"><span>DFI</span><span>{fmtR(cap.dfi)}/mês</span></div>
            <div className="cr tot"><span>Capacidade Financeira</span><span>{fmtR(cap.cap)}</span></div>
            <div className="hint"><strong>Fórmula:</strong> Financ = (LEM_disp − DFI) ÷ (1/prazo + i_mensal + MIP_taxa)</div>
          </div>
          <div className="card mt8"><div className="sec">Confronto com Tabela CCCPM</div>
            <div className="cr"><span>Capacidade calculada</span><span>{fmtR(cap.cap)}</span></div>
            <div className="cr"><span>CCCPM oficial (PROMORAR)</span><span>{refs.promorar ? fmtR(refs.promorar) : 'N/D (Gen.)'}</span></div>
            <div className="cr"><span>Diferença</span><span>{difRef == null ? '—' : `${fmtR(difRef)} (${difRefPct.toFixed(1)}%)`}</span></div>
            <div className="cr"><span>Validação</span><span>{difRefPct == null ? 'Tabela CCCPM não publicada para esta faixa' : Math.abs(difRefPct) <= 2 ? '✅ CONFIRMADO (< 2%)' : Math.abs(difRefPct) <= 6 ? '⚠️ Próximo (< 6%)' : '❌ Verificar'}</span></div>
          </div>
        </div>
        <div>
          <div className="card"><div className="sec">Unidade selecionada — Análise de viabilidade</div>
            <div className="cr"><span>Unidade</span><span>{unidade.andar}º andar · {unidade.apt.id}</span></div>
            <div className="cr"><span>Valor de venda</span><span>{fmtR(venda)}</span></div>
            <div className="cr"><span>Valor de avaliação</span><span>{fmtR(avaliacao)}</span></div>
            <div className="cr"><span>Entrada informada</span><span>{fmtR(entrada)}</span></div>
            <div className="cr"><span>Financiamento necessário</span><span>{fmtR(financiamento)}</span></div>
            <div className="cr"><span>Capacidade PROMORAR</span><span>{fmtR(cap.cap)}</span></div>
            <div className="cr tot"><span>Diferença (Cap − Financ)</span><span style={{ color: dif >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmtR(dif)}</span></div>
          </div>
          <div className="card mt8"><div className="sec">Capacidade vs. Financiamento necessário</div><div className="chart-box" style={{ height: 200 }}>{barData && <ChartCanvas type="bar" data={barData} options={barOptions} />}</div></div>
          <div className="card mt8"><div className="sec">Viabilidade por programa — UH selecionada</div><div className="table-wrap"><table className="ptbl"><thead><tr><th>Programa</th><th>Cap. Financeira</th><th>Financ. Necessário</th><th>Situação</th></tr></thead><tbody>{[{ nome: 'PROMORAR (9,20%)', cap: cap.cap }, { nome: '1º Imóvel (consignado faixa)', cap: capPrimeiro }].map((p) => <tr key={p.nome}><td>{p.nome}</td><td>{fmtR(p.cap)}</td><td>{fmtR(financiamento)}</td><td>{p.cap >= financiamento ? <span className="badge ok">✅ Viável</span> : <span className="badge blq">🛑 Insuficiente</span>}</td></tr>)}</tbody></table></div></div>
        </div>
      </div>}
    </div>
  );
}
