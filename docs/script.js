// Número de WhatsApp del emprendimiento, en formato internacional:
// solo dígitos (sin +, espacios ni guiones). Es el ÚNICO lugar donde hay que
// cambiarlo: lo usan el carrito y el botón de contacto del footer.
const WHATSAPP_NUMERO = '5493794982013';

const enlaceFooterWhatsApp = document.querySelector('.btn-whatsapp');
if (enlaceFooterWhatsApp) enlaceFooterWhatsApp.href = `https://wa.me/${WHATSAPP_NUMERO}`;

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

/* ==========================================================
   SONIDOS DE RELAJACIÓN
   ========================================================== */
const botonesAudio = document.querySelectorAll('.audio-btn');
const sonidos = {};       // caché: { lluvia: <audio>, mar: <audio>, ... }
let sonidoActual = null;  // nombre del sonido que está sonando (o null)

// new Audio(...) empieza a descargar el archivo apenas se crea. Como cada uno
// pesa 3-6 MB, los creamos recién la primera vez que alguien lo pide.
function obtenerSonido(nombre) {
  if (!sonidos[nombre]) {
    const audio = new Audio(`assets/sonidos/${nombre}.mp3`);
    audio.loop = true; // al terminar vuelve a empezar solo
    sonidos[nombre] = audio;
  }
  return sonidos[nombre];
}

function apagarSonidoActual() {
  if (!sonidoActual) return;
  sonidos[sonidoActual].pause();
  sonidoActual = null;
  botonesAudio.forEach(b => {
    b.classList.remove('activo');
    b.setAttribute('aria-pressed', 'false');
  });
}

botonesAudio.forEach(boton => {
  boton.addEventListener('click', () => {
    const nombre = boton.dataset.sonido;
    const eraElMismo = sonidoActual === nombre;

    apagarSonidoActual();
    if (eraElMismo) return; // segundo click sobre el mismo botón = pausa

    // Marcamos el estado ANTES de esperar a que el audio arranque: así dos
    // clicks seguidos no pueden dejar dos sonidos sonando a la vez.
    sonidoActual = nombre;
    boton.classList.add('activo');
    boton.setAttribute('aria-pressed', 'true');

    // play() devuelve una promesa (undefined en navegadores muy viejos).
    // Si falla (archivo faltante, bloqueo del navegador), deshacemos el estado visual.
    const intento = obtenerSonido(nombre).play();
    if (intento !== undefined) {
      intento.catch(() => {
        if (sonidoActual === nombre) apagarSonidoActual();
      });
    }
  });
});


/* ==========================================================
   CARRITO DE COMPRAS
   El carrito es un objeto { "Nombre del producto": cantidad }.
   Al finalizar se arma un link de WhatsApp con el pedido.
   ========================================================== */
const CLAVE_CARRITO = 'nexo-carrito';
const MAX_CANTIDAD = 99;

const botonesComprar = document.querySelectorAll('.btn-comprar');
const botonCarrito = document.getElementById('cartFab');
const contadorCarrito = document.getElementById('cartCount');
const panelCarrito = document.getElementById('cartPanel');
const fondoCarrito = document.getElementById('cartBackdrop');
const botonCerrarCarrito = document.getElementById('cartClose');
const listaCarrito = document.getElementById('cartList');
const carritoVacio = document.getElementById('cartEmpty');
const botonVaciar = document.getElementById('cartClear');
const enlaceCompra = document.getElementById('cartCheckout');

// Nombres de los productos que de verdad existen en la página
const productosValidos = new Set([...botonesComprar].map(b => b.dataset.producto));

function cargarCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || {};
    const limpio = {};
    // Solo aceptamos lo que tenga sentido: así, si un producto se renombra o se
    // elimina del catálogo, no queda "fantasma" en el carrito de alguien.
    for (const [nombre, cantidad] of Object.entries(guardado)) {
      if (productosValidos.has(nombre) && Number.isInteger(cantidad) && cantidad > 0) {
        limpio[nombre] = Math.min(cantidad, MAX_CANTIDAD);
      }
    }
    return limpio;
  } catch (e) {
    return {};
  }
}

let carrito = cargarCarrito();

function guardarCarrito() {
  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  } catch (e) {
    // sin localStorage el carrito funciona igual, pero solo mientras la página está abierta
  }
}

function cambiarCantidad(nombre, delta) {
  const nueva = Math.min((carrito[nombre] || 0) + delta, MAX_CANTIDAD);
  if (nueva <= 0) delete carrito[nombre];
  else carrito[nombre] = nueva;
  renderizarCarrito();
}

function totalUnidades() {
  return Object.values(carrito).reduce((suma, cantidad) => suma + cantidad, 0);
}

// Mensaje de WhatsApp: una línea por producto
function construirMensaje() {
  const lineas = Object.entries(carrito).map(([nombre, cantidad]) => `${nombre} x ${cantidad}`);
  return ['Hola! Me gustaría realizar una compra de:', ...lineas, 'Muchas gracias'].join('\n');
}

// Crea una fila del panel. Usamos textContent (y no innerHTML) para que el
// nombre siempre se trate como texto y nunca como HTML.
function crearFilaCarrito(nombre, cantidad) {
  const fila = document.createElement('li');
  fila.className = 'cart-item';

  const nombreEl = document.createElement('span');
  nombreEl.className = 'cart-item__name';
  nombreEl.textContent = nombre;

  const cantidadEl = document.createElement('span');
  cantidadEl.className = 'cart-item__qty';
  cantidadEl.textContent = cantidad;

  // data-action y data-producto le dicen al "oyente" de la lista qué botón fue y de qué producto
  const crearBoton = (texto, accion, etiqueta) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cart-qty-btn';
    b.textContent = texto;
    b.dataset.action = accion;
    b.dataset.producto = nombre;
    b.setAttribute('aria-label', `${etiqueta}: ${nombre}`);
    return b;
  };

  const controles = document.createElement('div');
  controles.className = 'cart-item__controls';
  controles.append(
    crearBoton('−', 'menos', 'Quitar una unidad'),
    cantidadEl,
    crearBoton('+', 'mas', 'Agregar una unidad'),
    crearBoton('×', 'quitar', 'Eliminar del carrito')
  );

  fila.append(nombreEl, controles);
  return fila;
}

// Dibuja TODO el estado del carrito a partir del objeto "carrito".
// Se llama cada vez que algo cambia, así pantalla y datos nunca se desincronizan.
function renderizarCarrito() {
  const entradas = Object.entries(carrito);
  const total = totalUnidades();

  listaCarrito.replaceChildren(...entradas.map(([nombre, cantidad]) => crearFilaCarrito(nombre, cantidad)));
  carritoVacio.hidden = entradas.length > 0;
  botonVaciar.hidden = entradas.length === 0;

  contadorCarrito.textContent = total;
  contadorCarrito.hidden = total === 0;
  botonCarrito.setAttribute(
    'aria-label',
    total === 0 ? 'Abrir carrito' : `Abrir carrito (${total} ${total === 1 ? 'producto' : 'productos'})`
  );

  // El botón de compra es un <a> normal cuyo href se rearma en cada cambio.
  // Vacío: sin href (no es clickeable ni enfocable). Con productos: link a WhatsApp.
  if (total === 0) {
    enlaceCompra.removeAttribute('href');
    enlaceCompra.setAttribute('aria-disabled', 'true');
  } else {
    enlaceCompra.href = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(construirMensaje())}`;
    enlaceCompra.removeAttribute('aria-disabled');
  }

  guardarCarrito();
}

function animarContador() {
  contadorCarrito.classList.remove('bump');
  void contadorCarrito.offsetWidth; // forzar reflow para poder reiniciar la animación
  contadorCarrito.classList.add('bump');
}

function abrirCarrito() {
  panelCarrito.classList.add('abierto');
  fondoCarrito.classList.add('abierto');
  document.body.classList.add('cart-abierto'); // bloquea el scroll de la página de fondo
  botonCarrito.setAttribute('aria-expanded', 'true');
  botonCerrarCarrito.focus();
}

function cerrarCarrito() {
  panelCarrito.classList.remove('abierto');
  fondoCarrito.classList.remove('abierto');
  document.body.classList.remove('cart-abierto');
  botonCarrito.setAttribute('aria-expanded', 'false');
  botonCarrito.focus();
}

// Botones "Agregar al carrito" de cada producto
botonesComprar.forEach(boton => {
  const textoOriginal = boton.textContent;
  let timeoutFeedback; // cada botón guarda su propio temporizador (closure)

  boton.addEventListener('click', () => {
    cambiarCantidad(boton.dataset.producto, 1);
    animarContador();

    boton.textContent = '¡Agregado!';
    clearTimeout(timeoutFeedback);
    timeoutFeedback = setTimeout(() => { boton.textContent = textoOriginal; }, 1200);
  });
});

botonCarrito.addEventListener('click', abrirCarrito);
botonCerrarCarrito.addEventListener('click', cerrarCarrito);
fondoCarrito.addEventListener('click', cerrarCarrito);
botonVaciar.addEventListener('click', () => {
  carrito = {};
  renderizarCarrito();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && panelCarrito.classList.contains('abierto')) cerrarCarrito();
});

// DELEGACIÓN DE EVENTOS: las filas se crean y se destruyen todo el tiempo, así que
// en vez de ponerle un oyente a cada botón, ponemos UNO en la lista y preguntamos
// qué botón recibió el click (e.target.closest).
listaCarrito.addEventListener('click', e => {
  const boton = e.target.closest('button[data-action]');
  if (!boton) return;
  const { action, producto } = boton.dataset;

  if (action === 'mas') cambiarCantidad(producto, 1);
  if (action === 'menos') cambiarCantidad(producto, -1);
  if (action === 'quitar') {
    delete carrito[producto];
    renderizarCarrito();
  }

  // Al redibujar la lista se destruye el botón apretado; devolvemos el foco al
  // equivalente nuevo para que con teclado se pueda seguir apretando "+".
  const mismoBoton = [...listaCarrito.querySelectorAll('button')]
    .find(b => b.dataset.action === action && b.dataset.producto === producto);
  (mismoBoton || botonCerrarCarrito).focus();
});

renderizarCarrito(); // estado inicial (recupera lo guardado de visitas anteriores)
