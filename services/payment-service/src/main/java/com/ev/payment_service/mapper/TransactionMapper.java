package com.ev.payment_service.mapper;

import com.ev.payment_service.dto.response.TransactionResponse;
import com.ev.payment_service.entity.Transaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TransactionMapper {

    @Mapping(source = "paymentMethod.methodName", target = "paymentMethodName")
    @Mapping(source = "paymentRecord.orderId", target = "orderId")
    TransactionResponse toResponse(Transaction transaction);
}