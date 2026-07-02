import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/config/api";

export function useDashboardData() {
  const [data, setData] = useState({
    profits: null,
    doctorsCount: 0,
    activeOrdersCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب كل البيانات في نفس الوقت (أسرع بكتير)
    const fetchAllData = async () => {
      try {
        const [profitsRes, doctorsRes, ordersRes] = await Promise.all([
          fetch(API_ENDPOINTS.profits),
          fetch(API_ENDPOINTS.doctors),
          fetch(API_ENDPOINTS.activeOrders),
        ]);

        const profits = await profitsRes.json();
        const doctors = await doctorsRes.json();
        const orders = await ordersRes.json();

        setData({
          profits,
          doctorsCount: doctors.length, // عدد الدكاترة الإجمالي
          activeOrdersCount: orders.length, // عدد الهاندبيسات اللي على الرف
        });
      } catch (error) {
        console.error("خطأ في جلب بيانات اللوحة:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return { ...data, loading };
}
