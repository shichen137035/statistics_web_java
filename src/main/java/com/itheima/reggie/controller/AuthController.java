package com.itheima.reggie.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/check")
    public ResponseEntity<String> checkKey(@RequestBody Map<String, String> payload) {
        String inputKey = payload.get("key");

        String sql = "SELECT COUNT(*) FROM secret_key WHERE key_value = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, inputKey);

        if (count != null && count > 0) {
            return ResponseEntity.ok("success");  // 返回成功
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("error");  // 返回错误
        }
    }
}
