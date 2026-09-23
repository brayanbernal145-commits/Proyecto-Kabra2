
package com.DJuanCarlosPeluqueria.DJuanCarlosPeluqueria.Controller;

import com.DJuanCarlosPeluqueria.DJuanCarlosPeluqueria.Model.Factura;
import com.DJuanCarlosPeluqueria.DJuanCarlosPeluqueria.Model.Repository.FacturaRepository;
import com.DJuanCarlosPeluqueria.DJuanCarlosPeluqueria.Model.FacturaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping
@CrossOrigin(origins = "*")
public class FacturaController {

    @Autowired
    private FacturaService facturaService;

    @Autowired
    private FacturaRepository facturaRepository;

    // ==============================
    // PÁGINAS HTML
    // ==============================

    // Listado de facturas
    @GetMapping("/facturas")
    public String listarFacturas() {
        return "ListadoF";
    }

    // Crear factura
    @GetMapping("/facturas/crear")
    public String crearFactura() {
        return "FormularioFactura";
    }

    // Editar factura
    @GetMapping("/facturas/editar")
    public String editarFactura() {
        return "EditarF";
    }


    // ==============================
    // API DE FACTURAS
    // ==============================
    @GetMapping("/cita/{idCita}")
    public ResponseEntity<Factura> obtenerFacturaPorCita(@PathVariable Long idCita) {
        return facturaRepository.findByIdCitaFK(idCita)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    // GET: Obtener todas las facturas
    @GetMapping("/api/factura")
    @ResponseBody
    public List<Factura> getAllFacturas() {
        return facturaService.getAllFacturas();
    }

    // GET: Obtener una factura por ID
    @GetMapping("/api/factura/{id}")
    @ResponseBody
    public ResponseEntity<Factura> getFacturaById(@PathVariable Long id) {

        Factura factura = facturaService.getFacturaById(id);

        if (factura != null) {
            return ResponseEntity.ok(factura);
        }

        return ResponseEntity.notFound().build();
    }

    // POST: Crear una factura
    @PostMapping("/api/factura")
    @ResponseBody
    public ResponseEntity<Factura> createFactura(@RequestBody Factura factura) {

        Factura nuevaFactura = facturaService.createFactura(factura);

        return ResponseEntity.ok(nuevaFactura);
    }

    // PUT: Actualizar una factura
    @PutMapping("/api/factura/{id}")
    @ResponseBody
    public ResponseEntity<Factura> updateFactura(
            @PathVariable Long id,
            @RequestBody Factura factura) {

        Factura facturaActualizada =
                facturaService.updateFactura(id, factura);

        if (facturaActualizada != null) {
            return ResponseEntity.ok(facturaActualizada);
        }

        return ResponseEntity.notFound().build();
    }

    // DELETE: Eliminar una factura
    @DeleteMapping("/api/factura/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteFactura(@PathVariable Long id) {

        facturaService.deleteFactura(id);

        return ResponseEntity.noContent().build();
    }
}

