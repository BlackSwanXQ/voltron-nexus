package com.example.gridmonitor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;

@SpringBootApplication
//        (exclude = {KafkaAutoConfiguration.class})
//@EnableAutoConfiguration(exclude = {KafkaAutoConfiguration.class})
public class GridMonitorApplication {

    public static void main(String[] args) {
        SpringApplication.run(GridMonitorApplication.class, args);
    }

}
