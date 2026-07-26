"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import AuthScreen from "./AuthScreen";
import ChatWidget from "./ChatWidget";

export default function AuthWrapper({ children }) {
  const { user, currentBranchId, login, selectBranch } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔧 Force-clean any corrupted "undefined" localStorage values
    if (typeof window === "undefined") return;
    const storedBranch = localStorage.getItem("elwarsha_current_branch");
    if (storedBranch === "undefined" || storedBranch === "null" || storedBranch === "") {
      localStorage.setItem("elwarsha_current_branch", "1");
    }

    // 1. محاولة استعادة الجلسة من الـ localStorage عند فتح التطبيق
    const storedAuth = localStorage.getItem("elwarsha_auth");
    const cleanedBranch = localStorage.getItem("elwarsha_current_branch");

    if (storedAuth) {
      try {
        const userData = JSON.parse(storedAuth);
        
        // Normalize stored session data in case old/unnormalized data is in local storage
        const normalizedData = {
          token: userData.token || userData.Token,
          username: userData.username || userData.Username,
          role: userData.role || userData.Role || userData.roleName || userData.RoleName || (userData.roles || userData.Roles)?.[0] || "",
          branches: (userData.branches || userData.Branches || []).map(b => {
            if (typeof b === "string" || typeof b === "number") {
              const cleanStr = String(b).trim().toLowerCase();
              if (cleanStr === "serw") return "فرع السرو";
              if (cleanStr === "newdamietta") return "فرع دمياط الجديدة";
              return b;
            }
            
            const rawId = b.id !== undefined ? b.id : (b.Id !== undefined ? b.Id : (b.branchId !== undefined ? b.branchId : (b.BranchId !== undefined ? b.BranchId : (b.code !== undefined ? b.code : b.Code))));
            const rawName = b.name !== undefined ? b.name : (b.Name !== undefined ? b.Name : (b.branchName !== undefined ? b.branchName : (b.BranchName !== undefined ? b.BranchName : "")));
            const cleanId = String(rawId || "").trim().toLowerCase();
            const cleanName = String(rawName || "").trim().toLowerCase();
            
            let name = rawName;
            if (cleanId === "serw" || cleanName === "serw") {
              name = "فرع السرو";
            } else if (cleanId === "newdamietta" || cleanName === "newdamietta") {
              name = "فرع دمياط الجديدة";
            }
            
            return {
              id: rawId,
              name: name
            };
          })
        };

        login(normalizedData); // استرجاع بيانات اليوزر والفروع المتاحة له

        // Restore branch — always default to 1 if nothing valid is stored
        const parsedBranch = parseInt(cleanedBranch, 10);
        selectBranch(isNaN(parsedBranch) ? 1 : parsedBranch);

      } catch (e) {
        console.error("خطأ في قراءة بيانات الجلسة السابقة:", e);
        localStorage.removeItem("elwarsha_auth");
        localStorage.setItem("elwarsha_current_branch", "1");
      }
    }
    setLoading(false);
  }, [login, selectBranch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1120] font-sans text-right" dir="rtl">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-indigo-600 mx-auto"></div>
          <h3 className="text-gray-900 dark:text-white font-bold text-sm">جاري تحميل السيستم...</h3>
        </div>
      </div>
    );
  }

  // 2. إذا لم يقم بتسجيل الدخول، أو قام بالدخول ولم يحدد فرع بعد -> اعرض شاشة الـ Auth (لوجن + اختيار فرع)
  if (!user || (currentBranchId === null || currentBranchId === undefined)) {
    return <AuthScreen />;
  }

  // 3. إذا قام بتسجيل الدخول واختار الفرع بنجاح -> افتح له بقية السيستم والـ Dashboard
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
}
