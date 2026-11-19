package com.jabai.campustrack.Services;

import com.jabai.campustrack.DTOs.Requests.CreateUserRequestDto;
import com.jabai.campustrack.DTOs.Requests.LoginUserRequestDto;
import com.jabai.campustrack.DTOs.Requests.RegisterUserRequestDto;
import com.jabai.campustrack.DTOs.Requests.SearchUserRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateUserPasswordRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateUserProfileRequestDto;
import com.jabai.campustrack.DTOs.Requests.UpdateUserRequestDto;
import com.jabai.campustrack.DTOs.Responses.LoginUserResponseDto;
import com.jabai.campustrack.DTOs.Responses.RegisterUserResponseDto;
import com.jabai.campustrack.DTOs.Responses.UserProfileResponseDto;

import com.jabai.campustrack.Exceptions.CustomExceptions.DuplicatedRowException;
import com.jabai.campustrack.Exceptions.CustomExceptions.RowNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jabai.campustrack.Repositories.UserRepository;
import com.jabai.campustrack.Repositories.Specifications.UserSpecifications;
import com.jabai.campustrack.Exceptions.CustomExceptions.InvalidCredentialsException;
import com.jabai.campustrack.Securities.JwtUtil;
import com.jabai.campustrack.Models.*;
import com.jabai.campustrack.Models.Enums.UserRole;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

@Service
public class UserService {
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * ========== AUTHS ==========
     * Para sa auth controller
     */

    @Transactional
    public RegisterUserResponseDto registerUser(RegisterUserRequestDto dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent())
            throw new DuplicatedRowException("This email already exists.");

        User user = new User(dto.getEmail(), passwordEncoder.encode(dto.getPassword()), UserRole.STUDENT);

        UserProfile profile = new UserProfile(user);
        profile.setFirstName(dto.getFirstName());
        profile.setMiddleName(dto.getMiddleName());
        profile.setLastName(dto.getLastName());
        profile.setSuffix(dto.getSuffix());
        profile.setPhone(dto.getPhone());
        profile.setStudentNumber(dto.getStudentNumber());
        profile.setDepartment(dto.getDepartment());

        user.setProfile(profile);
        userRepository.save(user);

        return new RegisterUserResponseDto("Your account has successfully been created.");
    }

    public LoginUserResponseDto loginUser(LoginUserRequestDto loginUserRequestDto) throws RuntimeException {
        Optional<User> foundUser = userRepository.findByEmail(loginUserRequestDto.getEmail());

        if (foundUser.isEmpty())
            throw new RowNotFoundException("Unable to find user.");
        if (!passwordEncoder.matches(loginUserRequestDto.getPassword(), foundUser.get().getHashedPassword()))
            throw new InvalidCredentialsException("Your email or password is incorrect.");

        User currentUser = foundUser.get();
        String userToken = jwtUtil.generateToken(currentUser);

        return new LoginUserResponseDto(
                "Login success!",
                currentUser.getEmail(),
                userToken
        );
    }

    /**
     * ========== PROFILES ==========
     * Para sa profile controller
     */

    public UserProfileResponseDto getUserProfile(Long id) {
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new RowNotFoundException("User not found."));

        return UserProfileResponseDto.from(user);
    }

    @Transactional
    public UserProfileResponseDto updateUserProfile(Long id, UpdateUserProfileRequestDto dto) {
        User foundUser = userRepository
                .findById(id)
                .orElseThrow(() -> new RowNotFoundException("Unable to find the user."));

        String email = dto.getEmail();
        if (email != null) {
            userRepository
                    .findByEmail(email)
                    .ifPresent(user -> {
                        if (!user.getId().equals(id))
                            throw new DuplicatedRowException("This email already exists.");
                    });
            foundUser.setEmail(email);
        }

        UserProfile profile = foundUser.getProfile();
        if (dto.getFirstName() != null) profile.setFirstName(dto.getFirstName());
        if (dto.getMiddleName() != null) profile.setMiddleName(dto.getMiddleName());
        if (dto.getLastName() != null) profile.setLastName(dto.getLastName());
        if (dto.getSuffix() != null) profile.setSuffix(dto.getSuffix());
        if (dto.getPhone() != null) profile.setPhone(dto.getPhone());
        if (dto.getStudentNumber() != null) profile.setStudentNumber(dto.getStudentNumber());
        if (dto.getDepartment() != null) profile.setDepartment(dto.getDepartment());
        if (dto.getAvatarPath() != null) profile.setAvatarPath(dto.getAvatarPath());

        return UserProfileResponseDto.from(foundUser);
    }

    @Transactional
    public UserProfileResponseDto updateUserPassword(Long id, UpdateUserPasswordRequestDto updateUserPasswordRequestDto) {
        User foundUser = userRepository
                .findById(id)
                .orElseThrow(() -> new RowNotFoundException("Unable to find the user."));

        if (!passwordEncoder.matches(updateUserPasswordRequestDto.getCurrentPassword(), foundUser.getHashedPassword()))
            throw new InvalidCredentialsException("Your current password doesn't matched");

        foundUser.setHashedPassword(passwordEncoder.encode(updateUserPasswordRequestDto.getPassword()));

        return UserProfileResponseDto.from(foundUser);
    }

    public void deleteUser(Long id) {
        User foundUser = userRepository
                .findById(id)
                .orElseThrow(() -> new RowNotFoundException("Unable to find the user."));
        userRepository.delete(foundUser);
    }

    /**
     * ========== USER MANAGEMENT ==========
     * Para sa admin user controller
     */

    @Transactional
    public UserProfileResponseDto createUser(CreateUserRequestDto dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent())
            throw new DuplicatedRowException("This email already exists.");

        String studentNumber = dto.getStudentNumber();
        if (studentNumber != null && !studentNumber.isBlank()
                && userRepository.existsByProfile_StudentNumber(studentNumber))
            throw new DuplicatedRowException("This student number already exists.");

        User user = new User(dto.getEmail(), passwordEncoder.encode(dto.getPassword()), dto.getUserRole());

        UserProfile profile = new UserProfile(user);
        profile.setFirstName(dto.getFirstName());
        profile.setMiddleName(dto.getMiddleName());
        profile.setLastName(dto.getLastName());
        profile.setSuffix(dto.getSuffix());
        profile.setPhone(dto.getPhone());
        profile.setStudentNumber(studentNumber);
        profile.setDepartment(dto.getDepartment());
        if (dto.getUserRole() == UserRole.WORKER) profile.setAvailable(true);

        user.setProfile(profile);
        userRepository.save(user);

        return UserProfileResponseDto.from(user);
    }

    @Transactional(readOnly = true)
    public Page<UserProfileResponseDto> getAllUsers(Pageable pageable) {
        return userRepository
                .findAll(pageable)
                .map(UserProfileResponseDto::from);
    }

    @Transactional(readOnly = true)
    public Page<UserProfileResponseDto> searchUsers(SearchUserRequestDto request, Pageable pageable) {
        LocalDate fromDate = request.getFrom();
        LocalDate toDate = request.getTo();

        LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime to = toDate != null ? toDate.atTime(LocalTime.MAX) : null;

        Specification<User> specification = Specification
                .where(UserSpecifications.hasFirstNameKeyword(request.getFirstName()))
                .and(UserSpecifications.hasLastNameKeyword(request.getLastName()))
                .and(UserSpecifications.hasEmailKeyword(request.getEmail()))
                .and(UserSpecifications.hasRole(request.getUserRole()))
                .and(UserSpecifications.hasStudentNumber(request.getStudentNumber()))
                .and(UserSpecifications.hasDepartment(request.getDepartment()))
                .and(UserSpecifications.hasCreatedAtRange(from, to));

        return userRepository
                .findAll(specification, pageable)
                .map(UserProfileResponseDto::from);
    }

    @Transactional
    public UserProfileResponseDto updateUser(Long id, UpdateUserRequestDto dto) {
        User foundUser = userRepository
                .findById(id)
                .orElseThrow(() -> new RowNotFoundException("Unable to find the user."));

        if (dto.getUserRole() != null) foundUser.setUserRole(dto.getUserRole());
        if (dto.getPassword() != null) foundUser.setHashedPassword(passwordEncoder.encode(dto.getPassword()));

        UserProfile profile = foundUser.getProfile();
        if (dto.getAvailable() != null) profile.setAvailable(dto.getAvailable());
        if (dto.getLastAssignedAt() != null) profile.setLastAssignedAt(dto.getLastAssignedAt());

        return UserProfileResponseDto.from(foundUser);
    }
}
