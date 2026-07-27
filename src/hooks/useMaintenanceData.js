import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/config/api";
import { useAuth } from "@/AuthContext";

export function useMaintenanceData() {
  const { currentBranchId } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingService, setIsAddingService] = useState(false);
  const [globalDiscount, setGlobalDiscount] = useState(0);

  const [suggestedToolNames, setSuggestedToolNames] = useState([]);
  const [suggestedFaultReasons, setSuggestedFaultReasons] = useState([]);
  const [suggestedContraStatuses, setSuggestedContraStatuses] = useState([]);

  useEffect(() => {
    try {
      setSuggestedToolNames(JSON.parse(localStorage.getItem("warsha_toolNames")) || []);
      setSuggestedFaultReasons(JSON.parse(localStorage.getItem("warsha_faultReasons")) || []);
      setSuggestedContraStatuses(JSON.parse(localStorage.getItem("warsha_contraStatuses")) || []);
    } catch(e) {}
  }, []);

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
    { handpieceType: "هاي", toolName: "", serial: "", maintenanceTypes: [], priceUs: 0, priceDoc: 0, notes: "", shipping: false }
  ]);

  // قائمة الخدمات وقطع الغيار الموحدة والقابلة للتعديل والمسجلة محلياً
  const [servicesList, setServicesList] = useState([]);

  const allServices = servicesList;

  const clearLocalStorageReceiptData = () => {
    setIsReceiptMode(false);
    setSelectedDocId("");
    setReceiptRows([{ handpieceType: "هاي", toolName: "", serial: "", maintenanceTypes: [], priceUs: 0, priceDoc: 0, notes: "", shipping: false }]);
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
      { handpieceType: "هاي", toolName: "", serial: "", maintenanceTypes: [], priceUs: 0, priceDoc: 0, notes: "", shipping: false }
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
  const totalPriceDoc = receiptRows.reduce((sum, row) => sum + (parseFloat(row.priceDoc) || 0), 0) - globalDiscount;

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

      const [docs, ords, invs] = await Promise.all([
        safeFetchJson(API_ENDPOINTS.doctorsByBranch(branchId)),
        safeFetchJson(API_ENDPOINTS.ordersByBranch(branchId)),
        safeFetchJson(API_ENDPOINTS.inventoriesByBranch(branchId)),
      ]);

      setDoctors(Array.isArray(docs) ? docs : []);
      setActiveOrders(Array.isArray(ords) ? ords : []);
      
      if (Array.isArray(invs)) {
        const mappedServices = invs.map(inv => ({
          id: inv.id,
          name: inv.itemName,
          type: inv.itemType === "Maintenance" || inv.itemType === "صيانة" ? "صيانة" : "قطعة غيار",
          count: parseInt(inv.quantity) || 0,
          priceUsPast: parseFloat(inv.costPrice) || 0,
          priceUs: parseFloat(inv.costPrice) || 0,
          priceDocPast: parseFloat(inv.sellingPrice) || 0,
          priceDoc: parseFloat(inv.sellingPrice) || 0
        }));
        setServicesList(mappedServices);
      }
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

      const typeMapping = {
        "هاي": 1, "لو": 2, "زراعة": 3, "روتاري": 4, 
        "ادابتور": 5, "سكيلر": 6, "جهاز موتور": 7, "استريت": 8
      };

      const handpiecesPayload = receiptRows.map((row) => {
        let items = [];
        let sumUs = 0;
        let sumDoc = 0;

        if (row.maintenanceTypes && row.maintenanceTypes.length > 0) {
          items = row.maintenanceTypes.map((t) => {
            const service = allServices.find(s => s.name === t);
            const wPrice = service ? parseFloat(service.priceUs || 0) : 0;
            const dPrice = service ? parseFloat(service.priceDoc || 0) : 0;
            sumUs += wPrice;
            sumDoc += dPrice;
            
            return {
              inventoryId: service ? service.id : null,
              quantity: 1,
              itemName: t,
              itemType: service ? service.type : "صيانة",
              workshopPrice: wPrice,
              doctorPrice: dPrice
            };
          });

          const diffUs = parseFloat(row.priceUs || 0) - sumUs;
          const diffDoc = parseFloat(row.priceDoc || 0) - sumDoc;
          
          if (items.length > 0 && (diffUs !== 0 || diffDoc !== 0)) {
            items[0].workshopPrice += diffUs;
            items[0].doctorPrice += diffDoc;
          }
        } else {
           items.push({
              inventoryId: null,
              quantity: 1,
              itemName: "أعمال صيانة غير محددة",
              itemType: "صيانة",
              workshopPrice: parseFloat(row.priceUs || 0),
              doctorPrice: parseFloat(row.priceDoc || 0)
           });
        }

        return {
          handpieceName: row.toolName || "",
          handpieceType: typeMapping[row.handpieceType || "هاي"] || 1,
          serialNumber: row.serial || "",
          contraCondition: row.contraStatus || null,
          failureReason: row.faultReason || null,
          notes: row.notes || null,
          items: items
        };
      });

      if (globalDiscount > 0) {
        handpiecesPayload.push({
          handpieceName: "خصم شامل",
          handpieceType: 1,
          serialNumber: "",
          contraCondition: null,
          failureReason: null,
          notes: "خصم مطبق على إجمالي الفاتورة",
          items: [{
             inventoryId: null,
             quantity: 1,
             itemName: "خصم",
             itemType: "أخرى",
             workshopPrice: 0,
             doctorPrice: -globalDiscount
          }]
        });
      }

      const wantsShipping = window.confirm("هل ترغب في إضافة مصاريف شحن لهذه الفاتورة؟");
      if (wantsShipping) {
        const priceStr = window.prompt("أدخل قيمة الشحن (ج.م):", "100");
        if (priceStr !== null) {
          const sPrice = parseFloat(priceStr) || 0;
          handpiecesPayload.push({
            handpieceName: "مصاريف شحن",
            handpieceType: 1,
            serialNumber: "",
            contraCondition: null,
            failureReason: null,
            notes: "تكلفة توصيل الفاتورة",
            items: [{
               inventoryId: null,
               quantity: 1,
               itemName: "شحن",
               itemType: "أخرى",
               workshopPrice: 0,
               doctorPrice: sPrice
            }]
          });
        }
      }

      const payload = {
        doctorId: parseInt(selectedDocId),
        branchId: parseInt(currentBranchId || 1),
        handpieces: handpiecesPayload
      };

      const res = await fetch(API_ENDPOINTS.createOrder, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(`تم تسجيل الفاتورة بالكامل وبنجاح! 🛠️\nالإجمالي للورشة: ${totalPriceUs} ج.م\nالإجمالي للدكتور: ${totalPriceDoc} ج.م`);
        
        try {
          let tNames = [...suggestedToolNames];
          let fReasons = [...suggestedFaultReasons];
          let cStatuses = [...suggestedContraStatuses];
          
          receiptRows.forEach(r => {
            if (r.toolName && !tNames.includes(r.toolName.trim())) tNames.push(r.toolName.trim());
            if (r.faultReason && !fReasons.includes(r.faultReason.trim())) fReasons.push(r.faultReason.trim());
            if (r.contraStatus && !cStatuses.includes(r.contraStatus.trim())) cStatuses.push(r.contraStatus.trim());
          });
          
          tNames = tNames.slice(-30);
          fReasons = fReasons.slice(-30);
          cStatuses = cStatuses.slice(-30);

          localStorage.setItem("warsha_toolNames", JSON.stringify(tNames));
          localStorage.setItem("warsha_faultReasons", JSON.stringify(fReasons));
          localStorage.setItem("warsha_contraStatuses", JSON.stringify(cStatuses));

          setSuggestedToolNames(tNames);
          setSuggestedFaultReasons(fReasons);
          setSuggestedContraStatuses(cStatuses);
        } catch(e) {}

        setIsReceiptMode(false);
        setSelectedDocId("");
        setReceiptRows([
          { handpieceType: "هاي", toolName: "", serial: "", maintenanceTypes: [], priceUs: 0, priceDoc: 0, notes: "", shipping: false }
        ]);
        setGlobalDiscount(0);
        clearLocalStorageReceiptData();
        refreshData();
      } else {
        alert("حدث خطأ أثناء حفظ الفاتورة، يرجى المحاولة لاحقاً.");
      }
    } catch (err) {
      console.error("Error creating maintenance order:", err);
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
    globalDiscount,
    setGlobalDiscount,
    suggestedToolNames,
    suggestedFaultReasons,
    suggestedContraStatuses,
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

