import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart,
} from "recharts";

// ─────────────────────────────────────────────
// TEMA CHIARO / SCURO
// ─────────────────────────────────────────────
const TEMI = {
  dark: {
    bg:              "linear-gradient(160deg, #020817 0%, #0a1628 50%, #020817 100%)",
    headerBg:        "linear-gradient(90deg, #0f172a, #1e293b)",
    headerBorder:    "#1e293b",
    cardBg:          "#0f172a",
    cardBorder:      "#1e293b",
    cardBg2:         "#1e293b44",
    text:            "#e2e8f0",
    textMuted:       "#64748b",
    textSub:         "#94a3b8",
    textLabel:       "#475569",
    inputBg:         "#1e293b",
    scrollTrack:     "#0f172a",
    scrollThumb:     "#334155",
    tooltipBg:       "#0f172a",
    tooltipBorder:   "#334155",
    tooltipText:     "#e2e8f0",
    tooltipLabel:    "#94a3b8",
    gridStroke:      "#1e293b",
    axisStroke:      "#475569",
    tabActive:       "#1e293b",
    tabText:         "#475569",
    bannerBg:        "linear-gradient(135deg, #1d4ed820, #1e3a5f)",
    bannerBorder:    "#2563eb33",
    badgeBlueBg:     "#1e3a5f",
    badgeBlueBorder: "#2563eb44",
    badgeBlueText:   "#93c5fd",
    badgeGreenBg:    "#14532d44",
    badgeGreenBorder:"#16a34a44",
    badgeGreenText:  "#86efac",
    infoBoxBg:       "#052e16",
    infoBoxBorder:   "#16a34a33",
    infoBoxText:     "#86efac",
    disclaimerBg:    "#1e293b44",
    disclaimerBorder:"#334155",
    disclaimerText:  "#475569",
    sliderTrack:     "#1e293b",
    thumbBorder:     "#0f172a",
    toggleBg:        "#1e293b",
  },
  light: {
    bg:              "linear-gradient(160deg, #f0f4ff 0%, #e8f0fe 50%, #f0f4ff 100%)",
    headerBg:        "linear-gradient(90deg, #ffffff, #f1f5ff)",
    headerBorder:    "#dbeafe",
    cardBg:          "#ffffff",
    cardBorder:      "#e2e8f0",
    cardBg2:         "#f8fafc",
    text:            "#0f172a",
    textMuted:       "#64748b",
    textSub:         "#475569",
    textLabel:       "#94a3b8",
    inputBg:         "#f1f5f9",
    scrollTrack:     "#f1f5f9",
    scrollThumb:     "#cbd5e1",
    tooltipBg:       "#ffffff",
    tooltipBorder:   "#e2e8f0",
    tooltipText:     "#0f172a",
    tooltipLabel:    "#64748b",
    gridStroke:      "#e2e8f0",
    axisStroke:      "#94a3b8",
    tabActive:       "#f1f5f9",
    tabText:         "#94a3b8",
    bannerBg:        "linear-gradient(135deg, #dbeafe, #eff6ff)",
    bannerBorder:    "#bfdbfe",
    badgeBlueBg:     "#dbeafe",
    badgeBlueBorder: "#93c5fd",
    badgeBlueText:   "#1d4ed8",
    badgeGreenBg:    "#dcfce7",
    badgeGreenBorder:"#86efac",
    badgeGreenText:  "#15803d",
    infoBoxBg:       "#f0fdf4",
    infoBoxBorder:   "#86efac",
    infoBoxText:     "#15803d",
    disclaimerBg:    "#f8fafc",
    disclaimerBorder:"#e2e8f0",
    disclaimerText:  "#64748b",
    sliderTrack:     "#e2e8f0",
    thumbBorder:     "#ffffff",
    toggleBg:        "#e2e8f0",
  },
};

// ─────────────────────────────────────────────
// COSTANTI FONDO ESPERO (dati reali 2025)
// ─────────────────────────────────────────────
const COMPARTI = {
  garantito: {
    label: "Garanzia",
    rendimento: 3.5,
    rendimentoPessimistico: 1.5,
    rendimentoOttimistico: 4.5,
    descrizione: "Garanzia del capitale · Rivalutazione in linea con TFR · Ideale per chi è prossimo alla pensione · Gestito da Unipol",
    colore: "#22c55e",
    rischio: "Basso",
    orizzonte: "Breve",
    composizione: "Prevalentemente obbligazionario breve/media durata + componente azionaria contenuta",
    tfr: true,
  },
  prudente: {
    label: "Crescita",
    rendimento: 4.0,
    rendimentoPessimistico: 1.5,
    rendimentoOttimistico: 6.5,
    descrizione: "Obiettivo: +2% oltre inflazione · 30% azioni / 40% obbligaz. / 10% monetario · 6 gestori specializzati",
    colore: "#3b82f6",
    rischio: "Medio",
    orizzonte: "Medio",
    composizione: "30% azioni internazionali · 40% obbligazioni internazionali · 10% monetario · 20% obbligaz. breve duration",
    tfr: false,
  },
  bilanciato: {
    label: "Dinamico",
    rendimento: 5.0,
    rendimentoPessimistico: 2.0,
    rendimentoOttimistico: 8.0,
    descrizione: "Attivo dal 1° nov 2024 · Obiettivo: +2,5% oltre inflazione · 60% azioni / 40% obbligaz. · Rischio medio-alto",
    colore: "#f59e0b",
    rischio: "Medio-Alto",
    orizzonte: "Lungo (15+ anni)",
    composizione: "60% azioni internazionali (mercati sviluppati) · 40% obbligazionario globale hedged",
    tfr: false,
  },
};

const TFR_RIVALUTAZIONE      = 1.5;
const ALIQUOTA_IRPEF_DEFAULT = 27;
const TASSAZIONE_FONDO_MIN   = 9;
const TASSAZIONE_FONDO_MAX   = 15;
const DEDUCIBILITA_MAX       = 5164;

// ─────────────────────────────────────────────
// CALCOLI FINANZIARI
// ─────────────────────────────────────────────
function calcolaSimulazione(params) {
  const { etaAttuale, etaPensionamento, stipendioLordo, crescitaStipendio,
    percContributoLavoratore, percContributoDatore, tfrAnnuo, comparto, inflazione, scenario } = params;

  const anni = etaPensionamento - etaAttuale;
  if (anni <= 0) return null;

  const comp = COMPARTI[comparto];
  const rendimento =
    scenario === "pessimistico" ? comp.rendimentoPessimistico :
    scenario === "ottimistico"  ? comp.rendimentoOttimistico  : comp.rendimento;

  const r               = rendimento / 100;
  const crescita        = crescitaStipendio / 100;
  const rivalutazioneTFR = (TFR_RIVALUTAZIONE + inflazione * 0.75) / 100;

  let datiAnnuali = [], montateFondo = 0, montateTFR_INPS = 0;
  let contributiTotali = 0, tfrTotale = 0, vantaggioFiscaleTotale = 0;
  let stipendioCorrente = stipendioLordo;

  for (let anno = 1; anno <= anni; anno++) {
    if (anno > 1) stipendioCorrente *= (1 + crescita);
    const contributoLavoratore = (stipendioCorrente * percContributoLavoratore) / 100;
    const contributoDatore     = (stipendioCorrente * percContributoDatore) / 100;
    const contributoAnnuo      = contributoLavoratore + contributoDatore + tfrAnnuo;
    const importoDeducibile    = Math.min(contributoLavoratore, DEDUCIBILITA_MAX);
    vantaggioFiscaleTotale    += (importoDeducibile * ALIQUOTA_IRPEF_DEFAULT) / 100;
    contributiTotali += contributoAnnuo;
    tfrTotale        += tfrAnnuo;
    montateFondo      = (montateFondo    + contributoAnnuo) * (1 + r);
    montateTFR_INPS   = (montateTFR_INPS + tfrAnnuo)       * (1 + rivalutazioneTFR);
    datiAnnuali.push({
      anno, eta: etaAttuale + anno,
      fondoEspero:          Math.round(montateFondo),
      tfrInps:              Math.round(montateTFR_INPS),
      contributiCumulativi: Math.round(contributiTotali),
      rendimentoAccumulato: Math.round(montateFondo - contributiTotali),
    });
  }

  const anniOltre15   = Math.max(0, anni - 15);
  const aliquotaFondo = Math.max(TASSAZIONE_FONDO_MIN, TASSAZIONE_FONDO_MAX - anniOltre15 * 0.3);
  const montateFondoNetto  = montateFondo * (1 - aliquotaFondo / 100);
  const pensioneMensile    = (montateFondoNetto * 0.045) / 12;
  const pensioneMensileTFR = (montateTFR_INPS   * 0.045) / 12;

  return {
    datiAnnuali,
    montateFondo:        Math.round(montateFondo),
    montateFondoNetto:   Math.round(montateFondoNetto),
    montateTFR_INPS:     Math.round(montateTFR_INPS),
    contributiTotali:    Math.round(contributiTotali),
    tfrTotale:           Math.round(tfrTotale),
    rendimentoGenerato:  Math.round(montateFondo - contributiTotali),
    pensioneMensile:     Math.round(pensioneMensile),
    pensioneMensileTFR:  Math.round(pensioneMensileTFR),
    vantaggioFiscale:    Math.round(vantaggioFiscaleTotale),
    aliquotaFondo:       aliquotaFondo.toFixed(1),
    vantaggioNettoFondo: Math.round(montateFondoNetto - montateTFR_INPS),
    anni,
  };
}

const fmt = (n) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

// ─────────────────────────────────────────────
// TOGGLE TEMA
// ─────────────────────────────────────────────
function ThemeToggle({ tema, onToggle, t }) {
  return (
    <button onClick={onToggle}
      title={tema === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro"}
      style={{
        display: "flex", alignItems: "center", gap: "0.5rem",
        background: t.toggleBg, border: `1px solid ${t.cardBorder}`,
        borderRadius: 99, padding: "0.35rem 0.9rem", cursor: "pointer",
        transition: "all 0.3s", fontSize: "0.8rem", fontWeight: 600, color: t.text,
      }}>
      <span style={{ fontSize: "1rem" }}>{tema === "dark" ? "☀️" : "🌙"}</span>
      <span>{tema === "dark" ? "Tema chiaro" : "Tema scuro"}</span>
    </button>
  );
}

// ─────────────────────────────────────────────
// SLIDER
// ─────────────────────────────────────────────
function SliderInput({ label, value, min, max, step, onChange, unit, tooltip, color = "#3b82f6", t }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: "1.4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
        <label style={{ fontSize: "0.82rem", fontWeight: 600, color: t.textSub, letterSpacing: "0.04em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          {label}
          {tooltip && (
            <span onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}
              style={{ cursor: "help", position: "relative", display: "inline-flex" }}>
              <span style={{ width: 16, height: 16, borderRadius: "50%", background: t.inputBg, color: t.textSub, fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>?</span>
              {showTooltip && (
                <span style={{ position: "absolute", bottom: "120%", left: "50%", transform: "translateX(-50%)",
                  background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: 8,
                  padding: "0.5rem 0.7rem", fontSize: "0.75rem", color: t.tooltipText,
                  whiteSpace: "nowrap", zIndex: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
                  {tooltip}
                </span>
              )}
            </span>
          )}
        </label>
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: t.text }}>
          {unit === "€" ? fmt(value) : `${value}${unit}`}
        </span>
      </div>
      <div style={{ position: "relative", height: 6, borderRadius: 99, background: t.sliderTrack }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 99, transition: "width 0.15s" }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: 0, width: "100%", opacity: 0, cursor: "pointer", height: 20, margin: 0 }} />
        <div style={{ position: "absolute", top: "50%", transform: "translate(-50%, -50%)", left: `${pct}%`,
          width: 16, height: 16, borderRadius: "50%", background: color, boxShadow: `0 0 12px ${color}88`,
          border: `2px solid ${t.thumbBorder}`, transition: "left 0.15s", pointerEvents: "none" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem" }}>
        <span style={{ fontSize: "0.7rem", color: t.textLabel }}>{unit === "€" ? fmt(min) : `${min}${unit}`}</span>
        <span style={{ fontSize: "0.7rem", color: t.textLabel }}>{unit === "€" ? fmt(max) : `${max}${unit}`}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// RESULT CARD
// ─────────────────────────────────────────────
function ResultCard({ label, value, sublabel, color, icon, highlight, t }) {
  return (
    <div style={{
      background: highlight ? `linear-gradient(135deg, ${color}18, ${color}08)` : t.cardBg,
      border: `1px solid ${highlight ? color + "44" : t.cardBorder}`,
      borderRadius: 16, padding: "1.2rem 1.4rem",
      boxShadow: highlight ? `0 0 24px ${color}22` : "none", transition: "all 0.3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "1.2rem" }}>{icon}</span>
        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      </div>
      <div style={{ fontSize: "1.6rem", fontWeight: 800, color: highlight ? color : t.text, lineHeight: 1 }}>{value}</div>
      {sublabel && <div style={{ fontSize: "0.75rem", color: t.textMuted, marginTop: "0.3rem" }}>{sublabel}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// TOOLTIP GRAFICO
// ─────────────────────────────────────────────
function CustomTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: 10, padding: "0.8rem 1rem", fontSize: "0.8rem", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
      <p style={{ color: t.tooltipLabel, marginBottom: "0.4rem", fontWeight: 700 }}>Età {label} anni</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "0.15rem 0" }}>
          <span style={{ fontWeight: 600 }}>{p.name}:</span> {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// APP PRINCIPALE
// ─────────────────────────────────────────────
export default function FondoEsperoSimulator() {
  const [tema, setTema] = useState("dark");
  const t = TEMI[tema];

  const [etaAttuale,              setEtaAttuale]              = useState(35);
  const [etaPensionamento,        setEtaPensionamento]        = useState(67);
  const [stipendioLordo,          setStipendioLordo]          = useState(26000);
  const [crescitaStipendio,       setCrescitaStipendio]       = useState(1.0);
  const [percContributoLavoratore,setPercContributoLavoratore]= useState(1.0);
  const [percContributoDatore,    setPercContributoDatore]    = useState(1.0);
  const [tfrAnnuo,                setTfrAnnuo]                = useState(1700);
  const [comparto,                setComparto]                = useState("prudente");
  const [inflazione,              setInflazione]              = useState(2.0);
  const [scenario,                setScenario]                = useState("realistico");
  const [activeTab,               setActiveTab]               = useState("crescita");

  const params        = { etaAttuale, etaPensionamento, stipendioLordo, crescitaStipendio, percContributoLavoratore, percContributoDatore, tfrAnnuo, comparto, inflazione, scenario };
  const risultati     = calcolaSimulazione(params);
  const risultatiPess = calcolaSimulazione({ ...params, scenario: "pessimistico" });
  const risultatiOtt  = calcolaSimulazione({ ...params, scenario: "ottimistico" });

  if (!risultati) return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
      Inserisci un'età di pensionamento maggiore dell'età attuale.
    </div>
  );

  const comp = COMPARTI[comparto];
  const mkTooltip = (props) => <CustomTooltip {...props} t={t} />;

  const datiScenari = risultati.datiAnnuali
    .filter((d) => d.anno % 5 === 0 || d.anno === risultati.anni)
    .map((d) => {
      const pRow = risultatiPess?.datiAnnuali.find((x) => x.anno === d.anno);
      const oRow = risultatiOtt?.datiAnnuali.find((x) => x.anno === d.anno);
      return { eta: d.eta, Realistico: d.fondoEspero, Pessimistico: pRow?.fondoEspero ?? 0, Ottimistico: oRow?.fondoEspero ?? 0, "TFR in INPS": d.tfrInps };
    });

  const datiGrafico = risultati.datiAnnuali
    .filter((d) => d.anno % 3 === 0 || d.anno === 1 || d.anno === risultati.anni)
    .map((d) => ({
      eta: d.eta,
      "Fondo Espero":      d.fondoEspero,
      "TFR in INPS":       d.tfrInps,
      "Contributi versati":d.contributiCumulativi,
      "Rendimento maturato":d.rendimentoAccumulato,
    }));

  const tabs = [
    { id: "crescita",     label: "📈 Crescita capitale" },
    { id: "confronto",    label: "⚖️ Confronto TFR" },
    { id: "scenari",      label: "🎯 Scenari rendimento" },
    { id: "composizione", label: "🧩 Composizione" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Outfit','Segoe UI',system-ui,sans-serif", color: t.text, transition: "background 0.4s, color 0.4s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=range] { -webkit-appearance: none; appearance: none; background: transparent; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${t.scrollTrack}; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 99px; }
        .tab-btn { background: none; border: none; cursor: pointer; transition: all 0.2s; }
        .tab-btn:hover { opacity: 0.8; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.35s ease forwards; }
        @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 20px #3b82f644; } 50% { box-shadow: 0 0 40px #3b82f688; } }
        .pulse { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background: t.headerBg, borderBottom: `1px solid ${t.headerBorder}`, padding: "1.2rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", transition: "background 0.4s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", boxShadow: "0 0 20px #3b82f644" }}>
            🏛️
          </div>
          <div>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: t.text, letterSpacing: "-0.02em" }}>
              Simulatore Fondo <span style={{ color: "#3b82f6" }}>Espero</span>
            </h1>
            <p style={{ fontSize: "0.75rem", color: t.textMuted, fontWeight: 500 }}>
              Fondo Pensione Complementare · Comparto Scuola
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ background: t.badgeBlueBg, border: `1px solid ${t.badgeBlueBorder}`, borderRadius: 8, padding: "0.3rem 0.8rem", fontSize: "0.75rem", color: t.badgeBlueText, fontWeight: 600 }}>
            Dati aggiornati 2025
          </span>
          <span style={{ background: t.badgeGreenBg, border: `1px solid ${t.badgeGreenBorder}`, borderRadius: 8, padding: "0.3rem 0.8rem", fontSize: "0.75rem", color: t.badgeGreenText, fontWeight: 600 }}>
            COVIP conforme
          </span>
          <ThemeToggle tema={tema} onToggle={() => setTema(tema === "dark" ? "light" : "dark")} t={t} />
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2rem 1.5rem", display: "grid", gridTemplateColumns: "360px 1fr", gap: "2rem" }}>

        {/* ── INPUT ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>

          <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 20, padding: "1.6rem", transition: "background 0.4s" }} className="fade-in">
            <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1.4rem" }}>👤 Profilo Lavoratore</h2>
            <SliderInput label="Età attuale"           value={etaAttuale}         min={20}    max={64}           step={1}   onChange={setEtaAttuale}          unit=" anni" tooltip="La tua età oggi"                                                           color="#3b82f6" t={t} />
            <SliderInput label="Età pensionamento"     value={etaPensionamento}   min={etaAttuale+1} max={72}    step={1}   onChange={setEtaPensionamento}    unit=" anni" tooltip="Età prevista di pensionamento (attuale: 67 anni)"                          color="#8b5cf6" t={t} />
            <SliderInput label="Stipendio lordo annuo" value={stipendioLordo}     min={18000} max={60000}        step={500} onChange={setStipendioLordo}      unit="€"     tooltip="Retribuzione lorda annua (incluse 13a e competenze accessorie)"             color="#10b981" t={t} />
            <SliderInput label="Crescita stipendio"    value={crescitaStipendio} min={0}     max={3}            step={0.1} onChange={setCrescitaStipendio}   unit="%"     tooltip="Stima incremento annuo (scatti, rinnovi contrattuali)"                      color="#f59e0b" t={t} />
          </div>

          <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 20, padding: "1.6rem", transition: "background 0.4s" }} className="fade-in">
            <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1.4rem" }}>💰 Contributi al Fondo</h2>
            <SliderInput label="Contributo lavoratore" value={percContributoLavoratore} min={1} max={10} step={0.1} onChange={setPercContributoLavoratore} unit="%" tooltip="Minimo obbligatorio 1%. Puoi versare di più per aumentare il capitale finale." color="#10b981" t={t} />
            <div style={{ background: t.infoBoxBg, border: `1px solid ${t.infoBoxBorder}`, borderRadius: 10, padding: "0.8rem", marginBottom: "1.2rem", fontSize: "0.78rem", color: t.infoBoxText }}>
              ✅ Il datore di lavoro aggiunge automaticamente <strong>1% + quota TFR</strong>
            </div>
            <SliderInput label="TFR annuo conferito" value={tfrAnnuo}   min={500} max={4000} step={100} onChange={setTfrAnnuo}   unit="€" tooltip="TFR maturato nell'anno (circa 6.91% della retribuzione lorda)" color="#f59e0b" t={t} />
            <SliderInput label="Inflazione stimata"  value={inflazione} min={0.5} max={4}    step={0.1} onChange={setInflazione} unit="%" tooltip="Incide sulla rivalutazione del TFR in INPS (formula: 1.5% + 75% inflazione)" color="#ef4444" t={t} />
          </div>

          <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 20, padding: "1.6rem", transition: "background 0.4s" }} className="fade-in">
            <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1.2rem" }}>📊 Comparto di Investimento</h2>
            {Object.entries(COMPARTI).map(([key, c]) => (
              <div key={key} onClick={() => setComparto(key)} style={{
                border: `1px solid ${comparto === key ? c.colore + "66" : t.cardBorder}`,
                borderRadius: 12, padding: "0.9rem 1rem", marginBottom: "0.7rem", cursor: "pointer",
                background: comparto === key ? c.colore + "12" : "transparent", transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: "0.8rem"
              }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.colore, flexShrink: 0, boxShadow: comparto === key ? `0 0 8px ${c.colore}` : "none" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.88rem", color: comparto === key ? c.colore : t.text }}>{c.label}</span>
                    {c.tfr && <span style={{ fontSize: "0.6rem", background: t.badgeGreenBg, color: t.badgeGreenText, border: `1px solid ${t.badgeGreenBorder}`, borderRadius: 4, padding: "0.1rem 0.4rem", fontWeight: 700 }}>TFR tacito</span>}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: t.textMuted, marginTop: "0.1rem" }}>{c.descrizione}</div>
                  {comparto === key && <div style={{ fontSize: "0.68rem", color: t.textLabel, marginTop: "0.3rem", fontStyle: "italic" }}>{c.composizione}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: c.colore }}>{c.rendimento}%</div>
                  <div style={{ fontSize: "0.65rem", color: t.textMuted }}>Rischio: {c.rischio}</div>
                  <div style={{ fontSize: "0.62rem", color: t.textLabel }}>{c.orizzonte}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 20, padding: "1.4rem", transition: "background 0.4s" }} className="fade-in">
            <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>🎲 Scenario Rendimento</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem" }}>
              {[
                { id: "pessimistico", label: "😟 Basso", color: "#ef4444" },
                { id: "realistico",   label: "😊 Medio", color: "#3b82f6" },
                { id: "ottimistico",  label: "🚀 Alto",  color: "#10b981" },
              ].map((s) => (
                <button key={s.id} onClick={() => setScenario(s.id)} className="tab-btn" style={{
                  border: `1px solid ${scenario === s.id ? s.color + "88" : t.cardBorder}`,
                  borderRadius: 10, padding: "0.6rem 0.3rem",
                  background: scenario === s.id ? s.color + "18" : "transparent",
                  color: scenario === s.id ? s.color : t.textMuted,
                  fontSize: "0.78rem", fontWeight: 700,
                }}>
                  {s.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: "0.72rem", color: t.textLabel, marginTop: "0.8rem", textAlign: "center" }}>
              Rendimento {scenario}: <strong style={{ color: comp.colore }}>
                {scenario === "pessimistico" ? comp.rendimentoPessimistico : scenario === "ottimistico" ? comp.rendimentoOttimistico : comp.rendimento}% annuo
              </strong>
            </p>
          </div>
        </div>

        {/* ── RISULTATI ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }} className="fade-in">
            <ResultCard label="Montante Fondo Espero"    value={fmt(risultati.montateFondoNetto)}         sublabel={`Netto imposte (${risultati.aliquotaFondo}%)`}           color="#3b82f6" icon="🏦" highlight t={t} />
            <ResultCard label="Pensione mensile stimata" value={fmt(risultati.pensioneMensile)+"/mese"}   sublabel="Rendita vitalizia integrativa"                            color="#10b981" icon="👴" highlight t={t} />
            <ResultCard label="Vantaggio vs TFR in INPS" value={fmt(risultati.vantaggioNettoFondo)}      sublabel={`TFR INPS: ${fmt(risultati.montateTFR_INPS)}`}            color="#f59e0b" icon="⚡" highlight t={t} />
            <ResultCard label="Risparmio fiscale IRPEF"  value={fmt(risultati.vantaggioFiscale)}         sublabel={`Contributi versati: ${fmt(risultati.contributiTotali)}`}  color="#8b5cf6" icon="🧾" highlight t={t} />
          </div>

          <div style={{ background: t.bannerBg, border: `1px solid ${t.bannerBorder}`, borderRadius: 16, padding: "1.2rem 1.6rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", transition: "background 0.4s" }} className="pulse">
            <div>
              <p style={{ fontSize: "0.75rem", color: t.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Durata accumulo</p>
              <p style={{ fontSize: "2rem", fontWeight: 900, color: "#93c5fd", lineHeight: 1 }}>{risultati.anni} anni</p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: t.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Rendimento totale generato</p>
              <p style={{ fontSize: "2rem", fontWeight: 900, color: "#34d399", lineHeight: 1 }}>{fmt(risultati.rendimentoGenerato)}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: t.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Pensione TFR INPS (confronto)</p>
              <p style={{ fontSize: "2rem", fontWeight: 900, color: "#fbbf24", lineHeight: 1 }}>{fmt(risultati.pensioneMensileTFR)}/mese</p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: t.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Comparto scelto</p>
              <p style={{ fontSize: "1.3rem", fontWeight: 800, color: comp.colore, lineHeight: 1 }}>{comp.label}</p>
            </div>
          </div>

          {/* Grafici */}
          <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 20, overflow: "hidden", transition: "background 0.4s" }} className="fade-in">
            <div style={{ display: "flex", borderBottom: `1px solid ${t.cardBorder}`, overflowX: "auto" }}>
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="tab-btn" style={{
                  padding: "1rem 1.2rem", fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap",
                  color: activeTab === tab.id ? t.text : t.tabText,
                  borderBottom: activeTab === tab.id ? "2px solid #3b82f6" : "2px solid transparent",
                  background: activeTab === tab.id ? t.tabActive : "transparent",
                }}>
                  {tab.label}
                </button>
              ))}
            </div>
            <div style={{ padding: "1.5rem" }}>

              {activeTab === "crescita" && (
                <div className="fade-in">
                  <p style={{ fontSize: "0.8rem", color: t.textMuted, marginBottom: "1rem" }}>
                    Crescita del capitale con interesse composto — {comp.rendimento}% annuo, scenario {scenario}
                  </p>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={datiGrafico}>
                      <defs>
                        <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} />
                      <XAxis dataKey="eta" stroke={t.axisStroke} tick={{ fontSize: 11, fill: t.axisStroke }} tickFormatter={(v) => `${v}a`} />
                      <YAxis stroke={t.axisStroke} tick={{ fontSize: 11, fill: t.axisStroke }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={mkTooltip} />
                      <Legend />
                      <Area type="monotone" dataKey="Contributi versati" stroke="#8b5cf6" fill="url(#gC)" strokeWidth={2} strokeDasharray="5 5" />
                      <Area type="monotone" dataKey="Fondo Espero"       stroke="#3b82f6" fill="url(#gF)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeTab === "confronto" && (
                <div className="fade-in">
                  <p style={{ fontSize: "0.8rem", color: t.textMuted, marginBottom: "1rem" }}>
                    Fondo Espero ({comp.rendimento}%) vs TFR rivalutato in INPS ({(TFR_RIVALUTAZIONE + inflazione * 0.75).toFixed(2)}%)
                  </p>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={datiGrafico}>
                      <defs>
                        <linearGradient id="gF2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} />
                      <XAxis dataKey="eta" stroke={t.axisStroke} tick={{ fontSize: 11, fill: t.axisStroke }} tickFormatter={(v) => `${v}a`} />
                      <YAxis stroke={t.axisStroke} tick={{ fontSize: 11, fill: t.axisStroke }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={mkTooltip} />
                      <Legend />
                      <Area type="monotone" dataKey="TFR in INPS"  stroke="#f59e0b" fill="url(#gT)"  strokeWidth={2} />
                      <Area type="monotone" dataKey="Fondo Espero" stroke="#3b82f6" fill="url(#gF2)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                    <div style={{ background: "#1e3a5f22", border: "1px solid #3b82f644", borderRadius: 12, padding: "1rem" }}>
                      <p style={{ fontSize: "0.75rem", color: "#93c5fd", fontWeight: 700, marginBottom: "0.3rem" }}>🏦 Fondo Espero (netto)</p>
                      <p style={{ fontSize: "1.4rem", fontWeight: 800, color: "#3b82f6" }}>{fmt(risultati.montateFondoNetto)}</p>
                      <p style={{ fontSize: "0.72rem", color: t.textMuted }}>{fmt(risultati.pensioneMensile)}/mese stimati</p>
                    </div>
                    <div style={{ background: "#78350f22", border: "1px solid #f59e0b44", borderRadius: 12, padding: "1rem" }}>
                      <p style={{ fontSize: "0.75rem", color: "#fbbf24", fontWeight: 700, marginBottom: "0.3rem" }}>🏛️ TFR in INPS</p>
                      <p style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f59e0b" }}>{fmt(risultati.montateTFR_INPS)}</p>
                      <p style={{ fontSize: "0.72rem", color: t.textMuted }}>{fmt(risultati.pensioneMensileTFR)}/mese stimati</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "scenari" && (
                <div className="fade-in">
                  <p style={{ fontSize: "0.8rem", color: t.textMuted, marginBottom: "1rem" }}>
                    Tre scenari di rendimento per il comparto <strong style={{ color: comp.colore }}>{comp.label}</strong>
                  </p>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={datiScenari}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} />
                      <XAxis dataKey="eta" stroke={t.axisStroke} tick={{ fontSize: 11, fill: t.axisStroke }} tickFormatter={(v) => `${v}a`} />
                      <YAxis stroke={t.axisStroke} tick={{ fontSize: 11, fill: t.axisStroke }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={mkTooltip} />
                      <Legend />
                      <Line type="monotone" dataKey="Ottimistico"  stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Realistico"   stroke="#3b82f6" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="Pessimistico" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="TFR in INPS"  stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="8 3" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.8rem", marginTop: "1rem" }}>
                    {[
                      { label: "🔴 Scenario basso", val: risultatiPess?.montateFondoNetto, color: "#ef4444", rend: comp.rendimentoPessimistico },
                      { label: "🔵 Scenario medio", val: risultati.montateFondoNetto,       color: "#3b82f6", rend: comp.rendimento },
                      { label: "🟢 Scenario alto",  val: risultatiOtt?.montateFondoNetto,  color: "#10b981", rend: comp.rendimentoOttimistico },
                    ].map((s) => (
                      <div key={s.label} style={{ background: s.color+"12", border: `1px solid ${s.color}33`, borderRadius: 10, padding: "0.8rem", textAlign: "center" }}>
                        <p style={{ fontSize: "0.72rem", color: t.textMuted, fontWeight: 600 }}>{s.label}</p>
                        <p style={{ fontSize: "1.15rem", fontWeight: 800, color: s.color }}>{fmt(s.val ?? 0)}</p>
                        <p style={{ fontSize: "0.7rem", color: t.textLabel }}>{s.rend}% annuo</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "composizione" && (
                <div className="fade-in">
                  <p style={{ fontSize: "0.8rem", color: t.textMuted, marginBottom: "1rem" }}>
                    Contributi versati vs rendimento generato dalla capitalizzazione composta
                  </p>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={datiGrafico}>
                      <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} />
                      <XAxis dataKey="eta" stroke={t.axisStroke} tick={{ fontSize: 11, fill: t.axisStroke }} tickFormatter={(v) => `${v}a`} />
                      <YAxis stroke={t.axisStroke} tick={{ fontSize: 11, fill: t.axisStroke }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={mkTooltip} />
                      <Legend />
                      <Bar dataKey="Contributi versati"  stackId="a" fill="#8b5cf6" radius={[0,0,4,4]} />
                      <Bar dataKey="Rendimento maturato" stackId="a" fill="#3b82f6" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Dettaglio fiscale */}
          <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 20, padding: "1.6rem", transition: "background 0.4s" }} className="fade-in">
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1.2rem" }}>
              🧾 Dettaglio Fiscale e Normativa
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
              {[
                { label: "Deducibilità IRPEF", val: `Fino a ${fmt(DEDUCIBILITA_MAX)}/anno`, sub: "D.Lgs. 252/2005",                           color: "#8b5cf6" },
                { label: "Tassazione finale",  val: `${risultati.aliquotaFondo}%`,           sub: `Ridotta per ${risultati.anni} anni (min 9%)`, color: "#10b981" },
                { label: "Contributo datore",  val: "1% garantito",                          sub: "Solo con adesione al fondo",                 color: "#3b82f6" },
                { label: "Contributi totali",  val: fmt(risultati.contributiTotali),         sub: "Lavoratore + Datore + TFR",                  color: "#f59e0b" },
                { label: "TFR conferito",      val: fmt(risultati.tfrTotale),                sub: "Totale versato al fondo",                    color: "#ef4444" },
                { label: "Rendimento netto",   val: fmt(risultati.rendimentoGenerato),       sub: "Capitalizzazione composta",                  color: "#34d399" },
              ].map((item) => (
                <div key={item.label} style={{ background: t.cardBg2, borderRadius: 10, padding: "0.9rem" }}>
                  <p style={{ fontSize: "0.7rem", color: t.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</p>
                  <p style={{ fontSize: "1.1rem", fontWeight: 800, color: item.color, margin: "0.2rem 0" }}>{item.val}</p>
                  <p style={{ fontSize: "0.7rem", color: t.textLabel }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ background: t.disclaimerBg, border: `1px solid ${t.disclaimerBorder}`, borderRadius: 12, padding: "1rem 1.4rem" }}>
            <p style={{ fontSize: "0.72rem", color: t.disclaimerText, lineHeight: 1.6 }}>
              ⚠️ <strong style={{ color: t.textMuted }}>Nota legale:</strong> Questa simulazione ha scopo esclusivamente informativo e non costituisce consulenza finanziaria o previdenziale. I rendimenti storici non garantiscono rendimenti futuri. Per decisioni di investimento rivolgiti a un consulente previdenziale abilitato o contatta direttamente il Fondo Espero. Dati basati su rendicontazione COVIP 2025.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
