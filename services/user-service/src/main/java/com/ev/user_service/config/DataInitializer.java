package com.ev.user_service.config;

import com.ev.user_service.enums.UserStatus;
import com.ev.user_service.service.AdminProfileService;
import com.ev.user_service.service.CustomerProfileService;
import com.ev.user_service.service.DealerManagerProfileService;
import com.ev.user_service.service.DealerStaffProfileService;
import com.ev.user_service.service.EvmStaffProfileService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.ev.user_service.entity.Permission;
import com.ev.user_service.entity.Role;
import com.ev.user_service.entity.User;
import com.ev.user_service.enums.PermissionName;
import com.ev.user_service.enums.RoleName;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.user_service.repository.PermissionRepository;
import com.ev.user_service.repository.RoleRepository;
import com.ev.user_service.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final AdminProfileService adminProfileService;
    private final DealerManagerProfileService dealerManagerProfileService;
    private final EvmStaffProfileService evmStaffProfileService;
    private final DealerStaffProfileService dealerStaffProfileService;
    private final CustomerProfileService customerProfileService;

    // Helper method
    private Permission createPermission(PermissionName permissionName) {
        Permission permission = new Permission();
        permission.setName(permissionName.getName());
        return permission;
    }

    public DataInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            AdminProfileService adminProfileService,
            DealerManagerProfileService dealerManagerProfileService,
            EvmStaffProfileService evmStaffProfileService,
            DealerStaffProfileService dealerStaffProfileService,
            CustomerProfileService customerProfileService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.adminProfileService = adminProfileService;
        this.dealerManagerProfileService = dealerManagerProfileService;
        this.evmStaffProfileService = evmStaffProfileService;
        this.dealerStaffProfileService = dealerStaffProfileService;
        this.customerProfileService = customerProfileService;
    }

    @Override
    public void run(ApplicationArguments args) {
        // ========== INITIALIZE ROLES ==========
        initializeAdminRole();
        initializeDealerManagerRole();
        initializeDealerStaffRole();
        initializeEvmStaffRole();
        initializeCustomerRole();

        // ========== INITIALIZE USERS ==========
        if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
            initializeAdminUser();
        }

        if (userRepository.findByEmail("TrongManager@gmail.com").isEmpty()) {
            initializeDealerManagerUser();
        }

        if (userRepository.findByEmail("TrongStaff@gmail.com").isEmpty()) {
            initializeDealerStaffUser();
        }

        initializeEvmStaffUser();
    }

    private void initializeAdminRole() {
        if (roleRepository.findFirstByName(RoleName.ADMIN.getName()).isEmpty()) {
            Set<Permission> permissions = new HashSet<>();

            // Chỉ các quyền đặc biệt của ADMIN
            permissions.add(createPermission(PermissionName.FULL_SYSTEM_ACCESS));
            permissions.add(createPermission(PermissionName.MANAGE_USERS));
            permissions.add(createPermission(PermissionName.VIEW_AI_REPORTS));
            permissions.add(createPermission(PermissionName.SYSTEM_CONFIG));

            permissionRepository.saveAll(permissions);
            Role role = new Role();
            role.setName(RoleName.ADMIN.getName());
            role.setPermissions(permissions);
            roleRepository.save(role);
        }
    }

    private void initializeDealerManagerRole() {
        if (roleRepository.findFirstByName(RoleName.DEALER_MANAGER.getName()).isEmpty()) {
            Set<Permission> permissions = new HashSet<>();

            // Quyền của DEALER_MANAGER
            permissions.add(createPermission(PermissionName.VIEW_VEHICLES));
            permissions.add(createPermission(PermissionName.MANAGE_VEHICLES));
            permissions.add(createPermission(PermissionName.MANAGE_PRICING));
            permissions.add(createPermission(PermissionName.CREATE_QUOTATION));
            permissions.add(createPermission(PermissionName.CREATE_ORDER));
            permissions.add(createPermission(PermissionName.CREATE_CONTRACT));
            permissions.add(createPermission(PermissionName.APPROVE_ORDERS));
            permissions.add(createPermission(PermissionName.VIEW_ALL_DEALER_ORDERS));
            permissions.add(createPermission(PermissionName.MANAGE_OWN_CUSTOMERS));
            permissions.add(createPermission(PermissionName.VIEW_ALL_DEALER_CUSTOMERS));
            permissions.add(createPermission(PermissionName.CREATE_APPOINTMENT));
            permissions.add(createPermission(PermissionName.VIEW_DEALER_INVENTORY));
            permissions.add(createPermission(PermissionName.REQUEST_STOCK));
            permissions.add(createPermission(PermissionName.PROCESS_PAYMENT));
            permissions.add(createPermission(PermissionName.VIEW_DEALER_REPORTS));
            permissions.add(createPermission(PermissionName.MANAGE_DEALER_STAFF));
            permissions.add(createPermission(PermissionName.MANAGE_PROMOTIONS));

            permissionRepository.saveAll(permissions);
            Role role = new Role();
            role.setName(RoleName.DEALER_MANAGER.getName());
            role.setPermissions(permissions);
            roleRepository.save(role);
        }
    }

    private void initializeDealerStaffRole() {
        if (roleRepository.findFirstByName(RoleName.DEALER_STAFF.getName()).isEmpty()) {
            Set<Permission> permissions = new HashSet<>();

            // Quyền của DEALER_STAFF
            permissions.add(createPermission(PermissionName.VIEW_VEHICLES));
            permissions.add(createPermission(PermissionName.CREATE_QUOTATION));
            permissions.add(createPermission(PermissionName.CREATE_ORDER));
            permissions.add(createPermission(PermissionName.MANAGE_OWN_CUSTOMERS));
            permissions.add(createPermission(PermissionName.CREATE_APPOINTMENT));
            permissions.add(createPermission(PermissionName.CREATE_FEEDBACK));
            permissions.add(createPermission(PermissionName.VIEW_DEALER_INVENTORY));
            permissions.add(createPermission(PermissionName.PROCESS_PAYMENT));
            permissions.add(createPermission(PermissionName.VIEW_DEALER_REPORTS));

            permissionRepository.saveAll(permissions);
            Role role = new Role();
            role.setName(RoleName.DEALER_STAFF.getName());
            role.setPermissions(permissions);
            roleRepository.save(role);
        }
    }

    private void initializeEvmStaffRole() {
        if (roleRepository.findFirstByName(RoleName.EVM_STAFF.getName()).isEmpty()) {
            Set<Permission> permissions = new HashSet<>();

            // Quyền của EVM_STAFF
            permissions.add(createPermission(PermissionName.VIEW_VEHICLES));
            permissions.add(createPermission(PermissionName.MANAGE_VEHICLES));
            permissions.add(createPermission(PermissionName.MANAGE_PRICING));
            permissions.add(createPermission(PermissionName.VIEW_ALL_DEALER_ORDERS));
            permissions.add(createPermission(PermissionName.VIEW_DEALER_REPORTS));
            permissions.add(createPermission(PermissionName.MANAGE_PROMOTIONS));
            
            permissionRepository.saveAll(permissions);
            Role role = new Role();
            role.setName(RoleName.EVM_STAFF.getName());
            role.setPermissions(permissions);
            roleRepository.save(role);
        }
    }

    private void initializeAdminUser() {
        Set<Role> roles = new HashSet<>();
        Role adminRole = roleRepository.findFirstByName(RoleName.ADMIN.getRoleName())
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
        roles.add(adminRole);

        User admin = new User();
        admin.setEmail("admin@gmail.com");
        admin.setPassword(passwordEncoder.encode("123123123"));
        admin.setRoles(new HashSet<>(roles));
        admin.setStatus(UserStatus.ACTIVE);
        userRepository.save(admin);
        adminProfileService.SaveAdminProfile(admin, "SUPER_ADMIN", "Toàn quyền hệ thống", "GLOBAL");
    }

    private void initializeDealerManagerUser() {
        UUID dealerId = UUID.fromString("3ec76f92-7d44-49f4-ada1-b47d4f55b418");

        Set<Role> roles = new HashSet<>();
        Role dealerManagerRole = roleRepository.findFirstByName(RoleName.DEALER_MANAGER.getRoleName())
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
        roles.add(dealerManagerRole);

        User dealerManager = new User();
        dealerManager.setEmail("TrongManager@gmail.com");
        dealerManager.setPassword(passwordEncoder.encode("123123123"));
        dealerManager.setRoles(new HashSet<>(roles));
        dealerManager.setStatus(UserStatus.ACTIVE);
        userRepository.save(dealerManager);

        dealerManagerProfileService.SaveDealerManagerProfile(
                dealerManager,
                dealerId,
                "MANAGER",
                new BigDecimal("1000000000"), // approvalLimit
                "Quản lý");
    }

    private void initializeDealerStaffUser() {
        UUID dealerId = UUID.fromString("3ec76f92-7d44-49f4-ada1-b47d4f55b418");

        Set<Role> roles = new HashSet<>();
        Role dealerStaffRole = roleRepository.findFirstByName(RoleName.DEALER_STAFF.getRoleName())
                .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
        roles.add(dealerStaffRole);

        User dealerStaff = new User();
        dealerStaff.setEmail("TrongStaff@gmail.com");
        dealerStaff.setPassword(passwordEncoder.encode("123123123"));
        dealerStaff.setRoles(new HashSet<>(roles));
        dealerStaff.setStatus(UserStatus.ACTIVE);
        userRepository.save(dealerStaff);

        dealerStaffProfileService.SaveDealerStaffProfile(
                dealerStaff,
                dealerId,
                "Nhân viên bán hàng",
                "Bán hàng",
                LocalDate.now(), // hireDate
                new BigDecimal("10000000"), // salary
                new BigDecimal("2.5") // commissionRate
        );
    }

    private void initializeEvmStaffUser() {
        if (userRepository.findByEmail("StafffEVM@gmail.com").isEmpty()) {
            Set<Role> roles = new HashSet<>();
            Role evmStaffRole = roleRepository.findFirstByName(RoleName.EVM_STAFF.getRoleName())
                    .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR));
            roles.add(evmStaffRole);

            User evmStaff = new User();
            evmStaff.setEmail("StafffEVM@gmail.com");
            evmStaff.setPassword(passwordEncoder.encode("123123123"));
            evmStaff.setRoles(new HashSet<>(roles));
            evmStaff.setStatus(UserStatus.ACTIVE);
            userRepository.save(evmStaff);

            evmStaffProfileService.SaveEvmStaffProfile(
                    evmStaff,
                    "Technical Support",
                    "System Analysis"
            );
        }
    }

    private void initializeCustomerRole() {
        if (roleRepository.findFirstByName(RoleName.CUSTOMER.getName()).isEmpty()) {
            Set<Permission> permissions = new HashSet<>();

            // Quyền của CUSTOMER (B2C)
            permissions.add(createPermission(PermissionName.VIEW_VEHICLES));
            permissions.add(createPermission(PermissionName.COMPARE_VEHICLES));
            permissions.add(createPermission(PermissionName.VIEW_OWN_PROFILE));
            permissions.add(createPermission(PermissionName.UPDATE_OWN_PROFILE));
            permissions.add(createPermission(PermissionName.VIEW_OWN_ORDERS));
            permissions.add(createPermission(PermissionName.CREATE_OWN_ORDER));
            permissions.add(createPermission(PermissionName.CANCEL_OWN_ORDER));
            permissions.add(createPermission(PermissionName.VIEW_OWN_PAYMENTS));
            permissions.add(createPermission(PermissionName.MAKE_PAYMENT));
            permissions.add(createPermission(PermissionName.REQUEST_TEST_DRIVE));
            permissions.add(createPermission(PermissionName.VIEW_PROMOTIONS));
            permissions.add(createPermission(PermissionName.CREATE_FEEDBACK));

            permissionRepository.saveAll(permissions);
            Role role = new Role();
            role.setName(RoleName.CUSTOMER.getName());
            role.setPermissions(permissions);
            roleRepository.save(role);
        }
    }
}