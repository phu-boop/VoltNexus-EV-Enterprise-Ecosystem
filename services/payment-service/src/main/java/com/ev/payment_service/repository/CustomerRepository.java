package com.ev.payment_service.repository;

import com.ev.payment_service.dto.external.CustomerInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Repository to query customer information from customer_db
 * This is a cross-database query - in production should use customer-service
 * API
 */
@Repository
@Slf4j
@RequiredArgsConstructor
public class CustomerRepository {

    private final DataSource dataSource;

    @Value("${customer.db.name:customer_db}")
    private String customerDbName;

    /**
     * Fetch customer info by ID
     */
    public CustomerInfo findById(Long customerId) {
        if (customerId == null) {
            return null;
        }

        try {
            JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
            String sql = "SELECT customer_id, first_name, last_name, email, phone " +
                    "FROM " + customerDbName + ".customers " +
                    "WHERE customer_id = ?";

            List<CustomerInfo> results = jdbcTemplate.query(sql, new CustomerRowMapper(), customerId);
            return results.isEmpty() ? null : results.get(0);
        } catch (Exception e) {
            log.error("Error fetching customer info for ID: {}", customerId, e);
            return null;
        }
    }

    /**
     * Batch fetch multiple customers
     */
    public Map<Long, CustomerInfo> findByIds(Set<Long> customerIds) {
        Map<Long, CustomerInfo> customerMap = new HashMap<>();

        if (customerIds == null || customerIds.isEmpty()) {
            return customerMap;
        }

        try {
            JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
            String placeholders = String.join(",", customerIds.stream().map(id -> "?").toArray(String[]::new));
            String sql = "SELECT customer_id, first_name, last_name, email, phone " +
                    "FROM " + customerDbName + ".customers " +
                    "WHERE customer_id IN (" + placeholders + ")";

            List<CustomerInfo> results = jdbcTemplate.query(sql, new CustomerRowMapper(), customerIds.toArray());

            for (CustomerInfo customer : results) {
                customerMap.put(customer.getCustomerId(), customer);
            }
        } catch (Exception e) {
            log.error("Error batch fetching customer info for IDs: {}", customerIds, e);
        }

        return customerMap;
    }

    private static class CustomerRowMapper implements RowMapper<CustomerInfo> {
        @Override
        public CustomerInfo mapRow(ResultSet rs, int rowNum) throws SQLException {
            return CustomerInfo.builder()
                    .customerId(rs.getLong("customer_id"))
                    .firstName(rs.getString("first_name"))
                    .lastName(rs.getString("last_name"))
                    .email(rs.getString("email"))
                    .phone(rs.getString("phone"))
                    .build();
        }
    }
}
