package com.johns_web;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Controller {
    @RequestMapping("/hello")
    public String helloController() {
        return "<h1>Hello World</h1>";
    }      
}
