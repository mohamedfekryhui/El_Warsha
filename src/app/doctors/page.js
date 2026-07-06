"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useDoctorsData } from "@/hooks/useDoctorsData";
import { Plus, UserPlus, Users, MapPin, Phone, Search, X, Calendar, Filter, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.08 } }
};
const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function DoctorsPage() {
  const router = useRouter();
  const {
    doctors,
    reports,
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
  } = useDoctorsData();

  // States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // "recent" | "most_treated"
  const [dateFilter, setDateFilter] = useState("all"); // "all" | "today" | "week" | "month"

  // Check for duplicate name or phone on creation form (Interpretation 4)
  const isDuplicateName = doctors.some(d => d.name && d.name.trim().toLowerCase() === docName.trim().toLowerCase());
  const isDuplicatePhone = doctors.some(d => d.phone && d.phone.trim() === docPhone.trim());
  const hasDuplicateWarning = (docName.trim() !== "" && isDuplicateName) || (docPhone.trim() !== "" && isDuplicatePhone);

  const getDoctorRegistrationDate = (d) => {
    if (d.createdAt) return new Date(d.createdAt);
    if (d.creationDate) return new Date(d.creationDate);
    // Fallback: generate a date based on doctor ID to allow filtration by date
    const baseDate = new Date("2026-06-25T12:00:00Z");
    return new Date(baseDate.getTime() + d.id * 24 * 60 * 60 * 1000);
  };

  // Perform search trigger
  const handleSearch = () => {
    setActiveSearchQuery(searchQuery);
  };

  // Clear search query
  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearchQuery("");
  };

  // Filter and sort doctor list
  const filteredAndSortedDoctors = doctors
    .filter((d) => {
      // 1. Search Query filter (matches name, phone, or address)
      if (!activeSearchQuery) return true;
      const query = activeSearchQuery.toLowerCase();
      return (
        (d.name && d.name.toLowerCase().includes(query)) ||
        (d.phone && d.phone.toLowerCase().includes(query)) ||
        (d.address1 && d.address1.toLowerCase().includes(query))
      );
    })
    .filter((d) => {
      // 2. Date registration filter (today, this week, this month)
      if (dateFilter === "all") return true;
      const regDate = getDoctorRegistrationDate(d);
      const now = new Date();
      const diffTime = Math.abs(now - regDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (dateFilter === "today") {
        return regDate.toDateString() === now.toDateString();
      }
      if (dateFilter === "week") {
        return diffDays <= 7;
      }
      if (dateFilter === "month") {
        return diffDays <= 30;
      }
      return true;
    })
    .sort((a, b) => {
      // 3. Sorting (recent or most treated)
      if (sortBy === "recent") {
        return b.id - a.id;
      }
      if (sortBy === "most_treated") {
        const aReport = reports.find((r) => r.doctorId === a.id);
        const bReport = reports.find((r) => r.doctorId === b.id);
        const aVal = aReport ? (aReport.totalRequired || 0) : 0;
        const bVal = bReport ? (bReport.totalRequired || 0) : 0;
        return bVal - aVal;
      }
      return 0;
    });

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
          {/* الهيدر */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                سجلات الدكاترة <Users className="text-indigo-500" size={28} />
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                إدارة بيانات العملاء، العيادات، وعناوين الشحن.
              </p>
            </div>
            {/* زر التبديل للنموذج */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsFormOpen(!isFormOpen)}
              className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                isFormOpen
                  ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/10"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/10"
              }`}
            >
              {isFormOpen ? (
                <>
                  <X size={16} /> إغلاق النموذج
                </>
              ) : (
                <>
                  <Plus size={16} /> تسجيل دكتور جديد
                </>
              )}
            </motion.button>
          </div>

          {/* البانل الخاص بالبحث والفلترة */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1E293B] p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-4 items-center justify-between"
          >
            {/* حقل البحث مع زر البحث */}
            <div className="flex w-full md:max-w-md items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ابحث عن طبيب بالاسم، الهاتف، أو العنوان..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pr-10 pl-10 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm outline-none"
                />
                <Search className="absolute right-3.5 top-3.5 text-gray-400" size={16} />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute left-3.5 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                onClick={handleSearch}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md shadow-indigo-500/10 transition-all cursor-pointer whitespace-nowrap"
              >
                بحث
              </button>
            </div>

            {/* أدوات الفلترة والترتيب */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {/* فلتر تاريخ التسجيل */}
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/40 px-3 py-2 rounded-2xl border border-gray-200/50 dark:border-gray-800/60">
                <Calendar size={14} className="text-gray-400" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent border-0 text-xs font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
                >
                  <option value="all" className="text-gray-900 dark:text-white bg-white dark:bg-[#1E293B]">كل التواريخ</option>
                  <option value="today" className="text-gray-900 dark:text-white bg-white dark:bg-[#1E293B]">سجل اليوم</option>
                  <option value="week" className="text-gray-900 dark:text-white bg-white dark:bg-[#1E293B]">سجل هذا الأسبوع</option>
                  <option value="month" className="text-gray-900 dark:text-white bg-white dark:bg-[#1E293B]">سجل هذا الشهر</option>
                </select>
              </div>

              {/* فلترة الترتيب */}
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-900/60 p-1 rounded-2xl border border-gray-200/20 dark:border-gray-800/20">
                <button
                  onClick={() => setSortBy("recent")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    sortBy === "recent"
                      ? "bg-white dark:bg-[#1E293B] text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-100 dark:border-gray-800"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  الأحدث
                </button>
                <button
                  onClick={() => setSortBy("most_treated")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    sortBy === "most_treated"
                      ? "bg-white dark:bg-[#1E293B] text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-100 dark:border-gray-800"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  <Sparkles size={12} className={sortBy === "most_treated" ? "text-amber-500 animate-pulse" : ""} />
                  الأكثر تعاملاً
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* فورم تسجيل دكتور جديد - toggleable rendering with Framer Motion */}
            <AnimatePresence mode="popLayout">
              {isFormOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="lg:col-span-1"
                >
                  <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-800/60 sticky top-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <UserPlus size={20} />
                      </div>
                      <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                        تسجيل دكتور جديد
                      </h3>
                    </div>

                    <form onSubmit={handleAddDoctor} className="space-y-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                          اسم الدكتور
                        </label>
                        <input
                          type="text"
                          required
                          value={docName}
                          onChange={(e) => setDocName(e.target.value)}
                          className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm outline-none"
                          placeholder="مثال: د. أحمد خالد"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                          رقم الهاتف
                        </label>
                        <input
                          type="text"
                          required
                          value={docPhone}
                          onChange={(e) => setDocPhone(e.target.value)}
                          className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm outline-none"
                          placeholder="010XXXXXXXX"
                        />
                      </div>

                      {/* Duplicate Warn Filtration Banner */}
                      {hasDuplicateWarning && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20 rounded-2xl text-xs font-bold space-y-1"
                        >
                          {isDuplicateName && (
                            <div className="flex items-center gap-1.5">
                              <span>⚠️ يوجد طبيب مسجل بنفس هذا الاسم بالفعل.</span>
                            </div>
                          )}
                          {isDuplicatePhone && (
                            <div className="flex items-center gap-1.5">
                              <span>⚠️ يوجد طبيب مسجل برقم الهاتف هذا بالفعل.</span>
                            </div>
                          )}
                        </motion.div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                          عنوان العيادة الأساسي
                        </label>
                        <input
                          type="text"
                          required
                          value={docAddr1}
                          onChange={(e) => setDocAddr1(e.target.value)}
                          className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm outline-none"
                          placeholder="المحافظة، المنطقة، الشارع"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                          عنوان شحن بديل (اختياري)
                        </label>
                        <input
                          type="text"
                          value={docAddr2}
                          onChange={(e) => setDocAddr2(e.target.value)}
                          className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm outline-none"
                          placeholder="عنوان آخر إن وجد"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-md shadow-indigo-500/20 mt-2 cursor-pointer"
                      >
                        <Plus size={18} /> حفظ بيانات الطبيب
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* الجدول - responsive size depending on form state */}
            <motion.div
              layout
              className={isFormOpen ? "lg:col-span-2" : "lg:col-span-3"}
            >
              <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-800/60 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                    قائمة العملاء المسجلين ({filteredAndSortedDoctors.length})
                  </h3>
                  {activeSearchQuery && (
                    <span className="text-xs font-medium text-indigo-500 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                      نتائج البحث عن: "{activeSearchQuery}"
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800/60">
                          <th className="pb-4 text-sm font-semibold text-gray-400 dark:text-gray-500 w-1/3">
                            الطبيب
                          </th>
                          <th className="pb-4 text-sm font-semibold text-gray-400 dark:text-gray-500 w-1/4">
                            التواصل
                          </th>
                          <th className="pb-4 text-sm font-semibold text-gray-400 dark:text-gray-500">
                            عنوان الشحن
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedDoctors.length === 0 ? (
                          <tr>
                            <td
                              colSpan="3"
                              className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm"
                            >
                              لا يوجد دكاترة يطابقون خيارات البحث أو التصفية الحالية.
                            </td>
                          </tr>
                        ) : (
                          filteredAndSortedDoctors.map((d) => (
                            <tr
                              key={d.id}
                              onClick={() => router.push(`/doctors/${d.id}`)}
                              className="border-b border-gray-50 dark:border-gray-800/40 last:border-0 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/15 cursor-pointer transition-colors duration-150"
                            >
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-500/20 dark:to-blue-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0 border border-indigo-200/50 dark:border-indigo-500/30">
                                    {d.name ? d.name.charAt(0) : "?"}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-gray-900 dark:text-gray-100 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                      {d.name}
                                    </span>
                                    {/* عرض رتبة الأكثر تعاملاً إذا كان ضمن الأكثر تعاملاً */}
                                    {sortBy === "most_treated" && (
                                      <span className="text-[10px] text-amber-500 font-bold mt-0.5">
                                        إجمالي كشف الحساب: {reports.find(r => r.doctorId === d.id)?.totalRequired || 0} ج.م
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                  <Phone size={14} className="text-gray-400" />
                                  <span dir="ltr" className="text-right">
                                    {d.phone}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                                  <MapPin
                                    size={16}
                                    className="text-gray-400 shrink-0 mt-0.5"
                                  />
                                  <span className="line-clamp-1">{d.address1}</span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

