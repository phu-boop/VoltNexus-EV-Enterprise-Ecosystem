package com.ev.customer_service.bva;

import com.ev.customer_service.dto.request.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * BVA Test Cases for Member 2: Customer Experience (Test Drive & Reviews)
 * 
 * Test Classes:
 * 1. PublicTestDriveRequestBVATest
 * 2. TestDriveRequestBVATest
 * 3. UpdateTestDriveRequestBVATest
 * 4. VehicleReviewRequestBVATest
 * 5. TestDriveFeedbackRequestBVATest
 * 6. ChargingStationRequestBVATest
 */

@SpringBootTest
@AutoConfigureMockMvc
public class CustomerServiceBVATest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // ==================== PublicTestDriveRequest BVA Tests ====================

    @SpringBootTest
    @AutoConfigureMockMvc
    @DisplayName("BVA Tests for PublicTestDriveRequest")
    public static class PublicTestDriveRequestBVATest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Test
        @DisplayName("TD001 - customerName Below Minimum (1 char) should return 400")
        void testCustomerNameBelowMinimum() throws Exception {
            PublicTestDriveRequest request = new PublicTestDriveRequest();
            request.setDealerId("550e8400-e29b-41d4-a716-446655440000");
            request.setModelId(1L);
            request.setCustomerName("A"); // Below minimum of 2
            request.setCustomerPhone("0912345678");
            request.setCustomerEmail("test@example.com");
            request.setAppointmentDate(LocalDateTime.now().plusDays(5));
            request.setDurationMinutes(15);
            request.setTestDriveLocation("Dealer Branch 1");

            mockMvc.perform(post("/customers/api/test-drives/public")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("TD002 - customerName At Minimum (2 chars) should return 201")
        void testCustomerNameAtMinimum() throws Exception {
            PublicTestDriveRequest request = createValidPublicTestDriveRequest();
            request.setCustomerName("AB"); // At minimum of 2

            mockMvc.perform(post("/customers/api/test-drives/public")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("TD005 - customerName At Maximum (100 chars) should return 201")
        void testCustomerNameAtMaximum() throws Exception {
            PublicTestDriveRequest request = createValidPublicTestDriveRequest();
            request.setCustomerName("A".repeat(100)); // At maximum of 100

            mockMvc.perform(post("/customers/api/test-drives/public")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("TD006 - customerName Above Maximum (101 chars) should return 400")
        void testCustomerNameAboveMaximum() throws Exception {
            PublicTestDriveRequest request = createValidPublicTestDriveRequest();
            request.setCustomerName("A".repeat(101)); // Above maximum of 100

            mockMvc.perform(post("/customers/api/test-drives/public")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("TD009 - durationMinutes Below Minimum (14) should return 400")
        void testDurationBelowMinimum() throws Exception {
            PublicTestDriveRequest request = createValidPublicTestDriveRequest();
            request.setDurationMinutes(14); // Below minimum of 15

            mockMvc.perform(post("/customers/api/test-drives/public")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("TD010 - durationMinutes At Minimum (15) should return 201")
        void testDurationAtMinimum() throws Exception {
            PublicTestDriveRequest request = createValidPublicTestDriveRequest();
            request.setDurationMinutes(15); // At minimum

            mockMvc.perform(post("/customers/api/test-drives/public")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("TD013 - durationMinutes At Maximum (240) should return 201")
        void testDurationAtMaximum() throws Exception {
            PublicTestDriveRequest request = createValidPublicTestDriveRequest();
            request.setDurationMinutes(240); // At maximum

            mockMvc.perform(post("/customers/api/test-drives/public")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("TD014 - durationMinutes Above Maximum (241) should return 400")
        void testDurationAboveMaximum() throws Exception {
            PublicTestDriveRequest request = createValidPublicTestDriveRequest();
            request.setDurationMinutes(241); // Above maximum of 240

            mockMvc.perform(post("/customers/api/test-drives/public")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("TD017 - customerPhone Below Minimum (9 digits) should return 400")
        void testPhoneBelowMinimum() throws Exception {
            PublicTestDriveRequest request = createValidPublicTestDriveRequest();
            request.setCustomerPhone("123456789"); // Below minimum of 10

            mockMvc.perform(post("/customers/api/test-drives/public")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("TD018 - customerPhone At Minimum (10 digits) should return 201")
        void testPhoneAtMinimum() throws Exception {
            PublicTestDriveRequest request = createValidPublicTestDriveRequest();
            request.setCustomerPhone("1234567890"); // At minimum of 10

            mockMvc.perform(post("/customers/api/test-drives/public")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("TD019 - customerPhone At Maximum (11 digits) should return 201")
        void testPhoneAtMaximum() throws Exception {
            PublicTestDriveRequest request = createValidPublicTestDriveRequest();
            request.setCustomerPhone("12345678901"); // At maximum of 11

            mockMvc.perform(post("/customers/api/test-drives/public")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("TD020 - customerPhone Above Maximum (12 digits) should return 400")
        void testPhoneAboveMaximum() throws Exception {
            PublicTestDriveRequest request = createValidPublicTestDriveRequest();
            request.setCustomerPhone("123456789012"); // Above maximum of 11

            mockMvc.perform(post("/customers/api/test-drives/public")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        private PublicTestDriveRequest createValidPublicTestDriveRequest() {
            PublicTestDriveRequest request = new PublicTestDriveRequest();
            request.setDealerId("550e8400-e29b-41d4-a716-446655440000");
            request.setModelId(1L);
            request.setCustomerName("John Doe");
            request.setCustomerPhone("0912345678");
            request.setCustomerEmail("test@example.com");
            request.setAppointmentDate(LocalDateTime.now().plusDays(5));
            request.setDurationMinutes(30);
            request.setTestDriveLocation("Dealer Branch 1");
            return request;
        }
    }

    // ==================== VehicleReviewRequest BVA Tests ====================

    @SpringBootTest
    @AutoConfigureMockMvc
    @DisplayName("BVA Tests for VehicleReviewRequest")
    public static class VehicleReviewRequestBVATest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Test
        @DisplayName("VR001 - rating Below Minimum (0) should return 400")
        void testRatingBelowMinimum() throws Exception {
            VehicleReviewRequest request = createValidVehicleReviewRequest();
            request.setRating(0); // Below minimum of 1

            mockMvc.perform(post("/customers/api/reviews")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("VR002 - rating At Minimum (1) should return 201")
        void testRatingAtMinimum() throws Exception {
            VehicleReviewRequest request = createValidVehicleReviewRequest();
            request.setRating(1); // At minimum

            mockMvc.perform(post("/customers/api/reviews")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("VR005 - rating At Maximum (5) should return 201")
        void testRatingAtMaximum() throws Exception {
            VehicleReviewRequest request = createValidVehicleReviewRequest();
            request.setRating(5); // At maximum

            mockMvc.perform(post("/customers/api/reviews")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("VR006 - rating Above Maximum (6) should return 400")
        void testRatingAboveMaximum() throws Exception {
            VehicleReviewRequest request = createValidVehicleReviewRequest();
            request.setRating(6); // Above maximum of 5

            mockMvc.perform(post("/customers/api/reviews")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("VR012 - title At Maximum (200 chars) should return 201")
        void testTitleAtMaximum() throws Exception {
            VehicleReviewRequest request = createValidVehicleReviewRequest();
            request.setTitle("A".repeat(200)); // At maximum

            mockMvc.perform(post("/customers/api/reviews")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("VR013 - title Above Maximum (201 chars) should return 400")
        void testTitleAboveMaximum() throws Exception {
            VehicleReviewRequest request = createValidVehicleReviewRequest();
            request.setTitle("A".repeat(201)); // Above maximum

            mockMvc.perform(post("/customers/api/reviews")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("VR015 - reviewText At Minimum (10 chars) should return 201")
        void testReviewTextAtMinimum() throws Exception {
            VehicleReviewRequest request = createValidVehicleReviewRequest();
            request.setReviewText("1234567890"); // At minimum

            mockMvc.perform(post("/customers/api/reviews")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("VR014 - reviewText Below Minimum (9 chars) should return 400")
        void testReviewTextBelowMinimum() throws Exception {
            VehicleReviewRequest request = createValidVehicleReviewRequest();
            request.setReviewText("123456789"); // Below minimum of 10

            mockMvc.perform(post("/customers/api/reviews")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("VR018 - reviewText At Maximum (2000 chars) should return 201")
        void testReviewTextAtMaximum() throws Exception {
            VehicleReviewRequest request = createValidVehicleReviewRequest();
            request.setReviewText("A".repeat(2000)); // At maximum

            mockMvc.perform(post("/customers/api/reviews")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("VR019 - reviewText Above Maximum (2001 chars) should return 400")
        void testReviewTextAboveMaximum() throws Exception {
            VehicleReviewRequest request = createValidVehicleReviewRequest();
            request.setReviewText("A".repeat(2001)); // Above maximum

            mockMvc.perform(post("/customers/api/reviews")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("VR021-VR030 - Optional rating fields validation")
        void testOptionalRatingFields() throws Exception {
            VehicleReviewRequest request = createValidVehicleReviewRequest();
            
            // Test performanceRating boundaries
            request.setPerformanceRating(0); // Below minimum
            mockMvc.perform(post("/customers/api/reviews")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());

            request.setPerformanceRating(1); // At minimum
            mockMvc.perform(post("/customers/api/reviews")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());

            request.setPerformanceRating(6); // Above maximum
            mockMvc.perform(post("/customers/api/reviews")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        private VehicleReviewRequest createValidVehicleReviewRequest() {
            VehicleReviewRequest request = new VehicleReviewRequest();
            request.setCustomerId(1L);
            request.setModelId(1L);
            request.setRating(4);
            request.setTitle("Great car");
            request.setReviewText("This is a wonderful car with excellent performance");
            return request;
        }
    }

    // ==================== ChargingStationRequest BVA Tests ====================

    @SpringBootTest
    @AutoConfigureMockMvc
    @DisplayName("BVA Tests for ChargingStationRequest")
    public static class ChargingStationRequestBVATest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Test
        @DisplayName("CS004 - stationName At Maximum (200 chars) should return 201")
        void testStationNameAtMaximum() throws Exception {
            ChargingStationRequest request = createValidChargingStationRequest();
            request.setStationName("A".repeat(200)); // At maximum

            mockMvc.perform(post("/customers/api/charging-stations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("CS005 - stationName Above Maximum (201 chars) should return 400")
        void testStationNameAboveMaximum() throws Exception {
            ChargingStationRequest request = createValidChargingStationRequest();
            request.setStationName("A".repeat(201)); // Above maximum

            mockMvc.perform(post("/customers/api/charging-stations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("CS009 - address At Maximum (500 chars) should return 201")
        void testAddressAtMaximum() throws Exception {
            ChargingStationRequest request = createValidChargingStationRequest();
            request.setAddress("A".repeat(500)); // At maximum

            mockMvc.perform(post("/customers/api/charging-stations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("CS010 - address Above Maximum (501 chars) should return 400")
        void testAddressAboveMaximum() throws Exception {
            ChargingStationRequest request = createValidChargingStationRequest();
            request.setAddress("A".repeat(501)); // Above maximum

            mockMvc.perform(post("/customers/api/charging-stations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("CS021 - totalChargers Below Minimum (0) should return 400")
        void testTotalChargersBelow() throws Exception {
            ChargingStationRequest request = createValidChargingStationRequest();
            request.setTotalChargers(0); // Below minimum of 1

            mockMvc.perform(post("/customers/api/charging-stations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("CS022 - totalChargers At Minimum (1) should return 201")
        void testTotalChargersAtMinimum() throws Exception {
            ChargingStationRequest request = createValidChargingStationRequest();
            request.setTotalChargers(1); // At minimum

            mockMvc.perform(post("/customers/api/charging-stations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("CS030 - latitude Below Minimum (-91) should return 400")
        void testLatitudeBelowMinimum() throws Exception {
            ChargingStationRequest request = createValidChargingStationRequest();
            request.setLatitude(new BigDecimal("-91")); // Below minimum of -90

            mockMvc.perform(post("/customers/api/charging-stations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("CS031 - latitude At Minimum (-90) should return 201")
        void testLatitudeAtMinimum() throws Exception {
            ChargingStationRequest request = createValidChargingStationRequest();
            request.setLatitude(new BigDecimal("-90")); // At minimum

            mockMvc.perform(post("/customers/api/charging-stations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("CS033 - latitude At Maximum (90) should return 201")
        void testLatitudeAtMaximum() throws Exception {
            ChargingStationRequest request = createValidChargingStationRequest();
            request.setLatitude(new BigDecimal("90")); // At maximum

            mockMvc.perform(post("/customers/api/charging-stations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("CS034 - latitude Above Maximum (91) should return 400")
        void testLatitudeAboveMaximum() throws Exception {
            ChargingStationRequest request = createValidChargingStationRequest();
            request.setLatitude(new BigDecimal("91")); // Above maximum of 90

            mockMvc.perform(post("/customers/api/charging-stations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("CS036 - longitude Below Minimum (-181) should return 400")
        void testLongitudeBelowMinimum() throws Exception {
            ChargingStationRequest request = createValidChargingStationRequest();
            request.setLongitude(new BigDecimal("-181")); // Below minimum of -180

            mockMvc.perform(post("/customers/api/charging-stations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("CS037 - longitude At Minimum (-180) should return 201")
        void testLongitudeAtMinimum() throws Exception {
            ChargingStationRequest request = createValidChargingStationRequest();
            request.setLongitude(new BigDecimal("-180")); // At minimum

            mockMvc.perform(post("/customers/api/charging-stations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        private ChargingStationRequest createValidChargingStationRequest() {
            ChargingStationRequest request = new ChargingStationRequest();
            request.setStationName("Downtown Charging Hub");
            request.setAddress("123 Main Street, Ho Chi Minh City");
            request.setCity("Ho Chi Minh");
            request.setProvince("HCMC");
            request.setLatitude(new BigDecimal("10.77"));
            request.setLongitude(new BigDecimal("106.70"));
            request.setTotalChargers(5);
            request.setAvailableChargers(3);
            request.setMaxPowerKw(150);
            return request;
        }
    }

    // ==================== TestDriveFeedbackRequest BVA Tests ====================

    @SpringBootTest
    @AutoConfigureMockMvc
    @DisplayName("BVA Tests for TestDriveFeedbackRequest")
    public static class TestDriveFeedbackRequestBVATest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Test
        @DisplayName("TDF001 - feedbackRating Below Minimum (0) should return 400")
        void testFeedbackRatingBelowMinimum() throws Exception {
            TestDriveFeedbackRequest request = createValidTestDriveFeedbackRequest();
            request.setFeedbackRating(0); // Below minimum of 1

            mockMvc.perform(post("/customers/api/test-drives/{id}/feedback", 1L)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("TDF002 - feedbackRating At Minimum (1) should return 200")
        void testFeedbackRatingAtMinimum() throws Exception {
            TestDriveFeedbackRequest request = createValidTestDriveFeedbackRequest();
            request.setFeedbackRating(1); // At minimum

            mockMvc.perform(post("/customers/api/test-drives/{id}/feedback", 1L)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("TDF005 - feedbackRating At Maximum (5) should return 200")
        void testFeedbackRatingAtMaximum() throws Exception {
            TestDriveFeedbackRequest request = createValidTestDriveFeedbackRequest();
            request.setFeedbackRating(5); // At maximum

            mockMvc.perform(post("/customers/api/test-drives/{id}/feedback", 1L)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("TDF006 - feedbackRating Above Maximum (6) should return 400")
        void testFeedbackRatingAboveMaximum() throws Exception {
            TestDriveFeedbackRequest request = createValidTestDriveFeedbackRequest();
            request.setFeedbackRating(6); // Above maximum of 5

            mockMvc.perform(post("/customers/api/test-drives/{id}/feedback", 1L)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        private TestDriveFeedbackRequest createValidTestDriveFeedbackRequest() {
            TestDriveFeedbackRequest request = new TestDriveFeedbackRequest();
            request.setFeedbackRating(4);
            request.setFeedbackComment("Great experience!");
            request.setStaffNotes("Customer satisfied with vehicle");
            return request;
        }
    }
}
