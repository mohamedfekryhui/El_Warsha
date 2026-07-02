"use client";
import Sidebar from "@/components/Sidebar";
import { useReportsData } from "@/hooks/useReportsData";
import { FileText, CreditCard, Truck, Receipt, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.08 } }
};
const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function ReportsPage() {
  const {
    doctors,
    reports,
    loading,
    finDoctorId,
    setFinDoctorId,
    finShipping,
    setFinShipping,
    finOther,
    setFinOther,
    finDesc,
    setFinDesc,
    finPaid,
    setFinPaid,
    handleRecordTransaction,
  } = useReportsData();

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
          <div className="mb-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              الحسابات والتقارير <FileText className="text-blue-500" size={28} />
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
              كشوفات العملاء، المديونيات، وتسجيل المدفوعات.
            </p>
          </div>

        <div className="space-y-8">
          {/* فورمة تسجيل مالي (Control Panel Style) */}
          <motion.div variants={itemVariants}>
            <form
              onSubmit={handleRecordTransaction}
              className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-800/60"
            >
            <div className="flex items-center gap-2 mb-6">
              <Receipt className="text-blue-500" size={20} />
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                تسجيل حركة مالية جديدة
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2 ml-1">
                  الطبيب
                </label>
                <select
                  required
                  value={finDoctorId}
                  onChange={(e) => setFinDoctorId(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="">اختر العميل...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2 ml-1">
                  تكلفة شحن
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={finShipping}
                  onChange={(e) => setFinShipping(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-2 ml-1">
                  المدفوع (الوارد)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={finPaid}
                  onChange={(e) => setFinPaid(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-800/50 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-emerald-700 dark:text-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2 ml-1">
                  وصف مصاريف أخرى
                </label>
                <input
                  type="text"
                  placeholder="مثال: خصم، إكرامية"
                  value={finDesc}
                  onChange={(e) => setFinDesc(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-2xl font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-md shadow-blue-500/20 h-[52px] flex items-center justify-center gap-2"
              >
                <CreditCard size={18} /> حفظ المعاملة
              </button>
            </div>
            </form>
          </motion.div>

          {/* جدول كشف الحساب */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-800/60 overflow-hidden">
            <h3 className="font-bold text-lg mb-6 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <FileText size={20} className="text-blue-500" /> كشف الحساب المجمع
            </h3>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800/60">
                      <th className="pb-4 text-sm font-semibold text-gray-400 w-1/4">
                        الطبيب
                      </th>
                      <th className="pb-4 text-sm font-semibold text-gray-400">
                        الصيانة
                      </th>
                      <th className="pb-4 text-sm font-semibold text-gray-400">
                        الشحن
                      </th>
                      <th className="pb-4 text-sm font-semibold text-gray-400">
                        المطلوب كلياً
                      </th>
                      <th className="pb-4 text-sm font-semibold text-gray-400">
                        تم دفعه
                      </th>
                      <th className="pb-4 text-sm font-semibold text-gray-400 text-left px-4">
                        الرصيد المتبقي
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr
                        key={r.doctorId}
                        className="border-b border-gray-50 dark:border-gray-800/40 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                      >
                        <td className="py-5 font-bold text-gray-900 dark:text-gray-100">
                          {r.doctorName}
                        </td>
                        <td className="py-5 text-gray-500 dark:text-gray-400 font-medium">
                          {r.totalPartsCost} ج.م
                        </td>
                        <td className="py-5 text-amber-600 dark:text-amber-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Truck size={14} /> {r.totalShipping} ج.م
                          </span>
                        </td>
                        <td className="py-5 text-gray-900 dark:text-gray-100 font-bold">
                          {r.totalRequired} ج.م
                        </td>
                        <td className="py-5 text-emerald-600 dark:text-emerald-500 font-bold">
                          {r.totalPaid} ج.م
                        </td>
                        <td className="py-5 text-left px-4">
                          {r.remainingBalance === 0 ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-500/20">
                              <BadgeCheck size={14} /> خالص
                            </span>
                          ) : (
                            <span
                              className={`font-black text-lg ${r.remainingBalance > 0 ? "text-rose-500" : "text-blue-500"}`}
                            >
                              {r.remainingBalance}{" "}
                              <span className="text-sm font-medium">ج.م</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </main>
  </div>
  );
}
