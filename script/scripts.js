// === IMPORTS ===============================================================
import selecionaCotacao from "./imprimeCotacao.js";

// === HELPERS ===============================================================
function geraHorario() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function adicionarDados(chart, label, valor) {
  chart.data.labels.push(label);
  chart.data.datasets.forEach(ds => ds.data.push(valor));
  chart.update();
}

function criaLinhaChart(ctx, label) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label,
        data: [],
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,   // usa altura do container .grafico no CSS
      layout: {
        padding: { top: 4, right: 6, bottom: 12, left: 6 } // respiro interno
      },
      plugins: {
        legend: { display: true }
      },
      scales: {
        x: { ticks: { maxTicksLimit: 4, autoSkip: true } },
        y: { ticks: { maxTicksLimit: 5 } }
      }
    }
  });
}

// === CHARTS ================================================================
const elDolar = document.getElementById('graficoDolar');
const elIene  = document.getElementById('graficoIene');

const graficoParaDolar = criaLinhaChart(elDolar, 'Dólar');
const graficoParaIene  = criaLinhaChart(elIene,  'Iene');

// Recalcula no resize (reforço)
window.addEventListener('resize', () => {
  graficoParaDolar.resize();
  graficoParaIene.resize();
});

// === WEB WORKERS ===========================================================
const workerDolar = new Worker('./script/workers/workerDolar.js');
workerDolar.postMessage('usd');
workerDolar.addEventListener("message", (event) => {
  const tempo = geraHorario();
  const valor = event.data.ask;
  selecionaCotacao("dolar", valor);
  adicionarDados(graficoParaDolar, tempo, valor);
});

const workerIene = new Worker('./script/workers/workerIene.js');
workerIene.postMessage('iene');
workerIene.addEventListener("message", (event) => {
  const tempo = geraHorario();
  const valor = event.data.ask;
  adicionarDados(graficoParaIene, tempo, valor);
  selecionaCotacao("iene", valor);
});

// === SIDEBAR (Hambúrguer + Backdrop + ESC) ================================
const hamburger = document.getElementById('hamburger');
const sidebar   = document.querySelector('.sidebar');
const backdrop  = document.getElementById('backdrop');

function openSidebar() {
  sidebar.classList.add('active');
  backdrop.classList.add('active');
  document.body.classList.add('menu-open');   // anima o ícone (vira X)
}
function closeSidebar() {
  sidebar.classList.remove('active');
  backdrop.classList.remove('active');
  document.body.classList.remove('menu-open');
}
function toggleSidebar() {
  sidebar.classList.contains('active') ? closeSidebar() : openSidebar();
}

if (hamburger && sidebar && backdrop) {
  hamburger.addEventListener('click', toggleSidebar);
  backdrop.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });
} else {
  console.warn('Hamburger/Sidebar/Backdrop não encontrado(s). Confira o HTML/IDs.');
}
