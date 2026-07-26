// ملف الإعدادات المركزي للروابط
const BASE_URL = "https://el-warsha-back.onrender.com/api"; // غير الرابط هنا بس لما ترفع المشروع 🚀

export const API_ENDPOINTS = {
  // AiAssistant
  aiChat: `${BASE_URL}/AiAssistant/chat`,

  // Auth
  login: `${BASE_URL}/Auth/login`,

  // Branches
  createBranch: `${BASE_URL}/Branches/create`,

  // Custodies
  addCustody: `${BASE_URL}/Custodies/add`,
  custodiesByBranch: (branchId) => `${BASE_URL}/Custodies/branch/${branchId}`,
  editCustody: (id) => `${BASE_URL}/Custodies/edit/${id}`,
  deleteCustody: (id) => `${BASE_URL}/Custodies/delete/${id}`,

  // Doctors
  doctors: `${BASE_URL}/Doctors`,
  doctorById: (branchId, id) => `${BASE_URL}/Doctors/branch/${branchId}/${id}`,
  doctorsByBranch: (branchId) => `${BASE_URL}/Doctors/branch/${branchId}`,
  deleteDoctor: (branchId, id) => `${BASE_URL}/Doctors/branch/${branchId}/${id}`,
  updateDoctorName: (branchId, id) => `${BASE_URL}/Doctors/branch/${branchId}/${id}/name`,

  // FinancialRecords
  financialRecords: `${BASE_URL}/FinancialRecords`,

  // Inventories
  addInventory: `${BASE_URL}/Inventories/add`,
  inventoriesByBranch: (branchId) => `${BASE_URL}/Inventories/branch/${branchId}`,
  editInventory: (id) => `${BASE_URL}/Inventories/edit/${id}`,
  addNewPriceInventory: (id, newSellingPrice, newCostPrice, newQuantity) => 
    `${BASE_URL}/Inventories/add-new-price/${id}?newSellingPrice=${newSellingPrice}&newCostPrice=${newCostPrice}&newQuantity=${newQuantity}`,
  deleteInventory: (id) => `${BASE_URL}/Inventories/delete/${id}`,

  // MaintenanceOrders
  createOrder: `${BASE_URL}/MaintenanceOrders/create`,
  ordersByBranch: (branchId) => `${BASE_URL}/MaintenanceOrders/branch/${branchId}`
};
