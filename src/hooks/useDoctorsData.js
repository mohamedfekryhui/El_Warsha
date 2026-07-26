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
  const [docPhone, setDocPhone] = useState("");
  const [docAddr1, setDocAddr1] = useState("");
  const [docAddr2, setDocAddr2] = useState("");

  const fetchDoctors = async () => {
    if (!currentBranchId) return;
    try {
      const branchIdStr = String(currentBranchId);
      const [res, repRes] = await Promise.all([
        fetch(API_ENDPOINTS.doctorsByBranch(branchIdStr)).catch(() => ({ json: async () => [] })),
        fetch(API_ENDPOINTS.financialRecords).catch(() => ({ json: async () => [] })),
      ]);
      const data = await res.json();
      const repData = await repRes.json();

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
          phone: docPhone,
          address1: docAddr1,
          address2: docAddr2,
        }),
      });

      if (res.ok) {
        alert("تم تسجيل الدكتور بنجاح! 🩺");
        setDocName("");
        setDocPhone("");
        setDocAddr1("");
        setDocAddr2("");
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
    docPhone,
    setDocPhone,
    docAddr1,
    setDocAddr1,
    docAddr2,
    setDocAddr2,
    handleAddDoctor,
  };
}

