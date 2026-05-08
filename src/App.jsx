import { useState } from 'react';
import { APTOS } from './data/units.js';
import Simulador from './components/Simulador.jsx';
import Capacidade from './components/Capacidade.jsx';
import Projecao from './components/Projecao.jsx';
import Comparativo from './components/Comparativo.jsx';
import Metodologia from './components/Metodologia.jsx';

const abas = [
  ['sim', 'Simulador'],
  ['capac', 'Capacidade Financeira'],
  ['proj', 'Projeção de Mercado'],
  ['cmp', 'Comparativo'],
  ['met', 'Metodologia'],
];

export default function App() {
  const [aba, setAba] = useState('sim');
  const [unidade, setUnidade] = useState({ andar: 1, apt: APTOS[3] });
  const [posto, setPosto] = useState('');
  const [form, setForm] = useState({
    nascimento: '1975-04-25',
    entrada: '0,00',
    prazo: 360,
    sistema: 'SACRE',
    indexador: 'TR',
    tr: '0,1679',
    ipca: '4,14',
  });

  return (
    <>
      <header className="hdr">
        <div className="logo-fallback">CCCPM</div>
        <div><h1>Simulador de Financiamento Imobiliário · CCCPM</h1><p>Residencial Oceania · SQNW 302 Bloco K · Brasília/DF · NOV/2025</p></div>
      </header>
      <nav className="tabs">
        {abas.map(([id, label]) => <button key={id} type="button" className={`tab ${aba === id ? 'active' : ''}`} onClick={() => setAba(id)}>{label}</button>)}
      </nav>
      <main className="main">
        {aba === 'sim' && <Simulador unidade={unidade} setUnidade={setUnidade} form={form} setForm={setForm} />}
        {aba === 'capac' && <Capacidade unidade={unidade} form={form} posto={posto} setPosto={setPosto} />}
        {aba === 'proj' && <Projecao />}
        {aba === 'cmp' && <Comparativo unidade={unidade} form={form} />}
        {aba === 'met' && <Metodologia />}
      </main>
    </>
  );
}
