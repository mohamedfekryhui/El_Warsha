"use client";
import Sidebar from "@/components/Sidebar";
import { useDoctorsData } from "@/hooks/useDoctorsData";
import { Plus, UserPlus, Users, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.08 } }
};
const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function DoctorsPage() {
  const {
    doctors,
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
              سجلات الدكاترة <Users className="text-indigo-500" size={28} />
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
              إدارة بيانات العملاء، العيادات، وعناوين الشحن.
            </p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* الفورمة (تصميم Card مودرن) */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
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
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-md shadow-indigo-500/20 mt-2"
                >
                  <Plus size={18} /> حفظ بيانات الطبيب
                </button>
              </form>
            </div>
          </motion.div>

          {/* الجدول (تصميم Clean) */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-800/60 overflow-hidden">
              <h3 className="font-bold text-lg mb-6 text-gray-800 dark:text-gray-200">
                قائمة العملاء المسجلين
              </h3>

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
                      {doctors.length === 0 ? (
                        <tr>
                          <td
                            colSpan="3"
                            className="py-8 text-center text-gray-400 text-sm"
                          >
                            لا يوجد دكاترة مسجلين حتى الآن.
                          </td>
                        </tr>
                      ) : (
                        doctors.map((d) => (
                          <tr
                            key={d.id}
                            className="border-b border-gray-50 dark:border-gray-800/40 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                          >
                            <td className="py-4 px-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-500/20 dark:to-blue-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0 border border-indigo-200/50 dark:border-indigo-500/30">
                                  {d.name.charAt(0)}
                                </div>
                                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                                  {d.name}
                                </span>
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
                                <span>{d.address1}</span>
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
