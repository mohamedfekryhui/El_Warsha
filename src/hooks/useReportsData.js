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
        fetch(API_ENDPOINTS.doctors),
        fetch(API_ENDPOINTS.doctorsAccounts),
      ]);
      setDoctors(await docsRes.json());
      setReports(await repRes.json());
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
