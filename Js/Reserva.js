document.addEventListener("DOMContentLoaded", function () {
    // Configurar eventos usando optional chaining
    document.getElementById("btnCerrar")?.addEventListener('click', () => Alerta(true));
    document.getElementById("btnRegistrar")?.addEventListener('click', ReservaRegistrar);
    document.getElementById("btnCancelar")?.addEventListener('click', Cancelar);
    document.getElementById("btnActualizar")?.addEventListener('click', ReservaActualizar);
    document.getElementById("btnEliminar")?.addEventListener('click', ReservaEliminar);
    document.getElementById("btnRegresar")?.addEventListener('click', () => window.location.href = "../index.html");
    document.getElementById("btnRegresarUno")?.addEventListener('click', () => window.location.href = "../index.html");
    document.getElementById("btnActualizarUno")?.addEventListener('click', () => {
        ReservaListar();
        Alerta(false, "IconoExito.png", "Lista actualizada");
    });

    // Inicializar si existe el botón registrar (indica que estamos en la página de reservas)
    const btnRegistrar = document.getElementById("btnRegistrar");
    if (btnRegistrar) {
        OcultarControl(true, true, true, true, true, true);
        OcultarBoton(false, true, false, false);
        OcultaTabla(false);
    }

    // Inicializar alerta
    Alerta(true);

    ReservaListar();
    ReservaBuscar();
    ActualizarContador();
});

// Variable para permitir seleccionar fila
let PermitirSeleccionarFila = true;

// Función para ocultar/habilitar controles
function OcultarControl(nombreCompleto, telefono, email, fechaReserva, hora, numeroPersona) {
    const estados = [nombreCompleto, telefono, email, fechaReserva, hora, numeroPersona];
    const ids = ["txtNombreCompleto", "txtTelefono", "txtEmail", "txtFechaReserva", "txtHora", "txtNumeroPersona"];

    ids.forEach((id, index) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.disabled = estados[index];
    });
}

// Función para ocultar/habilitar botones
function OcultarBoton(registrar, cancelar, actualizar, eliminar) {
    const estados = [registrar, cancelar, actualizar, eliminar];
    const ids = ["btnRegistrar", "btnCancelar", "btnActualizar", "btnEliminar"];

    ids.forEach((id, index) => {
        const boton = document.getElementById(id);
        if (boton) boton.disabled = estados[index];
    });
}

// Función para ocultar tablas
function OcultaTabla(ocultar) {
    const tabla = document.querySelector(".pTablaReserva");
    tabla?.classList.toggle("Ocultar", ocultar);
}

// Función para alertas
function Alerta(ocultar, icono = "", mensaje = "") {
    const alerta = document.querySelector(".alerta-uno");
    if (!alerta) return;

    alerta.classList.toggle("Ocultar", ocultar);

    if (!ocultar) {
        const imgIcono = document.getElementById("imgIcono");
        const pMensaje = document.getElementById("pMensaje");
        if (imgIcono) imgIcono.src = `../Imagen/Icono/${icono}`;
        if (pMensaje) pMensaje.innerText = mensaje;
    }
}

// Función para seleccionar fila
function SeleccionarFila(fila) {
    if (!PermitirSeleccionarFila) return;

    const yaSeleccionada = fila.classList.contains("SeleccionarFila");

    // Limpiar selección previa
    document.querySelectorAll("#tblReserva tbody tr.SeleccionarFila")
        .forEach(f => f.classList.remove("SeleccionarFila"));

    if (yaSeleccionada) {
        LimpiarCampo();
        delete document.getElementById("btnActualizar")?.dataset.index;
        return;
    }

    // Seleccionar nueva fila
    fila.classList.add("SeleccionarFila");

    // Cargar datos en los campos
    const campos = ["txtNombreCompleto", "txtTelefono", "txtEmail", "txtFechaReserva", "txtHora", "txtNumeroPersona"];
    campos.forEach((id, index) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.value = fila.cells[index].innerText;
    });

    // Calcular índice real
    const reservas = JSON.parse(localStorage.getItem('ReservasRestantes')) || [];
    const indiceFila = fila.rowIndex - 1;
    const indiceReal = reservas.length - 1 - indiceFila;

    const btnActualizar = document.getElementById("btnActualizar");
    if (btnActualizar) btnActualizar.dataset.index = indiceReal;
}

// Función para limpiar campos
function LimpiarCampo() {
    const campos = ["txtNombreCompleto", "txtTelefono", "txtEmail", "txtFechaReserva", "txtHora", "txtNumeroPersona"];
    campos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.value = "";
    });

    document.querySelectorAll("#tblReserva tbody tr.SeleccionarFila")
        .forEach(fila => fila.classList.remove("SeleccionarFila"));
}

// Función para validar campos
function ValidarCampo(datos) {
    // Validar nombre
    if (!datos.NombreCompleto) return "Ingresa un Nombre Completo";
    if (datos.NombreCompleto.trim().length < 3) return "El Nombre Completo debe tener mínimo 3 caracteres";

    // Validar teléfono
    if (!datos.Telefono) return "Ingresa un Teléfono";
    if (!/^[\d\s\-\(\)\+]+$/.test(datos.Telefono)) {
        return "El Teléfono solo debe contener números y símbolos válidos (+, -, (), espacios)";
    }
    const soloNumeros = datos.Telefono.replace(/\D/g, '');
    if (soloNumeros.length < 7) return "El Teléfono debe tener al menos 7 dígitos";

    // Validar email
    if (!datos.Email) return "Ingresa un Email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.Email)) {
        return "Ingresa un Email válido (ejemplo: usuario@dominio.com)";
    }

    // Validar fecha
    if (!datos.FechaReserva) return "Ingresa una Fecha de Reserva";
    const fechaReserva = new Date(datos.FechaReserva + "T00:00:00");
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);
    if (fechaReserva < fechaActual) return "La Fecha de Reserva no puede ser anterior a hoy";

    // Validar hora
    if (!datos.Hora) return "Ingresa la Hora";
    const [horas, minutos] = datos.Hora.split(':').map(Number);
    const horaEnMinutos = horas * 60 + minutos;
    if (horaEnMinutos < 720 || horaEnMinutos > 1350) {
        return "La Hora debe estar entre 12:00 y 22:30";
    }

    // Validar número de personas
    if (!datos.NumeroPersona) return "Ingresa el Número de Personas";
    const numeroPersonas = parseInt(datos.NumeroPersona);
    if (isNaN(numeroPersonas) || numeroPersonas < 1 || numeroPersonas > 12) {
        return "El Número de Personas debe estar entre 1 y 12";
    }

    return true;
}

// Función para obtener datos del formulario
function ObtenerDatosFormulario() {
    return {
        NombreCompleto: document.getElementById("txtNombreCompleto")?.value || "",
        Telefono: document.getElementById("txtTelefono")?.value || "",
        Email: document.getElementById("txtEmail")?.value || "",
        FechaReserva: document.getElementById("txtFechaReserva")?.value || "",
        Hora: document.getElementById("txtHora")?.value || "",
        NumeroPersona: document.getElementById("txtNumeroPersona")?.value || ""
    };
}

// Función para registrar reserva
async function ReservaRegistrar() {
    try {
        const btnRegistrar = document.getElementById("btnRegistrar");
        if (!btnRegistrar) return;

        const textoBoton = btnRegistrar.innerText;

        if (textoBoton === "REGISTRAR") {
            LimpiarCampo();
            btnRegistrar.innerHTML = "<img src='../Imagen/Icono/IconoAgregar.png'>GUARDAR";
            OcultarControl(false, false, false, false, false, false);
            OcultarBoton(false, false, true, true);
            PermitirSeleccionarFila = false;
            return;
        }

        if (textoBoton === "GUARDAR") {
            const datos = ObtenerDatosFormulario();
            const validacion = ValidarCampo(datos);

            if (validacion !== true) {
                Alerta(false, "IconoAdvertencia.png", validacion);
                return;
            }

            const reservas = JSON.parse(localStorage.getItem('ReservasRestantes')) || [];
            reservas.push(datos);
            localStorage.setItem('ReservasRestantes', JSON.stringify(reservas));

            Alerta(false, "IconoExito.png", "Reserva Registrada");
            btnRegistrar.innerHTML = "<img src='../Imagen/Icono/IconoAgregar.png'>REGISTRAR";
            ReservaListar();
            ActualizarContador();
            Cancelar();
        }
    } catch (e) {
        Alerta(false, "IconoError.png", "ERROR: Revisar consola");
        console.error(e);
    }
}

// Función para cancelar
function Cancelar() {
    document.querySelectorAll("#tblReserva tbody tr.SeleccionarFila")
        .forEach(fila => fila.classList.remove("SeleccionarFila"));

    document.getElementById("btnRegistrar").innerHTML = "<img src='../Imagen/Icono/IconoAgregar.png'>REGISTRAR";
    document.getElementById("btnActualizar").innerHTML = "<img src='../Imagen/Icono/IconoActualizar.png'>ACTUALIZAR";

    LimpiarCampo();
    PermitirSeleccionarFila = true;
    OcultarControl(true, true, true, true, true, true);
    OcultarBoton(false, true, false, false);
    OcultaTabla(false);
}

// Función para actualizar reserva
async function ReservaActualizar() {
    try {
        const btnActualizar = document.getElementById("btnActualizar");

        const filaSeleccionada = document.querySelector("#tblReserva tbody tr.SeleccionarFila");
        if (!filaSeleccionada && btnActualizar.innerText === "ACTUALIZAR") {
            Alerta(false, "IconoAdvertencia.png", "SELECCIONA UNA FILA");
            return;
        }

        const textoBoton = btnActualizar.innerText;

        if (textoBoton === "ACTUALIZAR") {
            btnActualizar.innerHTML = "<img src='../Imagen/Icono/IconoActualizarUsuario.png'>GUARDAR";
            OcultarControl(false, false, false, false, false, false);
            OcultarBoton(true, false, false, true);
            PermitirSeleccionarFila = false;
            return;
        }

        if (textoBoton === "GUARDAR") {
            const datos = ObtenerDatosFormulario();
            const validacion = ValidarCampo(datos);

            if (validacion !== true) {
                Alerta(false, "IconoAdvertencia.png", validacion);
                return;
            }

            const index = parseInt(btnActualizar.dataset.index);
            const reservas = JSON.parse(localStorage.getItem('ReservasRestantes')) || [];
            reservas[index] = datos;
            localStorage.setItem('ReservasRestantes', JSON.stringify(reservas));

            Alerta(false, "IconoExito.png", "Reserva actualizada exitosamente");
            Cancelar();
            ReservaListar();
            ActualizarContador();
        }
    } catch (e) {
        Alerta(false, "IconoError.png", "ERROR: Revisar consola");
        console.error(e);
    }
}

// Función para eliminar reserva
async function ReservaEliminar() {
    try {
        const filaSeleccionada = document.querySelector("#tblReserva tbody tr.SeleccionarFila");
        if (!filaSeleccionada) {
            Alerta(false, "IconoAdvertencia.png", "SELECCIONA UNA FILA");
            return;
        }

        if (!confirm("¿Estás seguro de eliminar esta reserva?")) return;

        const btnActualizar = document.getElementById("btnActualizar");
        const index = parseInt(btnActualizar?.dataset.index);
        const reservas = JSON.parse(localStorage.getItem('ReservasRestantes')) || [];
        reservas.splice(index, 1);
        localStorage.setItem('ReservasRestantes', JSON.stringify(reservas));

        Alerta(false, "IconoExito.png", "Reserva eliminada exitosamente");
        Cancelar();
        ReservaListar();
        ActualizarContador();
    } catch (e) {
        Alerta(false, "IconoError.png", "ERROR: Revisar consola");
        console.error(e);
    }
}

// Función para buscar reserva
function ReservaBuscar() {
    const buscar = document.getElementById("txtBuscarReserva");
    if (!buscar) return;

    buscar.addEventListener("input", function () {
        const filtro = this.value.trim().toLowerCase();
        const filas = document.querySelectorAll("#tblReserva tbody tr");

        filas.forEach(fila => {
            const textoFila = fila.textContent.toLowerCase();
            fila.style.display = textoFila.includes(filtro) ? "" : "none";
        });
    });
}

// Función para actualizar contador
function ActualizarContador() {
    const spanTotal = document.getElementById("spanTotal");
    if (!spanTotal) return;

    const reservas = JSON.parse(localStorage.getItem('ReservasRestantes')) || [];
    spanTotal.innerText = reservas.length;
}

// Función para listar reservas
async function ReservaListar() {
    try {
        const reservas = JSON.parse(localStorage.getItem('ReservasRestantes')) || [];
        const tbody = document.querySelector("#tblReserva tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (reservas.length === 0) {
            const fila = tbody.insertRow();
            const celda = fila.insertCell();
            celda.colSpan = 6;
            celda.style.textAlign = "center";
            celda.innerText = "No hay reservas registradas";
            return;
        }

        // Mostrar reservas en orden inverso
        for (let i = reservas.length - 1; i >= 0; i--) {
            const fila = tbody.insertRow();
            fila.onclick = function () { SeleccionarFila(this); };

            const campos = ["NombreCompleto", "Telefono", "Email", "FechaReserva", "Hora", "NumeroPersona"];
            campos.forEach(campo => {
                fila.insertCell().innerText = reservas[i][campo];
            });
        }

        ActualizarContador();
    } catch (e) {
        Alerta(false, "IconoError.png", "ERROR: Revisar consola");
        console.error(e);
    }
}