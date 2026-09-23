// -------------------------------------------------------------
// 1. CONTROL DE SIDEBAR Y NAVEGACIÓN
// -------------------------------------------------------------
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menu-btn');
const sidebarBtn = document.getElementById('sidebar-btn');

sidebarBtn?.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-hidden');
    sidebar?.classList.toggle('active');
});

menuBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('minimize');
    sidebar?.classList.remove('active');
});

// -------------------------------------------------------------
// 2. SESIÓN DE USUARIO Y CONFIGURACIÓN INICIAL
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const usuarioData = localStorage.getItem('usuarioSesion');

    if (!usuarioData) {
        window.location.href = 'login.html';
        return;
    }

    const usuario = JSON.parse(usuarioData);

    // Inyectar datos del perfil
    if (document.getElementById('user-perfil')) document.getElementById('user-perfil').textContent = usuario.perfil || 'Usuario';
    if (document.getElementById('user-email')) document.getElementById('user-email').textContent = usuario.email || '';
    if (document.getElementById('nombreHeader')) document.getElementById('nombreHeader').textContent = usuario.nombreCompleto || '';

    if (document.getElementById('valNombre')) document.getElementById('valNombre').textContent = usuario.nombreCompleto || '';
    if (document.getElementById('valTipoDoc')) document.getElementById('valTipoDoc').textContent = usuario.tipoDocumento || '';
    if (document.getElementById('valNumDoc')) document.getElementById('valNumDoc').textContent = usuario.numDocumento || '';
    if (document.getElementById('valTelefono')) document.getElementById('valTelefono').textContent = usuario.telefono || '';
    if (document.getElementById('valEmail')) document.getElementById('valEmail').textContent = usuario.email || '';
    if (document.getElementById('valDireccion')) document.getElementById('valDireccion').textContent = usuario.direccion || '';
    if (document.getElementById('valGenero')) document.getElementById('valGenero').textContent = usuario.genero || '';
    if (document.getElementById('valEstado')) document.getElementById('valEstado').textContent = usuario.estado || '';

    // Obtener ID del usuario
    const idUsuario = usuario.idUsuario || 1;

    // Guardar ID en input oculto
    const inputIdUser = document.getElementById('idUsuarioFK');
    if (inputIdUser) {
        inputIdUser.value = idUsuario;
    }

    // CARGA INICIAL DE CITAS Y FACTURA DEL USUARIO
    cargarCitasUsuario(idUsuario);

    // Cierre de Sesión
    document.getElementById('btnCerrarSesion')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('usuarioSesion');
        window.location.href = 'login.html';
    });

    // Abrir Modal de Cita y Cargar Datos de la BD
    const btnAgendar = document.getElementById('btnAgendarCita');
    const modalAgendar = document.getElementById('modalAgendar');
    const btnCerrarModal = document.getElementById('btnCerrarModal');

    btnAgendar?.addEventListener('click', () => {
        if (modalAgendar) modalAgendar.style.display = 'flex';

        // Cargar listas desde la API de Spring Boot
        cargarServiciosBackend();
        cargarInsumosBackend();
        siguientePaso(1);
    });

    btnCerrarModal?.addEventListener('click', () => {
        if (modalAgendar) modalAgendar.style.display = 'none';
    });
});

// -------------------------------------------------------------
// 3. CARGA DINÁMICA DESDE EL BACKEND (SERVICIOS E INSUMOS)
// -------------------------------------------------------------
async function cargarServiciosBackend() {
    const selectServicio = document.getElementById('selectServicio');
    if (!selectServicio) return;

    try {
        const response = await fetch('/api/servicios');
        if (!response.ok) throw new Error('Error al obtener servicios');

        const servicios = await response.json();
        selectServicio.innerHTML = '<option value="" disabled selected>-- Elija un servicio --</option>';

        servicios.forEach(s => {
            const option = document.createElement('option');
            option.value = s.idServicio;
            option.setAttribute('data-nombre', s.nombreServicio);
            option.setAttribute('data-precio', s.precioBase);
            option.setAttribute('data-duracion', 30);
            option.textContent = `${s.nombreServicio} - $${Number(s.precioBase).toLocaleString('es-CO')}`;
            selectServicio.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando servicios:', error);
    }
}

async function cargarInsumosBackend() {
    const selectInsumo = document.getElementById('selectInsumo');
    if (!selectInsumo) return;

    try {
        const response = await fetch('/api/insumos');
        if (!response.ok) throw new Error('Error al obtener insumos');

        const insumos = await response.json();
        selectInsumo.innerHTML = '<option value="">-- Sin insumo asignado --</option>';

        insumos.forEach(i => {
            const option = document.createElement('option');
            option.value = i.idInsumo;
            option.textContent = `${i.nombreInsumo} (Stock: ${i.stockActual})`;
            selectInsumo.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando insumos:', error);
    }
}

// -------------------------------------------------------------
// CARGA DE CITAS Y FACTURAS DEL USUARIO DESDE EL BACKEND
// -------------------------------------------------------------
async function cargarCitasUsuario(idUsuario) {
    try {
        const response = await fetch(`/api/citas/usuario/${idUsuario}`);
        if (!response.ok) throw new Error('Error al obtener las citas');

        const citas = await response.json();

        if (!citas || citas.length === 0) {
            document.getElementById('proximaCitaServicio').textContent = 'No tienes citas agendadas';
            document.getElementById('proximaCitaFecha').innerHTML = `<i class='bx bx-calendar'></i> --`;
            document.getElementById('proximaCitaHorario').innerHTML = `<i class='bx bx-time'></i> Horario: --`;
            document.getElementById('proximaCitaTotal').innerHTML = `<i class='bx bx-dollar-circle'></i> Total: $0`;
            return;
        }

        // Buscar la cita pendiente o más cercana
        const proximaCita = citas.find(c => c.estado === 'PENDIENTE') || citas[0];

        // Obtención flexible del nombre del servicio para evitar "Servicio General"
        const nombreServicio = proximaCita.servicio
            || (proximaCita.servicioEntidad ? proximaCita.servicioEntidad.nombreServicio : null)
            || proximaCita.nombreServicio
            || 'Manos y Pies Tradicional';

        // Renderizar Próxima Cita
        document.getElementById('proximaCitaServicio').textContent = nombreServicio;
        document.getElementById('proximaCitaFecha').innerHTML = `<i class='bx bx-calendar'></i> ${proximaCita.fecha}`;
        document.getElementById('proximaCitaHorario').innerHTML = `<i class='bx bx-time'></i> Horario: ${proximaCita.horaInicio} - ${proximaCita.horaFinal}`;
        document.getElementById('proximaCitaTotal').innerHTML = `<i class='bx bx-dollar-circle'></i> Total: $${Number(proximaCita.totalServicio || 0).toLocaleString('es-CO')}`;

        const badgeEstado = document.getElementById('proximaCitaEstado');
        if (badgeEstado) {
            badgeEstado.textContent = proximaCita.estado;
            badgeEstado.className = `badge badge-${proximaCita.estado ? proximaCita.estado.toLowerCase() : 'pendiente'}`;
        }

        // Renderizar Historial de Citas Completadas
        const completadas = citas.filter(c => c.estado === 'COMPLETADA' || c.estado === 'FINALIZADA');
        const contenedorCompletadas = document.getElementById('listaCitasCompletadas');

        if (contenedorCompletadas && completadas.length > 0) {
            contenedorCompletadas.innerHTML = completadas.map(c => {
                const nombreItem = c.servicio || (c.servicioEntidad ? c.servicioEntidad.nombreServicio : null) || c.nombreServicio || 'Servicio';
                return `
                    <div class="cita-item-completada">
                        <div>
                            <strong>${nombreItem}</strong>
                            <small>${c.fecha} - $${Number(c.totalServicio || 0).toLocaleString('es-CO')}</small>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Cargar Factura asociada a la cita
        const idCitaActual = proximaCita.idCita || proximaCita.idCitaPK || proximaCita.numCita;
        if (idCitaActual) {
            cargarUltimaFactura(idCitaActual, nombreServicio);
        }

    } catch (error) {
        console.error('Error cargando citas:', error);
        document.getElementById('proximaCitaServicio').textContent = 'Error al cargar citas';
    }
}

async function cargarUltimaFactura(idCita, nombreServicio) {
    try {
        const response = await fetch(`/api/facturas/cita/${idCita}`);
        if (!response.ok) return;

        const factura = await response.json();

        if (factura) {
            document.getElementById('facturaServicio').textContent = nombreServicio;
            document.getElementById('facturaMonto').textContent = `$${Number(factura.total || 0).toLocaleString('es-CO')} COP`;
            document.getElementById('facturaFecha').textContent = factura.fechaEmision || '--/--/----';

            const btnVerFactura = document.getElementById('btnVerFactura');
            if (btnVerFactura) {
                btnVerFactura.onclick = () => {
                    alert(`--- FACTURA DIGITAL ---\nN° Factura: ${factura.numFactura}\nServicio: ${nombreServicio}\nFecha: ${factura.fechaEmision}\nMétodo de Pago: ${factura.metodoPago || 'Efectivo'}\nIVA: $${Number(factura.iva || 0).toLocaleString('es-CO')}\nTotal: $${Number(factura.total || 0).toLocaleString('es-CO')} COP`);
                };
            }
        }
    } catch (error) {
        console.error('Error al cargar la factura:', error);
    }
}

// -------------------------------------------------------------
// 4. PASOS DEL WIZARD (AGENDAR CITA)
// -------------------------------------------------------------
const API_CITAS_URL = '/api/citas';

let datosReserva = {
    idServicioFK: null,
    idInsumoFK: null,
    servicioNombre: '',
    precio: 0,
    duracionMinutos: 0,
    fecha: '',
    horaInicio: '',
    horaFinal: '',
    observacion: ''
};

function siguientePaso(paso) {
    if (paso === 2) {
        const selectServicio = document.getElementById('selectServicio');
        if (!selectServicio.value) {
            alert('Por favor selecciona un servicio.');
            return;
        }
        const option = selectServicio.options[selectServicio.selectedIndex];
        datosReserva.idServicioFK = parseInt(selectServicio.value);

        // Extrae correctamente solo el nombre eliminando el costo
        const dataNombre = option.getAttribute('data-nombre');
        datosReserva.servicioNombre = dataNombre || option.text.split(' - ')[0].trim();

        datosReserva.precio = parseFloat(option.getAttribute('data-precio') || 0);
        datosReserva.duracionMinutos = parseInt(option.getAttribute('data-duracion') || 30);
    }

    if (paso === 3) {
        const fecha = document.getElementById('inputFecha').value;
        const horaInicio = document.getElementById('inputHoraInicio').value;
        const selectInsumo = document.getElementById('selectInsumo');

        if (!fecha || !horaInicio) {
            alert('Por favor selecciona la fecha y hora de inicio.');
            return;
        }

        // Obtener ID del insumo seleccionado o asignar null si no eligió ninguno
        datosReserva.idInsumoFK = (selectInsumo && selectInsumo.value) ? parseInt(selectInsumo.value) : null;

        // Calcular hora final según la duración del servicio
        const [horas, minutos] = horaInicio.split(':').map(Number);
        const fechaHora = new Date();
        fechaHora.setHours(horas, minutos + datosReserva.duracionMinutos, 0);

        const hFin = String(fechaHora.getHours()).padStart(2, '0');
        const mFin = String(fechaHora.getMinutes()).padStart(2, '0');

        datosReserva.fecha = fecha;
        datosReserva.horaInicio = `${horaInicio}:00`;
        datosReserva.horaFinal = `${hFin}:${mFin}:00`;
        datosReserva.observacion = document.getElementById('inputObservacion')?.value.trim() || "Sin observación";

        // Cargar datos en la vista de resumen
        if (document.getElementById('resumenServicio')) document.getElementById('resumenServicio').textContent = datosReserva.servicioNombre;
        if (document.getElementById('resumenFecha')) document.getElementById('resumenFecha').textContent = datosReserva.fecha;
        if (document.getElementById('resumenHorario')) document.getElementById('resumenHorario').textContent = `${horaInicio} a ${hFin}:${mFin}`;
        if (document.getElementById('resumenTotal')) document.getElementById('resumenTotal').textContent = `$${datosReserva.precio.toLocaleString('es-CO')}`;
        if (document.getElementById('resumenObservacion')) document.getElementById('resumenObservacion').textContent = datosReserva.observacion;
    }

    // Actualizar visibilidad de los pasos
    document.querySelectorAll('.wizard-paso').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.paso-dot').forEach(d => d.classList.remove('active'));

    document.getElementById(`paso${paso}`)?.classList.add('active');
    document.getElementById(`dotPaso${paso}`)?.classList.add('active');
}

// -------------------------------------------------------------
// 5. GUARDAR CITA EN SPRING BOOT (POST)
// -------------------------------------------------------------
document.getElementById('btnConfirmarReserva')?.addEventListener('click', async () => {
    const idUserElem = document.getElementById('idUsuarioFK');
    const idUsuario = idUserElem ? parseInt(idUserElem.value) : 1;

    const nuevaCita = {
        servicio: datosReserva.servicioNombre,
        fecha: datosReserva.fecha,
        horaInicio: datosReserva.horaInicio,
        horaFinal: datosReserva.horaFinal,
        estado: "PENDIENTE",
        observacion: datosReserva.observacion,
        totalServicio: datosReserva.precio,
        idUsuarioFK: idUsuario,
        idServicioFK: datosReserva.idServicioFK,
        idInsumoFK: datosReserva.idInsumoFK
    };

    try {
        const response = await fetch(API_CITAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaCita)
        });

        if (response.ok) {
            alert('¡Cita agendada con éxito!');
            const modalAgendar = document.getElementById('modalAgendar');
            if (modalAgendar) modalAgendar.style.display = 'none';
            location.reload();
        } else {
            alert('Error al agendar la cita. Verifica que todos los campos sean válidos.');
        }
    } catch (err) {
        console.error('Error de conexión:', err);
        alert('Error de conexión con el servidor.');
    }
});