import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/config/api";

export function useMaintenanceData() {
  const [doctors, setDoctors] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // States القديمة للاستلام العادي (نحتفظ بها للتوافق أو نزيلها إذا استبدلناها)
  const [handpieceName, setHandpieceName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [inventoryId, setInventoryId] = useState("");

  // States الجديدة لاستلام معدات متعددة بجدول مرن مع الحفظ التلقائي في localStorage
  const [isReceiptMode, setIsReceiptMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("elwarsha_is_receipt_mode") === "true";
    }
    return false;
  });
  const [selectedDocId, setSelectedDocId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("elwarsha_receipt_doc_id") || "";
    }
    return "";
  });
  const [receiptRows, setReceiptRows] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("elwarsha_receipt_rows");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [{ toolName: "", serial: "", maintenanceTypes: [], priceUs: 0, priceDoc: 0, notes: "", shipping: false }];
  });

  // قائمة الخدمات وقطع الغيار الموحدة والقابلة للتعديل والمسجلة محلياً
  const [servicesList, setServicesList] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("elwarsha_services_list");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [
      { id: 1, name: "تنظيف وتشحيم", type: "صيانة", count: 1, priceUsPast: 50, priceUs: 50, priceDocPast: 100, priceDoc: 100 },
      { id: 2, name: "تغيير بيلية ياباني", type: "قطعة غيار", count: 10, priceUsPast: 120, priceUs: 150, priceDocPast: 200, priceDoc: 250 },
      { id: 3, name: "تغيير روتور كامل", type: "قطعة غيار", count: 5, priceUsPast: 380, priceUs: 400, priceDocPast: 550, priceDoc: 600 },
      { id: 4, name: "تغيير جوانات", type: "قطعة غيار", count: 20, priceUsPast: 25, priceUs: 30, priceDocPast: 50, priceDoc: 60 },
      { id: 5, name: "إصلاح هيد كامل", type: "صيانة", count: 1, priceUsPast: 180, priceUs: 200, priceDocPast: 300, priceDoc: 350 },
    ];
  });

  const allServices = servicesList;

  // تتبع المزامنة لـ localStorage للحفظ التلقائي أثناء الكتابة
  useEffect(() => {
    localStorage.setItem("elwarsha_is_receipt_mode", isReceiptMode ? "true" : "false");
  }, [isReceiptMode]);

  useEffect(() => {
    localStorage.setItem("elwarsha_receipt_doc_id", selectedDocId);
  }, [selectedDocId]);

  useEffect(() => {
    localStorage.setItem("elwarsha_receipt_rows", JSON.stringify(receiptRows));
  }, [receiptRows]);

  useEffect(() => {
    localStorage.setItem("elwarsha_services_list", JSON.stringify(servicesList));
  }, [servicesList]);

  const clearLocalStorageReceiptData = () => {
    localStorage.removeItem("elwarsha_is_receipt_mode");
    localStorage.removeItem("elwarsha_receipt_doc_id");
    localStorage.removeItem("elwarsha_receipt_rows");
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
    try {
      setLoading(true);
      const [docsRes, ordersRes] = await Promise.all([
        fetch(API_ENDPOINTS.doctors).catch(() => ({ json: async () => [] })),
        fetch(API_ENDPOINTS.activeOrders).catch(() => ({ json: async () => [] })),
      ]);
      let docs = await docsRes.json();
      let ords = await ordersRes.json();

      // Mock fallback
      if (!Array.isArray(docs) || docs.length === 0) {
        docs = [{ id: 1, name: "د. محمد علي", phone: "01012345678", address1: "القاهرة، مدينة نصر", address2: "الجيزة، الدقي" }];
      }
      if (!Array.isArray(ords) || ords.length === 0) {
        ords = [{ id: 101, doctorId: 1, doctorName: "د. محمد علي", handpieceName: "هاندبيس NSK", serialNumber: "NSK-9982", status: "تحت الصيانة" }];
      }

      setDoctors(docs);
      setActiveOrders(ords);
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
      API_ENDPOINTS.updateOrderStatus(orderId, "تم التوصيل"),
      { method: "PUT" },
    );
    if (res.ok) {
      alert("تم تسليم الهاندبيس للعميل! ✅");
      refreshData();
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    // تحديث الحالة محلياً فوراً ليبقى التطبيق مستجيباً (مثلاً للمعدات الوهمية أو السيرفر المغلق)
    setActiveOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const res = await fetch(
        API_ENDPOINTS.updateOrderStatus(orderId, newStatus),
        { method: "PUT" },
      );
      if (res.ok) {
        refreshData();
      } else {
        console.warn("Failed to sync status update with backend, local state remains updated.");
      }
    } catch (err) {
      console.warn("Failed to fetch backend endpoint, fallback to local status update:", err);
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
    handleUpdateStatus,
    
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

