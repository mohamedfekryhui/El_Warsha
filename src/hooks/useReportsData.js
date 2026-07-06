import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/config/api";

export function useReportsData() {
  const [doctors, setDoctors] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [finDoctorId, setFinDoctorId] = useState("");
  const [finShipping, setFinShipping] = useState("");
  const [finOther, setFinOther] = useState("");
  const [finDesc, setFinDesc] = useState("");
  const [finPaid, setFinPaid] = useState("");

  const refreshFinancials = async () => {
    try {
      setLoading(true);
      const [docsRes, repRes] = await Promise.all([
        fetch(API_ENDPOINTS.doctors).catch(() => ({ json: async () => [] })),
        fetch(API_ENDPOINTS.doctorsAccounts).catch(() => ({ json: async () => [] })),
      ]);
      let docs = await docsRes.json();
      let reps = await repRes.json();

      // Fallback
      if (!Array.isArray(docs) || docs.length === 0) {
        docs = [{ id: 1, name: "د. محمد علي", phone: "01012345678", address1: "القاهرة، مدينة نصر", address2: "الجيزة، الدقي" }];
      }
      if (!Array.isArray(reps) || reps.length === 0) {
        reps = [{ doctorId: 1, doctorName: "د. محمد علي", totalPartsCost: 350, totalShipping: 50, totalRequired: 400, totalPaid: 200, remainingBalance: 200 }];
      }

      setDoctors(docs);
      setReports(reps);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFinancials();
  }, []);

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
