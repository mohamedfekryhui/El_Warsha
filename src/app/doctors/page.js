"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useDoctorsData } from "@/hooks/useDoctorsData";
import { Plus, UserPlus, Users, MapPin, Phone, Search, X, Calendar, Filter, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelect from "@/components/CustomSelect";
import { containerVariants, itemVariants } from "@/utils/animations";

export default function DoctorsPage() {
  const router = useRouter();
  const {
    doctors,
    reports,
    loading,
    docName,
    setDocName,
    handleAddDoctor,
  } = useDoctorsData();

  // States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // "recent" | "most_treated"
  const [dateFilter, setDateFilter] = useState("all"); // "all" | "today" | "week" | "month"

  // Check for duplicate name on creation form (Interpretation 4)
  const isDuplicateName = doctors.some(d => d.name && d.name.trim().toLowerCase() === docName.trim().toLowerCase());
  const hasDuplicateWarning = (docName.trim() !== "" && isDuplicateName);

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
      // 1. Search Query filter (matches name)
      if (!activeSearchQuery) return true;
      const query = activeSearchQuery.toLowerCase();
      return (
        (d.name && d.name.toLowerCase().includes(query))
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
      // 3. Sorting
      if (sortBy === "recent") {
        return b.id - a.id;
      }
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "", "ar");
      }
      if (sortBy === "last_treated") {
        const aReport = reports.find((r) => r.doctorId === a.id);
        const bReport = reports.find((r) => r.doctorId === b.id);
        
        const getRecentness = (rep) => {
          if (!rep) return 0;
          if (rep.updatedAt) return new Date(rep.updatedAt).getTime();
          if (rep.createdAt) return new Date(rep.createdAt).getTime();
          if (rep.date) return new Date(rep.date).getTime();
          return rep.id || 1; 
        };
        
        return getRecentness(bReport) - getRecentness(aReport);
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
          className="space-y-8 max-w-[1400px] mx-auto"
        >
          {/* الهيدر */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                سجلات الدكاترة <Users className="text-indigo-500" size={28} />
              </h1>
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
                  placeholder="ابحث عن دكتور بالاسم..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveSearchQuery(e.target.value);
                  }}
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

            </div>

            {/* أدوات الفلترة والترتيب */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {/* فلتر تاريخ التسجيل */}
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/40 px-3 py-2 rounded-2xl border border-gray-200/50 dark:border-gray-800/60">
                <Calendar size={14} className="text-gray-400" />
                <CustomSelect
                  value={dateFilter}
                  onChange={setDateFilter}
                  options={[
                    { value: "all", label: "كل التواريخ" },
                    { value: "today", label: "سجل اليوم" },
                    { value: "week", label: "سجل هذا الأسبوع" },
                    { value: "month", label: "سجل هذا الشهر" }
                  ]}
                  className="bg-transparent border-0 text-xs font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
                  dropdownClassName="min-w-[150px]"
                />
              </div>

              {/* فلترة الترتيب */}
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/40 px-3 py-2 rounded-2xl border border-gray-200/50 dark:border-gray-800/60">
                <Filter size={14} className="text-gray-400" />
                <CustomSelect
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: "recent", label: "الأحدث تسجيلًا" },
                    { value: "name", label: "ترتيب أبجدي (الاسم)" },
                    { value: "last_treated", label: "آخر تعامل" },
                    { value: "most_treated", label: "الأكثر تعاملاً" }
                  ]}
                  className="bg-transparent border-0 text-xs font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
                  dropdownClassName="min-w-[150px]"
                />
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
                        </motion.div>
                      )}

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
                    قائمة الدكاترة المسجلين ({filteredAndSortedDoctors.length})
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAndSortedDoctors.length === 0 ? (
                      <div className="col-span-full py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                        لا يوجد دكاترة يطابقون خيارات البحث أو التصفية الحالية.
                      </div>
                    ) : (
                      filteredAndSortedDoctors.map((d) => (
                        <div
                          key={d.id}
                          onClick={() => router.push(`/doctors/${d.id}`)}
                          className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-500/30 cursor-pointer transition-all duration-200 group shadow-sm hover:shadow-md"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-500/20 dark:to-blue-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg shrink-0 border border-indigo-200/50 dark:border-indigo-500/30 group-hover:scale-105 transition-transform">
                            {d.name ? d.name.charAt(0) : "?"}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm group-hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate">
                              {d.name}
                            </span>
                            {/* عرض رتبة الأكثر تعاملاً إذا كان ضمن الأكثر تعاملاً */}
                            {sortBy === "most_treated" && (
                              <span className="text-[10px] text-amber-500 font-bold mt-1 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md inline-block w-fit">
                                الحساب: {reports.find(r => r.doctorId === d.id)?.totalRequired || 0} ج.م
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
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

