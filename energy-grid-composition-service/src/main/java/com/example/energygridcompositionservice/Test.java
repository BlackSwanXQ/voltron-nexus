package com.example.energygridcompositionservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
public class Test {

    public static void main(String[] args) {
            SpringApplication.run(Test.class, args);

//        ConfigurableApplicationContext context = SpringApplication.run(Test.class, args);
//
//        DemoService demoService = context.getBean(DemoService.class);
//        demoService.runDemo();
//
//        context.close();
    }
}