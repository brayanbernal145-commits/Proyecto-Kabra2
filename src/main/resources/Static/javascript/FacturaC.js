
const API_URL = "http://localhost:8080/api/factura";
const CITAS_API_URL = "http://localhost:8080/api/citas";

document.addEventListener("DOMContentLoaded", () => {
    inicializarSidebar();
    cargarFacturasRecientes();
    inicializarVistaPrevia();
    cargarCitas();

    const formFactura = document.getElementById("facturaForm");

    if (formFactura) {
        formFactura.addEventListener("submit", guardarFactura);
    }
});


/* =========================
   CARGAR CITAS
========================= */

async function cargarCitas() {

    const buscarCita = document.getElementById("buscarCita");
    const listaCitas = document.getElementById("listaCitas");

    if (!buscarCita || !listaCitas) {
        return;
    }

    try {

        const response = await fetch(CITAS_API_URL);

        if (!response.ok) {
            throw new Error("No se pudieron cargar las citas.");
        }

        const citas = await response.json();

        listaCitas.innerHTML = "";

        citas.forEach(cita => {

            const option = document.createElement("option");

            option.value = `Cita #${cita.idCita}`;

            option.textContent =
                `Cita #${cita.idCita} - ${cita.fecha || "Sin fecha"}`;

            option.dataset.id = cita.idCita;

            listaCitas.appendChild(option);
        });


        // Cuando el usuario selecciona una cita
        buscarCita.addEventListener("change", () => {

            const valor = buscarCita.value.trim();

            const opciones =
                listaCitas.querySelectorAll("option");

            let citaEncontrada = null;

            opciones.forEach(option => {

                if (option.value === valor) {
                    citaEncontrada = option;
                }
            });


            const idCitaFK =
                document.getElementById("idCitaFK");


            if (citaEncontrada) {

                idCitaFK.value =
                    citaEncontrada.dataset.id;

                console.log(
                    "Cita seleccionada:",
                    idCitaFK.value
                );

            } else {

                idCitaFK.value = "";

                console.log(
                    "No se encontró la cita seleccionada."
                );
            }
        });


    } catch (error) {

        console.error(
            "Error al cargar las citas:",
            error
        );

        alert(
            "No se pudieron cargar las citas."
        );
    }
}


/* =========================
   VISTA PREVIA
========================= */

function inicializarVistaPrevia() {

    const inputFecha =
        document.getElementById("fechaEmision");

    const inputTotal =
        document.getElementById("total");

    const selectEstado =
        document.getElementById("estadoFactura");

    const selectMetodo =
        document.getElementById("metodoPago");


    inputFecha?.addEventListener(
        "input",
        actualizarPreviewFactura
    );

    inputTotal?.addEventListener(
        "input",
        actualizarPreviewFactura
    );

    selectEstado?.addEventListener(
        "change",
        actualizarPreviewFactura
    );

    selectMetodo?.addEventListener(
        "change",
        actualizarPreviewFactura
    );

    actualizarPreviewFactura();
}


function actualizarPreviewFactura() {

    const fecha =
        document.getElementById("fechaEmision")?.value ||
        "--/--/----";

    const total =
        document.getElementById("total")?.value ||
        "0";

    const estado =
        document.getElementById("estadoFactura")?.value ||
        "Pendiente";

    const metodo =
        document.getElementById("metodoPago")?.value ||
        "Efectivo";


    const prevFecha =
        document.getElementById("prevFechaF");

    const prevTotal =
        document.getElementById("prevTotalF");

    const prevEstado =
        document.getElementById("prevEstadoF");

    const prevMetodo =
        document.getElementById("prevMetodoF");


    if (prevFecha) {
        prevFecha.textContent =
            `Fecha: ${formatearFecha(fecha)}`;
    }

    if (prevTotal) {
        prevTotal.textContent =
            `Total: $${Number(total).toLocaleString("es-CO")}`;
    }

    if (prevEstado) {

        prevEstado.textContent = estado;

        prevEstado.className =
            `badge-rol ${estado
    .toLowerCase()
    .replace(/\s+/g, "-")}`;
    }

    if (prevMetodo) {
        prevMetodo.textContent =
            `Método: ${metodo}`;
    }
}


/* =========================
   FACTURAS RECIENTES
========================= */

async function cargarFacturasRecientes() {

    const listaRecientes =
        document.getElementById("listaUltimasFacturas");

    if (!listaRecientes) {
        return;
    }

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                "No se pudieron cargar las facturas."
            );
        }

        const facturas =
            await response.json();

        listaRecientes.innerHTML = "";


        if (facturas.length === 0) {

            listaRecientes.innerHTML = `
<li class="sin-registros">
    No hay facturas registradas.
</li>
`;

            return;
        }


        const ultimas =
            facturas.slice(-4).reverse();


        ultimas.forEach(factura => {

            const li =
                document.createElement("li");

            const numeroFactura =
                factura.numFactura || "-";

            const estado =
                factura.estadoFactura ||
                "Pendiente";

            const total =
                Number(factura.total || 0)
                    .toLocaleString("es-CO");


            li.innerHTML = `
<span>
<strong>
Factura #${numeroFactura}
</strong>
<br>
    Total: $${total}
</span>

<span class="badge-mini">
                    ${estado}
                </span>
    `;

            listaRecientes.appendChild(li);
        });


    } catch (error) {

        console.error(
            "Error al cargar facturas recientes:",
            error
        );

        listaRecientes.innerHTML = `
<li class="sin-registros">
    Error al cargar el historial.
</li>
`;
    }
}


/* =========================
   GUARDAR FACTURA
========================= */

async function guardarFactura(event) {

    event.preventDefault();


    const idCita =
        document.getElementById("idCitaFK")?.value;

    const fechaEmision =
        document.getElementById("fechaEmision")?.value;

    const total =
        document.getElementById("total")?.value;

    const iva =
        document.getElementById("iva")?.value;

    const estadoFactura =
        document.getElementById("estadoFactura")?.value;

    const metodoPago =
        document.getElementById("metodoPago")?.value;

    const observaciones =
        document.getElementById("observaciones")?.value ||
        "";


    const facturaData = {

        idCitaFK: idCita
            ? Number(idCita)
            : null,

        fechaEmision:
            fechaEmision || "",

        total:
            total
                ? Number(total)
                : 0,

        iva:
            iva
                ? Number(iva)
                : 0,

        estadoFactura:
            estadoFactura ||
            "Pendiente",

        metodoPago:
            metodoPago ||
            "Efectivo",

        observaciones:
            observaciones.trim()
    };


    console.log(
        "Factura que se enviará:",
        facturaData
    );


    // Validaciones
    if (
        !facturaData.idCitaFK ||
        !facturaData.fechaEmision ||
        facturaData.total < 0 ||
        facturaData.iva < 0
    ) {

        alert(
            "Por favor selecciona una cita válida y completa los campos obligatorios."
        );

        return;
    }


    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(facturaData)
            });


        if (response.ok) {

            alert(
                "¡Factura registrada con éxito!"
            );


            document
                .getElementById("facturaForm")
                ?.reset();


            document.getElementById("idCitaFK").value = "";


            actualizarPreviewFactura();

            cargarFacturasRecientes();


        } else {

            const errorText =
                await response.text();

            console.error(
                "Error del servidor:",
                errorText
            );

            alert(
                "Error al registrar la factura: " +
                errorText
            );
        }


    } catch (error) {

        console.error(
            "Error de red al guardar la factura:",
            error
        );

        alert(
            "Error de conexión al intentar guardar la factura."
        );
    }
}


/* =========================
   FORMATEAR FECHA
========================= */

function formatearFecha(fecha) {

    if (!fecha) {
        return "--/--/----";
    }


    const fechaObj =
        new Date(fecha);


    if (isNaN(fechaObj.getTime())) {
        return fecha;
    }


    return fechaObj.toLocaleString(
        "es-CO",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================
   MENÚ LATERAL
========================= */

function inicializarSidebar() {

    const menusItemsDropDown =
        document.querySelectorAll(
            ".menu-item-dropdown"
        );

    const sidebar =
        document.getElementById("sidebar");

    const menuBtn =
        document.getElementById("menu-btn");

    const sidebarBtn =
        document.getElementById("sidebar-btn");


    sidebarBtn?.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "sidebar-hidden"
            );
        }
    );


    menuBtn?.addEventListener(
        "click",
        () => {

            sidebar?.classList.toggle(
                "minimize"
            );
        }
    );


    menusItemsDropDown.forEach(
        (menuItem) => {

            menuItem.addEventListener(
                "click",
                () => {

                    const subMenu =
                        menuItem.querySelector(
                            ".sub-menu"
                        );

                    const isActive =
                        menuItem.classList.toggle(
                            "sub-menu-toggle"
                        );


                    if (subMenu) {

                        subMenu.style.height =
                            isActive
                                ? `${subMenu.scrollHeight + 20}px`
                                : "0";

                        subMenu.style.padding =
                            isActive
                                ? "0.2rem 0"
                                : "0";
                    }
                }
            );
        }
    );
}

