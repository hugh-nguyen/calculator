package com.example.calculator; // replace with your group and artifact IDs

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CalculatorController {

    @GetMapping("/api/calculate")
    public ResponseEntity<?> calculate(
            @RequestParam String operation,
            @RequestParam double first,
            @RequestParam double second) {
        try {
            double result;
            switch (operation) {
                case "add":
                    result = first + second;
                    break;
                case "subtract":
                    result = first - second;
                    break;
                case "multiply":
                    result = first * second;
                    break;
                case "divide":
                    if (second == 0) throw new IllegalArgumentException("Cannot divide by zero.");
                    result = first / second;
                    break;
                default:
                    throw new IllegalArgumentException("Invalid operation.");
            }
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
