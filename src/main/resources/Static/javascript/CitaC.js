const API_URL = "http://localhost:8080/api/citas";

document.addEventListener("DOMContentLoaded", () => {
    inicializarSidebar();
    cargarDatosSelectores();
    cargarCitasRecientes();
    inicializarVistaPrevia();

    const formCita = document.getElementById("citaForm");
    if (formCita) {
        formCita.addEventListener("submit", guardarCita);
    }
});

async function cargarDatosSelectores() {
    try {
        // Cargar Usuarios
        const resUsuarios = await fetch("http://localhost:8080/api/usuarios");
        if (resUsuarios.ok) {
            const usuarios = await resUsuarios.json();
            const listaUsuarios = document.getElementById("listaUsuarios");
            const inputUsuario = document.getElementById("buscarUsuario");

            if (listaUsuarios) listaUsuarios.innerHTML = "";

            usuarios.forEach(u => {
                const option = document.createElement("option");
                option.value = u.nombreCompleto;
                option.dataset.id = u.idUsuario;
                listaUsuarios.appendChild(option);
            });

            if (inputUsuario && !inputUsuario.dataset.listenerAttached) {
                inputUsuario.dataset.listenerAttached = "true";
                inputUsuario.addEventListener("change", (e) => {
                    const val = e.target.value;
                    const options = listaUsuarios.options;
                    document.getElementById("idUsuarioFK").value = "";
                    for (let i = 0; i < options.length; i++) {
                        if (options[i].value === val) {
                            document.getElementById("idUsuarioFK").value = options[i].dataset.id;
                            break;
                        }
                    }
                    actualizarPreviewCliente(val);
                });
                inputUsuario.addEventListener("input", (e) => {
                    actualizarPreviewCliente(e.target.value);
                });
            }
        }

        // Cargar Servicios
        const resServicios = await fetch("http://localhost:8080/api/servicios");
        if (resServicios.ok) {
            const servicios = await resServicios.json();
            const listaServicios = document.getElementById("listaServicios");
            const inputServicio = document.getElementById("buscarServicio");
            const inputTotal = document.getElementById("totalServicio");

            if (listaServicios) listaServicios.innerHTML = "";

            servicios.forEach(s => {
                const option = document.createElement("option");
                option.value = s.nombreServicio;
                option.dataset.id = s.idServicio;
                option.dataset.precio = s.precioBase;
                listaServicios.appendChild(option);
            });

            if (inputServicio && !inputServicio.dataset.listenerAttached) {
                inputServicio.dataset.listenerAttached = "true";
                inputServicio.addEventListener("change", (e) => {
                    const val = e.target.value;
                    const options = listaServicios.options;
                    document.getElementById("idServicioFK").value = "";
                    for (let i = 0; i < options.length; i++) {
                        if (options[i].value === val) {
                            document.getElementById("idServicioFK").value = options[i].dataset.id;
                            if (inputTotal && options[i].dataset.precio) {
                                inputTotal.value = options[i].dataset.precio;
                            }
                            break;
                        }
                    }
                    actualizarPreviewServicio(val);
                });
                inputServicio.addEventListener("input", (e) => {
                    actualizarPreviewServicio(e.target.value);
                });
            }
        }

        // Cargar Insumos en el <select> tradicional
        const resInsumos = await fetch("http://localhost:8080/api/insumos");
        if (resInsumos.ok) {
            const insumos = await resInsumos.json();
            const selectInsumo = document.getElementById("idInsumoFK");

            if (selectInsumo) {
                selectInsumo.innerHTML = `<option value="">-- Seleccione un insumo (Opcional) --</option>`;
                insumos.forEach(ins => {
                    const option = document.createElement("option");
                    option.value = ins.idInsumo;
                    option.textContent = ins.nombreInsumo;
                    selectInsumo.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error("Error cargando los datos para los selectores:", error);
    }
}

// Lógica de Vista Previa en Tiempo Real
function inicializarVistaPrevia() {
    const inputFecha = document.getElementById("fecha");
    const inputHora = document.getElementById("horaInicio");
    const selectEstado = document.getElementById("estado");

    inputFecha?.addEventListener("input", actualizarPreviewHorario);
    inputHora?.addEventListener("input", actualizarPreviewHorario);
    selectEstado?.addEventListener("change", (e) => {
        const badge = document.getElementById("prevEstadoC");
        if (badge) {
            badge.textContent = e.target.value || "Pendiente";
            badge.className = `badge-rol ${e.target.value.toLowerCase()}`;
        }
    });
}

function actualizarPreviewCliente(nombre) {
    const el = document.getElementById("prevClienteC");
    if (el) el.textContent = nombre ? nombre : "Cliente No Seleccionado";
}

function actualizarPreviewServicio(nombre) {
    const el = document.getElementById("prevServicioC");
    if (el) el.textContent = `Servicio: ${nombre ? nombre : "-"}`;
}

function actualizarPreviewHorario() {
    const fecha = document.getElementById("fecha")?.value || "--/--";
    const hora = document.getElementById("horaInicio")?.value || "--:--";
    const el = document.getElementById("prevHorarioC");
    if (el) el.textContent = `Fecha/Hora: ${fecha} ${hora}`;
}

// Cargar Citas Recientes en el panel lateral derecho
async function cargarCitasRecientes() {
    const listaRecientes = document.getElementById("listaUltimasCitas");
    if (!listaRecientes) return;

    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            const citas = await response.json();
            listaRecientes.innerHTML = "";

            if (citas.length === 0) {
                listaRecientes.innerHTML = `<li class="sin-registros">No hay citas registradas.</li>`;
                return;
            }

            // Tomar las últimas 4 citas registradas
            const ultimas = citas.slice(-4).reverse();
            ultimas.forEach(c => {
                const li = document.createElement("li");
                li.innerHTML = `<span><strong>Fecha:</strong> ${c.fecha || '-'}</span> <span class="badge-mini">${c.estado || 'Pendiente'}</span>`;
                listaRecientes.appendChild(li);
            });
        }
    } catch (error) {
        console.error("Error al cargar citas recientes:", error);
        listaRecientes.innerHTML = `<li class="sin-registros">Error al cargar historial.</li>`;
    }
}

async function guardarCita(event) {
    event.preventDefault();

    const inputTotal = document.getElementById("totalServicio");
    let valorTotal = 0;
    if (inputTotal && inputTotal.value) {
        valorTotal = parseFloat(inputTotal.value);
    }

    const insumoVal = document.getElementById("idInsumoFK")?.value;

    const citaData = {
        fecha: document.getElementById("fecha")?.value || "",
        horaInicio: document.getElementById("horaInicio")?.value || "",
        horaFinal: document.getElementById("horaFinal")?.value || "",
        observacion: document.getElementById("observacion")?.value || "",
        totalServicio: isNaN(valorTotal) ? 0 : valorTotal,
        estado: document.getElementById("estado")?.value || "Pendiente",
        idUsuarioFK: document.getElementById("idUsuarioFK")?.value ? Number(document.getElementById("idUsuarioFK").value) : null,
        idServicioFK: document.getElementById("idServicioFK")?.value ? Number(document.getElementById("idServicioFK").value) : null,
        idInsumoFK: insumoVal ? Number(insumoVal) : null
    };

    if (!citaData.idUsuarioFK || !citaData.idServicioFK || !citaData.fecha || !citaData.horaInicio) {
        alert("Por favor completa los campos obligatorios: Cliente, Servicio, Fecha y Hora de Inicio.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(citaData)
        });

        if (response.ok) {
            alert("¡Cita registrada con éxito!");
            document.getElementById("citaForm").reset();
            // Resetear vista previa y recargar lista lateral
            actualizarPreviewCliente("");
            actualizarPreviewServicio("");
            actualizarPreviewHorario();
            cargarCitasRecientes();
        } else {
            const errorText = await response.text();
            alert("Error al registrar la cita: " + errorText);
        }
    } catch (error) {
        console.error("Error de red al guardar:", error);
        alert("Error de conexión al intentar guardar la cita.");
    }
}

function inicializarSidebar() {
    const menusItemsDropDown = document.querySelectorAll('.menu-item-dropdown');
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menu-btn');
    const sidebarBtn = document.getElementById('sidebar-btn');

    sidebarBtn?.addEventListener('click', () => document.body.classList.toggle('sidebar-hidden'));
    menuBtn?.addEventListener('click', () => sidebar?.classList.toggle('minimize'));

    menusItemsDropDown.forEach((menuItem) => {
        menuItem.addEventListener('click', () => {
            const subMenu = menuItem.querySelector('.sub-menu');
            const isActive = menuItem.classList.toggle('sub-menu-toggle');
            if (subMenu) {
                subMenu.style.height = isActive ? `${subMenu.scrollHeight + 20}px` : '0';
                subMenu.style.padding = isActive ? '0.2rem 0' : '0';
            }
        });
    });
}