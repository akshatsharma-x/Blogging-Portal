"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  isStaff: boolean;
  username: string | null;
  loading: boolean;
  login: (access: string, refresh: string, username: string, isStaff?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isStaff: false,
  username: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    Promise.resolve().then(() => {
      const token = localStorage.getItem("accessToken");
      const storedUsername = localStorage.getItem("username");
      const storedIsStaff = localStorage.getItem("isStaff") === "true";
      
      if (token) {
        setIsAuthenticated(true);
        setIsStaff(storedIsStaff);
        if (storedUsername) setUsername(storedUsername);
      }
      setLoading(false);
    });
  }, []);

  const login = (access: string, refresh: string, loginUsername: string, staffFlag = false) => {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    localStorage.setItem("username", loginUsername);
    localStorage.setItem("isStaff", String(staffFlag));
    document.cookie = `accessToken=${access}; path=/`;
    setIsAuthenticated(true);
    setIsStaff(staffFlag);
    setUsername(loginUsername);
    router.push("/");
    router.refresh();
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("isStaff");
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    setIsAuthenticated(false);
    setIsStaff(false);
    setUsername(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isStaff, username, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
