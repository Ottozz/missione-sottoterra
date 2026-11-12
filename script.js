/* =========================================================
   PERSONALIZZA QUI 👇
   ========================================================= */
const CONFIG = {
  nomeAmico: "Il Dottore",     // es. "Marco"
  titoloAmico: "Dottore",      // es. "Dott. Marco" o "Ingegnere"
  tuoNome: "io",               // es. "Andrea"
  secondiMomentoSerio: 15,     // quanto dura il messaggio serio prima di "autodistruggersi"
};

/* ---------- Inserisce i nomi ---------- */
document.querySelectorAll("[data-campo]").forEach((el) => {
  const valore = CONFIG[el.dataset.campo];
  if (valore) el.textContent = valore;
});

/* ---------- Intro al buio con la frontale ---------- */
const buio = document.getElementById("buio");
document.body.classList.add("al-buio");
let haToccato = false;

function puntaLuce(x, y) {
  buio.style.setProperty("--x", x + "px");
  buio.style.setProperty("--y", y + "px");
}

buio.addEventListener("pointermove", (e) => {
  haToccato = true;
  puntaLuce(e.clientX, e.clientY);
});
buio.addEventListener("touchmove", (e) => {
  haToccato = true;
  const t = e.touches[0];
  puntaLuce(t.clientX, t.clientY);
}, { passive: true });

// Se nessuno tocca niente, la luce vaga da sola (come una guida un po' distratta)
let t0 = performance.now();
function vaga(now) {
  if (buio.classList.contains("spento")) return;
  if (!haToccato) {
    const s = (now - t0) / 1000;
    const x = window.innerWidth * (0.5 + 0.28 * Math.sin(s * 0.9));
    const y = window.innerHeight * (0.45 + 0.18 * Math.sin(s * 1.7));
    puntaLuce(x, y);
  }
  requestAnimationFrame(vaga);
}
requestAnimationFrame(vaga);

document.getElementById("accendi").addEventListener("click", () => {
  buio.classList.add("spento");
  buio.setAttribute("aria-hidden", "true");
  document.body.classList.remove("al-buio");
  setTimeout(() => buio.remove(), 1000);
});

/* ---------- Sezioni che appaiono allo scroll ---------- */
const osservatore = new IntersectionObserver((voci) => {
  voci.forEach((v) => {
    if (v.isIntersecting) {
      v.target.classList.add("visibile");
      osservatore.unobserve(v.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".sezione").forEach((s) => osservatore.observe(s));

/* ---------- Checklist ---------- */
const checkbox = document.querySelectorAll("#checklist input");
const esito = document.getElementById("checklistEsito");
checkbox.forEach((c) => c.addEventListener("change", () => {
  const tutte = [...checkbox].every((x) => x.checked);
  esito.hidden = !tutte;
  if (tutte) coriandoli(60);
}));

/* ---------- Momento serio (con autodistruzione) ---------- */
const btnSerio = document.getElementById("btnSerio");
const boxSerio = document.getElementById("serio");
const fineSerio = document.getElementById("serioFine");
const timerEl = document.getElementById("timer");
let intervallo;

function mostraSerio() {
  btnSerio.hidden = true;
  fineSerio.hidden = true;
  boxSerio.hidden = false;
  boxSerio.classList.remove("esplode");
  let rimasti = CONFIG.secondiMomentoSerio;
  timerEl.textContent = rimasti;
  clearInterval(intervallo);
  intervallo = setInterval(() => {
    rimasti--;
    timerEl.textContent = rimasti;
    if (rimasti <= 0) {
      clearInterval(intervallo);
      boxSerio.classList.add("esplode");
      setTimeout(() => {
        boxSerio.hidden = true;
        fineSerio.hidden = false;
      }, 600);
    }
  }, 1000);
}
btnSerio.addEventListener("click", mostraSerio);
document.getElementById("btnRiguarda").addEventListener("click", mostraSerio);

/* ---------- Il bottone "No" che scappa ---------- */
const btnNo = document.getElementById("no");
const scuse = [
  "No, ho paura del buio",
  "Sicuro sicuro?",
  "Dai, non fare così",
  "Non puoi rifiutare",
  "Ci hai provato",
  "Il NO non è un'opzione",
  "Rinuncia, Dottore",
];
let tentativi = 0;

function scappa(e) {
  e.preventDefault();
  tentativi++;
  btnNo.textContent = scuse[Math.min(tentativi, scuse.length - 1)];
  const area = document.getElementById("scelta").getBoundingClientRect();
  const maxX = Math.max(0, area.width / 2 - btnNo.offsetWidth / 2);
  const maxY = 60;
  const dx = (Math.random() * 2 - 1) * maxX;
  const dy = (Math.random() * 2 - 1) * maxY;
  const scala = Math.max(0.45, 1 - tentativi * 0.08);
  btnNo.style.transform = `translate(${dx}px, ${dy}px) scale(${scala})`;
  if (tentativi >= 8) {
    btnNo.style.transform = "scale(0)";
    setTimeout(() => (btnNo.hidden = true), 250);
  }
}
btnNo.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") scappa(e); });
btnNo.addEventListener("click", scappa);

document.getElementById("si").addEventListener("click", () => {
  document.getElementById("scelta").hidden = true;
  document.getElementById("accettato").hidden = false;
  coriandoli(220);
});

/* ---------- Coriandoli (versione speleo: sassolini e lucine) ---------- */
const canvas = document.getElementById("coriandoli");
const ctx = canvas.getContext("2d");
let pezzi = [];
let animando = false;
const colori = ["#ffb340", "#ece4d6", "#c9781a", "#8fd18b", "#a89a85", "#ffd88a"];

function ridimensiona() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener("resize", ridimensiona);
ridimensiona();

function coriandoli(n) {
  const w = window.innerWidth;
  for (let i = 0; i < n; i++) {
    pezzi.push({
      x: w / 2 + (Math.random() - 0.5) * w * 0.3,
      y: window.innerHeight * 0.6,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 16 - 6,
      r: Math.random() * 5 + 3,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: colori[(Math.random() * colori.length) | 0],
      vita: 0,
    });
  }
  if (!animando) { animando = true; requestAnimationFrame(disegna); }
}

function disegna() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pezzi.forEach((p) => {
    p.vy += 0.42;
    p.vx *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.vita++;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.c;
    ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
    ctx.restore();
  });
  pezzi = pezzi.filter((p) => p.y < window.innerHeight + 40 && p.vita < 400);
  if (pezzi.length) requestAnimationFrame(disegna);
  else { animando = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
}
