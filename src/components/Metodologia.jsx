export default function Metodologia() {
  return (
    <div className="g2">
      <div>
        <div className="card">
          <div className="sec">Algoritmo da Capacidade Financeira (PROMORAR)</div>
          <div style={{ fontSize: 12, lineHeight: 1.9, color: 'var(--text)' }}>
            <p><strong>1. LEM</strong> = Renda Bruta × 30% (Lei 8.692/1993)</p><br />
            <p><strong>2. Capacidade Financeira</strong> = LEM − R$ 200,00 (margem de segurança CCCPM)</p><br />
            <p><strong>3. Capacidade Financeira</strong> pelo SACRE 1º mês:<br /><code>Financ = (LEM_disp − DFI) ÷ (1/prazo + i + MIP_taxa)</code></p><br />
            <p><strong>4. Parâmetros PROMORAR:</strong><br />• Taxa: 9,20% a.a. efetiva<br />• Prazo: 420 meses<br />• MIP: taxa TOO Seguros por faixa etária<br />• DFI: 0,004684%/mês sobre avaliação<br />• Admin: NÃO incluída no PROMORAR<br />• TR: 0% na tabela CCCPM publicada sem projeção de TR</p><br />
            <p><strong>5. Validação:</strong> CMG/CF/CC → desvio inferior a 1% vs CCCPM.</p>
          </div>
        </div>
        <div className="card mt8"><div className="sec">Taxas por Faixa — Sheet3 (Consignado Efetivo)</div><table className="mtbl"><thead><tr><th>Faixa de avaliação</th><th>Consignado (Efetiva)</th></tr></thead><tbody><tr><td>Até R$ 700.000</td><td>9,20% a.a.</td></tr><tr><td>Até R$ 950.000</td><td>9,50% a.a.</td></tr><tr><td>Até R$ 1.500.000</td><td>9,80% a.a.</td></tr><tr><td>Até R$ 2.250.000</td><td>10,70% a.a.</td></tr><tr><td>PROMORAR (especial)</td><td><strong>9,20% a.a. fixo</strong></td></tr></tbody></table></div>
      </div>
      <div>
        <div className="card"><div className="sec">Seguro MIP — TOO Seguros / CCCPM</div><table className="mtbl"><thead><tr><th>Faixa etária</th><th>Taxa MIP (% ao mês)</th></tr></thead><tbody><tr><td>18 a 25 anos</td><td>0,022866%</td></tr><tr><td>26 a 30 anos</td><td>0,029256%</td></tr><tr><td>31 a 35 anos</td><td>0,028933%</td></tr><tr><td>36 a 40 anos</td><td>0,030896%</td></tr><tr><td>41 a 45 anos</td><td>0,032617%</td></tr><tr><td>46 a 50 anos</td><td>0,034423%</td></tr><tr><td>51 a 55 anos</td><td>0,037127%</td></tr><tr><td>56 a 60 anos</td><td>0,039172%</td></tr><tr><td>61 a 65 anos</td><td>0,040322%</td></tr><tr><td>66 a 80 anos</td><td>0,043928%</td></tr></tbody></table><div className="notas">DFI: 0,004684%/mês sobre valor de avaliação (fixo)</div></div>
        <div className="card mt8"><div className="sec">SFH (CCCPM) × SFI (POUPEX)</div><table className="mtbl"><thead><tr><th>Critério</th><th>CCCPM/SFH</th><th>POUPEX/SFI</th></tr></thead><tbody><tr><td>Taxa TR civil</td><td>9,80%</td><td>a partir 7,6%</td></tr><tr><td>Taxa IPCA militar</td><td>—</td><td>a partir 2,6%</td></tr><tr><td>PROMORAR</td><td><strong>9,20%</strong></td><td>—</td></tr><tr><td>Valor máx. imóvel</td><td>R$ 2,25M</td><td>R$ 10M</td></tr><tr><td>Máx. financiado</td><td><strong>90%</strong> (SACRE)</td><td>80%</td></tr><tr><td>Limite de idade</td><td>80 anos</td><td>85 anos</td></tr></tbody></table></div>
      </div>
    </div>
  );
}
