import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/config/api";

export function useDoctorsData() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // States الخاصة بالفورمة
  const [docName, setDocName] = useState("");
  const [docPhone, setDocPhone] = useState("");
  const [docAddr1, setDocAddr1] = useState("");
  const [docAddr2, setDocAddr2] = useState("");

  const fetchDoctors = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.doctors);
      const data = await res.json();
      setDoctors(data);
    } catch (error) {
      console.error("خطأ في جلب بيانات الدكاترة:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

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
