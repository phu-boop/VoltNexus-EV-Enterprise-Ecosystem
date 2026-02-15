package com.example.reporting_service.service;

import com.example.reporting_service.dto.SaleEventDTO;
import com.example.reporting_service.repository.SalesSummaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SalesPersistenceService {

    @Autowired
    private SalesSummaryRepository salesRepository;

    @Transactional
    public void saveSaleSummary(SaleEventDTO event) {

        salesRepository.upsertSalesSummary(
            event.getRegion(),
            event.getDealershipId(),
            event.getDealershipName(),
            event.getModelId(),
            event.getModelName(),
            event.getVariantId(),
            event.getVariantName(),
            event.getQuantitySold(),
            event.getSalePrice(),
            event.getSaleTimestamp()
        );
    }
}
