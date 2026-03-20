import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [roles, setRoles] = useState(() => {
    try {
      const storedRoles = sessionStorage.getItem("roles");
      return storedRoles ? JSON.parse(storedRoles) : [];
    } catch (error) {
      console.error("Failed to parse roles from sessionStorage:", error);
      return [];
    }
  });

  const [token, setToken] = useState(sessionStorage.getItem("token") || null);
  const [id_user, setIdUser] = useState(sessionStorage.getItem("id_user") || null);
  const [email, setEmail] = useState(sessionStorage.getItem("email") || null);
  const [name, setName] = useState(sessionStorage.getItem("name") || null);
  const [fullName, setFullName] = useState(sessionStorage.getItem("fullName") || null);
  const [memberId, setMemberId] = useState(sessionStorage.getItem("memberId") || null);
  const [avatarUrl, setAvatarUrl] = useState(sessionStorage.getItem("avatarUrl") || null);
  const [userData, setUserData] = useState(() => {
    try {
      const storedUserData = sessionStorage.getItem("userData");
      return storedUserData ? JSON.parse(storedUserData) : null;
    } catch (error) {
      console.error("Failed to parse userData from sessionStorage:", error);
      return null;
    }
  });

  const login = (newToken, newRoles, newId, newEmail, newName, newFullName, newMemberId, newUserData, newAvatarUrl) => {
    sessionStorage.setItem("id_user", newId);
    sessionStorage.setItem("token", newToken);
    sessionStorage.setItem("roles", JSON.stringify(newRoles));
    sessionStorage.setItem("email", newEmail);
    sessionStorage.setItem("name", newName);
    sessionStorage.setItem("fullName", newFullName);
    sessionStorage.setItem("userData", JSON.stringify(newUserData));
    sessionStorage.setItem("memberId", newMemberId);
    sessionStorage.setItem("avatarUrl", newAvatarUrl);

    setEmail(newEmail);
    setToken(newToken);
    setRoles(newRoles);
    setIdUser(newId);
    setName(newName);
    setFullName(newFullName);
    setUserData(newUserData);
    setMemberId(newMemberId);
    setAvatarUrl(newAvatarUrl);
  };

  const logout = () => {
    sessionStorage.clear();
    setEmail(null);
    setRoles([]);
    setIdUser(null);
    setName(null);
    setFullName(null);
    setMemberId(null);
    setUserData(null);
    setToken(null);
    setAvatarUrl(null);
  };

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    const storedRoles = sessionStorage.getItem("roles");
    const storedEmail = sessionStorage.getItem("email");
    const storedId = sessionStorage.getItem("id_user");
    const storedName = sessionStorage.getItem("name");
    const storedFullName = sessionStorage.getItem("fullName");
    const storedMemberId = sessionStorage.getItem("memberId");
    const storedUserData = sessionStorage.getItem("userData");
    const storedAvatarUrl = sessionStorage.getItem("avatarUrl");

    if (storedToken) setToken(storedToken);
    if (storedEmail) setEmail(storedEmail);
    if (storedId) setIdUser(storedId);
    if (storedName) setName(storedName);
    if (storedFullName) setFullName(storedFullName);
    if (storedMemberId) setMemberId(storedMemberId);
    if (storedAvatarUrl) setAvatarUrl(storedAvatarUrl);
    if (storedRoles) {
      try {
        setRoles(JSON.parse(storedRoles));
      } catch (error) {
        console.error("Failed to parse roles:", error);
      }
    }
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error("Failed to parse userData:", error);
      }
    }
  }, []);

  const isAuthenticated = () => {
    return token !== null;
  };

  const hasRole = (roleNames) => {
    if (Array.isArray(roleNames)) {
      return roleNames.some(role => roles.includes(role));
    }
    return roles.includes(roleNames);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        roles,
        id_user,
        email,
        name,
        fullName,
        memberId,
        avatarUrl,
        userData,
        login,
        logout,
        isAuthenticated,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

