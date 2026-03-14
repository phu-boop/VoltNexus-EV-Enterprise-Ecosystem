package com.ev.customer_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.customer_service.dto.request.ChargingStationRequest;
import com.ev.customer_service.dto.response.ChargingStationResponse;
import com.ev.customer_service.service.ChargingStationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * REST Controller for Charging Stations
 */
@RestController
@RequestMapping("/customers/api/charging-stations")
@RequiredArgsConstructor
public class ChargingStationController {

    private final ChargingStationService chargingStationService;

    /**
     * Get all active charging stations (Public endpoint)
     */
    @GetMapping
    public ResponseEntity<ApiRespond<List<ChargingStationResponse>>> getAllStations() {
        List<ChargingStationResponse> stations = chargingStationService.getAllActiveStations();
        return ResponseEntity.ok(ApiRespond.success("Fetched all charging stations successfully", stations));
    }

    /**
     * Get charging station by ID (Public endpoint)
     */
    @GetMapping("/{stationId}")
    public ResponseEntity<ApiRespond<ChargingStationResponse>> getStationById(@PathVariable Long stationId) {
        ChargingStationResponse station = chargingStationService.getStationById(stationId);
        return ResponseEntity.ok(ApiRespond.success("Fetched charging station successfully", station));
    }

    /**
     * Find charging stations near a location (Public endpoint)
     * 
     * @param latitude  Latitude of search location
     * @param longitude Longitude of search location
     * @param radius    Search radius in kilometers (default: 50km)
     */
    @GetMapping("/nearby")
    public ResponseEntity<ApiRespond<List<ChargingStationResponse>>> findNearbyStations(
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude,
            @RequestParam(required = false, defaultValue = "50.0") Double radius) {
        
        List<ChargingStationResponse> stations = chargingStationService.findStationsNearby(latitude, longitude, radius);
        return ResponseEntity.ok(ApiRespond.success("Found " + stations.size() + " stations nearby", stations));
    }

    /**
     * Search charging stations by keyword (Public endpoint)
     */
    @GetMapping("/search")
    public ResponseEntity<ApiRespond<List<ChargingStationResponse>>> searchStations(
            @RequestParam String keyword) {
        
        List<ChargingStationResponse> stations = chargingStationService.searchStations(keyword);
        return ResponseEntity.ok(ApiRespond.success("Search completed", stations));
    }

    /**
     * Get charging stations by city (Public endpoint)
     */
    @GetMapping("/city/{city}")
    public ResponseEntity<ApiRespond<List<ChargingStationResponse>>> getStationsByCity(@PathVariable String city) {
        List<ChargingStationResponse> stations = chargingStationService.getStationsByCity(city);
        return ResponseEntity.ok(ApiRespond.success("Fetched stations in " + city, stations));
    }

    /**
     * Get charging stations by province (Public endpoint)
     */
    @GetMapping("/province/{province}")
    public ResponseEntity<ApiRespond<List<ChargingStationResponse>>> getStationsByProvince(@PathVariable String province) {
        List<ChargingStationResponse> stations = chargingStationService.getStationsByProvince(province);
        return ResponseEntity.ok(ApiRespond.success("Fetched stations in " + province, stations));
    }

    /**
     * Create a new charging station (Admin/Staff only)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<ApiRespond<ChargingStationResponse>> createStation(
            @Valid @RequestBody ChargingStationRequest request) {
        
        ChargingStationResponse station = chargingStationService.createStation(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiRespond.success("Charging station created successfully", station));
    }

    /**
     * Update a charging station (Admin/Staff only)
     */
    @PutMapping("/{stationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<ApiRespond<ChargingStationResponse>> updateStation(
            @PathVariable Long stationId,
            @Valid @RequestBody ChargingStationRequest request) {
        
        ChargingStationResponse station = chargingStationService.updateStation(stationId, request);
        return ResponseEntity.ok(ApiRespond.success("Charging station updated successfully", station));
    }

    /**
     * Delete a charging station (Admin only)
     */
    @DeleteMapping("/{stationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiRespond<Void>> deleteStation(@PathVariable Long stationId) {
        chargingStationService.deleteStation(stationId);
        return ResponseEntity.ok(ApiRespond.success("Charging station deleted successfully", null));
    }
}
