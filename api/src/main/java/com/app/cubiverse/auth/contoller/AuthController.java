package com.app.cubiverse.auth.contoller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.cubiverse.auth.dto.AuthResponse;
import com.app.cubiverse.auth.dto.LoginRequest;
import com.app.cubiverse.auth.dto.SignupRequest;
import com.app.cubiverse.auth.entity.User;
import com.app.cubiverse.auth.security.JwtUtil;
import com.app.cubiverse.auth.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        User newUser = userService.registerNewUser(request);
        //returning dummy token for now.
        return ResponseEntity.ok(new AuthResponse(jwtUtil.generateToken(newUser.getEmail()), newUser.getUsername(), newUser.getEmail(), newUser.getId().toString()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.authenticateUser(request);
        String token = jwtUtil.generateToken(user.getEmail());
        System.out.println(user);
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getEmail(), user.getId().toString()));
    }

    @GetMapping("/whoami")
    public ResponseEntity<AuthResponse> whoAmI(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.validateToken(token);

        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getEmail(), user.getId().toString()));
    }
    
}
