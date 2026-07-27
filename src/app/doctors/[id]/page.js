"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { API_ENDPOINTS } from "@/config/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  User,
  Phone,
  MapPin,
  CreditCard,
  ShieldCheck,
  Wrench,
  BadgeCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Coins,
  FileText,
  X,
  Sparkles
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import CustomSelect from "@/components/CustomSelect";
import { useAuth } from "@/AuthContext";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";
import { getStatusStyle } from "@/utils/statusStyles";
import { containerVariants, itemVariants } from "@/utils/animations";

export default function DoctorDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { currentBranchId } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [report, setReport] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);


  // حالة التحكم في مودال تفاصيل الطلب المختار
  const [selectedOrder, setSelectedOrder] = useState(null);

  // حالة التوست المخصصة لإشعار النسخ
  const { toastMessage, copyToClipboard } = useToast();

  // حالات مساعد الذكاء الاصطناعي للأجهزة مع الدردشة الاستبدالية
  const [showAiReport, setShowAiReport] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReportText, setAiReportText] = useState("");
  const [initialAiReportText, setInitialAiReportText] = useState("");
  const [isOrderChatMode, setIsOrderChatMode] = useState(false);
  const [orderChatInput, setOrderChatInput] = useState("");

  // حالات مساعد الذكاء الاصطناعي للتحليل المالي للمعاملات مع الدردشة الاستبدالية
  const [showFinancialAiReport, setShowFinancialAiReport] = useState(false);
  const [finAiLoading, setFinAiLoading] = useState(false);
  const [finAiReportText, setFinAiReportText] = useState("");
  const [initialFinReportText, setInitialFinReportText] = useState("");
  const [isFinChatMode, setIsFinChatMode] = useState(false);
  const [finChatInput, setFinChatInput] = useState("");



  // توليد تقرير الذكاء الاصطناعي للأعطال الفنية
  const handleGenerateAiOrderReport = async () => {
    if (!selectedOrder) return;
    setShowAiReport(true);
    setAiLoading(true);
    setIsOrderChatMode(false);
    
    const device = selectedOrder.handpieceName || "توربين أسنان";
    const notes = selectedOrder.notes || "فحص وتنظيف";
    const msg = `قم بإنشاء تقرير فحص فني لطلب الصيانة التالي: الجهاز: ${device}، الملاحظات: ${notes}`;

    try {
      const res = await fetch(API_ENDPOINTS.aiChat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });
      if (res.ok) {
        const reply = await res.text();
        setAiReportText(reply);
        setInitialAiReportText(reply);
      } else {
        setAiReportText("عذراً، حدث خطأ أثناء التواصل مع المساعد الذكي.");
      }
    } catch (e) {
      setAiReportText("حدث خطأ فني.");
    } finally {
      setAiLoading(false);
    }
  };

  // إرسال رسالة في شات الأعطال الفنية
  const handleSendOrderChat = async (e) => {
    e.preventDefault();
    if (!orderChatInput.trim()) return;

    const userText = orderChatInput.trim();
    setOrderChatInput("");
    setAiLoading(true);

    try {
      const res = await fetch(API_ENDPOINTS.aiChat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });
      if (res.ok) {
        const reply = await res.text();
        setAiReportText(reply);
      } else {
        setAiReportText("عذراً، حدث خطأ أثناء التواصل.");
      }
    } catch (e) {
      setAiReportText("حدث خطأ فني.");
    } finally {
      setAiLoading(false);
    }
  };

  // توليد تقرير التحليل المالي الذكي للمعاملات
  const handleAnalyzeTransactions = async () => {
    if (!doctor) return;
    setShowFinancialAiReport(true);
    setFinAiLoading(true);
    setIsFinChatMode(false);
    
    const req = report ? report.totalRequired : 0;
    const paid = report ? report.totalPaid : 0;
    const rem = report ? report.remainingBalance : 0;

    const msg = `قم بإنشاء تحليل مالي لطبيب ${doctor.name}، إجمالي المطلوب ${req} ج.م والمدفوع ${paid} ج.م والمتبقي ${rem} ج.م. أعطني توصيات مالية مختصرة.`;

    try {
      const res = await fetch(API_ENDPOINTS.aiChat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });
      if (res.ok) {
        const reply = await res.text();
        setFinAiReportText(reply);
        setInitialFinReportText(reply);
      } else {
        setFinAiReportText("عذراً، حدث خطأ أثناء التواصل.");
      }
    } catch (e) {
      setFinAiReportText("حدث خطأ فني.");
    } finally {
      setFinAiLoading(false);
    }
  };

  // إرسال رسالة في شات المعاملات المالية
  const handleSendFinChat = async (e) => {
    e.preventDefault();
    if (!finChatInput.trim()) return;

    const userText = finChatInput.trim();
    setFinChatInput("");
    setFinAiLoading(true);

    try {
      const res = await fetch(API_ENDPOINTS.aiChat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });
      if (res.ok) {
        const reply = await res.text();
        setFinAiReportText(reply);
      } else {
        setFinAiReportText("عذراً، حدث خطأ أثناء التواصل.");
      }
    } catch (e) {
      setFinAiReportText("حدث خطأ فني.");
    } finally {
      setFinAiLoading(false);
    }
  };

  useEffect(() => {
    if (!id || !currentBranchId) return;

    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        // Fetch doctor by id, financial records, and orders in parallel
        const docIdNum = parseInt(id);
        const branchIdStr = String(currentBranchId);
        
        const safeFetchJson = async (url) => {
          try {
            const res = await fetch(url);
            if (!res.ok) return null;
            const text = await res.text();
            return text ? JSON.parse(text) : null;
          } catch (e) {
            return null;
          }
        };

        // 1. Try to fetch doctor by ID first
        let docData = await safeFetchJson(API_ENDPOINTS.doctorById(branchIdStr, docIdNum));
        
        // Fallback: If doctor by ID fails, fetch all doctors and find by ID
        if (!docData || docData.status) {
          const allDocs = await safeFetchJson(API_ENDPOINTS.doctorsByBranch(branchIdStr));
          if (Array.isArray(allDocs)) {
            docData = allDocs.find(d => d.id === docIdNum) || null;
          } else {
            docData = null;
          }
        }

        const [reportsListRaw, allOrdersRaw] = await Promise.all([
          safeFetchJson(API_ENDPOINTS.financialRecords),
          safeFetchJson(API_ENDPOINTS.ordersByBranch(branchIdStr))
        ]);

        if (docData) {
          setDoctor(docData);
        } else {
          setDoctor(null);
        }

        // 2. Find financial report (if supported)
        const reportsList = Array.isArray(reportsListRaw) ? reportsListRaw : [];
        const repObj = reportsList.find((r) => r.doctorId === docIdNum);
        setReport(repObj || {
          totalRequired: 0,
          totalPaid: 0,
          remainingBalance: 0,
          totalPartsCost: 0,
          totalShipping: 0
        });

        // 3. Filter orders associated with this doctor (by ID)
        let mergedOrders = [];
        const sourceOrders = Array.isArray(allOrdersRaw) ? allOrdersRaw : [];
        
        mergedOrders = sourceOrders.filter(
          (o) => o.doctorId === docIdNum
        );
        setOrders(mergedOrders);

      } catch (error) {
        console.error("Error fetching doctor profile details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [id, currentBranchId]);

  // تحديث حالة الصيانة من صفحة الطبيب
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
    }

    try {
      const res = await fetch(
        API_ENDPOINTS.updateOrderStatus(orderId, newStatus),
        { method: "PUT" }
      );
      if (!res.ok) {
        console.warn("Failed to sync status update with backend, local state remains updated.");
      }
    } catch (err) {
      console.warn("Failed to fetch backend endpoint, fallback to local status update:", err);
    }
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
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 animate-pulse">جاري تحميل ملف الدكتور ...</span>
        </main>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex min-h-screen bg-[#F8FAFC] text-gray-900 dark:bg-[#0B1120] dark:text-gray-100 transition-colors duration-300 font-sans">
        <Sidebar />
        <main className="flex-1 p-8 lg:p-12 flex flex-col justify-center items-center space-y-4">
          <AlertCircle size={48} className="text-rose-500" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            لم يتم العثور على الطبيب المطلوب!
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            قد يكون تم حذف بيانات الطبيب أو أن المعرف غير صحيح.
          </p>
          <button
            onClick={() => router.push("/doctors")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <ArrowRight size={16} /> العودة لقائمة الأطباء
          </button>
        </main>
      </div>
    );
  }

  // فرز الأجهزة النشطة والمنتهية
  const activeOrdersList = orders.filter(
    (o) => o.status !== "تم التوصيل" && o.status !== "تم التسليم"
  );
  const pastOrdersList = orders.filter(
    (o) => o.status === "تم التوصيل" || o.status === "تم التسليم"
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-gray-900 dark:bg-[#0B1120] dark:text-gray-100 transition-colors duration-300 font-sans relative">
      <Sidebar />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <motion.div
          initial="initial"
          animate="animate"
          variants={containerVariants}
          className="space-y-8"
        >
          {/* شريط التنقل العلوي مع الاسم ودروب داون البيانات بجانب الاسم */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800/40 pb-6" dir="rtl">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/doctors")}
                className="p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800/60 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <ArrowRight size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <span className="text-xs font-semibold text-gray-400">ملف الطبيب الشخصي</span>
                <div className="flex items-center gap-3 mt-0.5">
                  <h1
                    onClick={() => copyToClipboard(doctor.name)}
                    className="text-2xl font-black text-gray-900 dark:text-white cursor-pointer hover:text-indigo-650 transition-colors"
                    title="اضغط لنسخ اسم الطبيب"
                  >
                    {doctor.name}
                  </h1>
                  <span
                    onClick={() => copyToClipboard(doctor.id.toString())}
                    className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black shrink-0 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-all"
                    title="اضغط لنسخ معرف العميل"
                  >
                    عميل #{doctor.id}
                  </span>
                </div>
              </div>
            </div>


          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* الكارت الأيمن الكبير - الحسابات والصيانات - الآن يمتد بعرض الصفحة بالكامل */}
            <motion.div variants={itemVariants} className="lg:col-span-3 space-y-8">
              
              {/* قسم الكروت المالية والمساعد الذكي */}
              <div className="space-y-4 bg-white dark:bg-[#1E293B]/40 p-6 rounded-[2rem] border border-gray-150 dark:border-gray-800/60">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" dir="rtl">
                  <div>
                    <h3 className="font-bold text-lg text-gray-850 dark:text-gray-150">نظرة عامة على الحسابات والمدفوعات</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">الملخص المالي لجميع الصيانات وقطع الغيار المعتمدة</p>
                  </div>
                  
                  {/* زر حلِّل لي المعاملات وولد لي تقرير - المظهر الفاخر الجديد */}
                  <button
                    type="button"
                    onClick={handleAnalyzeTransactions}
                    className="relative overflow-hidden group px-7 py-3.5 bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#2563EB] hover:from-[#8B5CF6] hover:to-[#1D4ED8] text-white rounded-full text-sm font-black transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 hover:scale-[1.03] active:translate-y-0 active:scale-[0.98]"
                  >
                    {/* خط لمعان زجاجي متحرك عند التمرير بالماوس */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" 
                      initial={{ x: "-100%" }} 
                      whileHover={{ x: "100%", transition: { duration: 0.75, ease: "easeInOut" } }} 
                    />
                    <span>حلِّل لي المعاملات وولد لي تقرير</span> 
                    <Sparkles size={15} className="text-amber-300 animate-pulse shrink-0" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* كارت المطلوب كلياً */}
                  <div
                    onClick={() => copyToClipboard(report ? report.totalRequired.toString() : "0")}
                    className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm relative overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
                    title="اضغط لنسخ إجمالي المطلوب"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-400">إجمالي المطلوب سداده</span>
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <CreditCard size={16} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-gray-900 dark:text-white">
                        {report ? report.totalRequired : 0} <span className="text-sm font-medium text-gray-400">ج.م</span>
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1">
                        يشمل الصيانات ({report ? report.totalPartsCost : 0} ج.م) + الشحن ({report ? report.totalShipping : 0} ج.م)
                      </p>
                    </div>
                  </div>

                  {/* كارت المسدد */}
                  <div
                    onClick={() => copyToClipboard(report ? report.totalPaid.toString() : "0")}
                    className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm relative overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
                    title="اضغط لنسخ إجمالي المدفوع"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-400">إجمالي ما تم دفعه</span>
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        <BadgeCheck size={16} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {report ? report.totalPaid : 0} <span className="text-sm font-medium text-gray-400">ج.م</span>
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1">المبالغ الواردة المقيدة في النظام</p>
                    </div>
                  </div>

                  {/* كارت المديونية المتبقية */}
                  <div
                    onClick={() => copyToClipboard(report ? report.remainingBalance.toString() : "0")}
                    className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm relative overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
                    title="اضغط لنسخ الرصيد المتبقي"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-400">الرصيد المتبقي (المديونية)</span>
                      <div className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg">
                        <AlertCircle size={16} />
                      </div>
                    </div>
                    <div>
                      {report && report.remainingBalance === 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-2xl text-xs font-bold border border-emerald-200 dark:border-emerald-500/20">
                          <CheckCircle2 size={14} /> خالص الحساب
                        </span>
                      ) : (
                        <h4 className="text-2xl font-black text-rose-600 dark:text-rose-400">
                          {report ? report.remainingBalance : 0} <span className="text-sm font-medium text-gray-400">ج.م</span>
                        </h4>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">الرصيد المعلق المستحق سداده</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* 1. أجهزة قيد الصيانة حالياً */}
                <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800/60 shadow-sm">
                <h3 className="font-bold text-lg mb-6 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Clock size={20} className="text-amber-500 animate-pulse" /> كونترات قيد الصيانة والشحن حالياً ({activeOrdersList.length})
                </h3>

                {activeOrdersList.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
                    لا توجد كونترات قيد الصيانة حالياً لهذا الطبيب.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800/60 font-bold">
                          <th className="pb-4 text-xs font-bold text-gray-400 w-1/4">رقم الأمر</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 w-1/2">الجهاز (نوع الصيانة)</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 text-center w-1/4">تعديل حالة الصيانة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeOrdersList.map((o) => (
                          <tr
                            key={o.id}
                            onClick={() => { setSelectedOrder(o); setShowAiReport(false); }}
                            className="border-b border-gray-50 dark:border-gray-800/40 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer"
                          >
                            <td
                              className="py-4 font-bold text-gray-755 dark:text-gray-300 hover:text-indigo-650 transition-colors cursor-pointer"
                              title="اضغط لنسخ رقم الأمر"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(o.id.toString());
                              }}
                            >
                              #{o.id}
                            </td>
                            <td className="py-4 font-bold text-gray-900 dark:text-gray-100">
                              <div className="flex items-center gap-2">
                                <span
                                  className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(o.handpieceName);
                                  }}
                                  title="اضغط لنسخ اسم الصيانة"
                                >
                                  {o.handpieceName}
                                </span>
                                {o.shipping && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-md text-[9px] font-bold shrink-0 select-none">
                                    🚚 شحن
                                  </span>
                                )}
                              </div>
                              {o.serialNumber && (
                                <span
                                  className="block text-[10px] font-semibold text-gray-400 mt-0.5 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(o.serialNumber);
                                  }}
                                  title="اضغط لنسخ الرقم التسلسلي"
                                >
                                  S/N: {o.serialNumber}
                                </span>
                              )}
                            </td>
                            <td className="py-4 text-center">
                              <CustomSelect
                                value={o.status || "تحت الصيانة"}
                                onChange={(val) => handleUpdateOrderStatus(o.id, val)}
                                options={[
                                  { value: "تحت الصيانة", label: "🛠️ تحت الصيانة", activeClassName: "bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400" },
                                  { value: "تمت الصيانة وتحت الشحن", label: "🚚 تمت الصيانة وتحت شحن", activeClassName: "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400" },
                                  { value: "تم التوصيل", label: "✅ تم التوصيل", activeClassName: "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" }
                                ]}
                                className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full border transition-all focus:outline-none cursor-pointer outline-none min-w-[130px] ${getStatusStyle(o.status || "تحت الصيانة")}`}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 2. سجل الأجهزة المسلمة سابقاً */}
              <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800/60 shadow-sm">
                <h3 className="font-bold text-lg mb-6 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-500" /> سجل الكونترات ({pastOrdersList.length})
                </h3>

                {pastOrdersList.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
                    لا يوجد سجل كونترات مستلمة سابقاً لهذا الدكتور.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800/60 font-bold">
                          <th className="pb-4 text-xs font-bold text-gray-400 w-1/4">رقم الأمر</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 w-1/2">الجهاز (نوع الصيانة)</th>
                          <th className="pb-4 text-xs font-bold text-gray-400 text-center w-1/4">تعديل حالة الصيانة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pastOrdersList.map((o) => (
                          <tr
                            key={o.id}
                            onClick={() => { setSelectedOrder(o); setShowAiReport(false); }}
                            className="border-b border-gray-50 dark:border-gray-800/40 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer"
                          >
                            <td
                              className="py-4 font-bold text-gray-755 dark:text-gray-300 hover:text-indigo-650 transition-colors cursor-pointer"
                              title="اضغط لنسخ رقم الأمر"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(o.id.toString());
                              }}
                            >
                              #{o.id}
                            </td>
                            <td className="py-4 font-bold text-gray-900 dark:text-gray-100">
                              <div className="flex items-center gap-2">
                                <span
                                  className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(o.handpieceName);
                                  }}
                                  title="اضغط لنسخ اسم الصيانة"
                                >
                                  {o.handpieceName}
                                </span>
                                {o.shipping && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-md text-[9px] font-bold shrink-0 select-none">
                                    🚚 شحن
                                  </span>
                                )}
                              </div>
                              {o.serialNumber && (
                                <span
                                  className="block text-[10px] font-semibold text-gray-400 mt-0.5 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(o.serialNumber);
                                  }}
                                  title="اضغط لنسخ الرقم التسلسلي"
                                >
                                  S/N: {o.serialNumber}
                                </span>
                              )}
                            </td>
                            <td className="py-4 text-center font-bold">
                              <CustomSelect
                                value={o.status || "تم التوصيل"}
                                onChange={(val) => handleUpdateOrderStatus(o.id, val)}
                                options={[
                                  { value: "تحت الصيانة", label: "🛠️ تحت الصيانة", activeClassName: "bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400" },
                                  { value: "تمت الصيانة وتحت الشحن", label: "🚚 تمت الصيانة وتحت شحن", activeClassName: "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400" },
                                  { value: "تم التوصيل", label: "✅ تم التوصيل", activeClassName: "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" }
                                ]}
                                className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full border transition-all focus:outline-none cursor-pointer outline-none min-w-[130px] ${getStatusStyle(o.status || "تم التوصيل")}`}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* مودال تفاصيل الجهاز المستلم/الطلب */}
      <AnimatePresence>
        {selectedOrder && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedOrder(null)}
            dir="rtl"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] border border-gray-150 dark:border-gray-800 shadow-2xl max-w-lg w-full text-right relative overflow-hidden cursor-default space-y-6"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-indigo-500"></div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="absolute top-5 left-5 p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-250 rounded-xl transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                <Wrench className="text-indigo-500" size={22} /> تفاصيل أمر الصيانة #{selectedOrder.id}
              </h3>

              <div className="space-y-4 text-sm">
                <div
                  onClick={() => copyToClipboard(selectedOrder.handpieceName)}
                  className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100/50 dark:border-gray-800/30 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                  title="اضغط لنسخ الاسم بالكامل"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 mb-1">اسم الجهاز والأشغال</span>
                      <span className="text-sm font-extrabold text-gray-850 dark:text-gray-150 block">{selectedOrder.handpieceName}</span>
                    </div>
                    {selectedOrder.shipping && (
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black shrink-0 select-none">
                        🚚 شحن مطلوب
                      </span>
                    )}
                  </div>
                  {selectedOrder.serialNumber && (
                    <span
                      className="text-xs font-semibold text-gray-500 mt-1 block hover:text-indigo-650 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(selectedOrder.serialNumber);
                      }}
                      title="اضغط لنسخ الرقم التسلسلي"
                    >
                      S/N: {selectedOrder.serialNumber}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100/50 dark:border-gray-800/30">
                    <span className="block text-[10px] font-bold text-gray-400 mb-1.5">الحالة الحالية (يمكنك تعديلها)</span>
                    <CustomSelect
                      value={selectedOrder.status || "تحت الصيانة"}
                      onChange={(val) => handleUpdateOrderStatus(selectedOrder.id, val)}
                      options={[
                        { value: "تحت الصيانة", label: "🛠️ تحت الصيانة", activeClassName: "bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400" },
                        { value: "تمت الصيانة وتحت الشحن", label: "🚚 تمت الصيانة وتحت شحن", activeClassName: "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400" },
                        { value: "تم التوصيل", label: "✅ تم التوصيل", activeClassName: "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" }
                      ]}
                      className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full border transition-all focus:outline-none cursor-pointer outline-none w-full ${getStatusStyle(selectedOrder.status || "تحت الصيانة")}`}
                    />
                  </div>
                  <div
                    className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100/50 dark:border-gray-800/30 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                    onClick={() => copyToClipboard(selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString("ar-EG") : new Date().toLocaleDateString("ar-EG"))}
                    title="اضغط لنسخ تاريخ الاستلام"
                  >
                    <span className="block text-[10px] font-bold text-gray-400 mb-1.5">تاريخ الاستلام</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mt-0.5">
                      📅 {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString("ar-EG") : new Date().toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100/50 dark:border-gray-800/30 space-y-3">
                  <span className="block text-[10px] font-bold text-gray-400 mb-1.5 flex items-center gap-1">
                    <Wrench size={12} className="text-indigo-500" /> الصيانة
                  </span>
                  
                  <div
                    onClick={() => copyToClipboard(selectedOrder.handpieceName)}
                    className="flex justify-between items-center gap-4 text-xs font-bold bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-150/40 dark:border-gray-800/40 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    title="اضغط لنسخ اسم الصيانة"
                  >
                    <span className="text-gray-900 dark:text-white font-extrabold">{selectedOrder.handpieceName}</span>
                    <span className="text-emerald-650 dark:text-emerald-455 font-black whitespace-nowrap">{selectedOrder.priceDoc || 0} ج.م</span>
                  </div>

                  {selectedOrder.notes && (
                    <div
                      className="pt-2 border-t border-gray-200/50 dark:border-gray-800/40 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-850 p-2 rounded-xl transition-all"
                      onClick={() => copyToClipboard(selectedOrder.notes)}
                      title="اضغط لنسخ الملاحظات"
                    >
                      <span className="block text-[9px] font-bold text-gray-455 dark:text-gray-500 mb-1">ملاحظات الفني:</span>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-semibold italic font-medium">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100/50 dark:border-gray-800/30 space-y-2.5">
                  <span className="block text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1"><Coins size={12} /> التكلفة والأسعار (اضغط للنسخ)</span>
                  <div
                    onClick={() => copyToClipboard(selectedOrder.priceUs ? selectedOrder.priceUs.toString() : "0")}
                    className="flex justify-between items-center text-xs font-bold cursor-pointer hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors"
                    title="اضغط لنسخ تكلفة الورشة"
                  >
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">تكلفة الورشة:</span>
                    <span className="text-gray-900 dark:text-white font-extrabold">{selectedOrder.priceUs || 0} ج.م</span>
                  </div>
                  <div className="w-full h-px bg-gray-200/50 dark:bg-gray-800/40"></div>
                  <div
                    onClick={() => copyToClipboard(selectedOrder.priceDoc ? selectedOrder.priceDoc.toString() : "0")}
                    className="flex justify-between items-center text-xs font-bold cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    title="اضغط لنسخ المطلوب من الدكتور"
                  >
                    <span className="text-emerald-600 dark:text-emerald-455 font-extrabold">مطلوب من الدكتور:</span>
                    <span className="text-gray-900 dark:text-white font-extrabold">{selectedOrder.priceDoc || 0} ج.م</span>
                  </div>
                </div>
              </div>

              {/* أزرار الفوتر للمودال - مع زر ولِّد لي تقرير بالتصميم الجديد وشاين أنيميشن */}
              <div className="mt-8 pt-4 border-t border-gray-150/40 dark:border-gray-800/40 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleGenerateAiOrderReport}
                  className="relative overflow-hidden group px-7 py-3.5 bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#2563EB] hover:from-[#8B5CF6] hover:to-[#1D4ED8] text-white rounded-full text-sm font-black transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 hover:scale-[1.03] active:translate-y-0 active:scale-[0.98]"
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" 
                    initial={{ x: "-100%" }} 
                    whileHover={{ x: "100%", transition: { duration: 0.75, ease: "easeInOut" } }} 
                  />
                  <span>ولِّد لي تقرير</span> 
                  <Sparkles size={15} className="text-amber-300 animate-pulse shrink-0" />
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-250 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs cursor-pointer"
                >
                  إغلاق النافذة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* مودال منفصل منبثق لعرض تقرير فحص الأعطال الفني (AI Report Popup with Replaced Chat Mode) */}
      <AnimatePresence>
        {showAiReport && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setShowAiReport(false)}
            dir="rtl"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] border border-gray-150 dark:border-gray-800 shadow-2xl max-w-lg w-full text-right relative overflow-hidden cursor-default space-y-6"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-violet-500"></div>

              <button
                type="button"
                onClick={() => setShowAiReport(false)}
                className="absolute top-5 left-5 p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-250 rounded-xl transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                ✨ {isOrderChatMode ? "محادثة المساعد الذكي للأعطال" : "تقرير فحص الأعطال الفني"}
              </h3>

              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-650 border-r-indigo-650 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-purple-500 border-l-purple-500 animate-spin [animation-duration:1.5s]"></div>
                    <div className="absolute inset-4 bg-indigo-500/10 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 animate-pulse">
                    {isOrderChatMode ? "جاري كتابة الرد الجديد..." : "يقوم المساعد الذكي بتحليل حالة وملاحظات الجهاز..."}
                  </span>
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100/50 dark:border-gray-800/30">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-gray-800/30 mb-3">
                      <span className="font-black text-indigo-600 dark:text-indigo-400">
                        {isOrderChatMode ? "💡 رد المساعد الذكي" : "التشخيص والتوجيهات الفنية"}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(aiReportText)}
                        className="text-xs text-indigo-650 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                      >
                        📋 نسخ النص
                      </button>
                    </div>
                    <p className="text-xs text-gray-755 dark:text-gray-300 leading-relaxed font-semibold whitespace-pre-line text-right" dir="rtl">
                      {aiReportText}
                    </p>
                  </div>

                  {/* حقل إدخال سؤال الدردشة */}
                  {isOrderChatMode && (
                    <form onSubmit={handleSendOrderChat} className="flex gap-2 border-t border-gray-150/40 dark:border-gray-800/40 pt-4">
                      <input
                        type="text"
                        value={orderChatInput}
                        onChange={(e) => setOrderChatInput(e.target.value)}
                        placeholder="اسأل عن تفاصيل إضافية (تزييت، ضغط هواء، قطع)..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-right font-bold"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-500/10 shrink-0"
                      >
                        إرسال
                      </button>
                    </form>
                  )}
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-gray-150/40 dark:border-gray-800/40 flex justify-between items-center">
                {!isOrderChatMode ? (
                  <button
                    type="button"
                    onClick={() => setIsOrderChatMode(true)}
                    className="relative overflow-hidden group px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-full text-xs font-black transition-all shadow-md hover:scale-105 active:scale-95 duration-200 cursor-pointer"
                  >
                    <span>متابعة الدردشة ✨</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAiReportText(initialAiReportText);
                      setIsOrderChatMode(false);
                    }}
                    className="px-6 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-150/50 dark:border-indigo-900/40 rounded-full text-xs font-black hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    <span>العودة للتقرير الرئيسي 📋</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowAiReport(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-250 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs cursor-pointer"
                >
                  إغلاق التقرير
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* مودال تقرير المساعد الذكي للتحليل المالي للمعاملات (AI Financial Report Popup) */}
      <AnimatePresence>
        {showFinancialAiReport && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setShowFinancialAiReport(false)}
            dir="rtl"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] border border-gray-150 dark:border-gray-800 shadow-2xl max-w-lg w-full text-right relative overflow-hidden cursor-default space-y-6"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-emerald-500"></div>

              <button
                type="button"
                onClick={() => setShowFinancialAiReport(false)}
                className="absolute top-5 left-5 p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-250 rounded-xl transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                ✨ {isFinChatMode ? "محادثة التحليل المالي الذكي" : "تقرير التحليل المالي للمعاملات"}
              </h3>

              {finAiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-650 border-r-indigo-650 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-purple-500 border-l-purple-500 animate-spin [animation-duration:1.5s]"></div>
                    <div className="absolute inset-4 bg-indigo-500/10 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 animate-pulse">
                    {isFinChatMode ? "جاري كتابة الرد الجديد..." : "يقوم المساعد الذكي بتحليل المعاملات وحساب نسب السداد..."}
                  </span>
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100/50 dark:border-gray-800/30">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-gray-800/30 mb-3">
                      <span className="font-black text-emerald-600 dark:text-emerald-455">
                        {isFinChatMode ? "💡 رد المساعد المالي" : "التوصية والتحليل المالي"}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(finAiReportText)}
                        className="text-xs text-indigo-655 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                      >
                        📋 نسخ النص
                      </button>
                    </div>
                    <p className="text-xs text-gray-755 dark:text-gray-300 leading-relaxed font-semibold whitespace-pre-line text-right" dir="rtl">
                      {finAiReportText}
                    </p>
                  </div>

                  {/* حقل إدخال سؤال المالي */}
                  {isFinChatMode && (
                    <form onSubmit={handleSendFinChat} className="flex gap-2 border-t border-gray-150/40 dark:border-gray-800/40 pt-4">
                      <input
                        type="text"
                        value={finChatInput}
                        onChange={(e) => setFinChatInput(e.target.value)}
                        placeholder="اسأل عن خصومات، خطط جدولة ديون، أو تفاصيل دفع..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-right font-bold"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/10 shrink-0"
                      >
                        إرسال
                      </button>
                    </form>
                  )}
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-gray-150/40 dark:border-gray-800/40 flex justify-between items-center">
                {!isFinChatMode ? (
                  <button
                    type="button"
                    onClick={() => setIsFinChatMode(true)}
                    className="relative overflow-hidden group px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-full text-xs font-black transition-all shadow-md hover:scale-105 active:scale-95 duration-200 cursor-pointer"
                  >
                    <span>متابعة الدردشة ✨</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setFinAiReportText(initialFinReportText);
                      setIsFinChatMode(false);
                    }}
                    className="px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-150/50 dark:border-emerald-900/40 rounded-full text-xs font-black hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <span>العودة للتقرير الرئيسي 📋</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowFinancialAiReport(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-250 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs cursor-pointer"
                >
                  إغلاق التحليل
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* توست الإشعار العائم للنسخ الناجح */}
      <Toast message={toastMessage} />
    </div>
  );
}
