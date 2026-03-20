package com.example.reporting_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ApiRespond<T> {
    private int status;
    private String message;
    private T data;
}
