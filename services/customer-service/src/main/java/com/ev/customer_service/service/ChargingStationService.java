package com.ev.customer_service.service;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.customer_service.dto.request.ChargingStationRequest;
import com.ev.customer_service.dto.response.ChargingStationResponse;
import com.ev.customer_service.entity.ChargingStation;
import com.ev.customer_service.repository.ChargingStationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing charging stations
 */
@Service
@RequiredArgsConstructor
public class ChargingStationService {

    private final ChargingStationRepository chargingStationRepository;

    /**
     * Get all active charging stations
     */
    public List<ChargingStationResponse> getAllActiveStations() {
        return chargingStationRepository.findByStatusOrderByStationNameAsc(ChargingStation.StationStatus.ACTIVE)
                .stream()
                .map(ChargingStationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get charging station by ID
     */
    public ChargingStationResponse getStationById(Long stationId) {
        ChargingStation station = chargingStationRepository.findById(stationId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));
        return ChargingStationResponse.fromEntity(station);
    }

    /**
     * Search charging stations near a location
     */
    public List<ChargingStationResponse> findStationsNearby(BigDecimal latitude, BigDecimal longitude, Double radiusKm) {
        if (radiusKm == null || radiusKm <= 0) {
            radiusKm = 50.0; // Default 50km radius
        }
        
        List<ChargingStation> stations = chargingStationRepository.findStationsNearby(
                latitude, longitude, radiusKm, ChargingStation.StationStatus.ACTIVE.name());
        
        return stations.stream()
                .map(station -> {
                    ChargingStationResponse response = ChargingStationResponse.fromEntity(station);
                    // Calculate distance
                    double distance = calculateDistance(latitude, longitude, station.getLatitude(), station.getLongitude());
                    response.setDistanceKm(Math.round(distance * 100.0) / 100.0); // Round to 2 decimal places
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Search stations by keyword
     */
    public List<ChargingStationResponse> searchStations(String keyword) {
        return chargingStationRepository.searchStations(keyword, ChargingStation.StationStatus.ACTIVE)
                .stream()
                .map(ChargingStationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get stations by city
     */
    public List<ChargingStationResponse> getStationsByCity(String city) {
        return chargingStationRepository.findByCityAndStatusOrderByStationNameAsc(city, ChargingStation.StationStatus.ACTIVE)
                .stream()
                .map(ChargingStationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get stations by province
     */
    public List<ChargingStationResponse> getStationsByProvince(String province) {
        return chargingStationRepository.findByProvinceAndStatusOrderByStationNameAsc(province, ChargingStation.StationStatus.ACTIVE)
                .stream()
                .map(ChargingStationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Create a new charging station (Admin only)
     */
    @Transactional
    public ChargingStationResponse createStation(ChargingStationRequest request) {
        ChargingStation station = new ChargingStation();
        updateStationFromRequest(station, request);
        
        ChargingStation savedStation = chargingStationRepository.save(station);
        return ChargingStationResponse.fromEntity(savedStation);
    }

    /**
     * Update a charging station (Admin only)
     */
    @Transactional
    public ChargingStationResponse updateStation(Long stationId, ChargingStationRequest request) {
        ChargingStation station = chargingStationRepository.findById(stationId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));
        
        updateStationFromRequest(station, request);
        
        ChargingStation updatedStation = chargingStationRepository.save(station);
        return ChargingStationResponse.fromEntity(updatedStation);
    }

    /**
     * Delete a charging station (Admin only)
     */
    @Transactional
    public void deleteStation(Long stationId) {
        if (!chargingStationRepository.existsById(stationId)) {
            throw new AppException(ErrorCode.DATA_NOT_FOUND);
        }
        chargingStationRepository.deleteById(stationId);
    }

    /**
     * Helper method to update station from request
     */
    private void updateStationFromRequest(ChargingStation station, ChargingStationRequest request) {
        station.setStationName(request.getStationName());
        station.setAddress(request.getAddress());
        station.setCity(request.getCity());
        station.setProvince(request.getProvince());
        station.setLatitude(request.getLatitude());
        station.setLongitude(request.getLongitude());
        station.setTotalChargers(request.getTotalChargers());
        station.setAvailableChargers(request.getAvailableChargers());
        station.setChargerTypes(request.getChargerTypes());
        station.setMaxPowerKw(request.getMaxPowerKw());
        station.setPricingInfo(request.getPricingInfo());
        
        if (request.getStatus() != null) {
            try {
                station.setStatus(ChargingStation.StationStatus.valueOf(request.getStatus()));
            } catch (IllegalArgumentException e) {
                station.setStatus(ChargingStation.StationStatus.ACTIVE);
            }
        }
        
        station.setOperatingHours(request.getOperatingHours());
        station.setPhoneNumber(request.getPhoneNumber());
        station.setDescription(request.getDescription());
        station.setAmenities(request.getAmenities());
        station.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : true);
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    private double calculateDistance(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        final int R = 6371; // Radius of the earth in km

        double latDistance = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double lonDistance = Math.toRadians(lon2.doubleValue() - lon1.doubleValue());
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1.doubleValue())) * Math.cos(Math.toRadians(lat2.doubleValue()))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance in km
    }
}
