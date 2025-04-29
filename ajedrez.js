// Constantes para las piezas de ajedrez
const PIEZAS = {
    REY_BLANCO: '♔',
    REINA_BLANCA: '♕',
    TORRE_BLANCA: '♖',
    ALFIL_BLANCO: '♗',
    CABALLO_BLANCO: '♘',
    PEON_BLANCO: '♙',
    REY_NEGRO: '♚',
    REINA_NEGRA: '♛',
    TORRE_NEGRA: '♜',
    ALFIL_NEGRO: '♝',
    CABALLO_NEGRO: '♞',
    PEON_NEGRO: '♟'
};

// Estado del juego
const estado = {
    tablero: Array(8).fill().map(() => Array(8).fill(null)),
    turnoBlancas: true,
    piezaSeleccionada: null,
    posicionSeleccionada: null,
    movimientosPosibles: [],
    historialMovimientos: [],
    capturasBlancas: [],
    capturasNegras: [],
    enroque: {
        reyBlancoMovido: false,
        reyNegroMovido: false,
        torreBlancoAMovida: false,
        torreBlancoHMovida: false,
        torreNegroAMovida: false,
        torreNegroHMovida: false
    },
    posicionReyes: {
        blanco: { fila: 7, columna: 4 },
        negro: { fila: 0, columna: 4 }
    },
    peonAlPaso: null
};

// Inicializar el tablero
function inicializarTablero() {
    // Limpiar el tablero
    estado.tablero = Array(8).fill().map(() => Array(8).fill(null));
    
    // Colocar las piezas negras
    estado.tablero[0][0] = PIEZAS.TORRE_NEGRA;
    estado.tablero[0][1] = PIEZAS.CABALLO_NEGRO;
    estado.tablero[0][2] = PIEZAS.ALFIL_NEGRO;
    estado.tablero[0][3] = PIEZAS.REINA_NEGRA;
    estado.tablero[0][4] = PIEZAS.REY_NEGRO;
    estado.tablero[0][5] = PIEZAS.ALFIL_NEGRO;
    estado.tablero[0][6] = PIEZAS.CABALLO_NEGRO;
    estado.tablero[0][7] = PIEZAS.TORRE_NEGRA;
    
    // Colocar peones negros
    for (let i = 0; i < 8; i++) {
        estado.tablero[1][i] = PIEZAS.PEON_NEGRO;
    }
    
    // Colocar las piezas blancas
    estado.tablero[7][0] = PIEZAS.TORRE_BLANCA;
    estado.tablero[7][1] = PIEZAS.CABALLO_BLANCO;
    estado.tablero[7][2] = PIEZAS.ALFIL_BLANCO;
    estado.tablero[7][3] = PIEZAS.REINA_BLANCA;
    estado.tablero[7][4] = PIEZAS.REY_BLANCO;
    estado.tablero[7][5] = PIEZAS.ALFIL_BLANCO;
    estado.tablero[7][6] = PIEZAS.CABALLO_BLANCO;
    estado.tablero[7][7] = PIEZAS.TORRE_BLANCA;
    
    // Colocar peones blancos
    for (let i = 0; i < 8; i++) {
        estado.tablero[6][i] = PIEZAS.PEON_BLANCO;
    }
    
    // Reiniciar estados
    estado.turnoBlancas = true;
    estado.piezaSeleccionada = null;
    estado.posicionSeleccionada = null;
    estado.movimientosPosibles = [];
    estado.historialMovimientos = [];
    estado.capturasBlancas = [];
    estado.capturasNegras = [];
    estado.enroque = {
        reyBlancoMovido: false,
        reyNegroMovido: false,
        torreBlancoAMovida: false,
        torreBlancoHMovida: false,
        torreNegroAMovida: false,
        torreNegroHMovida: false
    };
    estado.posicionReyes = {
        blanco: { fila: 7, columna: 4 },
        negro: { fila: 0, columna: 4 }
    };
    estado.peonAlPaso = null;
    
    actualizarInterfaz();
}

// Crear el tablero en el DOM
function crearTableroDOM() {
    const tableroElement = document.getElementById('tablero-ajedrez');
    tableroElement.innerHTML = '';
    
    for (let fila = 0; fila < 8; fila++) {
        for (let columna = 0; columna < 8; columna++) {
            const casilla = document.createElement('div');
            casilla.classList.add('casilla');
            
            // Asignar el color de la casilla
            if ((fila + columna) % 2 === 0) {
                casilla.classList.add('casilla-blanca');
            } else {
                casilla.classList.add('casilla-negra');
            }
            
            // Datos de la casilla
            casilla.dataset.fila = fila;
            casilla.dataset.columna = columna;
            
            // Evento de clic
            casilla.addEventListener('click', manejarClick);
            
            tableroElement.appendChild(casilla);
        }
    }
}

// Actualizar la interfaz del tablero
function actualizarInterfaz() {
    // Actualizar las piezas en el tablero
    const casillas = document.querySelectorAll('.casilla');
    casillas.forEach(casilla => {
        const fila = parseInt(casilla.dataset.fila);
        const columna = parseInt(casilla.dataset.columna);
        
        // Limpiar clases
        casilla.classList.remove('seleccionada', 'movimiento-posible', 'movimiento-captura');
        
        // Actualizar pieza
        casilla.textContent = estado.tablero[fila][columna] || '';
        
        // Marcar casilla seleccionada
        if (estado.posicionSeleccionada && 
            estado.posicionSeleccionada.fila === fila && 
            estado.posicionSeleccionada.columna === columna) {
            casilla.classList.add('seleccionada');
        }
        
        // Marcar movimientos posibles
        const esMovimientoPosible = estado.movimientosPosibles.some(
            mov => mov.fila === fila && mov.columna === columna
        );
        
        if (esMovimientoPosible) {
            if (estado.tablero[fila][columna]) {
                casilla.classList.add('movimiento-captura');
            } else {
                casilla.classList.add('movimiento-posible');
            }
        }
    });
    
    // Actualizar turno
    document.getElementById('turno').textContent = estado.turnoBlancas ? 'Blancas' : 'Negras';
    
    // Actualizar capturas
    actualizarCapturadas();
    
    // Actualizar historial
    actualizarHistorial();
}

// Actualizar el mostrado de piezas capturadas
function actualizarCapturadas() {
    const capturasBlancasElement = document.getElementById('capturadas-blancas');
    const capturasNegrasElement = document.getElementById('capturadas-negras');
    
    capturasBlancasElement.innerHTML = '';
    capturasNegrasElement.innerHTML = '';
    
    estado.capturasBlancas.forEach(pieza => {
        const piezaElement = document.createElement('span');
        piezaElement.classList.add('pieza-capturada');
        piezaElement.textContent = pieza;
        capturasBlancasElement.appendChild(piezaElement);
    });
    
    estado.capturasNegras.forEach(pieza => {
        const piezaElement = document.createElement('span');
        piezaElement.classList.add('pieza-capturada');
        piezaElement.textContent = pieza;
        capturasNegrasElement.appendChild(piezaElement);
    });
}

// Actualizar el historial de movimientos
function actualizarHistorial() {
    const historialElement = document.getElementById('historial-movimientos');
    historialElement.innerHTML = '';
    
    estado.historialMovimientos.forEach((movimiento, index) => {
        const movimientoElement = document.createElement('div');
        movimientoElement.classList.add('movimiento');
        
        const numeroElement = document.createElement('div');
        numeroElement.classList.add('movimiento-numero');
        numeroElement.textContent = Math.floor(index / 2) + 1 + '.';
        
        const detalleElement = document.createElement('div');
        detalleElement.classList.add('movimiento-detalle');
        detalleElement.textContent = movimiento;
        
        movimientoElement.appendChild(numeroElement);
        movimientoElement.appendChild(detalleElement);
        
        historialElement.appendChild(movimientoElement);
    });
    
    // Scroll al último movimiento
    historialElement.scrollTop = historialElement.scrollHeight;
}

// Manejar el clic en una casilla
function manejarClick(evento) {
    const fila = parseInt(evento.currentTarget.dataset.fila);
    const columna = parseInt(evento.currentTarget.dataset.columna);
    const pieza = estado.tablero[fila][columna];
    
    // Si hay una pieza seleccionada y se hace clic en un movimiento posible
    if (estado.piezaSeleccionada && 
        estado.movimientosPosibles.some(mov => mov.fila === fila && mov.columna === columna)) {
        realizarMovimiento(fila, columna);
        return;
    }
    
    // Deseleccionar si se hace clic de nuevo en la misma pieza
    if (estado.posicionSeleccionada && 
        estado.posicionSeleccionada.fila === fila && 
        estado.posicionSeleccionada.columna === columna) {
        desseleccionarPieza();
        return;
    }
    
    // Verificar si es el turno correcto y hay una pieza en la casilla
    if (pieza) {
        const esBlanca = esPiezaBlanca(pieza);
        if ((estado.turnoBlancas && esBlanca) || (!estado.turnoBlancas && !esBlanca)) {
            seleccionarPieza(fila, columna, pieza);
        }
    }
}

// Seleccionar una pieza
function seleccionarPieza(fila, columna, pieza) {
    estado.piezaSeleccionada = pieza;
    estado.posicionSeleccionada = { fila, columna };
    estado.movimientosPosibles = calcularMovimientosPosibles(fila, columna, pieza);
    actualizarInterfaz();
}

// Deseleccionar pieza
function desseleccionarPieza() {
    estado.piezaSeleccionada = null;
    estado.posicionSeleccionada = null;
    estado.movimientosPosibles = [];
    actualizarInterfaz();
}

// Realizar un movimiento
function realizarMovimiento(nuevaFila, nuevaColumna) {
    const { fila, columna } = estado.posicionSeleccionada;
    const pieza = estado.piezaSeleccionada;
    const piezaDestino = estado.tablero[nuevaFila][nuevaColumna];
    
    // Guardar información para notación de movimiento
    const esCaptura = piezaDestino !== null || (esPeon(pieza) && columna !== nuevaColumna && !piezaDestino);
    const columnaOrigen = columnaALetra(columna);
    const filaOrigen = 8 - fila;
    const columnaDestino = columnaALetra(nuevaColumna);
    const filaDestino = 8 - nuevaFila;
    
    // Verificar si es captura y guardar la pieza capturada
    if (piezaDestino) {
        if (estado.turnoBlancas) {
            estado.capturasBlancas.push(piezaDestino);
        } else {
            estado.capturasNegras.push(piezaDestino);
        }
    }
    
    // Verificar si es captura al paso
    if (esPeon(pieza) && columna !== nuevaColumna && !piezaDestino) {
        const filaPeonCapturado = estado.turnoBlancas ? nuevaFila + 1 : nuevaFila - 1;
        // Capturar el peón que está siendo capturado al paso
        const peonCapturado = estado.tablero[filaPeonCapturado][nuevaColumna];
        estado.tablero[filaPeonCapturado][nuevaColumna] = null;
        
        if (estado.turnoBlancas) {
            estado.capturasBlancas.push(peonCapturado);
        } else {
            estado.capturasNegras.push(peonCapturado);
        }
    }
    
    // Mover la pieza en el tablero
    estado.tablero[fila][columna] = null;
    estado.tablero[nuevaFila][nuevaColumna] = pieza;
    
    // Actualizar posición del rey si se mueve
    if (esRey(pieza)) {
        if (esPiezaBlanca(pieza)) {
            estado.posicionReyes.blanco = { fila: nuevaFila, columna: nuevaColumna };
            estado.enroque.reyBlancoMovido = true;
        } else {
            estado.posicionReyes.negro = { fila: nuevaFila, columna: nuevaColumna };
            estado.enroque.reyNegroMovido = true;
        }
        
        // Verificar enroque
        if (Math.abs(columna - nuevaColumna) === 2) {
            // Enroque corto (hacia la derecha)
            if (nuevaColumna > columna) {
                const torreColumna = 7;
                const nuevaTorreColumna = 5;
                const torre = estado.tablero[nuevaFila][torreColumna];
                estado.tablero[nuevaFila][torreColumna] = null;
                estado.tablero[nuevaFila][nuevaTorreColumna] = torre;
            } 
            // Enroque largo (hacia la izquierda)
            else {
                const torreColumna = 0;
                const nuevaTorreColumna = 3;
                const torre = estado.tablero[nuevaFila][torreColumna];
                estado.tablero[nuevaFila][torreColumna] = null;
                estado.tablero[nuevaFila][nuevaTorreColumna] = torre;
            }
        }
    }
    
    // Actualizar estado de torres para enroque
    if (esTorre(pieza)) {
        if (fila === 7 && columna === 0) {
            estado.enroque.torreBlancoAMovida = true;
        } else if (fila === 7 && columna === 7) {
            estado.enroque.torreBlancoHMovida = true;
        } else if (fila === 0 && columna === 0) {
            estado.enroque.torreNegroAMovida = true;
        } else if (fila === 0 && columna === 7) {
            estado.enroque.torreNegroHMovida = true;
        }
    }
    
    // Verificar si peón está en posición de promoción
    if (esPeon(pieza) && (nuevaFila === 0 || nuevaFila === 7)) {
        mostrarDialogoPromocion(nuevaFila, nuevaColumna);
    }
    
    // Verificar avance de peón dos casillas para captura al paso
    if (esPeon(pieza) && Math.abs(fila - nuevaFila) === 2) {
        estado.peonAlPaso = {
            fila: estado.turnoBlancas ? nuevaFila + 1 : nuevaFila - 1,
            columna: nuevaColumna,
            turno: estado.historialMovimientos.length
        };
    } else {
        estado.peonAlPaso = null;
    }
    
    // Crear notación del movimiento
    let notacion = '';
    
    // Enroque
    if (esRey(pieza) && Math.abs(columna - nuevaColumna) === 2) {
        if (nuevaColumna > columna) {
            notacion = 'O-O'; // Enroque corto
        } else {
            notacion = 'O-O-O'; // Enroque largo
        }
    } else {
        // Notación para piezas normales
        if (!esPeon(pieza)) {
            notacion += simboloAPiezaNotacion(pieza);
            
            // Si es una captura
            if (esCaptura) {
                notacion += 'x';
            }
        } 
        // Notación para peones
        else {
            if (esCaptura) {
                notacion += columnaOrigen + 'x';
            }
        }
        
        notacion += columnaDestino + filaDestino;
    }
    
    // Añadir al historial
    estado.historialMovimientos.push(notacion);
    
    // Cambiar turno
    estado.turnoBlancas = !estado.turnoBlancas;
    
    // Deseleccionar pieza
    desseleccionarPieza();
}

// Mostrar diálogo de promoción de peón
function mostrarDialogoPromocion(fila, columna) {
    const piezas = estado.turnoBlancas ? 
        [PIEZAS.REINA_BLANCA, PIEZAS.TORRE_BLANCA, PIEZAS.ALFIL_BLANCO, PIEZAS.CABALLO_BLANCO] :
        [PIEZAS.REINA_NEGRA, PIEZAS.TORRE_NEGRA, PIEZAS.ALFIL_NEGRO, PIEZAS.CABALLO_NEGRO];
    
    // Crear el overlay para el modal
    const overlay = document.createElement('div');
    overlay.classList.add('promocion-overlay');
    
    // Crear el modal
    const modal = document.createElement('div');
    modal.classList.add('promocion-modal');
    
    const titulo = document.createElement('h3');
    titulo.textContent = 'Elige una pieza para la promoción';
    modal.appendChild(titulo);
    
    const opciones = document.createElement('div');
    opciones.classList.add('opciones-promocion');
    
    piezas.forEach(pieza => {
        const opcion = document.createElement('div');
        opcion.classList.add('opcion-promocion');
        opcion.textContent = pieza;
        opcion.addEventListener('click', () => {
            estado.tablero[fila][columna] = pieza;
            document.body.removeChild(overlay);
            actualizarInterfaz();
        });
        opciones.appendChild(opcion);
    });
    
    modal.appendChild(opciones);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// Calcular los movimientos posibles para una pieza
function calcularMovimientosPosibles(fila, columna, pieza) {
    let movimientos = [];
    
    // Peón
    if (esPeon(pieza)) {
        movimientos = calcularMovimientosPeon(fila, columna, pieza);
    }
    // Caballo
    else if (esCaballo(pieza)) {
        movimientos = calcularMovimientosCaballo(fila, columna, pieza);
    }
    // Alfil
    else if (esAlfil(pieza)) {
        movimientos = calcularMovimientosAlfil(fila, columna, pieza);
    }
    // Torre
    else if (esTorre(pieza)) {
        movimientos = calcularMovimientosTorre(fila, columna, pieza);
    }
    // Reina
    else if (esReina(pieza)) {
        movimientos = calcularMovimientosReina(fila, columna, pieza);
    }
    // Rey
    else if (esRey(pieza)) {
        movimientos = calcularMovimientosRey(fila, columna, pieza);
    }
    
    return movimientos;
}

// Calcular movimientos para el peón
function calcularMovimientosPeon(fila, columna, pieza) {
    const movimientos = [];
    const direccion = esPiezaBlanca(pieza) ? -1 : 1;
    const filaInicial = esPiezaBlanca(pieza) ? 6 : 1;
    
    // Movimiento hacia adelante (1 casilla)
    if (dentroDelTablero(fila + direccion, columna) && 
        !estado.tablero[fila + direccion][columna]) {
        movimientos.push({ fila: fila + direccion, columna });
        
        // Movimiento hacia adelante (2 casillas) desde posición inicial
        if (fila === filaInicial && 
            !estado.tablero[fila + 2 * direccion][columna]) {
            movimientos.push({ fila: fila + 2 * direccion, columna });
        }
    }
    
    // Capturas diagonales
    for (let i = -1; i <= 1; i += 2) {
        if (dentroDelTablero(fila + direccion, columna + i)) {
            const piezaDestino = estado.tablero[fila + direccion][columna + i];
            
            // Hay una pieza enemiga que capturar
            if (piezaDestino && esPiezaBlanca(piezaDestino) !== esPiezaBlanca(pieza)) {
                movimientos.push({ fila: fila + direccion, columna: columna + i });
            }
            
            // Captura al paso
            else if (!piezaDestino && 
                     estado.peonAlPaso && 
                     estado.peonAlPaso.fila === fila + direccion && 
                     estado.peonAlPaso.columna === columna + i &&
                     estado.peonAlPaso.turno === estado.historialMovimientos.length - 1) {
                movimientos.push({ fila: fila + direccion, columna: columna + i });
            }
        }
    }
    
    return movimientos;
}

// Calcular movimientos para el caballo
function calcularMovimientosCaballo(fila, columna, pieza) {
    const movimientos = [];
    const saltos = [
        { fila: -2, columna: -1 }, { fila: -2, columna: 1 },
        { fila: -1, columna: -2 }, { fila: -1, columna: 2 },
        { fila: 1, columna: -2 }, { fila: 1, columna: 2 },
        { fila: 2, columna: -1 }, { fila: 2, columna: 1 }
    ];
    
    for (const salto of saltos) {
        const nuevaFila = fila + salto.fila;
        const nuevaColumna = columna + salto.columna;
        
        if (dentroDelTablero(nuevaFila, nuevaColumna)) {
            const piezaDestino = estado.tablero[nuevaFila][nuevaColumna];
            
            // La casilla está vacía o tiene una pieza enemiga
            if (!piezaDestino || esPiezaBlanca(piezaDestino) !== esPiezaBlanca(pieza)) {
                movimientos.push({ fila: nuevaFila, columna: nuevaColumna });
            }
        }
    }
    
    return movimientos;
}

// Calcular movimientos para el alfil
function calcularMovimientosAlfil(fila, columna, pieza) {
    const movimientos = [];
    const direcciones = [
        { fila: -1, columna: -1 }, // Diagonal superior izquierda
        { fila: -1, columna: 1 },  // Diagonal superior derecha
        { fila: 1, columna: -1 },  // Diagonal inferior izquierda
        { fila: 1, columna: 1 }    // Diagonal inferior derecha
    ];
    
    for (const direccion of direcciones) {
        let nuevaFila = fila + direccion.fila;
        let nuevaColumna = columna + direccion.columna;
        
        while (dentroDelTablero(nuevaFila, nuevaColumna)) {
            const piezaDestino = estado.tablero[nuevaFila][nuevaColumna];
            
            if (!piezaDestino) {
                // Casilla vacía
                movimientos.push({ fila: nuevaFila, columna: nuevaColumna });
            } else {
                // Hay una pieza
                if (esPiezaBlanca(piezaDestino) !== esPiezaBlanca(pieza)) {
                    // Es una pieza enemiga, se puede capturar
                    movimientos.push({ fila: nuevaFila, columna: nuevaColumna });
                }
                break; // No se puede seguir avanzando en esta dirección
            }
            
            nuevaFila += direccion.fila;
            nuevaColumna += direccion.columna;
        }
    }
    
    return movimientos;
}

// Calcular movimientos para la torre
function calcularMovimientosTorre(fila, columna, pieza) {
    const movimientos = [];
    const direcciones = [
        { fila: -1, columna: 0 }, // Arriba
        { fila: 1, columna: 0 },  // Abajo
        { fila: 0, columna: -1 }, // Izquierda
        { fila: 0, columna: 1 }   // Derecha
    ];
    
    for (const direccion of direcciones) {
        let nuevaFila = fila + direccion.fila;
        let nuevaColumna = columna + direccion.columna;
        
        while (dentroDelTablero(nuevaFila, nuevaColumna)) {
            const piezaDestino = estado.tablero[nuevaFila][nuevaColumna];
            
            if (!piezaDestino) {
                // Casilla vacía
                movimientos.push({ fila: nuevaFila, columna: nuevaColumna });
            } else {
                // Hay una pieza
                if (esPiezaBlanca(piezaDestino) !== esPiezaBlanca(pieza)) {
                    // Es una pieza enemiga, se puede capturar
                    movimientos.push({ fila: nuevaFila, columna: nuevaColumna });
                }
                break; // No se puede seguir avanzando en esta dirección
            }
            
            nuevaFila += direccion.fila;
            nuevaColumna += direccion.columna;
        }
    }
    
    return movimientos;
}

// Calcular movimientos para la reina (combinación de alfil y torre)
function calcularMovimientosReina(fila, columna, pieza) {
    return [
        ...calcularMovimientosAlfil(fila, columna, pieza),
        ...calcularMovimientosTorre(fila, columna, pieza)
    ];
}

// Calcular movimientos para el rey
function calcularMovimientosRey(fila, columna, pieza) {
    const movimientos = [];
    const direcciones = [
        { fila: -1, columna: -1 }, // Diagonal superior izquierda
        { fila: -1, columna: 0 },  // Arriba
        { fila: -1, columna: 1 },  // Diagonal superior derecha
        { fila: 0, columna: -1 },  // Izquierda
        { fila: 0, columna: 1 },   // Derecha
        { fila: 1, columna: -1 },  // Diagonal inferior izquierda
        { fila: 1, columna: 0 },   // Abajo
        { fila: 1, columna: 1 }    // Diagonal inferior derecha
    ];
    
    for (const direccion of direcciones) {
        const nuevaFila = fila + direccion.fila;
        const nuevaColumna = columna + direccion.columna;
        
        if (dentroDelTablero(nuevaFila, nuevaColumna)) {
            const piezaDestino = estado.tablero[nuevaFila][nuevaColumna];
            
            if (!piezaDestino || esPiezaBlanca(piezaDestino) !== esPiezaBlanca(pieza)) {
                movimientos.push({ fila: nuevaFila, columna: nuevaColumna });
            }
        }
    }
    
    // Verificar enroque corto
    if (esPiezaBlanca(pieza)) {
        if (!estado.enroque.reyBlancoMovido && !estado.enroque.torreBlancoHMovida) {
            if (!estado.tablero[7][5] && !estado.tablero[7][6]) {
                movimientos.push({ fila: 7, columna: 6 });
            }
        }
    } else {
        if (!estado.enroque.reyNegroMovido && !estado.enroque.torreNegroHMovida) {
            if (!estado.tablero[0][5] && !estado.tablero[0][6]) {
                movimientos.push({ fila: 0, columna: 6 });
            }
        }
    }
    
    // Verificar enroque largo
    if (esPiezaBlanca(pieza)) {
        if (!estado.enroque.reyBlancoMovido && !estado.enroque.torreBlancoAMovida) {
            if (!estado.tablero[7][1] && !estado.tablero[7][2] && !estado.tablero[7][3]) {
                movimientos.push({ fila: 7, columna: 2 });
            }
        }
    } else {
        if (!estado.enroque.reyNegroMovido && !estado.enroque.torreNegroAMovida) {
            if (!estado.tablero[0][1] && !estado.tablero[0][2] && !estado.tablero[0][3]) {
                movimientos.push({ fila: 0, columna: 2 });
            }
        }
    }
    
    return movimientos;
}

// Funciones de utilidad
function dentroDelTablero(fila, columna) {
    return fila >= 0 && fila < 8 && columna >= 0 && columna < 8;
}

function esPiezaBlanca(pieza) {
    return pieza.charCodeAt(0) < 9818; // Código Unicode para separar piezas blancas y negras
}

function esPeon(pieza) {
    return pieza === PIEZAS.PEON_BLANCO || pieza === PIEZAS.PEON_NEGRO;
}

function esCaballo(pieza) {
    return pieza === PIEZAS.CABALLO_BLANCO || pieza === PIEZAS.CABALLO_NEGRO;
}

function esAlfil(pieza) {
    return pieza === PIEZAS.ALFIL_BLANCO || pieza === PIEZAS.ALFIL_NEGRO;
}

function esTorre(pieza) {
    return pieza === PIEZAS.TORRE_BLANCA || pieza === PIEZAS.TORRE_NEGRA;
}

function esReina(pieza) {
    return pieza === PIEZAS.REINA_BLANCA || pieza === PIEZAS.REINA_NEGRA;
}

function esRey(pieza) {
    return pieza === PIEZAS.REY_BLANCO || pieza === PIEZAS.REY_NEGRO;
}

function columnaALetra(columna) {
    return String.fromCharCode(97 + columna);
}

function simboloAPiezaNotacion(pieza) {
    if (esCaballo(pieza)) return 'C';
    if (esAlfil(pieza)) return 'A';
    if (esTorre(pieza)) return 'T';
    if (esReina(pieza)) return 'D';
    if (esRey(pieza)) return 'R';
    return '';
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    crearTableroDOM();
    inicializarTablero();
    
    // Botón de reinicio
    document.getElementById('reset-btn').addEventListener('click', inicializarTablero);
});