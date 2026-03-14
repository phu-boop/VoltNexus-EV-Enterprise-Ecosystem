import { set } from "date-fns";
import { se } from "date-fns/locale";
import {createContext, useContext, useState, useEffect} from "react";

const AuthContext = createContext();

export function AuthProvider({children}) {
    const [roles, setRoles] = useState(() => {
        try {
            const storedRoles = sessionStorage.getItem("roles");
            return storedRoles ? JSON.parse(storedRoles) : [];
        } catch (error) {
            console.error("Failed to parse roles from sessionStorage:", error);
            return [];
        }
    });

    // Helper để đọc/ghi sessionStorage an toàn, tránh chuỗi "null"
    const safeGetItem = (key) => {
        const item = sessionStorage.getItem(key);
        return (item && item !== "null" && item !== "undefined") ? item : null;
    };

    const safeSetItem = (key, value) => {
        if (value && value !== "null" && value !== "undefined") {
            sessionStorage.setItem(key, value);
        } else {
            sessionStorage.removeItem(key);
        }
    };

    const [token, setToken] = useState(safeGetItem("token"));
    const [id_user, setIdUser] = useState(safeGetItem("id_user"));
    const [email, setEmail] = useState(safeGetItem("email"));
    const [name, setName] = useState(safeGetItem("name"));
    const [fullName, setFullName] = useState(safeGetItem("fullName"));
    const [memberId, setMemberId] = useState(safeGetItem("memberId"));
    const [avatarUrl, setAvatarUrl] = useState(safeGetItem("avatarUrl"));

    const [dealerId, setDealerId] = useState(safeGetItem("dealerId"));

    const [userData, setUserData] = useState(() => {
        try {
            const storedUserData = sessionStorage.getItem("userData");
            return storedUserData && storedUserData !== "null" ? JSON.parse(storedUserData) : null;
        } catch (error) {
            console.error("Failed to parse userData from sessionStorage:", error);
            return null;
        }
    });

    const login = (newToken, newRoles, newId, newEmail, newName, newFullName, newMemberId, newUserData, newAvataUrl) => {
        safeSetItem("id_user", newId);
        safeSetItem("token", newToken);
        if (newRoles) safeSetItem("roles", JSON.stringify(newRoles));
        safeSetItem("email", newEmail);
        safeSetItem("name", newName);
        safeSetItem("fullName", newFullName);
        if (newUserData) safeSetItem("userData", JSON.stringify(newUserData));
        safeSetItem("memberId", newMemberId);
        safeSetItem("avatarUrl", newAvataUrl);

        setEmail(newEmail);
        setToken(newToken);
        setRoles(newRoles || []);
        setIdUser(newId);
        setName(newName);
        setFullName(newFullName);
        setUserData(newUserData);
        setMemberId(newMemberId);
        setAvatarUrl(newAvataUrl);

        //Tự động trích xuất dealerId từ userData (profile)
        let newDealerId = null;
        if (newUserData && newUserData.dealerId) {
            newDealerId = newUserData.dealerId;
            safeSetItem("dealerId", newDealerId);
        }
        setDealerId(newDealerId);
    };

    const updateAvatar = (newAvatarUrl) => {
        safeSetItem("avatarUrl", newAvatarUrl);
        setAvatarUrl(newAvatarUrl);
    };

    // Cập nhật thông tin profile (name, fullName, avatar) sau khi user chỉnh sửa
    const updateProfile = ({ name: newName, fullName: newFullName, avatarUrl: newAvatarUrl } = {}) => {
        if (newName !== undefined) {
             safeSetItem("name", newName);
            setName(newName);
        }
        if (newFullName !== undefined) {
             safeSetItem("fullName", newFullName);
            setFullName(newFullName);
        }
        if (newAvatarUrl !== undefined) {
             safeSetItem("avatarUrl", newAvatarUrl);
            setAvatarUrl(newAvatarUrl);
        }
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
        setDealerId(null); //Xóa dealerId khi logout
    };

    useEffect(() => {
        const storedToken = safeGetItem("token");
        const storedRoles = sessionStorage.getItem("roles");
        const storedEmail = safeGetItem("email");
        const storedId = safeGetItem("id_user");
        const storedName = safeGetItem("name");
        const storedFullName = safeGetItem("fullName");
        const storedMemberId = safeGetItem("memberId");
        const storedUserData = sessionStorage.getItem("userData");
        const storedAvatarUrl = safeGetItem("avatarUrl");
        const storedDealerId = safeGetItem("dealerId"); 

        if (storedToken) setToken(storedToken);
        if (storedEmail) setEmail(storedEmail);
        if (storedId) setIdUser(storedId);
        if (storedName) setName(storedName);
        if (storedFullName) setFullName(storedFullName);
        if (storedMemberId) setMemberId(storedMemberId);
        if (storedAvatarUrl) setAvatarUrl(storedAvatarUrl);
        if (storedDealerId) setDealerId(storedDealerId);

        if (storedRoles && storedRoles !== "null") {
            try {
                setRoles(JSON.parse(storedRoles));
            } catch (error) {
                console.error("Failed to parse roles from sessionStorage:", error);
                setRoles([]);
            }
        }

        if (storedUserData && storedUserData !== "null") {
            try {
                setUserData(JSON.parse(storedUserData));
            } catch (error) {
                console.error("Failed to parse userData from sessionStorage:", error);
                setUserData(null);
            }
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                roles,
                token,
                id_user,
                email,
                name,
                fullName,
                memberId,
                dealerId,   //Cung cấp dealerId
                userData,
                avatarUrl,
                login,
                logout,
                updateAvatar,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
export const useAuthContext = () => useContext(AuthContext);