import { APTOS, M2, SOL, getValorVenda } from '../data/units.js';
import { fmtR } from '../utils/formatters.js';

export default function UnitGrid({ unidade, setUnidade }) {
  return (
    <div className="card">
      <div className="sec">Selecione a unidade habitacional</div>
      <div className="grade-wrap">
        <div className="grade">
          <div />
          {APTOS.map((ap) => <div key={ap.id} className="gh">{ap.id.replace('AP', 'Coluna')}</div>)}
          {[6, 5, 4, 3, 2, 1].map((andar) => (
            <>
              <div key={`andar-${andar}`} className="ga">{andar}º</div>
              {APTOS.map((ap) => {
                const selecionada = unidade.andar === andar && unidade.apt.id === ap.id;
                const cor = SOL[ap.sol];
                const numeroApto = andar * 100 + parseInt(ap.id.split(' ')[1]);
                return (
                  <button
                    type="button"
                    key={`${andar}-${ap.id}`}
                    className={`gc${selecionada ? ' sel' : ''}`}
                    style={{ background: selecionada ? 'var(--navy)' : cor.bg, color: selecionada ? '#fff' : cor.tx }}
                    title={`${andar}º · ${ap.id}\n${ap.fach}\n${ap.area.toFixed(2)}m²\nAvaliação: ${fmtR(ap.area * M2)}\nVenda: ${fmtR(getValorVenda(ap.id, andar))}`}
                    onClick={() => setUnidade({ andar, apt: ap })}
                  >
                    {numeroApto}
                  </button>
                );
              })}
            </>
          ))}
        </div>
      </div>
      <div className="leg">
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', alignSelf: 'center' }}>Sol:</span>
        {Object.entries(SOL).map(([key, value]) => <div key={key} className="leg-i" style={{ background: value.bg, color: value.tx }}><div className="leg-dot" style={{ background: value.tx }} />{value.label}</div>)}
      </div>
    </div>
  );
}
