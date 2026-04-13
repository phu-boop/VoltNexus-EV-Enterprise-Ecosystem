
package com.ev.user_service.service;

import com.ev.common_lib.exception.AppException;
import com.ev.user_service.dto.request.*;
import com.ev.user_service.dto.respond.ProfileRespond;
import com.ev.user_service.dto.respond.UserRespond;
import com.ev.user_service.entity.*;
import com.ev.user_service.enums.RoleName;
import com.ev.user_service.enums.UserStatus;
import com.ev.user_service.mapper.UserMapper;
import com.ev.user_service.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UserMapper userMapper;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private EvmStaffProfileService evmStaffProfileService;
    @Mock
    private AdminProfileService adminProfileService;
    @Mock
    private DealerManagerProfileService dealerManagerProfileService;
    @Mock
    private DealerStaffProfileService dealerStaffProfileService;
    @Mock
    private DealerStaffProfileRepository dealerStaffProfileRepository;
    @Mock
    private DealerManagerProfileRepository dealerManagerProfileRepository;
    @Mock
    private EvmStaffProfileRepository evmStaffProfileRepository;
    @Mock
    private AdminProfileRepository adminProfileRepository;

    @InjectMocks
    private UserService userService;

    private User user;
    private UserRequest userRequest;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        user = new User();
        user.setId(userId);
        user.setEmail("test@example.com");
        user.setPhone("0123456789");
        user.setPassword("hashedPassword");
        user.setStatus(UserStatus.ACTIVE);

        userRequest = new UserRequest();
        userRequest.setEmail("test@example.com");
        userRequest.setPhone("0123456789");
        userRequest.setPassword("password");
        userRequest.setName("Test");
    }

    @Nested
    @DisplayName("Tests for getAllUser")
    class GetAllUserTests {
        @Test
        @DisplayName("Should return list of users")
        void getAllUser_ShouldReturnListOfUserRespond() {
            when(userRepository.findAll((org.springframework.data.domain.Pageable) any())).thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(user)));
            when(userMapper.usertoUserRespond(any(User.class))).thenReturn(new UserRespond());

            org.springframework.data.domain.Page<UserRespond> result = userService.getAllUser(1, 10, "id", "asc");

            assertThat(result.getContent()).hasSize(1);
            verify(userRepository).findAll((org.springframework.data.domain.Pageable) any());
            verify(userMapper).usertoUserRespond(user);
        }

        @Test
        @DisplayName("Should return users with DEALER_MANAGER role")
        void getAllUserDealerManage_ShouldReturnFilteredList() {
            User manager = new User();
            Role role = new Role();
            role.setName("DEALER_MANAGER");
            manager.setRoles(Set.of(role));

            when(userRepository.findByRoleName("DEALER_MANAGER")).thenReturn(List.of(manager));
            when(userMapper.usertoUserRespond(manager)).thenReturn(new UserRespond());

            List<UserRespond> result = userService.getAllUserDealerManage();

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should return filtered staff for a dealer")
        void getAllUserStaffDealer_ShouldReturnFilteredList() {
            UUID dealerId = UUID.randomUUID();
            User staff = new User();
            Role role = new Role();
            role.setName("DEALER_STAFF");
            staff.setRoles(Set.of(role));
            DealerStaffProfile profile = new DealerStaffProfile();
            profile.setDealerId(dealerId);
            staff.setDealerStaffProfile(profile);

            when(userRepository.findByRoleName("DEALER_STAFF")).thenReturn(List.of(staff));
            when(userMapper.usertoUserRespond(staff)).thenReturn(new UserRespond());

            List<UserRespond> result = userService.getAllUserStaffDealer(dealerId);

            assertThat(result).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Tests for getUserById")
    class GetUserByIdTests {
        @Test
        @DisplayName("Should return user when found")
        void getUserById_WhenUserExists_ShouldReturnUserRespond() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(userMapper.usertoUserRespond(user)).thenReturn(new UserRespond());

            UserRespond result = userService.getUserById(userId);

            assertThat(result).isNotNull();
            verify(userRepository).findById(userId);
        }

        @Test
        @DisplayName("Should throw AppException when user not found")
        void getUserById_WhenUserDoesNotExist_ShouldThrowAppException() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getUserById(userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Không tìm thấy người dùng");
        }
    }

    @Nested
    @DisplayName("Tests for createUser")
    class CreateUserTests {
        @Test
        @DisplayName("Should create normal user successfully")
        void createUser_ShouldSucceed() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userRepository.existsByPhone(anyString())).thenReturn(false);
            when(userMapper.userRequesttoUser(any(UserRequest.class))).thenReturn(user);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(userMapper.usertoUserRespond(any(User.class))).thenReturn(new UserRespond());

            UserRespond result = userService.createUser(userRequest);

            assertThat(result).isNotNull();
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Should throw exception if email exists")
        void createUser_WhenEmailExists_ShouldThrowAppException() {
            when(userRepository.existsByEmail(anyString())).thenReturn(true);

            assertThatThrownBy(() -> userService.createUser(userRequest))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Email đã tồn tại");
        }

        @Test
        @DisplayName("Should throw exception if phone exists")
        void createUser_WhenPhoneExists_ShouldThrowAppException() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userRepository.existsByPhone(anyString())).thenReturn(true);

            assertThatThrownBy(() -> userService.createUser(userRequest))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Số điện thoại đã tồn tại");
        }
    }

    @Nested
    @DisplayName("Tests for createUserEvmAdmin")
    class CreateUserEvmAdminTests {
        @Test
        @DisplayName("Should create EVM admin successfully")
        void createUserEvmAdmin_ShouldSucceed() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userRepository.existsByPhone(anyString())).thenReturn(false);
            when(userMapper.userRequesttoUser(any(UserRequest.class))).thenReturn(user);
            when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");

            Role role = new Role();
            role.setName(RoleName.ADMIN.getRoleName());
            when(roleRepository.findByName(RoleName.ADMIN.getRoleName())).thenReturn(Optional.of(role));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(userMapper.usertoUserRespond(any(User.class))).thenReturn(new UserRespond());

            UserRespond result = userService.createUserEvmAdmin(userRequest);

            assertThat(result).isNotNull();
            verify(userRepository).save(user);
            verify(adminProfileService).SaveAdminProfile(any(User.class), isNull(), isNull(), isNull());
        }
    }

    @Nested
    @DisplayName("Tests for other role creations")
    class RoleCreationTests {
        @Test
        @DisplayName("Should create Dealer Staff successfully")
        void createUserDealerStaff_ShouldSucceed() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userMapper.userRequesttoUser(userRequest)).thenReturn(user);
            Role role = new Role();
            role.setName(RoleName.DEALER_STAFF.getRoleName());
            when(roleRepository.findByName(anyString())).thenReturn(Optional.of(role));

            userService.createUserDealerStaff(userRequest);

            verify(dealerStaffProfileService).SaveDealerStaffProfile(eq(user), any(), any(), any(), any(), any(),
                    any());
        }

        @Test
        @DisplayName("Should create EVM Staff successfully")
        void createUserEvmStaff_ShouldSucceed() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userMapper.userRequesttoUser(userRequest)).thenReturn(user);
            Role role = new Role();
            role.setName(RoleName.EVM_STAFF.getRoleName());
            when(roleRepository.findByName(anyString())).thenReturn(Optional.of(role));

            userService.createUserEvmStaff(userRequest);

            verify(evmStaffProfileService).SaveEvmStaffProfile(eq(user), any(), any());
        }

        @Test
        @DisplayName("Should create Dealer Manager successfully")
        void createUserDealerManager_ShouldSucceed() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(dealerManagerProfileRepository.existsByDealerId(any())).thenReturn(false);
            when(userMapper.userRequesttoUser(userRequest)).thenReturn(user);
            Role role = new Role();
            role.setName(RoleName.DEALER_MANAGER.getRoleName());
            when(roleRepository.findByName(anyString())).thenReturn(Optional.of(role));

            userService.createUserDealerManager(userRequest);

            verify(dealerManagerProfileService).SaveDealerManagerProfile(eq(user), any(), any(), any(), any());
        }

        @Test
        @DisplayName("Should throw exception if Dealer Manager already exists for dealer")
        void createUserDealerManager_WhenManagerExists_ShouldThrowException() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userMapper.userRequesttoUser(userRequest)).thenReturn(user);
            Role role = new Role();
            role.setName(RoleName.DEALER_MANAGER.getRoleName());
            when(roleRepository.findByName(anyString())).thenReturn(Optional.of(role));
            when(dealerManagerProfileRepository.existsByDealerId(any())).thenReturn(true);

            assertThatThrownBy(() -> userService.createUserDealerManager(userRequest))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Đại lý đã có quản lý");
        }
    }

    @Nested
    @DisplayName("Tests for role-specific updates")
    class RoleUpdateTests {
        @Test
        @DisplayName("Should update EVM Staff successfully")
        void updateUserEvmStaff_ShouldSucceed() {
            UserUpdateRequest req = new UserUpdateRequest();
            req.setEmail(user.getEmail());
            when(userRepository.findByEmail(req.getEmail())).thenReturn(Optional.of(user));
            EvmStaffProfile profile = new EvmStaffProfile();
            when(evmStaffProfileRepository.findByUserId(user.getId())).thenReturn(Optional.of(profile));

            userService.updateUserEvmStaff(req);

            verify(userRepository).save(user);
            verify(evmStaffProfileRepository).save(profile);
        }

        @Test
        @DisplayName("Should update Dealer Staff successfully")
        void updateUserDealerStaff_ShouldSucceed() {
            DealerStaffUpdateRequest req = new DealerStaffUpdateRequest();
            req.setEmail(user.getEmail());
            when(userRepository.findByEmail(req.getEmail())).thenReturn(Optional.of(user));
            DealerStaffProfile profile = new DealerStaffProfile();
            when(dealerStaffProfileRepository.findByUserId(user.getId())).thenReturn(Optional.of(profile));

            userService.updateUserDealerStaff(req);

            verify(userRepository).save(user);
            verify(dealerStaffProfileRepository).save(profile);
        }

        @Test
        @DisplayName("Should update Dealer Manager successfully")
        void updateUserDealerManager_ShouldSucceed() {
            DealerManagerUpdateRequest req = new DealerManagerUpdateRequest();
            req.setEmail(user.getEmail());
            when(userRepository.findByEmail(req.getEmail())).thenReturn(Optional.of(user));
            DealerManagerProfile profile = new DealerManagerProfile();
            when(dealerManagerProfileRepository.findByUserId(user.getId())).thenReturn(Optional.of(profile));

            userService.updateUserDealerManager(req);

            verify(userRepository).save(user);
            verify(dealerManagerProfileRepository).save(profile);
        }

        @Test
        @DisplayName("Should update EVM Admin successfully")
        void updateUserEvmAdmin_ShouldSucceed() {
            AdminUpdateRequest req = new AdminUpdateRequest();
            req.setEmail(user.getEmail());
            when(userRepository.findByEmail(req.getEmail())).thenReturn(Optional.of(user));
            AdminProfile profile = new AdminProfile();
            when(adminProfileRepository.findByUserId(user.getId())).thenReturn(Optional.of(profile));

            userService.updateUserEvmAdmin(req);

            verify(userRepository).save(user);
            verify(adminProfileRepository).save(profile);
        }
    }

    @Nested
    @DisplayName("Tests for profile operations")
    class ProfileTests {
        @Test
        @DisplayName("Should return current profile")
        void getCurrentProfileByIdUser_ShouldSucceed() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));

            ProfileRespond result = userService.getCurrentProfileByIdUser(userId);

            assertThat(result.getUser()).isEqualTo(user);
            assertThat(user.getPassword()).isEqualTo("đoán xemmmm");
        }

        @Test
        @DisplayName("Should update basic profile info")
        void updateProfile_ShouldSucceed() {
            UpdateProfileRequest req = new UpdateProfileRequest();
            req.setUserId(userId);
            req.setName("New Name");
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));

            User result = userService.updateProfile(req);

            assertThat(result.getName()).isEqualTo("New Name");
            verify(userRepository).save(user);
        }
    }

    @Nested
    @DisplayName("Tests for updateUser")
    class UpdateUserTests {
        @Test
        @DisplayName("Should update user basic info successfully")
        void updateUser_ShouldSucceed() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(userMapper.usertoUserRespond(any(User.class))).thenReturn(new UserRespond());

            UserRespond result = userService.updateUser(userId, userRequest);

            assertThat(result).isNotNull();
            verify(userMapper).updateUserFromRequest(userRequest, user);
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("Should throw exception if new email already exists")
        void updateUser_WhenNewEmailExists_ShouldThrowAppException() {
            userRequest.setEmail("new@example.com");
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(userRepository.existsByEmail("new@example.com")).thenReturn(true);

            assertThatThrownBy(() -> userService.updateUser(userId, userRequest))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Email đã tồn tại");
        }
    }

    @Nested
    @DisplayName("Tests for deleteUser")
    class DeleteUserTests {
        @Test
        @DisplayName("Should delete user when found")
        void deleteUser_ShouldSucceed() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));

            userService.deleteUser(userId);

            verify(userRepository).delete(user);
        }

        @Test
        @DisplayName("Should throw exception when not found")
        void deleteUser_WhenNotFound_ShouldThrowAppException() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.deleteUser(userId))
                    .isInstanceOf(AppException.class);
        }
    }
}
