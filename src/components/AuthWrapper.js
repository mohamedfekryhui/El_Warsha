"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import AuthScreen from "./AuthScreen";

export default function AuthWrapper({ children }) {
  const { user, currentBranchId, login, selectBranch } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. محاولة استعادة الجلسة من الـ localStorage عند فتح التطبيق
    const storedAuth = localStorage.getItem("elwarsha_auth");
    const storedBranch = localStorage.getItem("elwarsha_current_branch");

    if (storedAuth) {
      try {
        const userData = JSON.parse(storedAuth);
        login(userData); // استرجاع بيانات اليوزر والفروع المتاحة له

        if (storedBranch) {
          selectBranch(parseInt(storedBranch, 10)); // استرجاع الفرع النشط حالياً
        }
      } catch (e) {
        console.error("خطأ في قراءة بيانات الجلسة السابقة:", e);
        localStorage.removeItem("elwarsha_auth");
        localStorage.removeItem("elwarsha_current_branch");
      }
    }
    setLoading(false);
  }, []);

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
  if (!user || !currentBranchId) {
    return <AuthScreen />;
  }

  // 3. إذا قام بتسجيل الدخول واختار الفرع بنجاح -> افتح له بقية السيستم والـ Dashboard
  return <>{children}</>;
}
