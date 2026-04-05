package com.ev.customer_service.controller;

import com.ev.customer_service.dto.request.*;
import com.ev.customer_service.dto.response.ComplaintResponse;
import com.ev.customer_service.dto.response.ComplaintStatisticsResponse;
import com.ev.customer_service.service.ComplaintService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ComplaintController.class)
class ComplaintControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockBean
        private ComplaintService complaintService;

        @Autowired
        private ObjectMapper objectMapper;

        private ComplaintResponse complaintResponse;

        @BeforeEach
        void setUp() {
                complaintResponse = new ComplaintResponse();
                complaintResponse.setComplaintId(1L);
                complaintResponse.setComplaintCode("FB-20231001-0001");
                complaintResponse.setDealerId("dealer-1");
        }

        @Test
        @WithMockUser(roles = "DEALER_STAFF")
        @DisplayName("Create Complaint")
        void createComplaint() throws Exception {
                CreateComplaintRequest request = new CreateComplaintRequest();
                request.setCustomerId(1L);
                request.setDealerId("dealer-1");
                request.setDescription("Test");
                request.setComplaintType(com.ev.customer_service.enums.ComplaintType.VEHICLE_QUALITY);
                request.setSeverity(com.ev.customer_service.enums.ComplaintSeverity.HIGH);

                Mockito.when(complaintService.createComplaint(any(CreateComplaintRequest.class)))
                                .thenReturn(complaintResponse);

                mockMvc.perform(post("/customers/api/complaints")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.complaintCode").value("FB-20231001-0001"));
        }

        @Test
        @WithMockUser(roles = "DEALER_MANAGER")
        @DisplayName("Assign Complaint")
        void assignComplaint() throws Exception {
                AssignComplaintRequest request = new AssignComplaintRequest();
                request.setAssignedStaffId("staff-1");
                request.setAssignedStaffName("Staff Name");

                Mockito.when(complaintService.assignComplaint(eq(1L), any(AssignComplaintRequest.class)))
                                .thenReturn(complaintResponse);

                mockMvc.perform(put("/customers/api/complaints/1/assign")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.complaintId").value(1L));
        }

        @Test
        @WithMockUser(roles = "DEALER_STAFF")
        @DisplayName("Add Progress Update")
        void addProgressUpdate() throws Exception {
                ComplaintProgressUpdate update = new ComplaintProgressUpdate();
                update.setUpdatedByStaffId("staff-1");
                update.setUpdateNote("Progress detail");

                Mockito.when(complaintService.addProgressUpdate(eq(1L), any(ComplaintProgressUpdate.class)))
                                .thenReturn(complaintResponse);

                mockMvc.perform(post("/customers/api/complaints/1/progress")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(update)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @WithMockUser(roles = "DEALER_STAFF")
        @DisplayName("Resolve Complaint")
        void resolveComplaint() throws Exception {
                ResolveComplaintRequest request = new ResolveComplaintRequest();
                request.setInternalResolution("Internal Notes");
                request.setResolvedByStaffId("staff-1");
                request.setCustomerMessage("Resolved");

                Mockito.when(complaintService.resolveComplaint(eq(1L), any(ResolveComplaintRequest.class)))
                                .thenReturn(complaintResponse);

                mockMvc.perform(put("/customers/api/complaints/1/resolve")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @WithMockUser(roles = "DEALER_MANAGER")
        @DisplayName("Close Complaint")
        void closeComplaint() throws Exception {
                Mockito.when(complaintService.closeComplaint(1L)).thenReturn(complaintResponse);

                mockMvc.perform(put("/customers/api/complaints/1/close")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @WithMockUser(roles = "DEALER_STAFF")
        @DisplayName("Get Complaint By Id")
        void getComplaintById() throws Exception {
                Mockito.when(complaintService.getComplaintById(1L)).thenReturn(complaintResponse);

                mockMvc.perform(get("/customers/api/complaints/1")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.complaintCode").value("FB-20231001-0001"));
        }

        @Test
        @WithMockUser(roles = "DEALER_MANAGER")
        @DisplayName("Get Complaints By Dealer")
        void getComplaintsByDealer() throws Exception {
                Mockito.when(complaintService.getComplaintsByDealer("dealer-1"))
                                .thenReturn(Arrays.asList(complaintResponse));

                mockMvc.perform(get("/customers/api/complaints/dealer/dealer-1")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data[0].complaintCode").value("FB-20231001-0001"));
        }

        @Test
        @WithMockUser(roles = "DEALER_MANAGER")
        @DisplayName("Filter Complaints")
        void filterComplaints() throws Exception {
                ComplaintFilterRequest filter = new ComplaintFilterRequest();
                filter.setDealerId("dealer-1");

                Page<ComplaintResponse> mockPage = new PageImpl<>(Arrays.asList(complaintResponse));
                Mockito.when(complaintService.filterComplaints(any(ComplaintFilterRequest.class))).thenReturn(mockPage);

                mockMvc.perform(post("/customers/api/complaints/filter")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(filter)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @WithMockUser(roles = "DEALER_MANAGER")
        @DisplayName("Get Statistics")
        void getStatistics() throws Exception {
                ComplaintStatisticsResponse stats = new ComplaintStatisticsResponse();
                stats.setTotalComplaints(100L);

                Mockito.when(complaintService.getStatistics(eq("dealer-1"), any(), any())).thenReturn(stats);

                mockMvc.perform(get("/customers/api/complaints/statistics")
                                .param("dealerId", "dealer-1")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.totalComplaints").value(100));
        }

        @Test
        @WithMockUser(roles = "DEALER_STAFF")
        @DisplayName("Send Notification To Customer")
        void sendNotificationToCustomer() throws Exception {
                Mockito.when(complaintService.sendNotificationToCustomer(1L)).thenReturn(complaintResponse);

                mockMvc.perform(post("/customers/api/complaints/1/send-notification")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }
}
