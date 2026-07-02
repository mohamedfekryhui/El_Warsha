"use client";
import Sidebar from "@/components/Sidebar";
import { useMaintenanceData } from "@/hooks/useMaintenanceData";
import {
  Wrench,
  Plus,
  CheckCircle2,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.08 } }
};
const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function MaintenancePage() {
  const {
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
  } = useMaintenanceData();

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
              غرفة الصيانة والرف <Wrench className="text-amber-500" size={28} />
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
              إدارة استلام المعدات، تركيب قطع الغيار، والتسليم.
            </p>
          </div>

        <div className="space-y-8">
          {/* قسم الفورمات (جنب بعض في الشاشات الكبيرة) */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* فورمة الاستلام */}
            <form
              onSubmit={handleCreateOrder}
              className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-800/60 space-y-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                  <Plus size={20} />
                </div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                  استلام معدة جديدة
                </h3>
              </div>

              <select
                required
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
              >
                <option value="">اختر الطبيب صاحب المعدة...</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="نوع وموديل الهاندبيس (مثال: NSK Ti-Max)"
                required
                value={handpieceName}
                onChange={(e) => setHandpieceName(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
              />
              <input
                type="text"
                placeholder="السيريال نمبر (S/N)"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
              />
              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-md shadow-teal-500/20"
              >
                <Plus size={18} /> رفع على الرف
              </button>
            </form>

            {/* فورمة تركيب القطع */}
            <form
              onSubmit={handleAddItemToOrder}
              className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none border border-gray-100 dark:border-gray-800/60 space-y-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                  <Settings2 size={20} />
                </div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                  صرف وتركيب قطع غيار
                </h3>
              </div>

              <select
                required
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-rose-500 outline-none text-sm"
              >
                <option value="">اختر الهاندبيس الحالية من الرف...</option>
                {activeOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.handpieceName} - د.{o.doctorName}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="كود الصنف في المخزن (ID)"
                required
                value={inventoryId}
                onChange={(e) => setInventoryId(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-rose-500 outline-none text-sm"
              />
              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white p-4 rounded-2xl font-bold transition-all transform hover:-translate-y-0.5 shadow-md shadow-rose-500/20 mt-4"
              >
                خصم من المخزن وتركيب للمعدة
              </button>
            </form>
          </motion.div>

          {/* قسم الرف النشط */}
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
                الرف فارغ، لا توجد معدات قيد الصيانة.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeOrders.map((o) => (
                  <div
                    key={o.id}
                    className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/60 flex justify-between items-center hover:shadow-md transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                        {o.handpieceName}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        طبيب: {o.doctorName}
                      </p>
                      <span className="inline-block mt-3 px-3 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                        {o.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeliverOrder(o.id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl flex items-center gap-2 font-bold text-sm shadow-sm transition-transform hover:scale-105"
                    >
                      <CheckCircle2 size={16} /> تسليم
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </main>
  </div>
  );
}
