import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/config/api";
import { useAuth } from "@/AuthContext";

export function useMaintenanceData() {
  const { currentBranchId } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // States القديمة للاستلام العادي (نحتفظ بها للتوافق أو نزيلها إذا استبدلناها)
  const [handpieceName, setHandpieceName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [inventoryId, setInventoryId] = useState("");

  // States الجديدة لاستلام معدات متعددة بجدول مرن
  const [isReceiptMode, setIsReceiptMode] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [receiptRows, setReceiptRows] = useState([
    { toolName: "", serial: "", maintenanceTypes: [], priceUs: 0, priceDoc: 0, notes: "", shipping: false }
  ]);

  // قائمة الخدمات وقطع الغيار الموحدة والقابلة للتعديل والمسجلة محلياً
  const [servicesList, setServicesList] = useState([
    { id: 1, name: "تنظيف وتشحيم", type: "صيانة", count: 1, priceUsPast: 50, priceUs: 50, priceDocPast: 100, priceDoc: 100 },
    { id: 2, name: "تغيير بيلية ياباني", type: "قطعة غيار", count: 10, priceUsPast: 120, priceUs: 150, priceDocPast: 200, priceDoc: 250 },
    { id: 3, name: "تغيير روتور كامل", type: "قطعة غيار", count: 5, priceUsPast: 380, priceUs: 400, priceDocPast: 550, priceDoc: 600 },
    { id: 4, name: "تغيير جوانات", type: "قطعة غيار", count: 20, priceUsPast: 25, priceUs: 30, priceDocPast: 50, priceDoc: 60 },
    { id: 5, name: "إصلاح هيد كامل", type: "صيانة", count: 1, priceUsPast: 180, priceUs: 200, priceDocPast: 300, priceDoc: 350 },
  ]);

  const allServices = servicesList;

  const clearLocalStorageReceiptData = () => {
    setIsReceiptMode(false);
    setSelectedDocId("");
    setReceiptRows([{ toolName: "", serial: "", maintenanceTypes: [], priceUs: 0, priceDoc: 0, notes: "", shipping: false }]);
  };



  const handleAddCustomService = (name, type, count, priceUsPast, priceUs, priceDocPast, priceDoc) => {
    const newService = {
      id: Date.now(),
      name,
      type: type || "صيانة",
      count: type === "قطعة غيار" ? parseInt(count || 0) : 1,
      priceUsPast: parseFloat(priceUsPast || 0),
      priceUs: parseFloat(priceUs || 0),
      priceDocPast: parseFloat(priceDocPast || 0),
      priceDoc: parseFloat(priceDoc || 0)
    };
    setServicesList((prev) => [...prev, newService]);
  };

  const handleUpdateServiceField = (id, field, value) => {
    setServicesList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, [field]: value };
          // تصفير العدد إذا تم التغيير لصيانة
          if (field === "type" && value === "صيانة") {
            updated.count = 1;
          }
          return updated;
        }
        return s;
      })
    );
  };

  const handleDeleteService = (id) => {
    setServicesList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddRow = () => {
    setReceiptRows((prev) => [
      ...prev,
      { toolName: "", serial: "", maintenanceTypes: [], priceUs: 0, priceDoc: 0, notes: "", shipping: false }
    ]);
  };

  const handleRemoveRow = (index) => {
    if (receiptRows.length === 1) {
      alert("يجب أن يحتوي الجدول على معدة واحدة على الأقل!");
      return;
    }
    setReceiptRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index, field, value) => {
    setReceiptRows((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      
      // تعبئة وتجميع الأسعار تلقائياً إذا تغيرت قائمة الأعطال/الصيانات
      if (field === "maintenanceTypes") {
        const selectedList = value || [];
        let sumUs = 0;
        let sumDoc = 0;
         selectedList.forEach((serviceName) => {
           const service = allServices.find((s) => s.name === serviceName);
           if (service) {
             sumUs += parseFloat(service.priceUs || 0);
             sumDoc += parseFloat(service.priceDoc || 0);
           }
         });
         updated[index].priceUs = sumUs;
         updated[index].priceDoc = sumDoc;
      }
      return updated;
    });
  };

  const totalPriceUs = receiptRows.reduce((sum, row) => sum + (parseFloat(row.priceUs) || 0), 0);
  const totalPriceDoc = receiptRows.reduce((sum, row) => sum + (parseFloat(row.priceDoc) || 0), 0);

  const refreshData = async () => {
    if (!currentBranchId) return;
    const branchId = String(currentBranchId);
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

      const [docs, ords] = await Promise.all([
        safeFetchJson(API_ENDPOINTS.doctorsByBranch(branchId)),
        safeFetchJson(API_ENDPOINTS.ordersByBranch(branchId)),
      ]);

      setDoctors(Array.isArray(docs) ? docs : []);
      setActiveOrders(Array.isArray(ords) ? ords : []);
    } catch (error) {
      console.error("Error fetching maintenance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentBranchId]);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const res = await fetch(API_ENDPOINTS.createOrder, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId: parseInt(selectedDoctorId),
        handpieceName,
        serialNumber,
        status: "تحت الصيانة",
      }),
    });
    if (res.ok) {
      alert("تم فتح أمر صيانة ووضع الهاندبيس على الرف! 🛠️");
      setHandpieceName("");
      setSerialNumber("");
      refreshData();
    }
  };

  const handleSubmittingReceipt = async (e) => {
    e.preventDefault();
    if (!selectedDocId) {
      alert("الرجاء اختيار الطبيب أولاً!");
      return;
    }

    try {
      setLoading(true);
      // إرسال طلبات الإضافة بشكل متوازي
      const promises = receiptRows.map((row) => {
        const problemsText = Array.isArray(row.maintenanceTypes) && row.maintenanceTypes.length > 0
          ? row.maintenanceTypes.join(" + ")
          : "";

        const fullHandpieceName = row.toolName && problemsText
          ? `${row.toolName} (${problemsText})`
          : (row.toolName || problemsText || "معدة غير مسماة");

        return fetch(API_ENDPOINTS.createOrder, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctorId: parseInt(selectedDocId),
            handpieceName: fullHandpieceName,
            serialNumber: row.serial || "N/A",
            status: "تحت الصيانة",
            notes: row.notes || "",
            priceUs: parseFloat(row.priceUs || 0),
            priceDoc: parseFloat(row.priceDoc || 0),
            shipping: !!row.shipping
          }),
        });
      });

      const responses = await Promise.all(promises);
      const allOk = responses.every((r) => r.ok);

      if (allOk) {
        alert(`تم تسجيل الأجهزة بالكامل وبنجاح! 🛠️\nالإجمالي للورشة: ${totalPriceUs} ج.م\nالإجمالي للدكتور: ${totalPriceDoc} ج.م`);
        // تصفير البيانات وإغلاق شاشة الاستلام
        setIsReceiptMode(false);
        setSelectedDocId("");
        setReceiptRows([
          { toolName: "", serial: "", maintenanceTypes: [], priceUs: 0, priceDoc: 0, notes: "", shipping: false }
        ]);
        clearLocalStorageReceiptData();
        refreshData();
      } else {
        alert("حدث خطأ أثناء حفظ بعض المعدات، يرجى المحاولة لاحقاً.");
      }
    } catch (err) {
      console.error("Error creating maintenance orders:", err);
      alert("حدث خطأ فني أثناء إرسال الطلبات.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItemToOrder = async (e) => {
    e.preventDefault();
    // This endpoint is not supported by v1.json. It should probably be implemented in the future.
    alert("عذراً، هذه الميزة غير مدعومة حالياً من الخادم.");
  };

  const handleDeliverOrder = async (orderId) => {
    const res = await fetch(
      API_ENDPOINTS.updateOrderStatus(orderId, "تم التوصيل"),
      { method: "PUT" },
    );
    if (res.ok) {
      alert("تم تسليم الهاندبيس للعميل! ✅");
      refreshData();
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    // This endpoint does not exist in v1.json. We can't update status currently.
    alert("عذراً، هذه الميزة غير مدعومة حالياً من الخادم.");
  };

  const handleDeleteOrder = async (orderId) => {
    setActiveOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      if (API_ENDPOINTS.deleteOrder) {
        await fetch(API_ENDPOINTS.deleteOrder(orderId), { method: "DELETE" });
      }
    } catch (err) {
      console.warn("Failed to delete backend order, local state updated:", err);
    }
  };

  return {
    doctors,
    activeOrders,
    setActiveOrders,
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
    handleUpdateStatus,
    handleDeleteOrder,
    
    // إرجاع المتغيرات الجديدة
    isReceiptMode,
    setIsReceiptMode,
    selectedDocId,
    setSelectedDocId,
    receiptRows,
    setReceiptRows,
    allServices,
    servicesList,
    setServicesList,
    handleAddCustomService,
    handleUpdateServiceField,
    handleDeleteService,
    handleAddRow,
    handleRemoveRow,
    handleUpdateRow,
    totalPriceUs,
    totalPriceDoc,
    handleSubmittingReceipt
  };
}

