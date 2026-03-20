package com.ev.sales_service.config;

import com.ev.sales_service.dto.response.QuotationResponse;
import com.ev.sales_service.entity.Quotation;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration()
                .setMatchingStrategy(MatchingStrategies.STRICT)
                .setSkipNullEnabled(true);

        // Custom mapping for Quotation to QuotationResponse
        modelMapper.createTypeMap(Quotation.class, QuotationResponse.class)
                .addMapping(Quotation::getPromotions, QuotationResponse::setAppliedPromotions);

        return modelMapper;
    }
}