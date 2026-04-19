package com.ev.dealer_service.controller;

import com.ev.dealer_service.config.DevSecurityConfig;
import com.ev.dealer_service.dto.request.DealerRequest;
import com.ev.dealer_service.dto.response.DealerResponse;
import com.ev.dealer_service.service.DealerContractService;
import com.ev.dealer_service.service.Interface.DealerService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.test.context.ContextConfiguration;
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

@WebMvcTest(controllers = DealerController.class)
@ContextConfiguration(classes = {DealerController.class, DealerControllerWebMvcTest.TestConfig.class})
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("DealerController — slice test (MockMvc + mock DealerService)")
class DealerControllerWebMvcTest {

    @TestConfiguration
    static class TestConfig {
        // This minimal config ensures we don't scan for security/kafka/etc.
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DealerService dealerService;

    /** Cùng base path {@code /api/dealers} với {@link DealerContractController} — slice vẫn khởi tạo bean này. */
    @MockitoBean
    private DealerContractService dealerContractService;

    /**
     * Lấy tất cả đại lý - Kiểm tra phản hồi HTTP OK
     * - Tham số: Không có
     * - Mục tiêu: Kiểm tra xem endpoint GET /api/dealers có hoạt động và trả về dữ liệu đúng định dạng ApiResponse không.
     * - Cách thức: Giả lập DealerService trả về danh sách dealer, thực hiện gọi API qua MockMvc và kiểm tra status 200, success=true.
     * - Kết quả mong đợi: Status 200 OK, JSON body có field success=true và chứa dealerCode "D001".
     */
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

    /**
     * Lấy đại lý với tham số tìm kiếm (search)
     * - Tham số: String search (Các từ khóa: "Hanoi", "HCM", "EV")
     * - Mục tiêu: Xác nhận rằng khi có tham số search, controller sẽ gọi đúng phương thức searchDealers trong service.
     * - Cách thức: Thực hiện GET request với query param "search", kiểm tra service.searchDealers được gọi với đúng tham số.
     * - Kết quả mong đợi: Status 200 OK và service phụ trách tìm kiếm được kích hoạt.
     */
    @ParameterizedTest(name = "GET /api/dealers?search={0} — gọi searchDealers")
    @ValueSource(strings = {"Hanoi", "HCM", "EV"})
    void getAllDealers_withSearchParam_callsSearch_parameterized(String search) throws Exception {
        when(dealerService.searchDealers(eq(search))).thenReturn(List.of());

        mockMvc.perform(get("/api/dealers").param("search", search))
                .andExpect(status().isOk());

        verify(dealerService).searchDealers(search);
    }

    /**
     * @param city tham số {@code city} — chỉ khi không có search
     */
    @ParameterizedTest(name = "GET /api/dealers?city={0} — gọi getDealersByCity")
    @ValueSource(strings = {"Hue", "Hanoi", "Da Nang"})
    void getAllDealers_withCityParam_callsGetDealersByCity_parameterized(String city) throws Exception {
        when(dealerService.getDealersByCity(eq(city))).thenReturn(List.of());

        mockMvc.perform(get("/api/dealers").param("city", city))
                .andExpect(status().isOk());

        verify(dealerService).getDealersByCity(city);
    }

    /**
     * Khi cả {@code search} và {@code city} đều có — search được ưu tiên (không gọi getDealersByCity).
     */
    @ParameterizedTest(name = "search ưu tiên — search={0}, city={1}")
    @CsvSource(value = {
            "Hanoi|Hue",
            "a|b",
            "x|Hue"
    }, delimiterString = "|")
    void getAllDealers_searchTakesPrecedenceOverCity_parameterized(String search, String city) throws Exception {
        when(dealerService.searchDealers(eq(search))).thenReturn(List.of());

        mockMvc.perform(get("/api/dealers").param("search", search).param("city", city))
                .andExpect(status().isOk());

        verify(dealerService).searchDealers(search);
    }

    /**
     * Lấy đại lý theo ID (UUID)
     * - Tham số: String idString (Các chuỗi UUID giả lập)
     * - Mục tiêu: Kiểm tra xem endpoint GET /api/dealers/{id} có nhận diện đúng UUID và trả về dealer tương ứng không.
     * - Cách thức: Chuyển chuỗi sang UUID, giả lập service trả về response, thực hiện request và kiểm tra dữ liệu JSON.
     * - Kết quả mong đợi: Status 200 OK và mã dealer trong JSON trả về là "X".
     */
    @ParameterizedTest(name = "GET /api/dealers by UUID [{0}]")
    @ValueSource(strings = {
            "00000000-0000-0000-0000-000000000001",
            "ffffffff-ffff-ffff-ffff-ffffffffffff"
    })
    void getDealerById_returnsOk_parameterized(String idString) throws Exception {
        UUID id = UUID.fromString(idString);
        DealerResponse r = new DealerResponse();
        r.setDealerId(id);
        r.setDealerCode("X");
        when(dealerService.getDealerById(id)).thenReturn(r);

        mockMvc.perform(get("/api/dealers/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.dealerCode").value("X"));
    }

    /**
     * Tạo mới đại lý
     * - Tham số: DealerRequest (Body JSON chứa thông tin đại lý mới)
     * - Mục tiêu: Kiểm tra xem endpoint POST /api/dealers có tiếp nhận JSON, gọi service và trả về status 201 Created không.
     * - Cách thức: Tạo object request, serialze sang JSON, thực hiện POST request và kiểm tra status code.
     * - Kết quả mong đợi: Status 201 Created, JSON trả về có success=true và chứa đúng dealerCode "NEW".
     */
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
