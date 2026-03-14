package com.ev.sales_service.client;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.sales_service.dto.response.CustomerResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
    name = "customer-service",
    url = "${app.services.customer.url}"
)
public interface CustomerClient {

    @GetMapping("customers/{id}")
    ApiRespond<CustomerResponse> getCustomerById(@PathVariable("id") Long id);
    
    @GetMapping("customers/profile/{profileId}")
    ApiRespond<CustomerResponse> getCustomerByProfileId(@PathVariable("profileId") String profileId);
}

