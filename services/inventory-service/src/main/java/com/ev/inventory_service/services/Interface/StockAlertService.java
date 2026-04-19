package com.ev.inventory_service.services.Interface;

import com.ev.inventory_service.model.StockAlert;
import java.util.List;

public interface StockAlertService {
    void checkStockLevelsAndCreateAlerts();
    List<StockAlert> getActiveAlerts();
}
