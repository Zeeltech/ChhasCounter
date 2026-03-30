package com.chhas.tracker.service;

import com.chhas.tracker.dto.CreateUserRequest;
import com.chhas.tracker.dto.UserDTO;
import com.chhas.tracker.entity.User;
import com.chhas.tracker.repository.BulkPackRepository;
import com.chhas.tracker.repository.ConsumptionLogRepository;
import com.chhas.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BulkPackRepository bulkPackRepository;
    private final ConsumptionLogRepository consumptionLogRepository;

    public UserDTO createUser(CreateUserRequest request) {
        if (userRepository.existsByName(request.getName().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User '" + request.getName() + "' already exists");
        }
        User user = new User(request.getName().trim());
        return toDTO(userRepository.save(user));
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        return toDTO(findById(id));
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = findById(id);

        boolean hasLogs = consumptionLogRepository.existsByUserId(user.getId());
        if (hasLogs) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Cannot delete '" + user.getName() + "': they have consumption records. Remove their log entries first.");
        }

        boolean isParticipant = bulkPackRepository.findAll().stream()
                .anyMatch(pack -> pack.getParticipants().stream().anyMatch(p -> p.getId().equals(user.getId())));
        if (isParticipant) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Cannot delete '" + user.getName() + "': they are a participant in one or more packs. Remove them from the pack first.");
        }

        userRepository.delete(user);
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
    }

    public UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
