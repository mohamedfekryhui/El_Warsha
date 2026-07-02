// ملف الإعدادات المركزي للروابط
const BASE_URL = "https://localhost:7226/api"; // غير الرابط هنا بس لما ترفع المشروع 🚀

export const API_ENDPOINTS = {
  profits: `${BASE_URL}/maintenance/workshop-profits`,
  doctors: `${BASE_URL}/doctors`,
  activeOrders: `${BASE_URL}/maintenanceorders/active`,
  createOrder: `${BASE_URL}/maintenanceorders`,
  doctorsAccounts: `${BASE_URL}/maintenance/doctors-accounts`,
  addPartToOrder: (orderId, inventoryId) =>
    `${BASE_URL}/maintenance/add-item-to-order?orderId=${orderId}&inventoryId=${inventoryId}&qty=1`,
  updateOrderStatus: (orderId, status) =>
    `${BASE_URL}/maintenanceorders/${orderId}/status?newStatus=${status}`,
  financialRecords: `${BASE_URL}/financialrecords`,
  todos: `${BASE_URL}/todos`,
  events: `${BASE_URL}/workshopevents`
};
