import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/config/api";
import { useAuth } from "@/AuthContext";

export function useDoctorsData() {
  const { currentBranchId } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // States الخاصة بالفورمة
  const [docName, setDocName] = useState("");

  const fetchDoctors = async () => {
    const branchIdStr = String(currentBranchId);
    if (!currentBranchId || branchIdStr === "undefined" || branchIdStr === "null") return;
    try {
      const safeFetchJson = async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return [];
          const text = await res.text();
          return text ? JSON.parse(text) : [];
        } catch (e) {
          return [];
        }
      };

      const [data, repData] = await Promise.all([
        safeFetchJson(API_ENDPOINTS.doctorsByBranch(branchIdStr)),
        safeFetchJson(API_ENDPOINTS.financialRecords),
      ]);

      setDoctors(Array.isArray(data) ? data : []);
      setReports(Array.isArray(repData) ? repData : []);
    } catch (error) {
      console.error("خطأ في جلب بيانات الدكاترة والتقارير:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [currentBranchId]);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_ENDPOINTS.doctors, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: docName,
        }),
      });

      if (res.ok) {
        alert("تم تسجيل الدكتور بنجاح! 🩺");
        setDocName("");
        fetchDoctors(); // تحديث الجدول فوراً
      }
    } catch (error) {
      console.error("خطأ أثناء الإضافة:", error);
    }
  };

  return {
    doctors,
    reports,
    loading,
    docName,
    setDocName,
    handleAddDoctor,
  };
}

