/**
 * Returns the CSS classes for styling a status badge across the application.
 * @param {string} status - The status of the order/item
 * @returns {string} Tailwind CSS classes
 */
export const getStatusStyle = (status) => {
  switch (status) {
    case "تحت الصيانة":
      return "bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
    case "تمت الصيانة وتحت الشحن":
      return "bg-blue-50 text-blue-700 border-blue-250 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
    case "تم التوصيل":
    case "تم التسليم":
      return "bg-emerald-50 text-emerald-755 border-emerald-255 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
  }
};
