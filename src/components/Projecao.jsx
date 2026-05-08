import { useMemo, useState } from 'react';
import ChartCanvas from './ChartCanvas.jsx';
import { M2, TETO_SFH, TIPOLOGIAS } from '../data/units.js';
import { fmtR } from '../utils/formatters.js';

export default function Projecao() {
  const [valorizacao, setValorizacao] = useState(8);
  const [horizonte, setHorizonte] = useState(10);
  const taxa = valorizacao / 100;
  const anos = useMemo(() => Array.from({ length: horizonte + 1 }, (_, i) => 2025 + i), [horizonte]);

  const m2Data = {
    labels: anos.map(String),
    datasets: [{ label: 'm² (R$)', data: anos.map((a) => M2 * (1 + taxa) ** (a - 2025)), borderColor: '#1B4F72', backgroundColor: 'rgba(27,79,114,.1)', fill: true, tension: .3, pointRadius: 3, borderWidth: 2 }],
  };
  const tipData = {
    labels: anos.map(String),
    datasets: [
      ...TIPOLOGIAS.map((t, i) => ({ label: t.lbl, data: anos.map((a) => t.area * M2 * (1 + taxa) ** (a - 2025)), borderColor: ['#E74C3C', '#2E86AB', '#F4A261', '#2A9D8F'][i], tension: .3, pointRadius: 2, borderWidth: 2, fill: false })),
      { label: 'Teto SFH R$ 2,25M', data: anos.map(() => TETO_SFH), borderColor: '#E74C3C', borderDash: [8, 4], pointRadius: 0, borderWidth: 1.5, fill: false },
    ],
  };
  const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { boxWidth: 9, font: { size: 10 } } }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${fmtR(c.parsed.y)}` } } }, scales: { y: { ticks: { callback: (v) => `R$${Math.round(v / 1000)}k` }, beginAtZero: false }, x: { ticks: { font: { size: 10 } } } } };

  return (
    <div className="g2">
      <div>
        <div className="card"><div className="sec">Parâmetros da projeção</div>
          <div className="field"><label>Valorização anual do m² (%)</label><div className="rrow"><input type="range" min="2" max="20" step="0.5" value={valorizacao} onChange={(e) => setValorizacao(Number(e.target.value))} /><div className="rval">{valorizacao.toFixed(1).replace('.', ',')}%</div></div><div className="hint">DF 2024/25: IGMI-R +17% · Cons. 5% · Mod. 8% · Acel. 12%</div></div>
          <div className="field"><label>Horizonte (anos)</label><div className="rrow"><input type="range" min="3" max="15" step="1" value={horizonte} onChange={(e) => setHorizonte(Number(e.target.value))} /><div className="rval">{horizonte} anos</div></div></div>
          <div className="pills">{[[5, 'Conservador 5%'], [8, 'Moderado 8%'], [12, 'Acelerado 12%']].map(([v, l]) => <button key={v} type="button" className={`pill ${valorizacao === v ? 'active' : ''}`} onClick={() => setValorizacao(v)}>{l}</button>)}</div>
          <div className="notas"><strong>Teto SFH:</strong> R$ 2.250.000 de avaliação · Quando a avaliação supera esse teto, o financiamento pela CCCPM não é possível</div>
        </div>
        <div className="card"><div className="sec">Evolução do valor m²</div><div className="chart-box"><ChartCanvas data={m2Data} options={{ ...options, plugins: { legend: { display: false } } }} /></div></div>
      </div>
      <div>
        <div className="card"><div className="sec">Período crítico — teto R$ 2.250.000</div><div className="table-wrap"><table className="ptbl"><thead><tr><th>Tipologia</th><th>Área</th><th>Aval. atual</th><th>Anos p/ bloquear</th><th>Ano est.</th><th>Status</th></tr></thead><tbody>{TIPOLOGIAS.map((t) => {
          const av = t.area * M2;
          const anosBloq = av > TETO_SFH ? 0 : Math.log((TETO_SFH / t.area) / M2) / Math.log(1 + taxa);
          return { t, av, anosBloq };
        }).sort((a, b) => a.anosBloq - b.anosBloq).map(({ t, av, anosBloq }) => {
          if (av > TETO_SFH) return <tr key={t.lbl} className="blq"><td>{t.lbl}</td><td>{t.area.toFixed(2)}m²</td><td>{fmtR(av)}</td><td>—</td><td>—</td><td><span className="badge jb">JÁ BLOQUEADO</span></td></tr>;
          const cls = anosBloq <= 3 ? 'blq' : anosBloq <= 6 ? 'crit' : '';
          const badge = anosBloq <= 3 ? <span className="badge blq">≤ 3 anos</span> : anosBloq <= 6 ? <span className="badge cr">3-6 anos</span> : <span className="badge ok">&gt; 6 anos</span>;
          return <tr key={t.lbl} className={cls}><td>{t.lbl}</td><td>{t.area.toFixed(2)}m²</td><td>{fmtR(av)}</td><td>{anosBloq.toFixed(1)} anos</td><td>{Math.ceil(2025 + anosBloq)}</td><td>{badge}</td></tr>;
        })}</tbody></table></div><div className="notas"><span style={{ color: 'var(--red)' }}>■</span> ≤ 3 anos · <span style={{ color: '#9A7D0A' }}>■</span> 3-6 anos · <span style={{ color: 'var(--green)' }}>■</span> &gt; 6 anos</div></div>
        <div className="card mt12"><div className="sec">Avaliação por tipologia × Teto SFH</div><div className="chart-box" style={{ height: 260 }}><ChartCanvas data={tipData} options={options} /></div></div>
      </div>
    </div>
  );
}
