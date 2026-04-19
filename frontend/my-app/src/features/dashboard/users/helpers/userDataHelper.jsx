// helpers/userDataHelper.js
export const formatUserDataForUpdate = (userData, mode) => {
  if (mode === "edit") {
    const updateData = {
      userId: userData.id,
      name: userData.name || "",
      fullName: userData.fullName || "",
      phone: userData.phone || "",
      address: userData.address || "",
      birthday: userData.birthday || null,
      city: userData.city || "",
      country: userData.country || "",
      gender: userData.gender || "MALE", // Đảm bảo không null
      url: userData.url || null,
    };

    const role = userData.role;

    // Profile-specific data - chỉ thêm nếu có dữ liệu
    switch (role) {
      case "DEALER_STAFF":
        if (userData.position || userData.department) {
          updateData.dealerStaffProfile = {
            position: userData.position || null,
            department: userData.department || null,
            hireDate: userData.hireDate || null,
            salary: userData.salary ? parseFloat(userData.salary) : null,
            commissionRate: userData.commissionRate
              ? parseFloat(userData.commissionRate)
              : null,
          };
        }
        break;
      case "DEALER_MANAGER":
        if (userData.managementLevel || userData.approvalLimit) {
          updateData.dealerManagerProfile = {
            managementLevel: userData.managementLevel || null,
            approvalLimit: userData.approvalLimit
              ? typeof userData.approvalLimit === "string"
                ? parseFloat(userData.approvalLimit)
                : userData.approvalLimit
              : null,
          };
        }
        break;
      case "EVM_STAFF":
        if (userData.department || userData.specialization) {
          updateData.evmStaffProfile = {
            department: userData.department || null,
            specialization: userData.specialization || null,
          };
        }
        break;
      case "ADMIN":
        if (userData.adminLevel) {
          updateData.adminProfile = {
            adminLevel: userData.adminLevel || null,
          };
        }
        break;
    }

    return updateData;
  }

  // For create mode, return original data
  return userData;
};
