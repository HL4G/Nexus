const navButtons = document.querySelectorAll('.nav-btn');
navButtons.forEach(boton => {
  boton.addEventListener('click', () => {
    document.getElementById(boton.dataset.target)?.scrollIntoView({ behavior: 'smooth' });
  });
});

const secciones = document.querySelectorAll('.section');
const observador = new IntersectionObserver(entradas => {
  entradas.forEach(entrada => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add('visible');
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.15 });
secciones.forEach(sec => observador.observe(sec));

const botonIniciar = document.getElementById('breathingStart');
const overlay = document.getElementById('breathingOverlay');
const botonCerrar = document.getElementById('breathingClose');
const anilloProgreso = document.getElementById('timerRingProgress');
const overlayFase = document.getElementById('overlayFase');
const overlayTiempo = document.getElementById('overlayTiempo');
const contenedorParticulas = document.getElementById('particles');
const veloBlanco = document.getElementById('whiteCover');

const fases = [
  { texto: 'Inhalá', duracionMs: 4000 },
  { texto: 'Mantené', duracionMs: 7000 },
  { texto: 'Exhalá', duracionMs: 8000 },
];

const CIRCUNFERENCIA = 2 * Math.PI * 54;
if (anilloProgreso) anilloProgreso.style.strokeDasharray = CIRCUNFERENCIA;

let cicloActivo = false;
let intervaloCuentaRegresiva;
let timeoutFase; 

function iniciarAnilloTimer(duracionMs) {
  if (!anilloProgreso) return;
  anilloProgreso.style.transition = 'none';
  anilloProgreso.style.strokeDashoffset = '0';
  anilloProgreso.getBoundingClientRect(); 
  anilloProgreso.style.transition = `stroke-dashoffset ${duracionMs}ms linear`;
  anilloProgreso.style.strokeDashoffset = CIRCUNFERENCIA;
}

function correrFase(indice) {
  if (!cicloActivo) return;

  const fase = fases[indice];
  if (overlayFase) overlayFase.textContent = fase.texto;
  iniciarAnilloTimer(fase.duracionMs);

  let restante = fase.duracionMs / 1000;
  if (overlayTiempo) overlayTiempo.textContent = restante;

  clearInterval(intervaloCuentaRegresiva);
  intervaloCuentaRegresiva = setInterval(() => {
    restante -= 1;
    if (restante >= 0 && overlayTiempo) overlayTiempo.textContent = restante;
  }, 1000);

  clearTimeout(timeoutFase);
  timeoutFase = setTimeout(() => {
    correrFase((indice + 1) % fases.length);
  }, fase.duracionMs);
}

if (botonIniciar) {
  botonIniciar.addEventListener('click', () => {
    cicloActivo = true;
    if (overlay) overlay.hidden = false;
    correrFase(0);
  });
}

function cerrarConParticulas() {
  cicloActivo = false;
  clearInterval(intervaloCuentaRegresiva);
  clearTimeout(timeoutFase); 

  if (contenedorParticulas) {
    for (let i = 0; i < 45; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.setProperty('--x', `${Math.random() * 100}%`);
      p.style.setProperty('--tam', `${8 + Math.random() * 18}px`);
      p.style.setProperty('--duracion', `${1 + Math.random() * 0.8}s`);
      p.style.setProperty('--retraso', `${Math.random() * 0.5}s`);
      contenedorParticulas.appendChild(p);
    }
  }

  if (veloBlanco) {
    setTimeout(() => veloBlanco.classList.add('cubrir'), 700);
    setTimeout(() => {
      document.getElementById('inicio')?.scrollIntoView({ behavior: 'auto' });
      if (overlay) overlay.hidden = true;
      veloBlanco.classList.remove('cubrir');
      if (contenedorParticulas) contenedorParticulas.innerHTML = '';
    }, 2000);
  }
}

if (botonCerrar) botonCerrar.addEventListener('click', cerrarConParticulas);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && overlay && !overlay.hidden) cerrarConParticulas();
});

const areaDiario = document.getElementById('diarioTexto');
const estadoDiario = document.getElementById('diarioEstado');
let timeoutEstado;

if (areaDiario) {
  try {
    const textoGuardado = localStorage.getItem('nexo-diario');
    if (textoGuardado) areaDiario.value = textoGuardado;

    areaDiario.addEventListener('input', () => {
      localStorage.setItem('nexo-diario', areaDiario.value);
      if (estadoDiario) estadoDiario.textContent = 'Guardado automático...';
      
      clearTimeout(timeoutEstado);
      timeoutEstado = setTimeout(() => {
        if (estadoDiario) estadoDiario.textContent = '';
      }, 1500);
    });
  } catch(e) {
    console.warn("localStorage no disponible en este entorno");
  }
}

const botonesAudio = document.querySelectorAll('.audio-btn');
botonesAudio.forEach(boton => {
  boton.addEventListener('click', () => {
    const activo = boton.classList.contains('activo');
    botonesAudio.forEach(b => b.classList.remove('activo'));
    if (!activo) boton.classList.add('activo');
  });
});