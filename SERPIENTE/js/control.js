const elementos = {
    canvas: document.querySelector("#canvas"),
    puntaje: document.querySelector("#puntaje"),
    nivel: document.querySelector("#nivel"),
    tiempo: document.querySelector("#tiempo"),
    mensajes: document.querySelector("#mensajes"),
    iniciar: document.querySelector("#iniciar"),
    reiniciar: document.querySelector("#reiniciar"),
    pausar: document.querySelector("#pausar"),
    continuar: document.querySelector("#continuar"),
    guardar: document.querySelector("#guardar"),
    salir: document.querySelector("#salir"),
    arriba: document.querySelector("#arriba"),
    derecha: document.querySelector("#derecha"),
    abajo: document.querySelector("#abajo"),
    izquierda: document.querySelector("#izquierda")
};

const choque = new Audio("sonidos/choque.mp3");
const derrota = new Audio("sonidos/derrota.mp3");

let ancho = 15;
let altura = 15;
let serpiente = [2, 1, 0];
let direccion = 1;
let puntos = 0;
let nivel = 0;
let intervalo = 1000;
let intervaloJuego = null;
let tiempoInicio = null;
let jugando = false;
let pausado = false;
let ctx = null;
let filaManzana, columnaManzana;



function crearNotificacion(mensaje) {
    if (!elementos.mensajes) return;

    elementos.mensajes.innerText = mensaje;
    elementos.mensajes.style.display = "block"

    timeoutNotificacion = setTimeout(() => {
        elementos.mensajes.style.display = "none";
        elementos.mensajes.innerText = "";
    }, 2000);
};



function ajustarCanvas() {
    if (!elementos.canvas) return;
    const ajuste = elementos.canvas.getBoundingClientRect();
    const ratiopixeles = window.devicePixelRatio || 1;

    elementos.canvas.width = ajuste.width * ratiopixeles;
    elementos.canvas.height = ajuste.height * ratiopixeles;

    ctx = elementos.canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratiopixeles, ratiopixeles);
};


function asegurarContexto() {
    if (!ctx) {
        ctx = elementos.canvas.getContext("2d");
        if (!ctx) {
            alert("No se pudo obtener el contexto del canvas.");
        }
    }
}


function crearTablero() {
    asegurarContexto();

    let anchoCeldas = elementos.canvas.width / (window.devicePixelRatio * ancho);
    let alturaCeldas = elementos.canvas.height / (window.devicePixelRatio * altura);

    ctx.fillStyle = "#FFD600";
    ctx.fillRect(0, 0, elementos.canvas.width, elementos.canvas.height);

    ctx.strokeStyle = "#121212";
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let i = 0; i <= ancho; i++) {
        const x = i * anchoCeldas;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, elementos.canvas.height / window.devicePixelRatio);
    }

    for (let i = 0; i <= altura; i++) {
        const y = i * alturaCeldas;
        ctx.moveTo(0, y);
        ctx.lineTo(elementos.canvas.width / window.devicePixelRatio, y);
    }

    ctx.stroke();
};

function crearSerpiente() {
    asegurarContexto();

    const anchoCelda = elementos.canvas.width / (window.devicePixelRatio * ancho);
    const altoCelda = elementos.canvas.height / (window.devicePixelRatio * altura);

    ctx.fillStyle = "#4CAF50";

    for (let cuerpo of serpiente) {
        const fila = Math.floor(cuerpo / ancho);
        const columna = cuerpo % ancho;

        ctx.fillRect(
            columna * anchoCelda,
            fila * altoCelda,
            anchoCelda,
            altoCelda
        );
    }
};

function moverSerpiente() {
    const cabeza = serpiente[0];
    let nuevaCabeza;

    switch (direccion) {
        case 1: nuevaCabeza = cabeza + 1; break;
        case -1: nuevaCabeza = cabeza - 1; break;
        case ancho: nuevaCabeza = cabeza + ancho; break;
        case -ancho: nuevaCabeza = cabeza - ancho; break;
    }

    if (!verificarResultado(nuevaCabeza, direccion)) return false;

    serpiente.unshift(nuevaCabeza);
    comerManzana(nuevaCabeza);
    return true;
};


function crearManzana() {
    asegurarContexto();
    let posicionManzana;
    do {
        posicionManzana = Math.floor(Math.random() * (ancho * altura));
    } while (serpiente.includes(posicionManzana));

    filaManzana = Math.floor(posicionManzana / ancho);
    columnaManzana = posicionManzana % ancho;
}

function dibujarManzana() {
    asegurarContexto();
    if (!ctx) ctx = elementos.canvas.getContext("2d");
    const anchoCelda = elementos.canvas.width / (window.devicePixelRatio * ancho);
    const alturaCelda = elementos.canvas.height / (window.devicePixelRatio * altura);

    ctx.fillStyle = "#FF5252";
    ctx.fillRect(
        columnaManzana * anchoCelda,
        filaManzana * alturaCelda,
        anchoCelda,
        alturaCelda
    );
}

function comerManzana(nuevaCabeza) {
    const posicionManzana = filaManzana * ancho + columnaManzana;
    if (nuevaCabeza === posicionManzana) {
        puntos += 10;
        elementos.puntaje.innerText = puntos;
        crearNotificacion("¡Ñam! 🍎");
        crearManzana();
        if (puntos % 50 === 0) nuevoNivel();
    } else {
        serpiente.pop();
    }

    if (puntos > 0 && puntos % 50 === 0) {
        nuevoNivel();
    }
};

function nuevoNivel() {
    nivel++;
    elementos.nivel.innerText = nivel;
    intervalo = Math.max(100, intervalo * 0.8);
    clearInterval(intervaloJuego);
    intervaloJuego = setInterval(actualizarJuego, intervalo);
    crearNotificacion(`Nivel: ${nivel}!`);
};

function usarControles() {
    elementos.arriba.addEventListener("click", () => {
        if (direccion !== +ancho) direccion = -ancho;
    });
    elementos.abajo.addEventListener("click", () => {
        if (direccion !== -ancho) direccion = +ancho;
    });
    elementos.derecha.addEventListener("click", () => {
        if (direccion !== -1) direccion = 1;
    });
    elementos.izquierda.addEventListener("click", () => {
        if (direccion !== 1) direccion = -1;
    });

};

function usarBotones() {
    elementos.iniciar.addEventListener("click", iniciarJuego);
    elementos.reiniciar.addEventListener("click", reiniciarJuego);
    elementos.pausar.addEventListener("click", pausarJuego);
    elementos.continuar.addEventListener("click", continuarJuego);
    elementos.guardar.addEventListener("click", guardarJuego);
    elementos.salir.addEventListener("click", () => {
        window.location.href = "about:blank";
    });
};

function usarTeclas(e) {
    if (["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
    }

    switch (e.key) {
        case "ArrowRight":
            if (direccion !== -1) direccion = 1;
            break;
        case "ArrowUp":
            if (direccion !== +ancho) direccion = -ancho;
            break;
        case "ArrowLeft":
            if (direccion !== 1) direccion = -1;
            break;
        case "ArrowDown":
            if (direccion !== -ancho) direccion = +ancho;
            break;
    }
}

function pausarJuego() {
    if (jugando && !pausado) {
        clearInterval(intervaloJuego);
        pausado = true;
        crearNotificacion("PAUSADO!⏸️");
    }
};

function continuarJuego() {
    if (jugando && pausado) {
        intervaloJuego = setInterval(actualizarJuego, intervalo);
        pausado = false;
        crearNotificacion("CONTINÚA! ▶️");
    }
};

function reiniciarJuego() {
    clearInterval(intervaloJuego);
    puntos = 0;
    nivel = 0;
    direccion = 1;
    intervalo = 1000;
    serpiente = [2, 1, 0];
    tiempoInicio = Date.now();
    elementos.puntaje.innerText = puntos;
    elementos.nivel.innerText = nivel;
    jugando = true;
    pausado = false;
    crearManzana();
    intervaloJuego = setInterval(actualizarJuego, intervalo);
    crearNotificacion("JUEGO REINICIADO! 😊");
};

function iniciarJuego() {
    if (!jugando) {
        tiempoInicio = Date.now();
        jugando = true;
        pausado = false;
        crearManzana();
        intervaloJuego = setInterval(actualizarJuego, intervalo);
        crearNotificacion("JUEGO INICIADO! 😁");
    }
};

function guardarJuego() {
    const estado = {
        serpiente,
        direccion,
        puntos,
        nivel,
        filaManzana,
        columnaManzana,
        tiempo: Date.now() - tiempoInicio,
        intervalo,
        pausado,
        jugando
    };
    localStorage.setItem("partidaGuardada", JSON.stringify(estado));
    crearNotificacion("Juego guardado 💾");
};

function actualizarJuego() {
    if (!jugando || pausado) return;
    crearTablero();
    if (!moverSerpiente()) return;
    crearSerpiente();
    dibujarManzana();

    const tiempoTranscurrido = Date.now() - tiempoInicio;
    const minutos = Math.floor(tiempoTranscurrido / 60000);
    const segundos = Math.floor((tiempoTranscurrido % 60000) / 1000);
    elementos.tiempo.innerText = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
};

function cargarJuego() {
    const guardado = localStorage.getItem("partidaGuardada");
    if (!guardado) return;

    const estado = JSON.parse(guardado);
    if (!estado || !Array.isArray(estado.serpiente)) return;

    // Restaurar estado del juego
    serpiente = estado.serpiente;
    direccion = estado.direccion;
    puntos = estado.puntos;
    nivel = estado.nivel;
    filaManzana = estado.filaManzana;
    columnaManzana = estado.columnaManzana;
    tiempoInicio = Date.now() - estado.tiempo;
    intervalo = estado.intervalo;
    pausado = estado.pausado;
    jugando = estado.jugando;

    // Actualizar informacion
    elementos.puntaje.innerText = puntos;
    elementos.nivel.innerText = nivel;

    const minutos = Math.floor(estado.tiempo / 60000);
    const segundos = Math.floor((estado.tiempo % 60000) / 1000);
    elementos.tiempo.innerText = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;


    crearTablero();
    crearSerpiente();
    dibujarManzana();

    // Manejar estados de juego
    if (jugando) {
        if (pausado) {
            // Mostrar estado pausado sin iniciar intervalo
            elementos.mensajes.innerText = "PAUSADO!⏸️";
            elementos.mensajes.style.display = "block";
        } else {
            // Continuar juego automáticamente
            intervaloJuego = setInterval(actualizarJuego, intervalo);
        }
    } else {
        // Mostrar mensaje si la partida estaba terminada
        crearNotificacion("Partida cargada");
    }
};


function verificarResultado(nuevaCabeza, direccion) {
    // Verificar choque
    switch (direccion) {
        case 1: // derecha
            if (nuevaCabeza % ancho === 0) {
                choque.play();
                clearInterval(intervaloJuego);
                jugando = false;
                crearNotificacion("¡Chocaste con la pared! 😵‍💫");
                return false;
            }
            break;
        case -1: // izquierda
            if (nuevaCabeza % ancho === ancho - 1) {
                choque.play();
                clearInterval(intervaloJuego);
                jugando = false;
                crearNotificacion("¡Chocaste con la pared! 😵‍💫");
                return false;
            }
            break;
        case ancho: // abajo
            if (nuevaCabeza >= ancho * altura) {
                choque.play();
                clearInterval(intervaloJuego);
                jugando = false;
                crearNotificacion("¡Chocaste con la pared! 😵‍💫");
                return false;
            }
            break;
        case -ancho: // arriba
            if (nuevaCabeza < 0) {
                choque.play();
                clearInterval(intervaloJuego);
                jugando = false;
                crearNotificacion("¡Chocaste con la pared! 😵‍💫");
                return false;
            }
            break;
    }

    // Si se muerde a ella misma 
    if (serpiente.includes(nuevaCabeza)) {
        derrota.play();
        clearInterval(intervaloJuego);
        jugando = false;
        crearNotificacion("¡Te mordiste! 😥");
        return false;
    }
    return true;
}


function ejecutarJuego() {
    ajustarCanvas();
    crearTablero();
    crearSerpiente();
    usarControles();
    usarBotones();
    cargarJuego();
    window.addEventListener("keydown", usarTeclas);
};

window.addEventListener("resize", () => {
    ajustarCanvas();
    crearTablero();
    crearSerpiente();
    dibujarManzana();
});

window.onload = ejecutarJuego;