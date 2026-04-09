package com.ev.dealer_service.controller;

import com.ev.dealer_service.config.DevSecurityConfig;
import com.ev.dealer_service.dto.request.DealerRequest;
import com.ev.dealer_service.dto.response.DealerResponse;
import com.ev.dealer_service.service.Interface.DealerService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = DealerController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@WithMockUser(roles = "ADMIN")
@DisplayName("DealerController — slice test (MockMvc + mock DealerService)")
class DealerControllerWebMvcTest {

    @Configuration
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DealerService dealerService;

    @Test
    void getAllDealers_returnsOkAndWrappedBody() throws Exception {
        DealerResponse r = new DealerResponse();
        r.setDealerCode("D001");
        r.setDealerName("Demo");
        when(dealerService.getAllDealers()).thenReturn(List.of(r));

        mockMvc.perform(get("/api/dealers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].dealerCode").value("D001"));

        verify(dealerService).getAllDealers();
    }

    @Test
    void getAllDealers_withSearchParam_callsSearch() throws Exception {
        when(dealerService.searchDealers(eq("Hanoi"))).thenReturn(List.of());

        mockMvc.perform(get("/api/dealers").param("search", "Hanoi"))
                .andExpect(status().isOk());

        verify(dealerService).searchDealers("Hanoi");
    }

    @Test
    void getDealerById_returnsOk() throws Exception {
        UUID id = UUID.randomUUID();
        DealerResponse r = new DealerResponse();
        r.setDealerId(id);
        r.setDealerCode("X");
        when(dealerService.getDealerById(id)).thenReturn(r);

        mockMvc.perform(get("/api/dealers/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.dealerCode").value("X"));
    }

    @Test
    void createDealer_returns201() throws Exception {
        DealerRequest body = new DealerRequest();
        body.setDealerCode("NEW");
        body.setDealerName("New Dealer");

        DealerResponse saved = new DealerResponse();
        saved.setDealerCode("NEW");
        saved.setDealerName("New Dealer");
        when(dealerService.createDealer(any(DealerRequest.class))).thenReturn(saved);

        mockMvc.perform(post("/api/dealers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.dealerCode").value("NEW"));
    }
}
