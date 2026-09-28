"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole, PermissionCheck } from "@/types/auth";
import { getRolePermissions } from "../permissions";
import { MOCK_USERS } from "../storage/mock-data";
import { db } from "../storage/db";

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  permissions: PermissionCheck;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  allUsers: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "hireflow_auth_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

  useEffect(() => {
    // Load persisted user or default to Super Admin
    try {
      const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default to Super Admin in demo mode
        const defaultUser = MOCK_USERS[0];
        setUser(defaultUser);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUser));
      }
    } catch (e) {
      setUser(MOCK_USERS[0]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, requestedRole?: UserRole): Promise<boolean> => {
    const existingUsers = db.getUsers();
    let found = existingUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      // Find role match in MOCK_USERS or create a user profile
      const roleMatch = MOCK_USERS.find((u) => u.role === requestedRole);
      found = roleMatch || {
        id: `usr_${Date.now()}`,
        user_id: `usr_${Date.now()}`,
        organization_id: "org_default",
        full_name: email.split("@")[0].replace(".", " "),
        email: email,
        role: requestedRole || "recruiter",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    setUser(found);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found));
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const switchRole = (newRole: UserRole) => {
    const matched = MOCK_USERS.find((u) => u.role === newRole) || {
      ...user!,
      role: newRole,
    };
    setUser(matched);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matched));
    }
  };

  const currentRole: UserRole = user?.role || "super_admin";
  const permissions = getRolePermissions(currentRole);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRole,
        permissions,
        isLoading,
        isDemoMode,
        login,
        logout,
        switchRole,
        allUsers: db.getUsers(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
