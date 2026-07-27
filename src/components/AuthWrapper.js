"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import AuthScreen from "./AuthScreen";
import ChatWidget from "./ChatWidget";

const AUTH_KEY = "elwarsha_auth";
const BRANCH_KEY = "elwarsha_current_branch";

function normalizeBranch(branch) {
  if (typeof branch === "string" || typeof branch === "number") {
    return {
      id: Number(branch),
      name: String(branch),
    };
  }

  const id =
    branch.id ??
    branch.Id ??
    branch.branchId ??
    branch.BranchId ??
    1;

  const name =
    branch.name ??
    branch.Name ??
    branch.branchName ??
    branch.BranchName ??
    "";

  return {
    id,
    name,
  };
}

function normalizeUser(user) {
  return {
    token: user.token ?? user.Token ?? "",
    username: user.username ?? user.Username ?? "",
    role:
      user.role ??
      user.Role ??
      user.roleName ??
      user.RoleName ??
      (user.roles || user.Roles || [])[0] ??
      "",
    branches: (user.branches || user.Branches || []).map(normalizeBranch),
  };
}

export default function AuthWrapper({ children }) {
  const { user, currentBranchId, login, selectBranch } = useAuth();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      //-------------------------------
      // تنظيف الـ Branch
      //-------------------------------

      let storedBranch = localStorage.getItem(BRANCH_KEY);

      if (
        !storedBranch ||
        storedBranch === "undefined" ||
        storedBranch === "null" ||
        storedBranch === ""
      ) {
        storedBranch = "1";
        localStorage.setItem(BRANCH_KEY, "1");
      }

      //-------------------------------
      // تنظيف بيانات اليوزر
      //-------------------------------

      const storedAuth = localStorage.getItem(AUTH_KEY);

      if (!storedAuth) {
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(storedAuth);

      const normalized = normalizeUser(parsed);

      login(normalized);

      const branchId = Number(storedBranch);

      selectBranch(
        Number.isInteger(branchId) && branchId > 0
          ? branchId
          : 1
      );
    } catch (err) {
      console.error(err);

      localStorage.removeItem(AUTH_KEY);
      localStorage.setItem(BRANCH_KEY, "1");
    } finally {
      setLoading(false);
    }
  }, [login, selectBranch]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1120]"
        dir="rtl"
      >
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-indigo-600 mx-auto"></div>

          <h3 className="font-bold dark:text-white">
            جاري تحميل السيستم...
          </h3>
        </div>
      </div>
    );
  }

  if (!user || currentBranchId == null) {
    return <AuthScreen />;
  }

  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
}