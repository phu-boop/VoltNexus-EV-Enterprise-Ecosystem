package com.ev.user_service.service;

import com.ev.user_service.dto.request.*;
import com.ev.user_service.dto.respond.ApiResponseManageDealer;
import com.ev.user_service.dto.respond.ProfileRespond;
import com.ev.user_service.entity.*;
import com.ev.user_service.enums.UserStatus;
import com.ev.user_service.repository.*;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.ev.user_service.dto.respond.UserRespond;
import com.ev.user_service.enums.RoleName;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.user_service.mapper.UserMapper;
import reactor.core.publisher.Sinks;

import java.io.PrintStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EvmStaffProfileService evmStaffProfileService;
    private final AdminProfileService adminProfileService;
    private final DealerManagerProfileService dealerManagerProfileService;
    private final DealerStaffProfileService dealerStaffProfileService;
    private final DealerStaffProfileRepository dealerStaffProfileRepository;
    private final DealerManagerProfileRepository dealerManagerProfileRepository;
    private final EvmStaffProfileRepository evmStaffProfileRepository;
    private final AdminProfileRepository adminProfileRepository;

    public UserService(PasswordEncoder passwordEncoder,
                       UserMapper userMapper,
                       UserRepository userRepository,
                       RoleRepository roleRepository,
                       EvmStaffProfileService evmStaffProfileService,
                       AdminProfileService adminProfileService,
                       DealerStaffProfileService dealerStaffProfileService,
                       DealerManagerProfileService dealerManagerProfileService,
                       DealerStaffProfileRepository dealerStaffProfileRepository,
                       DealerManagerProfileRepository dealerManagerProfileRepository,
                       EvmStaffProfileRepository evmStaffProfileRepository,
                       AdminProfileRepository adminProfileRepository
    ) {
        this.adminProfileService = adminProfileService;
        this.dealerManagerProfileService = dealerManagerProfileService;
        this.dealerStaffProfileService = dealerStaffProfileService;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.evmStaffProfileService = evmStaffProfileService;
        this.adminProfileRepository = adminProfileRepository;
        this.dealerStaffProfileRepository = dealerStaffProfileRepository;
        this.dealerManagerProfileRepository = dealerManagerProfileRepository;
        this.evmStaffProfileRepository = evmStaffProfileRepository;
    }

    public List<UserRespond> getAllUser() {
        return userRepository.findAll()
                .stream()
                .map(
                        userMapper::usertoUserRespond
                )
                .collect(Collectors.toList());
    }

    public List<UserRespond> getAllUserDealerManage() {
        return userRepository.findAll().stream().filter(user -> user.getRoleToString().contains("DEALER_MANAGER")).map(userMapper::usertoUserRespond).collect(Collectors.toList());
    }

    public List<UserRespond> getAllUserStaffDealer(UUID dealerId) {
        System.out.printf("pgufg",dealerId);
        return userRepository.findAll()
                .stream()
                .filter(user -> user.getRoleToString().contains("DEALER_STAFF"))
                .filter(user -> user.getDealerStaffProfile() != null)
                .filter(user -> dealerId == null ||
                        (user.getDealerStaffProfile().getDealerId() != null &&
                                dealerId.equals(user.getDealerStaffProfile().getDealerId())))
                .map(userMapper::usertoUserRespond)
                .collect(Collectors.toList());
    }


    public UserRespond getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.usertoUserRespond(user);
    }

    public UserRespond createUser(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        } else if (userRepository.existsByPhone(userRequest.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        User user = userMapper.userRequesttoUser(userRequest);
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        userRepository.save(user);
        return userMapper.usertoUserRespond(user);
    }

    public UserRespond createUserEvmAdmin(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        } else if (userRepository.existsByPhone(userRequest.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        User user = userMapper.userRequesttoUser(userRequest);
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(RoleName.ADMIN.getRoleName())
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
        roles.add(userRole);
        user.setRoles(roles);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        adminProfileService.SaveAdminProfile(user, null, null, null);
        return userMapper.usertoUserRespond(user);
    }

    public UserRespond createUserDealerStaff(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        } else if (userRepository.existsByPhone(userRequest.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        User user = userMapper.userRequesttoUser(userRequest);
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(RoleName.DEALER_STAFF.getRoleName())
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
        roles.add(userRole);
        user.setRoles(roles);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        dealerStaffProfileService.SaveDealerStaffProfile(user, userRequest.getDealerId(), userRequest.getPosition(), userRequest.getDepartment(), userRequest.getHireDate(), userRequest.getSalary(), userRequest.getCommissionRate());
        return userMapper.usertoUserRespond(user);
    }

    public UserRespond createUserEvmStaff(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        } else if (userRepository.existsByPhone(userRequest.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        User user = userMapper.userRequesttoUser(userRequest);
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(RoleName.EVM_STAFF.getRoleName())
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
        roles.add(userRole);
        user.setRoles(roles);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        evmStaffProfileService.SaveEvmStaffProfile(user, userRequest.getDepartment(), userRequest.getSpecialization());
        return userMapper.usertoUserRespond(user);
    }


    public UserRespond createUserDealerManager(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        } else if (userRepository.existsByPhone(userRequest.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        User user = userMapper.userRequesttoUser(userRequest);
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName(RoleName.DEALER_MANAGER.getRoleName())
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
        roles.add(userRole);
        user.setRoles(roles);
        user.setStatus(UserStatus.ACTIVE);
        // check dealer id
        if (dealerManagerProfileRepository.existsByDealerId(userRequest.getDealerId())) {
            throw new AppException(ErrorCode.DEALER_MANAGER_ALREADY_EXISTS);
        }
        userRepository.save(user);
        dealerManagerProfileService.SaveDealerManagerProfile(user, userRequest
                .getDealerId(), userRequest.getManagementLevel(), userRequest.getApprovalLimit(), userRequest.getDepartment());
        return userMapper.usertoUserRespond(user);
    }

    public UserRespond updateUserEvmStaff(UserUpdateRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getEmail() != null &&
                !request.getEmail().equals(user.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        if (request.getPhone() != null &&
                !request.getPhone().equals(user.getPhone()) &&
                userRepository.existsByPhone(request.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }

        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getName() != null) user.setName(request.getName());
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPassword() != null) user.setPassword(request.getPassword());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getCountry() != null) user.setCountry(request.getCountry());
        if (request.getBirthday() != null) user.setBirthday(request.getBirthday());
        if (request.getGender() != null) user.setGender(request.getGender());

        userRepository.save(user);

        EvmStaffProfile profile = evmStaffProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getDepartment() != null) profile.setDepartment(request.getDepartment());
        if (request.getSpecialization() != null) profile.setSpecialization(request.getSpecialization());

        evmStaffProfileRepository.save(profile);

        return userMapper.usertoUserRespond(user);
    }

    public UserRespond updateUserDealerStaff(DealerStaffUpdateRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getEmail() != null &&
                !request.getEmail().equals(user.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        if (request.getPhone() != null &&
                !request.getPhone().equals(user.getPhone()) &&
                userRepository.existsByPhone(request.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }

        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getName() != null) user.setName(request.getName());
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPassword() != null) user.setPassword(request.getPassword());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getCountry() != null) user.setCountry(request.getCountry());
        if (request.getBirthday() != null) user.setBirthday(request.getBirthday());
        if (request.getGender() != null) user.setGender(request.getGender());

        userRepository.save(user);

        DealerStaffProfile profile = dealerStaffProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getDealerId() != null) profile.setDealerId(request.getDealerId());
        if (request.getPosition() != null) profile.setPosition(request.getPosition());
        if (request.getDepartment() != null) profile.setDepartment(request.getDepartment());
        if (request.getHireDate() != null) profile.setHireDate(request.getHireDate());
        if (request.getSalary() != null) profile.setSalary(request.getSalary());
        if (request.getCommissionRate() != null) profile.setCommissionRate(request.getCommissionRate());

        dealerStaffProfileRepository.save(profile);

        return userMapper.usertoUserRespond(user);
    }

    public UserRespond updateUserDealerManager(DealerManagerUpdateRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getEmail() != null &&
                !request.getEmail().equals(user.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        if (request.getPhone() != null &&
                !request.getPhone().equals(user.getPhone()) &&
                userRepository.existsByPhone(request.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }

        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getName() != null) user.setName(request.getName());
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPassword() != null) user.setPassword(request.getPassword());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getCountry() != null) user.setCountry(request.getCountry());
        if (request.getBirthday() != null) user.setBirthday(request.getBirthday());
        if (request.getGender() != null) user.setGender(request.getGender());

        userRepository.save(user);

        DealerManagerProfile profile = dealerManagerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getDealerId() != null) profile.setDealerId(request.getDealerId());
        if (request.getManagementLevel() != null) profile.setManagementLevel(request.getManagementLevel());
        if (request.getApprovalLimit() != null) profile.setApprovalLimit(request.getApprovalLimit());
        if (request.getDepartment() != null) profile.setDepartment(request.getDepartment());

        dealerManagerProfileRepository.save(profile);

        return userMapper.usertoUserRespond(user);
    }

    public UserRespond updateUserEvmAdmin(AdminUpdateRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getEmail() != null &&
                !request.getEmail().equals(user.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        if (request.getPhone() != null &&
                !request.getPhone().equals(user.getPhone()) &&
                userRepository.existsByPhone(request.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }

        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getName() != null) user.setName(request.getName());
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPassword() != null) user.setPassword(request.getPassword());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getCountry() != null) user.setCountry(request.getCountry());
        if (request.getBirthday() != null) user.setBirthday(request.getBirthday());
        if (request.getGender() != null) user.setGender(request.getGender());

        userRepository.save(user);

        AdminProfile profile = adminProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));


        if (request.getDepartment() != null) profile.setAccessScope(request.getDepartment());
        if (request.getManagementLevel() != null) profile.setAdminLevel(request.getManagementLevel());
        if (request.getSpecialization() != null) profile.setSystemPermissions(request.getSpecialization());

        adminProfileRepository.save(profile);

        return userMapper.usertoUserRespond(user);
    }


    public UserRespond updateUser(UUID id, UserRequest userRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if ((user.getEmail() != null) && !user.getEmail().equals(userRequest.getEmail())
                && userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if ((user.getPhone() != null) && !user.getPhone().equals(userRequest.getPhone())
                && userRepository.existsByPhone(userRequest.getPhone())) {
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        }
        userMapper.updateUserFromRequest(userRequest, user);
        userRepository.save(user);
        return userMapper.usertoUserRespond(user);
    }

    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        userRepository.delete(user);
    }

    public ProfileRespond getCurrentProfileByIdUser(UUID id_user) {
        User user = userRepository.findById(id_user)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setPassword("đoán xemmmm");
        ProfileRespond.ProfileRespondBuilder builder = ProfileRespond.builder().user(user);

        return builder.build();
    }

    public User updateProfile(UpdateProfileRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Cập nhật thông tin cơ bản
        updateBasicInfo(user, request);

        userRepository.save(user);
        return user;
    }

    private void updateBasicInfo(User user, UpdateProfileRequest req) {
        if (req.getName() != null) user.setName(req.getName());
        if (req.getFullName() != null) user.setFullName(req.getFullName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getAddress() != null) user.setAddress(req.getAddress());
        if (req.getBirthday() != null) user.setBirthday(req.getBirthday());
        if (req.getCity() != null) user.setCity(req.getCity());
        if (req.getCountry() != null) user.setCountry(req.getCountry());
        if (req.getGender() != null) user.setGender(req.getGender());
        if (req.getUrl() != null) user.setUrl(req.getUrl());
    }

}
