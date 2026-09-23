
const API_URL = "http://localhost:8080/api/factura";

document.addEventListener("DOMContentLoaded", () => {
    consultarFacturas();
    inicializarSidebar();
});


// GET: Obtener todas las facturas
async function consultarFacturas() {

    const tbody = document.getElementById("tablaFacturasBody");
    const infoTotal = document.getElementById("infoTotalFacturas");

    if (!tbody) {
        return;
    }

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                "No se pudieron obtener las facturas"
            );
        }

        const facturas = await response.json();

        tbody.innerHTML = "";


        if (facturas.length === 0) {

            tbody.innerHTML = `
<tr>
<td colspan="8" class="sin-datos">
    No hay facturas registradas en la base de datos.
</td>
</tr>
`;

            if (infoTotal) {
                infoTotal.textContent =
                    "Mostrando 0 facturas";
            }

            return;
        }


        if (infoTotal) {
            infoTotal.textContent =
                `Mostrando ${facturas.length} facturas registradas`;
        }


        facturas.forEach(factura => {

            const tr = document.createElement("tr");

            const idFactura =
                factura.numFactura || factura.id;

            const idCita =
                factura.idCitaFK || "-";


            tr.innerHTML = `
<td>#${idFactura || "N/A"}</td>

<td>
    ${formatearFecha(factura.fechaEmision)}
</td>

<td>
    $${Number(
    factura.total || 0
).toLocaleString("es-CO")}
</td>

<td>
    $${Number(
    factura.iva || 0
).toLocaleString("es-CO")}
</td>

<td>
                    <span class="badge ${
                        String(
                            factura.estadoFactura ||
                            "Pendiente"
                        )
                        .toLowerCase()
                        .replace(/\s+/g, "-")
    }">
    ${factura.estadoFactura || "Pendiente"}
</span>
</td>

<td>
    ${factura.metodoPago || "N/A"}
</td>

<td>
    ${factura.observaciones || "Sin observaciones"}
</td>

<td>
    #${idCita}
</td>
    `;

            tbody.appendChild(tr);
        });


    } catch (error) {

        console.error(
            "Error al cargar las facturas:",
            error
        );

        tbody.innerHTML = `
<tr>
<td colspan="8"
class="sin-datos"
style="color: red;">
    Error al conectar con Spring Boot.
    Revisa la consola o activa el servidor.
</td>
</tr>
`;

        if (infoTotal) {
            infoTotal.textContent =
                "Error al cargar las facturas";
        }
    }
}


// Formato de fecha y hora
function formatearFecha(fecha) {

    if (!fecha) {
        return "N/A";
    }

    const fechaObj = new Date(fecha);

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

