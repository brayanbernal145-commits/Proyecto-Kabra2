const API_URL = "http://localhost:8080/api/citas";

document.addEventListener("DOMContentLoaded", () => {
    consultarCitas();
    inicializarSidebar();
});

// GET: Obtener citas y cruzar los nombres reales de la BD
async function consultarCitas() {
    const tbody = document.getElementById("tablaCitasBody");
    const infoTotal = document.getElementById("infoTotalCitas");

    if (!tbody) return;

    try {
        // Hacemos peticiones en paralelo para obtener las citas y los catálogos de nombres
        const [resCitas, resUsuarios, resServicios, resInsumos] = await Promise.all([
            fetch(API_URL),
            fetch("http://localhost:8080/api/usuarios"),
            fetch("http://localhost:8080/api/servicios"),
            fetch("http://localhost:8080/api/insumos")
        ]);

        const citas = await resCitas.json();
        const usuarios = await resUsuarios.json();
        const servicios = await resServicios.json();
        const insumos = await resInsumos.json();

        // Creamos diccionarios (mapas) para buscar rápido el nombre por ID
        const mapaUsuarios = {};
        usuarios.forEach(u => mapaUsuarios[u.idUsuario] = u.nombreCompleto);

        const mapaServicios = {};
        servicios.forEach(s => mapaServicios[s.idServicio] = s.nombreServicio);

        const mapaInsumos = {};
        insumos.forEach(i => mapaInsumos[i.idInsumo] = i.nombreInsumo);

        tbody.innerHTML = "";

        if (citas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="11" class="sin-datos">No hay citas registradas en la base de datos.</td>
                </tr>`;
            if (infoTotal) infoTotal.textContent = "Mostrando 0 citas";
            return;
        }

        if (infoTotal) {
            infoTotal.textContent = `Mostrando ${citas.length} citas registradas`;
        }

        // Construir filas con los nombres reales cruzados
        citas.forEach(cita => {
            const tr = document.createElement("tr");

            const nombreCliente = mapaUsuarios[cita.idUsuarioFK] || `Cliente ${cita.idUsuarioFK || ''}`;
            const nombreServicio = mapaServicios[cita.idServicioFK] || `Servicio ${cita.idServicioFK || ''}`;
            const nombreInsumo = cita.idInsumoFK ? (mapaInsumos[cita.idInsumoFK] || `Insumo ${cita.idInsumoFK}`) : 'Ninguno';

            tr.innerHTML = `
                <td>#${cita.idCita || cita.id || 'N/A'}</td>
                <td><strong>${nombreCliente}</strong></td>
                <td>${nombreServicio}</td>
                <td>${nombreInsumo}</td>
                <td>${cita.observacion || 'Sin observaciones'}</td>
                <td>${cita.fecha || '-'}</td>
                <td>${formatearHoraAMPM(cita.horaInicio)}</td>
                <td>${formatearHoraAMPM(cita.horaFinal)}</td>
                <td>$${Number(cita.totalServicio || 0).toLocaleString()}</td>
                <td><span class="badge ${String(cita.estado || 'pendiente').toLowerCase().replace(/\s+/g, '-')}">${cita.estado || 'Pendiente'}</span></td>
                <td>
                    <div class="acciones">
                        <a class="btn-accion editar" href="/citas/editar?id=${cita.idCita || cita.id}" title="Editar">
                            <i class='bx bx-edit'></i>
                        </a>
                        <button class="btn-accion eliminar" onclick="eliminarCita(${cita.idCita || cita.id})" title="Eliminar">
                            <i class='bx bx-trash'></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error al cargar las citas:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="sin-datos" style="color: red;">
                    Error al conectar con Spring Boot. Revisa la consola o activa el servidor.
                </td>
            </tr>`;
    }
}

// DELETE: Eliminar cita por ID
async function eliminarCita(id) {
    if (!confirm("¿Está seguro de que desea eliminar esta cita?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

        if (response.ok) {
            alert("Cita eliminada correctamente de la base de datos.");
            consultarCitas();
        } else {
            alert("No se pudo eliminar la cita.");
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error de conexión al eliminar la cita.");
    }
}

// Auxiliar: Formato 12 horas AM/PM
function formatearHoraAMPM(hora24) {
    if (!hora24) return "--:--";
    const partes = hora24.split(":");
    if (partes.length < 2) return hora24;
    let horas = parseInt(partes[0], 10);
    const m = partes[1];
    const sufijo = horas >= 12 ? "PM" : "AM";
    horas = horas % 12 || 12;
    return `${horas.toString().padStart(2, "0")}:${m} ${sufijo}`;
}

/* Menú Lateral */
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