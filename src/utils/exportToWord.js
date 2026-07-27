export const exportToWord = (receiptRows, filename, doctorName, shippingPrice = 0, globalDiscount = 0) => {
  let html = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>";
  html += "<head><meta charset='utf-8'><title>فاتورة استلام</title></head><body dir='rtl' style='font-family: Arial, sans-serif;'>";
  
  // Header
  html += `<div style='text-align: center; margin-bottom: 20px;'>
             <h1 style='color: #2c3e50; margin: 0;'>فاتورة استلام صيانة</h1>
             <h3 style='color: #7f8c8d; margin: 5px 0 0 0;'>د. ${doctorName || "غير محدد"}</h3>
             <p style='color: #95a5a6; font-size: 12px;'>تاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
           </div>`;
           
  html += "<hr style='border: 1px solid #bdc3c7; margin-bottom: 20px;' />";

  let totalDoc = 0;

  receiptRows.forEach((r, idx) => {
    const pDoc = parseFloat(r.priceDoc) || 0;
    totalDoc += pDoc;
    
    html += `<div style='margin-bottom: 20px; padding: 15px; border: 1px solid #ecf0f1; border-radius: 8px; background-color: #f9fafb;'>
              <h3 style='margin: 0 0 10px 0; color: #34495e; border-bottom: 1px solid #ecf0f1; padding-bottom: 5px;'>
                ${idx + 1}. ${r.handpieceType || "هاي"} ${r.quantity && r.quantity > 1 ? `(${r.quantity} قطع)` : ""} ${r.toolName ? `- ${r.toolName}` : ""}
              </h3>
              <table style='width: 100%; font-size: 14px; color: #2c3e50;' border='0'>
                <tr>
                  <td style='padding: 4px 0;'><strong>الرقم التسلسلي:</strong> ${r.serial || "-"}</td>
                  <td style='padding: 4px 0;'><strong>حالة الكونترا:</strong> ${r.contraStatus || "-"}</td>
                </tr>
                <tr>
                  <td style='padding: 4px 0;'><strong>نوع الصيانة:</strong> ${r.maintenanceTypes?.length > 0 ? r.maintenanceTypes.join(" + ") : "غير محدد"}</td>
                  <td style='padding: 4px 0;'><strong>سبب العطل:</strong> ${r.faultReason || "-"}</td>
                </tr>
                <tr>
                  <td style='padding: 4px 0;' colspan='2'><strong>ملاحظات:</strong> ${r.notes || "-"}</td>
                </tr>
              </table>
              <div style='text-align: left; margin-top: 10px; font-weight: bold; font-size: 16px; color: #16a085;'>
                السعر: ${pDoc} ج.م
              </div>
            </div>`;
  });

  html += "<hr style='border: 1px solid #bdc3c7; margin-top: 20px; margin-bottom: 20px;' />";
  
  const finalTotal = totalDoc - globalDiscount + shippingPrice;
  
  html += `<div style='text-align: left; font-size: 18px; color: #2c3e50;'>
             <p style='margin: 5px 0;'><strong>إجمالي الصيانة:</strong> ${totalDoc} ج.م</p>
             ${globalDiscount > 0 ? `<p style='margin: 5px 0; color: #e74c3c;'><strong>الخصم الشامل:</strong> -${globalDiscount} ج.م</p>` : ""}
             <p style='margin: 5px 0;'><strong>مصاريف الشحن:</strong> ${shippingPrice === 0 ? "مجاني" : shippingPrice + " ج.م"}</p>
             <h2 style='margin: 10px 0 0 0; color: #2980b9;'><strong>الإجمالي الكلي:</strong> ${finalTotal} ج.م</h2>
           </div>`;

  html += "</body></html>";

  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword'
  });
  
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename ? filename + '.doc' : 'document.doc';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
