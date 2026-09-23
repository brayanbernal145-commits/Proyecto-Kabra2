console.log("CitaA.js FUNCIONANDO");
const API_URL = "http://localhost:8080/api/citas";
const API_USUARIOS_URL = "http://localhost:8080/api/usuarios";
const API_SERVICIOS_URL = "http://localhost:8080/api/servicios";
const API_INSUMOS_URL = "http://localhost:8080/api/insumos";

const urlParams = new URLSearchParams(window.location.search);
const citaId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", async () => {
    if (!citaId) {
        alert("No se seleccionó ninguna cita para editar.");
        window.location.href = "listadoC.html";
        return;
    }

    await cargarDatosSelectores();

    configurarPredictivo("buscarUsuario", "listaClientes", "idUsuarioFK");
    configurarPredictivo("buscarServicio", "listaServicios", "idServicioFK");
    configurarPredictivo("buscarInsumo", "listaInsumos", "idInsumoFK");

    await cargarDatosCita(citaId);

    const formCita = document.getElementById("editarCitaForm");

    if (formCita) {
        formCita.addEventListener("submit", actualizarCita);
    }
});

async function cargarDatosSelectores() {
    try {
        const resUsuarios = await fetch(API_USUARIOS_URL);

        if (resUsuarios.ok) {
            const usuarios = await resUsuarios.json();
            const listaClientes = document.getElementById("listaClientes");

            if (listaClientes) {
                listaClientes.innerHTML = "";

                usuarios.forEach(usuario => {
                    const option = document.createElement("option");
                    option.value = usuario.nombreCompleto;
                    option.dataset.id = usuario.idUsuario;
                    listaClientes.appendChild(option);
                });
            }
        }

        const resServicios = await fetch(API_SERVICIOS_URL);

        if (resServicios.ok) {
            const servicios = await resServicios.json();
            const listaServicios = document.getElementById("listaServicios");

            if (listaServicios) {
                listaServicios.innerHTML = "";

                servicios.forEach(servicio => {
                    const option = document.createElement("option");
                    option.value = servicio.nombreServicio;
                    option.dataset.id = servicio.idServicio;
                    option.dataset.precio = servicio.precioBase;
                    listaServicios.appendChild(option);
                });
            }
        }

        const resInsumos = await fetch(API_INSUMOS_URL);

        if (resInsumos.ok) {
            const insumos = await resInsumos.json();
            const listaInsumos = document.getElementById("listaInsumos");

            if (listaInsumos) {
                listaInsumos.innerHTML = "";

                insumos.forEach(insumo => {
                    const option = document.createElement("option");
                    option.value = insumo.nombreInsumo;
                    option.dataset.id = insumo.idInsumo;
                    listaInsumos.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error("Error cargando los datos:", error);
    }
}

function configurarPredictivo(inputId, listId, hiddenId) {
    const inputElement = document.getElementById(inputId);
    const hiddenElement = document.getElementById(hiddenId);

    if (!inputElement || !hiddenElement) {
        return;
    }

    inputElement.addEventListener("input", function () {
        const opciones = document.querySelectorAll(`#${listId} option`);
        let encontrado = false;

        opciones.forEach(option => {
            if (option.value === inputElement.value) {
                hiddenElement.value = option.dataset.id;
                encontrado = true;
            }
        });

        if (!encontrado) {
            hiddenElement.value = "";
        }
    });
}

async function cargarDatosCita(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);

if (!response.ok) {
    throw new Error("No se pudo obtener la cita.");
}

const cita = await response.json();

console.log("Cita seleccionada:", cita);

document.getElementById("idCita").value = cita.idCita;
document.getElementById("fecha").value = cita.fecha || "";

document.getElementById("horaInicio").value =
    cita.horaInicio ? cita.horaInicio.substring(0, 5) : "";

document.getElementById("horaFinal").value =
    cita.horaFinal ? cita.horaFinal.substring(0, 5) : "";

document.getElementById("estado").value =
    cita.estado || "Pendiente";

document.getElementById("totalServicio").value =
    cita.totalServicio ?? 0;

document.getElementById("observacion").value =
    cita.observacion || "";

if (cita.idUsuarioFK) {
    document.getElementById("idUsuarioFK").value = cita.idUsuarioFK;

    const opcionesUsuarios =
        document.querySelectorAll("#listaClientes option");

    opcionesUsuarios.forEach(option => {
        if (Number(option.dataset.id) === Number(cita.idUsuarioFK)) {
            document.getElementById("buscarUsuario").value =
                option.value;
        }
    });
}

if (cita.idServicioFK) {
    document.getElementById("idServicioFK").value = cita.idServicioFK;

    const opcionesServicios =
        document.querySelectorAll("#listaServicios option");

    opcionesServicios.forEach(option => {
        if (Number(option.dataset.id) === Number(cita.idServicioFK)) {
            document.getElementById("buscarServicio").value =
                option.value;
        }
    });
}

if (cita.idInsumoFK) {
    document.getElementById("idInsumoFK").value = cita.idInsumoFK;

    const opcionesInsumos =
        document.querySelectorAll("#listaInsumos option");

    opcionesInsumos.forEach(option => {
        if (Number(option.dataset.id) === Number(cita.idInsumoFK)) {
            document.getElementById("buscarInsumo").value =
                option.value;
        }
    });
}
} catch (error) {
    console.error("Error al cargar la cita:", error);
    alert("No se pudieron cargar los datos de la cita.");
}
}

async function actualizarCita(event) {
    event.preventDefault();

    const horaInicio = document.getElementById("horaInicio").value;
    const horaFinal = document.getElementById("horaFinal").value;

    const citaData = {
        idCita: Number(citaId),
        fecha: document.getElementById("fecha").value,
        horaInicio: horaInicio.length === 5 ? horaInicio + ":00" : horaInicio,
        horaFinal: horaFinal.length === 5 ? horaFinal + ":00" : horaFinal,
        estado: document.getElementById("estado").value,
        totalServicio: Number(document.getElementById("totalServicio").value),
        observacion: document.getElementById("observacion").value.trim(),
        idUsuarioFK: Number(document.getElementById("idUsuarioFK").value),
        idServicioFK: Number(document.getElementById("idServicioFK").value),
        idInsumoFK: document.getElementById("idInsumoFK").value
            ? Number(document.getElementById("idInsumoFK").value)
            : null
    };

    console.log("Actualizando cita:", citaData);

    try {
        const response = await fetch(`${API_URL}/${citaId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(citaData)
        });

        if (response.ok) {
            alert("¡Cita actualizada con éxito!");
            window.location.href = "http://localhost:8080/citas";
        } else {
            const errorMsg = await response.text();
            alert("No se pudo actualizar la cita: " + errorMsg);
        }
    } catch (error) {
        console.error("Error en la petición PUT:", error);
        alert("Error de conexión al actualizar la cita.");
    }
}