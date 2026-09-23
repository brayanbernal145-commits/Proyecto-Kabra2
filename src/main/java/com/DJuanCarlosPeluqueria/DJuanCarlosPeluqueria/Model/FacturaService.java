
package com.DJuanCarlosPeluqueria.DJuanCarlosPeluqueria.Model;

import com.DJuanCarlosPeluqueria.DJuanCarlosPeluqueria.Model.Repository.FacturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FacturaService {

    @Autowired
    private FacturaRepository facturaRepository;

    // Obtener todas las facturas
    public List<Factura> getAllFacturas() {
        return facturaRepository.findAll();
    }

    // Obtener una factura por ID
    public Factura getFacturaById(Long id) {
        return facturaRepository.findById(id).orElse(null);
    }

    // Crear una factura
    public Factura createFactura(Factura factura) {
        return facturaRepository.save(factura);
    }

    // Actualizar una factura
    public Factura updateFactura(Long id, Factura factura) {
        Factura facturaExistente = facturaRepository.findById(id).orElse(null);

        if (facturaExistente == null) {
            return null;
        }

        facturaExistente.setFechaEmision(factura.getFechaEmision());
        facturaExistente.setTotal(factura.getTotal());
        facturaExistente.setIva(factura.getIva());
        facturaExistente.setEstadoFactura(factura.getEstadoFactura());
        facturaExistente.setMetodoPago(factura.getMetodoPago());
        facturaExistente.setObservaciones(factura.getObservaciones());
        facturaExistente.setIdCitaFK(factura.getIdCitaFK());

        return facturaRepository.save(facturaExistente);
    }

    // Eliminar una factura
    public void deleteFactura(Long id) {
        facturaRepository.deleteById(id);
    }
}