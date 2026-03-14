package com.example.reporting_service.config;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.backoff.FixedBackOff;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@EnableKafka
@Configuration
public class KafkaConsumerConfig {
    
    @Value("${spring.kafka.bootstrap-servers}") 
    private String bootstrapServers;
    
    @Value("${spring.kafka.consumer.group-id}")
    private String groupId;
    
    @Value("${spring.kafka.consumer.auto-offset-reset}")
    private String offsetReset;

    @Value("${spring.kafka.consumer.properties.spring.json.trusted.packages:*}")
    private String trustedPackages;

    /**
     * ConsumerFactory với ErrorHandlingDeserializer bọc JsonDeserializer.
     * Khi gặp message không parse được, nó sẽ bỏ qua thay vì crash.
     */
    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, offsetReset);

        // Key deserializer: dùng ErrorHandlingDeserializer bọc StringDeserializer
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        props.put(ErrorHandlingDeserializer.KEY_DESERIALIZER_CLASS, StringDeserializer.class);

        // Value deserializer: dùng ErrorHandlingDeserializer bọc JsonDeserializer
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        props.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);

        // JsonDeserializer config: không dùng type headers, map về LinkedHashMap mặc định
        props.put(JsonDeserializer.TRUSTED_PACKAGES, trustedPackages);
        props.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, LinkedHashMap.class.getName());
        
        return new DefaultKafkaConsumerFactory<>(props);
    }

    /**
     * ContainerFactory với DefaultErrorHandler để skip message lỗi sau 3 lần retry.
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        
        // Error handler: retry 3 lần, mỗi lần cách 1 giây, sau đó skip message lỗi
        DefaultErrorHandler errorHandler = new DefaultErrorHandler(
            (record, exception) -> {
                log.error("Skipping bad Kafka record at topic={}, partition={}, offset={}: {}",
                    record.topic(), record.partition(), record.offset(), exception.getMessage());
            },
            new FixedBackOff(1000L, 2L) // 2 retries, 1 second interval
        );
        factory.setCommonErrorHandler(errorHandler);
        
        return factory;
    }
}