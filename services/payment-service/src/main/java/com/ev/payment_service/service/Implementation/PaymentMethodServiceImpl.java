package com.ev.payment_service.service.Implementation;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode; // << Import từ common-lib
import com.ev.payment_service.dto.request.PaymentMethodRequest;
import com.ev.payment_service.dto.response.PaymentMethodResponse;
import com.ev.payment_service.entity.PaymentMethod;
import com.ev.payment_service.mapper.PaymentMethodMapper;
import com.ev.payment_service.repository.PaymentMethodRepository;
import com.ev.payment_service.service.Interface.IPaymentMethodService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Tự động @Autowired
public class PaymentMethodServiceImpl implements IPaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;
    private final PaymentMethodMapper paymentMethodMapper;

    @Override
    @Transactional // Dùng Transaction cho CUD
    public PaymentMethodResponse createPaymentMethod(PaymentMethodRequest request) {
        // Dùng Mapper để chuyển DTO -> Entity
        PaymentMethod paymentMethod = paymentMethodMapper.toEntity(request);

        // Lưu vào DB
        PaymentMethod savedEntity = paymentMethodRepository.save(paymentMethod);

        // Dùng Mapper để chuyển Entity -> Response DTO và trả về
        return paymentMethodMapper.toResponse(savedEntity);
    }

    @Override
    @Transactional
    public PaymentMethodResponse updatePaymentMethod(UUID methodId, PaymentMethodRequest request) {
        // Tìm entity, nếu không thấy, ném lỗi 404
        PaymentMethod existingMethod = paymentMethodRepository.findById(methodId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND)); // << Dùng AppException

        // Dùng Mapper để cập nhật
        paymentMethodMapper.updateEntityFromRequest(request, existingMethod);

        PaymentMethod updatedEntity = paymentMethodRepository.save(existingMethod);

        return paymentMethodMapper.toResponse(updatedEntity);
    }

    @Override
    @Transactional(readOnly = true) // Chỉ đọc
    public List<PaymentMethodResponse> getAllPaymentMethods() {
        return paymentMethodRepository.findAll().stream()
                .map(paymentMethodMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentMethodResponse> getActivePublicMethods() {
        // Dùng query B2C chúng ta đã tạo
        return paymentMethodRepository.findActiveB2CMethods().stream()
                .map(paymentMethodMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentMethodResponse getPaymentMethodById(UUID methodId) {
        PaymentMethod entity = paymentMethodRepository.findById(methodId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        return paymentMethodMapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentMethodResponse> getActiveB2BMethods() {
        return paymentMethodRepository.findActiveB2BMethods().stream()
                .map(paymentMethodMapper::toResponse)
                .collect(Collectors.toList());
    }
}