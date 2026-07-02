import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/config/api";

export function useMaintenanceData() {
  const [doctors, setDoctors] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [handpieceName, setHandpieceName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [inventoryId, setInventoryId] = useState("");

  const refreshData = async () => {
    try {
      setLoading(true);
      const [docsRes, ordersRes] = await Promise.all([
        fetch(API_ENDPOINTS.doctors),
        fetch(API_ENDPOINTS.activeOrders),
      ]);
      setDoctors(await docsRes.json());
      setActiveOrders(await ordersRes.json());
    } catch (error) {
      console.error("Error fetching maintenance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const res = await fetch(API_ENDPOINTS.createOrder, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId: parseInt(selectedDoctorId),
        handpieceName,
        serialNumber,
        status: "قيد الصيانة",
      }),
    });
    if (res.ok) {
      alert("تم فتح أمر صيانة ووضع الهاندبيس على الرف! 🛠️");
      setHandpieceName("");
      setSerialNumber("");
      refreshData();
    }
  };

  const handleAddItemToOrder = async (e) => {
    e.preventDefault();
    const res = await fetch(
      API_ENDPOINTS.addPartToOrder(selectedOrderId, inventoryId),
      { method: "POST" },
    );
    if (res.ok) {
      alert("تم تركيب الصنف بنجاح! ⚙️");
      setInventoryId("");
      refreshData();
    }
  };

  const handleDeliverOrder = async (orderId) => {
    const res = await fetch(
      API_ENDPOINTS.updateOrderStatus(orderId, "تم التسليم"),
      { method: "PUT" },
    );
    if (res.ok) {
      alert("تم تسليم الهاندبيس للعميل! ✅");
      refreshData();
    }
  };

  return {
    doctors,
    activeOrders,
    loading,
    handpieceName,
    setHandpieceName,
    serialNumber,
    setSerialNumber,
    selectedDoctorId,
    setSelectedDoctorId,
    selectedOrderId,
    setSelectedOrderId,
    inventoryId,
    setInventoryId,
    handleCreateOrder,
    handleAddItemToOrder,
    handleDeliverOrder,
  };
}
