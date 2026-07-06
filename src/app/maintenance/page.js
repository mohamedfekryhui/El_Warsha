"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useMaintenanceData } from "@/hooks/useMaintenanceData";
import {
  Wrench,
  Plus,
  CheckCircle2,
  Settings2,
  ShieldCheck,
  X,
  Scissors,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.08 } }
};
const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function MaintenancePage() {
  const router = useRouter();
  const {
    doctors,
    activeOrders,
    loading,
    selectedOrderId,
    setSelectedOrderId,
    inventoryId,
    setInventoryId,
    handleAddItemToOrder,
    handleDeliverOrder,
    handleUpdateStatus,

    // المتغيرات الجديدة
    isReceiptMode,
    setIsReceiptMode,
    selectedDocId,
    setSelectedDocId,
    receiptRows,
    setReceiptRows,
    allServices,
    handleAddCustomService,
    handleUpdateServiceField,
    handleDeleteService,
    handleAddRow,
    handleRemoveRow,
    handleUpdateRow,
    totalPriceUs,
    totalPriceDoc,
    handleSubmittingReceipt,
    servicesList,
    setServicesList
  } = useMaintenanceData();

  // states الخاصة بـ تسجيل صيانة أو قطعة غيار جديدة مخصصة
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceType, setNewServiceType] = useState("قطعة غيار");
  const [newServiceCount, setNewServiceCount] = useState(1);
  const [newServicePriceUs, setNewServicePriceUs] = useState("");
  const [newServicePriceDoc, setNewServicePriceDoc] = useState("");
  
  const [activeDropdownRow, setActiveDropdownRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState("");

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setToastMessage(`تم النسخ إلى الحافظة: "${text}"`);
    setTimeout(() => setToastMessage(""), 2000);
  };

  const handleAiAnalyze = () => {
    setShowAiModal(true);
    setAiLoading(true);
    setAiReport("");
    setTimeout(() => {
      const active = (activeOrders || []).length;
      const services = (servicesList || []).length;
      const maintenance = (servicesList || []).filter(s => s.type === "صيانة").length;
      const parts = (servicesList || []).filter(s => s.type === "قطعة غيار").length;
      setAiReport(
`🔧 تقرير تحليل الصيانة الذكي:

📦 الأجهزة النشطة قيد الصيانة: ${active} جهاز
🛠️ إجمالي خدمات الرف: ${services} (${maintenance} صيانة، ${parts} قطعة غيار)

💡 التوصيات:
• تسريع تسليم الأجهزة التي اكتملت صيانتها لتحسين التدفق المالي.
• مراجعة قطع الغيار الأكثر استهلاكاً وتأمين مخزون احتياطي منها.
• جدولة المراجعة الدورية لكل جهاز قيد الصيانة كل 48 ساعة.

🎯 مؤشر الكفاءة التشغيلية: ${active > 10 ? 'مرتفع — يُنصح بزيادة طاقم الصيانة' : active > 5 ? 'متوسط — أداء جيد' : 'ممتاز — الورشة في وضع مريح'}`
      );
      setAiLoading(false);
    }, 1200);
  };
  const [typeFilter, setTypeFilter] = useState("all");

  const getRootName = (name) => {
    if (!name) return "";
    return name.split("(")[0].trim().toLowerCase();
  };

  // توليد لون ديناميكي HSL فريد بناءً على اسم الصنف لمنع التكرار نهائياً
  const getDynamicColors = (name) => {
    const root = getRootName(name);
    if (!root) return { primary: "#3b82f6" };
    let hash = 0;
    for (let i = 0; i < root.length; i++) {
      hash = root.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return {
      primary: `hsl(${hue}, 70%, 55%)`
    };
  };

  const filteredServices = (servicesList || []).filter((s) => {
    const matchesSearch = s.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" ? true : s.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // الترتيب: صيانة أولاً ثم قطعة غيار، ثم أبجدياً بالاسم الأساسي
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (a.type === "صيانة" && b.type === "قطعة غيار") return -1;
    if (a.type === "قطعة غيار" && b.type === "صيانة") return 1;
    const nameA = getRootName(a.name);
    const nameB = getRootName(b.name);
    return nameA.localeCompare(nameB, "ar");
  });

  const handleSaveCustomService = (e) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const priceUs = newServiceType === "صيانة" ? 0 : parseFloat(newServicePriceUs || 0);
    const priceDoc = parseFloat(newServicePriceDoc || 0);

    // التحقق من أن سعر الطبيب أكبر من أو يساوي سعر الورشة لقطع الغيار
    if (newServiceType === "قطعة غيار" && priceDoc < priceUs) {
      alert("⚠️ خطأ: يجب أن يكون سعر الطبيب أكبر من أو يساوي سعر الورشة لقطع الغيار.");
      return;
    }

    handleAddCustomService(
      newServiceName.trim(),
      newServiceType,
      newServiceType === "قطعة غيار" ? newServiceCount : 1,
      0,
      priceUs,
      0,
      priceDoc
    );

    alert("تم تسجيل الصيانة/قطعة الغيار بنجاح! ⚙️");
    setNewServiceName("");
    setNewServiceType("قطعة غيار");
    setNewServiceCount(1);
    setNewServicePriceUs("");
    setNewServicePriceDoc("");
    setShowAddServiceModal(false);
  };

  // تقسيم الصف في قائمة خدمات الصيانة وقطع الغيار مع إضافة تاريخ اليوم
  const handleSplitRow = (id) => {
    setServicesList((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const target = prev[idx];
      
      let oldQuantity = target.count || 1;
      const currentDateString = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      
      if (oldQuantity > 1) {
        // تعديل الكمية القديمة لتصبح N - 1
        const updatedTarget = { ...target, count: oldQuantity - 1 };
        const newRow = {
          ...target,
          id: Date.now() + Math.random(),
          count: 1,
          name: `${target.name} (سعر جديد - ${currentDateString})`
        };
        
        const nextList = [...prev];
        nextList[idx] = updatedTarget;
        nextList.splice(idx + 1, 0, newRow);
        return nextList;
      } else {
        // إذا كانت الكمية 1، ننسخ الصف فقط لتغيير السعر
        const newRow = {
          ...target,
          id: Date.now() + Math.random(),
          count: 1,
          name: `${target.name} (نسخة سعر - ${currentDateString})`
        };
        const nextList = [...prev];
        nextList.splice(idx + 1, 0, newRow);
        return nextList;
      }
    });
    alert("تم تقسيم الصف بنجاح! يمكنك الآن تعديل السعر والكمية بشكل منفصل. ✂️");
  };

  // ستايلات ملونة لحالة الطلب لتعزيز الـ UX
  const getStatusStyle = (status) => {
    switch (status) {
      case "تحت الصيانة":
        return "bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      case "تمت الصيانة وتحت الشحن":
        return "bg-blue-50 text-blue-700 border-blue-250 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
      case "تم التوصيل":
        return "bg-emerald-50 text-emerald-750 border-emerald-255 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20";
    }
  };

  // حركة التنقل بالأسهم والإنتر على غرار Excel
  const handleKeyDown = (e, rowIdx, colIdx) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextInput = document.querySelector(`[data-row="${rowIdx + 1}"][data-col="${colIdx}"]`);
      if (nextInput) {
        nextInput.focus();
      } else if (e.key === "Enter" && rowIdx === receiptRows.length - 1) {
        handleAddRow();
        setTimeout(() => {
          const newlyAdded = document.querySelector(`[data-row="${rowIdx + 1}"][data-col="${colIdx}"]`);
          if (newlyAdded) newlyAdded.focus();
        }, 50);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevInput = document.querySelector(`[data-row="${rowIdx - 1}"][data-col="${colIdx}"]`);
      if (prevInput) prevInput.focus();
    } else if (e.key === "ArrowRight") {
      const prevCol = document.querySelector(`[data-row="${rowIdx}"][data-col="${colIdx - 1}"]`);
      if (prevCol) prevCol.focus();
    } else if (e.key === "ArrowLeft") {
      const nextCol = document.querySelector(`[data-row="${rowIdx}"][data-col="${colIdx + 1}"]`);
      if (nextCol) nextCol.focus();
    }
  };

  // التحقق عند حفظ الفاتورة بالكامل
  const handleLocalSubmittingReceipt = (e) => {
    e.preventDefault();
    const hasPricingError = receiptRows.some((row) => {
      return parseFloat(row.priceDoc || 0) < parseFloat(row.priceUs || 0);
    });
    if (hasPricingError) {
      alert("⚠️ تنبيه: يوجد معدة في الفاتورة سعر الطبيب فيها أقل من سعر الورشة. يرجى تصحيح الأسعار قبل الحفظ.");
      return;
    }
    handleSubmittingReceipt(e);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8FAFC] text-gray-900 dark:bg-[#0B1120] dark:text-gray-100 transition-colors duration-300 font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col justify-center items-center h-screen space-y-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-650 border-r-indigo-650 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-purple-500 border-l-purple-500 animate-spin [animation-duration:1.5s]"></div>
            <div className="absolute inset-4 bg-indigo-500/10 rounded-full animate-pulse"></div>
          </div>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 animate-pulse">جاري تحميل غرفة الصيانة والرف...</span>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-gray-900 dark:bg-[#0B1120] dark:text-gray-100 transition-colors duration-300 font-sans">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <motion.div
          initial="initial"
          animate="animate"
          variants={containerVariants}
          className="space-y-8"
        >
          <div className="mb-2 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                غرفة الصيانة والرف <Wrench className="text-amber-500" size={28} />
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                إدارة استلام المعدات، تركيب قطع الغيار، والتسليم.
              </p>
            </div>
            <button
              onClick={handleAiAnalyze}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <Sparkles size={15} className="text-amber-300 animate-pulse" />
              حلل الصيانة ذكياً
            </button>
          </div>

        <div className="space-y-8">
          {/* قسم الاستلام والتركيب */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 1. كارت الاستلام: إما زر التفعيل أو الجدول المرن */}
            {isReceiptMode ? (
              <form
                onSubmit={handleLocalSubmittingReceipt}
                className="lg:col-span-2 bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-800/60 space-y-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                    <Plus size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                    نموذج استلام الأجهزة والمعدات الجديدة (جدول Excel ذكي)
                  </h3>
                </div>

                {/* الخطوة الأولى: اختيار الطبيب */}
                <div className="space-y-4">
                  <div className="max-w-md">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 mr-1">
                      اختر الطبيب أولاً للبدء
                    </label>
                    <select
                      required
                      value={selectedDocId}
                      onChange={(e) => setSelectedDocId(e.target.value)}
                      className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-teal-500 outline-none text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      <option value="" className="text-gray-900 dark:text-white bg-white dark:bg-[#1E293B]">اختر الطبيب صاحب المعدة...</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id} className="text-gray-900 dark:text-white bg-white dark:bg-[#1E293B]">
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* الخطوة الثانية: جدول الاستلام المرن Excel */}
                  {selectedDocId ? (
                    <div className="space-y-5 pt-2">
                      <div className="overflow-x-auto border border-gray-200 dark:border-gray-800/80 rounded-xl">
                        <table className="w-full text-right border-collapse min-w-[900px] border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
                          <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 divide-x divide-x-reverse divide-gray-200 dark:divide-gray-800">
                              <th className="p-2 text-center text-[10px] font-bold w-10"></th>
                              <th className="p-2 text-xs font-bold w-1/4">اسم المعدة</th>
                              <th className="p-2 text-xs font-bold w-1/6">الرقم التسلسلي S/N</th>
                              <th className="p-2 text-xs font-bold w-1/4">نوع الصيانة</th>
                              <th className="p-2 text-xs font-bold w-20 text-center">سعر الورشة</th>
                              <th className="p-2 text-xs font-bold w-20 text-center">سعر الطبيب</th>
                              <th className="p-2 text-xs font-bold w-1/4">ملاحظات</th>
                              <th className="p-2 text-xs font-bold w-16 text-center text-blue-600 dark:text-blue-400">الشحن</th>
                              <th className="p-2 text-xs font-bold w-12 text-center">حذف</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#151F32]">
                            {receiptRows.map((row, idx) => {
                              const hasPriceWarning = parseFloat(row.priceDoc || 0) < parseFloat(row.priceUs || 0);
                              return (
                                <tr key={idx} className="divide-x divide-x-reverse divide-gray-200 dark:divide-gray-800 hover:bg-gray-50/40 dark:hover:bg-gray-900/10">
                                  <td className="p-2 text-center text-xs font-bold text-gray-400 dark:text-gray-600 bg-gray-50/50 dark:bg-gray-900/30">
                                    {idx + 1}
                                  </td>
                                  <td className="p-0">
                                    <input type="text" value={row.toolName} onChange={(e) => handleUpdateRow(idx, "toolName", e.target.value)} onKeyDown={(e) => handleKeyDown(e, idx, 0)} data-row={idx} data-col={0} className="w-full h-10 px-3 bg-transparent text-xs text-gray-900 dark:text-white border-0 outline-none focus:ring-1 focus:ring-teal-500 font-semibold" />
                                  </td>
                                  <td className="p-0">
                                    <input type="text" value={row.serial} onChange={(e) => handleUpdateRow(idx, "serial", e.target.value)} onKeyDown={(e) => handleKeyDown(e, idx, 1)} data-row={idx} data-col={1} className="w-full h-10 px-3 bg-transparent text-xs text-gray-900 dark:text-white border-0 outline-none focus:ring-1 focus:ring-teal-500" />
                                  </td>
                                  <td className="p-0 relative">
                                    <div className="w-full h-10 flex items-center justify-between px-3">
                                      <button type="button" onClick={() => setActiveDropdownRow(activeDropdownRow === idx ? null : idx)} className="w-full text-right text-xs text-gray-700 dark:text-gray-300 focus:outline-none flex justify-between items-center cursor-pointer font-bold">
                                        <span className="truncate">{row.maintenanceTypes?.length > 0 ? row.maintenanceTypes.join(" + ") : "اختر..."}</span>
                                        <span className="text-[9px] text-gray-400 mr-2">▼</span>
                                      </button>
                                    </div>
                                    {activeDropdownRow === idx && (
                                      <>
                                        <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownRow(null)}></div>
                                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl z-20 w-64 max-h-60 overflow-y-auto p-2 text-xs">
                                          {allServices.map((s) => {
                                            const isChecked = row.maintenanceTypes?.includes(s.name);
                                            return (
                                              <label key={`${s.id}-${s.name}`} className="flex items-center gap-2.5 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer font-bold text-gray-700 dark:text-gray-300">
                                                <input type="checkbox" checked={isChecked} onChange={() => { const newTypes = isChecked ? row.maintenanceTypes.filter((t) => t !== s.name) : [...(row.maintenanceTypes || []), s.name]; handleUpdateRow(idx, "maintenanceTypes", newTypes); }} className="rounded text-teal-655 focus:ring-teal-500 w-3.5 h-3.5" />
                                                <span className="flex-1 text-right">{s.name}</span>
                                              </label>
                                            );
                                          })}
                                        </div>
                                      </>
                                    )}
                                  </td>
                                  <td className="p-0">
                                    <input type="number" value={row.priceUs || ""} onChange={(e) => handleUpdateRow(idx, "priceUs", parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleKeyDown(e, idx, 2)} data-row={idx} data-col={2} className={`w-full h-10 px-2 bg-transparent text-xs text-center border-0 outline-none font-bold text-indigo-650 dark:text-indigo-400 ${hasPriceWarning ? "bg-rose-50/50 dark:bg-rose-955/20 text-rose-500" : ""}`} />
                                  </td>
                                  <td className="p-0">
                                    <input type="number" value={row.priceDoc || ""} onChange={(e) => handleUpdateRow(idx, "priceDoc", parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleKeyDown(e, idx, 3)} data-row={idx} data-col={3} className={`w-full h-10 px-2 bg-transparent text-xs border-0 outline-none text-center font-bold text-emerald-650 dark:text-emerald-455 ${hasPriceWarning ? "bg-rose-50/50 dark:bg-rose-955/20 text-rose-500" : ""}`} />
                                  </td>
                                  <td className="p-0">
                                    <input type="text" value={row.notes} onChange={(e) => handleUpdateRow(idx, "notes", e.target.value)} onKeyDown={(e) => handleKeyDown(e, idx, 4)} data-row={idx} data-col={4} className="w-full h-10 px-3 bg-transparent text-xs text-gray-900 dark:text-white border-0 outline-none" />
                                  </td>
                                  <td className="p-0 text-center">
                                    <input
                                      type="checkbox"
                                      checked={!!row.shipping}
                                      onChange={(e) => handleUpdateRow(idx, "shipping", e.target.checked)}
                                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                      title="تحديد في حالة وجود شحن"
                                    />
                                  </td>
                                  <td className="p-0 text-center">
                                    <button type="button" onClick={() => handleRemoveRow(idx)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955/20 rounded transition-colors cursor-pointer"><X size={14} /></button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-1">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleAddRow}
                            className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Plus size={14} /> إضافة معدة أخرى
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddServiceModal(true)}
                            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Settings2 size={14} /> تسجيل صيانة او قطع غيار
                          </button>
                        </div>

                        <div className="p-4 bg-gray-50/50 dark:bg-gray-905/50 border border-gray-205 dark:border-gray-805 rounded-2xl flex items-center gap-6 text-xs font-bold shadow-sm shrink-0">
                          <div>
                            <span className="text-indigo-650 dark:text-indigo-400">إجمالي الورشة: </span>
                            <span className="text-sm font-black text-indigo-700 dark:text-indigo-300 mr-1">{totalPriceUs} ج.م</span>
                          </div>
                          <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
                          <div>
                            <span className="text-emerald-650 dark:text-emerald-455">إجمالي الطبيب: </span>
                            <span className="text-sm font-black text-emerald-700 dark:text-emerald-300 mr-1">{totalPriceDoc} ج.م</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-6 border-t border-gray-150/40 dark:border-gray-800/40 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setIsReceiptMode(false);
                            setSelectedDocId("");
                            setReceiptRows([{ toolName: "", serial: "", maintenanceTypes: [], priceUs: 0, priceDoc: 0, notes: "" }]);
                          }}
                          className="px-5 py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-xs transition-all shadow-md shadow-teal-500/15 cursor-pointer h-[46px] flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 size={16} /> حفظ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800/80 rounded-2xl text-xs font-semibold">
                      الرجاء اختيار الطبيب لعرض وتعبئة تفاصيل جدول الاستلام.
                    </div>
                  )}
                </div>
              </form>
            ) : (
              <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-800/60 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                      <Plus size={20} />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                      استلام معدة صيانة جديدة
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    ابدأ بتسجيل واستلام أجهزة الهاندبيس ومعدات العيادات الجديدة، مع إمكانية إدخال عدة أجهزة في نفس الوقت، وتحديد نوع العطل وتسجيل الأسعار الخاصة بالورشة والطبيب بشكل مرن.
                  </p>
                </div>
                <button
                  onClick={() => setIsReceiptMode(true)}
                  className="w-full bg-teal-655 hover:bg-teal-705 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-md shadow-teal-500/20 cursor-pointer text-sm"
                >
                  <Plus size={18} /> استلام معدة جديدة
                </button>
              </div>
            )}

            {!isReceiptMode && (
              <form
                onSubmit={handleSaveCustomService}
                className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-800/60 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold">
                      <Settings2 size={20} />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                      تسجيل صيانة أو قطعة غيار جديدة
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 mr-1 text-right">
                      النوع
                    </label>
                    <div className="flex w-full rounded-2xl bg-gray-150/70 dark:bg-gray-900/60 p-1 border border-gray-200 dark:border-gray-800/80">
                      <button
                        type="button"
                        onClick={() => setNewServiceType("قطعة غيار")}
                        className={`flex-1 py-3 text-xs font-bold text-center rounded-xl transition-all cursor-pointer ${
                          newServiceType === "قطعة غيار"
                            ? "bg-blue-600 text-white shadow-md font-black"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        }`}
                      >
                        ⚙️ قطعة غيار (منتج)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewServiceType("صيانة")}
                        className={`flex-1 py-3 text-xs font-bold text-center rounded-xl transition-all cursor-pointer ${
                          newServiceType === "صيانة"
                            ? "bg-blue-600 text-white shadow-md font-black"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        }`}
                      >
                        🔧 صيانة (خدمة)
                      </button>
                    </div>
                  </div>

                  {newServiceType === "قطعة غيار" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 mr-1 text-right font-bold">
                        العدد / الكمية
                      </label>
                      <input
                        type="number"
                        required
                        value={newServiceCount}
                        onChange={(e) => setNewServiceCount(parseInt(e.target.value) || 1)}
                        placeholder="1"
                        className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold text-gray-700 dark:text-gray-300 text-right"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 mr-1 text-right">
                      الاسم (صيانة / قطعة غيار)
                    </label>
                    <input
                      type="text"
                      required
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="مثال: تغيير بيلية فرنسي"
                      className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-755 dark:text-gray-300 text-right"
                    />
                  </div>

                  {/* أسعار الورشة والطبيب */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 mr-1 text-right font-bold">
                        سعر الطبيب
                      </label>
                      <input
                        type="number"
                        required
                        value={newServicePriceDoc}
                        onChange={(e) => setNewServicePriceDoc(e.target.value)}
                        placeholder="0"
                        className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold text-emerald-650 dark:text-emerald-455"
                      />
                    </div>
                    {newServiceType !== "صيانة" && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 mr-1 text-right font-bold">
                          سعر الورشة
                        </label>
                        <input
                          type="number"
                          required
                          value={newServicePriceUs}
                          onChange={(e) => setNewServicePriceUs(e.target.value)}
                          placeholder="0"
                          className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold text-indigo-650 dark:text-indigo-400"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl font-bold transition-all transform hover:-translate-y-0.5 shadow-md shadow-indigo-500/20 mt-4 cursor-pointer text-sm"
                >
                  حفظ وتسجيل
                </button>
              </form>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-800/60">
            <h3 className="font-bold text-lg mb-6 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <ShieldCheck size={20} className="text-amber-500" /> المعدات قيد
              الصيانة حالياً
            </h3>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                لا توجد معدات تحت الصيانة حالياً.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" dir="rtl">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-gray-50 dark:bg-[#151F32] p-6 rounded-3xl border border-gray-100 dark:border-gray-855 flex flex-col justify-between hover:shadow-md transition-all space-y-4"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            onClick={() => {
                              if (order.doctorId) {
                                router.push(`/doctors/${order.doctorId}`);
                              }
                            }}
                            className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                            title="عرض ملف الطبيب وتفاصيل الصيانات"
                          >
                            {order.doctorName || "طبيب مجهول"}
                          </span>
                          
                          {order.shipping && (
                            <span className="text-[9px] font-black bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md flex items-center gap-0.5 shrink-0 select-none">
                              🚚 شحن
                            </span>
                          )}
                        </div>
                        
                        {/* حالة التوصيل قابلة للتعديل والتحويل عبر دروب داون ملون لتعزيز الـ UX */}
                        <select
                          value={order.status || "تحت الصيانة"}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full border transition-all focus:outline-none cursor-pointer outline-none ${getStatusStyle(order.status || "تحت الصيانة")}`}
                        >
                          <option value="تحت الصيانة" className="bg-white dark:bg-[#1E293B] text-amber-700 dark:text-amber-400 font-bold">🛠️ تحت الصيانة</option>
                          <option value="تمت الصيانة وتحت الشحن" className="bg-white dark:bg-[#1E293B] text-blue-700 dark:text-blue-400 font-bold">🚚 تمت الصيانة وتحت شحن</option>
                          <option value="تم التوصيل" className="bg-white dark:bg-[#1E293B] text-emerald-700 dark:text-emerald-450 font-bold">✅ تم التوصيل</option>
                        </select>
                      </div>

                      {/* إشارة لعدد المعدات وتاريخ الاستلام */}
                      <div className="flex justify-between items-center text-[9px] text-gray-500 dark:text-gray-400 font-bold bg-gray-100/40 dark:bg-gray-900/30 p-2 rounded-xl my-2 border border-gray-150/40 dark:border-gray-800/40">
                        <span className="flex items-center gap-1">📦 عدد المعدات: {Array.isArray(order.items) && order.items.length > 0 ? order.items.length : 1}</span>
                        <span
                          className="flex items-center gap-1 cursor-pointer hover:text-indigo-650 transition-colors"
                          onClick={() => copyToClipboard(order.createdAt ? new Date(order.createdAt).toLocaleDateString("ar-EG") : new Date().toLocaleDateString("ar-EG"))}
                          title="اضغط لنسخ التاريخ"
                        >
                          📅 {order.createdAt ? new Date(order.createdAt).toLocaleDateString("ar-EG") : new Date().toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="border-b border-gray-200/50 dark:border-gray-800/40 pb-2 last:border-0 last:pb-0">
                            <h4 className="font-bold text-xs text-gray-855 dark:text-gray-150">
                              <span
                                className="cursor-pointer hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors"
                                onClick={() => copyToClipboard(item.toolName)}
                                title="اضغط لنسخ اسم الصنف"
                              >
                                {item.toolName}
                              </span>{" "}
                              {item.serial && (
                                <span
                                  className="text-[10px] text-gray-400 hover:text-indigo-650 cursor-pointer transition-colors font-semibold"
                                  onClick={() => copyToClipboard(item.serial)}
                                  title="اضغط لنسخ الرقم التسلسلي"
                                >
                                  (S/N: {item.serial})
                                </span>
                              )}
                            </h4>
                            <p
                              onClick={() => copyToClipboard(item.maintenanceTypes?.join(" + "))}
                              className="text-[9px] text-gray-500 dark:text-gray-400 font-semibold mt-1 cursor-pointer hover:text-indigo-650 transition-colors"
                              title="اضغط لنسخ المشاكل"
                            >
                              المشكلة: {item.maintenanceTypes?.join(" + ") || "غير محدد"}
                            </p>
                            {item.notes && (
                              <p
                                onClick={() => copyToClipboard(item.notes)}
                                className="text-[9px] text-amber-600 dark:text-amber-500/80 mt-0.5 italic cursor-pointer hover:text-amber-700 transition-colors"
                                title="اضغط لنسخ الملاحظات"
                              >
                                ملاحظة: {item.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200/60 dark:border-gray-800/40 pt-3 flex justify-between items-center text-xs font-bold">
                      <div
                        onClick={() => copyToClipboard(((order.items || []).reduce((sum, i) => sum + (parseFloat(i.priceUs) || 0), 0)).toString())}
                        className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                        title="اضغط لنسخ سعر الورشة"
                      >
                        سعر الورشة: <span className="text-indigo-650 dark:text-indigo-400 font-black">{(order.items || []).reduce((sum, i) => sum + (parseFloat(i.priceUs) || 0), 0)} ج.م</span>
                      </div>
                      <div
                        onClick={() => copyToClipboard(((order.items || []).reduce((sum, i) => sum + (parseFloat(i.priceDoc) || 0), 0)).toString())}
                        className="text-teal-650 dark:text-teal-400 cursor-pointer hover:text-emerald-655 transition-colors"
                        title="اضغط لنسخ سعر الطبيب"
                      >
                        سعر الطبيب: <span className="text-emerald-650 dark:text-emerald-455 font-black">{(order.items || []).reduce((sum, i) => sum + (parseFloat(i.priceDoc) || 0), 0)} ج.م</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* قسم قائمة الخدمات وقطع الغيار المتوفرة */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-800/60 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" dir="rtl">
              <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Wrench size={20} className="text-indigo-500" /> قائمة الصيانات وقطع الغيار المتوفرة
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  جدول تفاعلي لتعديل الأسعار وتحديث كميات قطع الغيار وإضافة أسعار جديدة مباشرة.
                </p>
              </div>

              {/* عناصر التصفية والبحث */}
              <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
                <input
                  type="text"
                  placeholder="بحث بالاسم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="p-2.5 px-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-right w-full sm:w-48 text-gray-700 dark:text-gray-300"
                />

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="p-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-bold cursor-pointer text-gray-755 dark:text-gray-300"
                >
                  <option value="all">كل الأنواع</option>
                  <option value="صيانة">🔧 صيانة فقط</option>
                  <option value="قطعة غيار">⚙️ قطعة غيار فقط</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800/80 rounded-xl" dir="rtl">
              <table className="w-full text-right border-collapse min-w-[900px] border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
                <thead>
                  <tr className="bg-gray-150 dark:bg-gray-800 text-gray-600 dark:text-gray-400 divide-x divide-x-reverse divide-gray-200 dark:divide-gray-800 font-bold">
                    <th className="p-3 text-center text-xs w-12 bg-gray-200/50 dark:bg-gray-900/40">#</th>
                    <th className="p-3 text-xs w-1/3">الاسم (صيانة / قطعة غيار)</th>
                    <th className="p-3 text-xs text-center w-1/6">النوع</th>
                    <th className="p-3 text-xs text-center w-20">العدد / الكمية</th>
                    <th className="p-3 text-xs text-center w-32 text-indigo-650 dark:text-indigo-400">سعر الورشة (ج.م)</th>
                    <th className="p-3 text-xs text-center w-32 text-emerald-650 dark:text-emerald-455">سعر الطبيب (ج.م)</th>
                    <th className="p-3 text-xs text-center w-48 text-indigo-650 dark:text-indigo-400">＋ إضافة سعر آخر (اختياري)</th>
                    <th className="p-3 text-xs text-center w-12">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {sortedServices.map((item, idx) => {
                    const hasPricingError = item.type === "قطعة غيار" && parseFloat(item.priceDoc || 0) < parseFloat(item.priceUs || 0);
                    const colors = getDynamicColors(item.name);
                    
                    return (
                      <tr key={`${item.id}-${idx}`} className="divide-x divide-x-reverse divide-gray-200 dark:divide-gray-800 hover:bg-gray-50/40 dark:hover:bg-gray-900/10 transition-all border-b border-gray-150 dark:border-gray-800/80 bg-white dark:bg-[#1E293B]/20">
                        <td className="p-3 text-center text-xs font-bold text-gray-400 dark:text-gray-600 bg-gray-50/50 dark:bg-gray-900/30 relative">
                          {/* خط جانبي ملون ديناميكي للتميز */}
                          <div className="absolute top-0 right-0 bottom-0 w-1" style={{ backgroundColor: colors.primary }} />
                          {idx + 1}
                        </td>
                        <td className="p-1">
                          <div className="flex items-center gap-2 px-2 w-full">
                            {/* نقطة ملونة ديناميكية بجانب الاسم */}
                            <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: colors.primary }} title="مؤشر الصنف الموحد" />
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleUpdateServiceField(item.id, "name", e.target.value)}
                              className="w-full h-9 bg-transparent text-xs text-gray-900 dark:text-white border-0 outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                            />
                          </div>
                        </td>
                        <td className="p-1 text-center">
                          <select
                            value={item.type}
                            onChange={(e) => handleUpdateServiceField(item.id, "type", e.target.value)}
                            className={`p-1.5 rounded-lg text-[10px] font-extrabold border outline-none cursor-pointer ${
                              item.type === "صيانة"
                                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-550/10 dark:text-blue-400 dark:border-blue-500/20"
                                : "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-550/10 dark:text-teal-400 dark:border-teal-500/20"
                            }`}
                          >
                            <option value="صيانة">🔧 صيانة</option>
                            <option value="قطعة غيار">⚙️ قطعة غيار</option>
                          </select>
                        </td>
                        <td className="p-1 text-center">
                          {item.type === "قطعة غيار" ? (
                            <input
                              type="number"
                              value={item.count || 0}
                              onChange={(e) => handleUpdateServiceField(item.id, "count", parseInt(e.target.value) || 0)}
                              className="w-full h-9 bg-transparent text-xs text-gray-900 dark:text-white border-0 outline-none text-center font-bold focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">-</span>
                          )}
                        </td>
                        {/* سعر الورشة */}
                        <td className="p-1 text-center font-bold">
                          {item.type === "صيانة" ? (
                            <span className="text-gray-400 dark:text-gray-600">-</span>
                          ) : (
                            <input
                              type="number"
                              value={item.priceUs || ""}
                              onChange={(e) => handleUpdateServiceField(item.id, "priceUs", parseFloat(e.target.value) || 0)}
                              className={`w-full h-9 bg-transparent text-xs text-center border-0 outline-none focus:ring-1 focus:ring-indigo-500 font-extrabold text-indigo-650 dark:text-indigo-400 ${hasPricingError ? "bg-rose-50/50 dark:bg-rose-955/20 text-rose-500" : ""}`}
                            />
                          )}
                        </td>

                        {/* سعر الطبيب */}
                        <td className="p-1 text-center">
                          <input
                            type="number"
                            value={item.priceDoc || ""}
                            onChange={(e) => handleUpdateServiceField(item.id, "priceDoc", parseFloat(e.target.value) || 0)}
                            className={`w-full h-9 bg-transparent text-xs text-center border-0 outline-none focus:ring-1 focus:ring-indigo-500 font-extrabold text-emerald-655 text-emerald-650 dark:text-emerald-455 ${hasPricingError ? "bg-rose-50/50 dark:bg-rose-955/20 text-rose-500" : ""}`}
                          />
                        </td>
                        <td className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleSplitRow(item.id)}
                            className="px-3 py-1 bg-white hover:bg-indigo-50 dark:bg-gray-800 dark:hover:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-extrabold transition-colors border border-indigo-200 dark:border-indigo-900/40 flex items-center gap-1.5 mx-auto cursor-pointer"
                            title="تقسيم الصف لإضافة سعر/كمية منفصلة"
                          >
                            <Scissors size={10} /> إضافة سعر آخر
                          </button>
                        </td>
                        <td className="p-1 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف ${item.name}؟`)) {
                                handleDeleteService(item.id);
                              }
                            }}
                            className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955/20 rounded transition-colors cursor-pointer"
                          >
                            <X size={14} className="mx-auto" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {showAddServiceModal && (
          <div
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => {
              setShowAddServiceModal(false);
              setNewServiceName("");
              setNewServicePriceUs("");
              setNewServicePriceDoc("");
            }}
            dir="rtl"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] border border-gray-150 dark:border-gray-800 shadow-2xl max-w-md w-full text-right cursor-default"
            >
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">
                تسجيل صيانة أو قطعة غيار جديدة
              </h3>
              <form onSubmit={handleSaveCustomService} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 mr-1">
                    النوع
                  </label>
                  <div className="flex w-full rounded-2xl bg-gray-150/70 dark:bg-gray-900/60 p-1 border border-gray-200 dark:border-gray-800/80">
                    <button
                      type="button"
                      onClick={() => setNewServiceType("قطعة غيار")}
                      className={`flex-1 py-3 text-xs font-bold text-center rounded-xl transition-all cursor-pointer ${
                        newServiceType === "قطعة غيار"
                          ? "bg-blue-600 text-white shadow-md font-black"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      }`}
                    >
                      ⚙️ قطعة غيار (منتج)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewServiceType("صيانة")}
                      className={`flex-1 py-3 text-xs font-bold text-center rounded-xl transition-all cursor-pointer ${
                        newServiceType === "صيانة"
                          ? "bg-blue-600 text-white shadow-md font-black"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      }`}
                    >
                      🔧 صيانة (خدمة)
                    </button>
                  </div>
                </div>

                {newServiceType === "قطعة غيار" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 mr-1 font-bold">
                      العدد / الكمية
                    </label>
                    <input
                      type="number"
                      required
                      value={newServiceCount}
                      onChange={(e) => setNewServiceCount(parseInt(e.target.value) || 1)}
                      placeholder="1"
                      className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-855 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold text-gray-700 dark:text-gray-300"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 mr-1">
                    الاسم (صيانة / قطعة غيار)
                  </label>
                  <input
                    type="text"
                    required
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="مثال: تغيير بيلية فرنسي"
                    className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 mr-1 font-bold">
                      سعر الطبيب
                    </label>
                    <input
                      type="number"
                      required
                      value={newServicePriceDoc}
                      onChange={(e) => setNewServicePriceDoc(e.target.value)}
                      placeholder="0"
                      className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold text-emerald-650 dark:text-emerald-455"
                    />
                  </div>
                  {newServiceType !== "صيانة" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 mr-1 font-bold">
                        سعر الورشة
                      </label>
                      <input
                        type="number"
                        required
                        value={newServicePriceUs}
                        onChange={(e) => setNewServicePriceUs(e.target.value)}
                        placeholder="0"
                        className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold text-indigo-650 dark:text-indigo-400"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-6 border-t border-gray-150/40 dark:border-gray-800/40 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddServiceModal(false);
                      setNewServiceName("");
                      setNewServicePriceUs("");
                      setNewServicePriceDoc("");
                    }}
                    className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                  >
                    حفظ وتسجيل
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* توست الإشعار العائم للنسخ الناجح */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: "-50%" }}
            className="fixed bottom-8 left-1/2 transform bg-slate-900/95 text-white dark:bg-white dark:text-slate-900 px-6 py-3 rounded-2xl shadow-2xl font-bold text-xs z-50 flex items-center gap-2 border border-slate-800 dark:border-slate-100"
          >
            <span>📋</span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── AI Modal: حلل الصيانة ذكياً ── */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAiModal(false)} dir="rtl">
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl max-w-lg w-full text-right relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500" />
              <button onClick={() => setShowAiModal(false)} className="absolute top-5 left-5 p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 rounded-xl transition-colors cursor-pointer">
                <X size={16} />
              </button>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2 mb-5">
                <Sparkles size={20} className="text-violet-500" /> تحليل ذكي لغرفة الصيانة
              </h3>
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 border-r-violet-500 animate-spin" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 animate-pulse">جاري تحليل بيانات الصيانة...</span>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-semibold whitespace-pre-line">{aiReport}</p>
                </div>
              )}
              <button onClick={() => setShowAiModal(false)} className="mt-6 w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-sm font-bold transition-all cursor-pointer">
                حسناً
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </main>

    </div>
  );
}
