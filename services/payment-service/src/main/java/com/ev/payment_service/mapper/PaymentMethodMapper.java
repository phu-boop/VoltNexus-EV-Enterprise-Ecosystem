package com.ev.payment_service.mapper;

import com.ev.payment_service.dto.request.PaymentMethodRequest;
import com.ev.payment_service.dto.response.PaymentMethodResponse;
import com.ev.payment_service.entity.PaymentMethod;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring") // Báo cho Spring biết đây là một Bean
public interface PaymentMethodMapper {

    // 1. Từ Request DTO -> Entity (cho việc tạo mới)
    PaymentMethod toEntity(PaymentMethodRequest request);

    // 2. Từ Entity -> Response DTO (cho việc trả về)
    PaymentMethodResponse toResponse(PaymentMethod entity);

    // 3. Cập nhật Entity từ Request DTO (cho việc update)
    // (Bỏ qua methodId vì chúng ta không update PK)
    @Mapping(target = "methodId", ignore = true)
    void updateEntityFromRequest(PaymentMethodRequest request, @MappingTarget PaymentMethod entity);
}