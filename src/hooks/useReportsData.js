import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/config/api";
import { useAuth } from "@/AuthContext";

export function useReportsData() {
  const { currentBranchId } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [finDoctorId, setFinDoctorId] = useState("");
  const [finShipping, setFinShipping] = useState("");
  const [finOther, setFinOther] = useState("");
  const [finDesc, setFinDesc] = useState("");
  const [finPaid, setFinPaid] = useState("");

  const refreshFinancials = async () => {
    const branchIdStr = String(currentBranchId);
    if (!currentBranchId || branchIdStr === "undefined" || branchIdStr === "null") return;

    try {
      setLoading(true);
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

      const [docs, reps] = await Promise.all([
        safeFetchJson(API_ENDPOINTS.doctorsByBranch(branchIdStr)),
        safeFetchJson(API_ENDPOINTS.financialRecords), // ⚠️ Backend might still need a GET endpoint for this!
      ]);

      setDoctors(Array.isArray(docs) ? docs : []);
      setReports(Array.isArray(reps) ? reps : []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFinancials();
  }, [currentBranchId]);

  const handleRecordTransaction = async (e) => {
    e.preventDefault();
    const res = await fetch(API_ENDPOINTS.financialRecords, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId: parseInt(finDoctorId),
        shippingCost: parseFloat(finShipping || 0),
        otherExpenses: parseFloat(finOther || 0),
        expenseDescription: finDesc,
        amountPaid: parseFloat(finPaid || 0),
      }),
    });
    if (res.ok) {
      alert("تم تسجيل المعاملة وتحديث الكشوفات بنجاح! 💳");
      setFinShipping("");
      setFinOther("");
      setFinDesc("");
      setFinPaid("");
      refreshFinancials();
    }
  };

  return {
    doctors,
    reports,
    loading,
    finDoctorId,
    setFinDoctorId,
    finShipping,
    setFinShipping,
    finOther,
    setFinOther,
    finDesc,
    setFinDesc,
    finPaid,
    setFinPaid,
    handleRecordTransaction,
  };
}
