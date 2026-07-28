const abbreviationsMap = {
  "ت": "تنظيف",
  "خ": "رد خبطة",
  "خ غطا": "رد خبطة غطا",
  "ف اير": "تسليك فلاش اير",
  "2 ب": "2 بلية",
  "2 ب س": "2 بلية سيرونا",
  "است": "استك",
  "استبدال ق": "استبدال قاعدة",
  "ب ام": "بلية امامية",
  "ب ام (ر)": "بلية امامية",
  "ب ام س": "بلية امامية سيرونا",
  "بادي بدون ق": "بادي بدون قاعدة",
  "ع": "عمود",
  "ع كي": "عمود كي",
  "غ": "غطا",
  "غ ب و م": "غطا بلية ومحبس",
  "غ كي استاندر": "غطا كي",
  "ق": "قاعدة",
  "ك": "كاوتشة",
  "لزق": "لزق قاعدة",
  "لزه": "لزق هيد",
  "هكر": "هيد لو سبيد",
  "هكن": "هيد لو سبيد",
  "ص ت": "صندوق تروس"
};

export const exportToWord = (receiptRows, filename, doctorName, shippingPrice = 0, globalDiscount = 0, allServices = []) => {
  let html = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>";
  html += "<head><meta charset='utf-8'><title>فاتورة صيانة</title></head>";
  html += "<body dir='rtl' style='font-family: Arial, Tahoma, sans-serif; background-color: #ffffff; color: #1e293b;'>";

  // ==========================================
  // 1. Header (مبني بجداول مخفية عشان الـ Word يفهمها)
  // ==========================================
  html += `
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
      <tr>
        <td align="right" valign="middle" width="50%">
          <!-- لوجو نصي فخم بديل للصورة المكسورة -->
          <h1 style="color: #1e3a8a; margin: 0; font-size: 28px; font-family: 'Segoe UI', Arial, sans-serif;">الـورشـة</h1>
        </td>
        <td align="left" valign="middle" width="50%">
          <table border="0" cellpadding="8" cellspacing="0" style="border: 1px solid #cbd5e1; background-color: #f8fafc;">
            <tr>
              <td align="right">
                <div style="font-size: 13px; color: #334155;"><strong>الدكتور:</strong> د. ${doctorName || "غير محدد"}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;"><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-EG')}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <hr style="border: 0; border-bottom: 2px solid #e2e8f0; margin-bottom: 25px;" />
  `;

  let totalDoc = 0;

  // ==========================================
  // 2. الهاندبيسات والقطع (Cards Design in Word format)
  // ==========================================
  receiptRows.forEach((r, idx) => {
    const pDoc = parseFloat(r.priceDoc) || 0;
    totalDoc += pDoc;

    let specsHtml = "";
    if (r.serial) specsHtml += `<tr><td width="30%" style="color:#64748b; font-size:12px; padding-bottom:5px;">الرقم التسلسلي:</td><td width="70%" style="font-weight:bold; font-size:13px; padding-bottom:5px;">${r.serial}</td></tr>`;
    if (r.contraStatus) specsHtml += `<tr><td style="color:#64748b; font-size:12px; padding-bottom:5px;">حالة الكونترا:</td><td style="font-weight:bold; font-size:13px; padding-bottom:5px;">${r.contraStatus}</td></tr>`;
    if (r.faultReason) specsHtml += `<tr><td style="color:#64748b; font-size:12px; padding-bottom:5px;">سبب العطل:</td><td style="font-weight:bold; font-size:13px; padding-bottom:5px;">${r.faultReason}</td></tr>`;
    if (r.notes) specsHtml += `<tr><td style="color:#64748b; font-size:12px; padding-bottom:10px;">ملاحظات:</td><td style="font-weight:bold; font-size:13px; padding-bottom:10px;">${r.notes}</td></tr>`;

    let servicesHtml = "";
    if (r.maintenanceTypes && r.maintenanceTypes.length > 0) {
      servicesHtml += `<tr><td colspan="2" style="font-weight:bold; color:#1e3a8a; font-size:13px; padding-top:10px; border-top:1px solid #e2e8f0;">الخدمات والقطع المنفذة:</td></tr>`;
      
      r.maintenanceTypes.forEach(t => {
        const service = allServices.find(s => s.name === t);
        const price = service ? parseFloat(service.priceDoc || 0) : 0;
        const nameTranslated = abbreviationsMap[t.trim()] || t;

        servicesHtml += `
          <tr>
            <td colspan="2" style="padding-top: 5px;">
              <table width="100%" border="0" cellpadding="5" cellspacing="0" style="background-color: #ffffff; border: 1px solid #cbd5e1;">
                <tr>
                  <td align="right" style="color: #16a34a; font-weight: bold; font-size: 13px;">✓ ${nameTranslated}</td>
                  <td align="left" style="color: #cee233ff; font-weight: bold; font-size: 13px; width: 100px;">${price} ج.م</td>
                </tr>
              </table>
            </td>
          </tr>
        `;
      });
    }

    html += `
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; border: 1px solid #cbd5e1; background-color: #f8fafc;">
        <!-- Card Header -->
        <tr>
          <td bgcolor="#1e3a8a" style="padding: 10px;">
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td align="right" style="color: #ffffff; font-size: 15px; font-weight: bold;">
                  🦷 ${r.handpieceType || "هاي سبيد"} ${r.toolName ? `- ${r.toolName}` : ""}
                </td>
                <td align="left" style="color: #93c5fd; font-size: 13px;">
                  ${r.quantity && r.quantity > 1 ? `العدد: ${r.quantity}` : "العدد: 1"}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- Card Body -->
        <tr>
          <td style="padding: 15px;">
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              ${specsHtml}
              ${servicesHtml}
            </table>
          </td>
        </tr>

        <!-- Card Footer (Total for piece) -->
        <tr>
          <td bgcolor="#e2e8f0" style="padding: 10px; border-top: 1px solid #cbd5e1;">
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td align="right" style="color: #475569; font-weight: bold; font-size: 13px;">إجمالي القطعة:</td>
                <td align="left" style="color: #cee233ff; font-weight: bold; font-size: 15px;">${pDoc} ج.م</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  });

  // ==========================================
  // 3. Summary (كارت الإجمالي الختامي)
  // ==========================================
  const finalTotal = totalDoc - globalDiscount + shippingPrice;

  html += `
    <br/>
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <!-- مساحة فارغة لليمين عشان نزق الكارت للشمال -->
        <td width="55%"></td>
        <td width="45%" align="left">
          
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border: 1px solid #cbd5e1; background-color: #f8fafc;">
            <tr>
              <td style="padding: 15px;">
                <table width="100%" border="0" cellpadding="5" cellspacing="0">
                  <tr>
                    <td align="right" style="color: #475569; font-size: 13px;">إجمالي الصيانة:</td>
                    <td align="left" style="color: #1e293b; font-weight: bold; font-size: 13px;">${totalDoc} ج.م</td>
                  </tr>
                  ${globalDiscount > 0 ? `
                  <tr>
                    <td align="right" style="color: #dc2626; font-size: 13px;">الخصم:</td>
                    <td align="left" style="color: #dc2626; font-weight: bold; font-size: 13px;">-${globalDiscount} ج.م</td>
                  </tr>` : ""}
                  <tr>
                    <td align="right" style="color: #475569; font-size: 13px;">الشحن:</td>
                    <td align="left" style="color: #1e293b; font-weight: bold; font-size: 13px;">${shippingPrice === 0 ? "مجاني" : shippingPrice + " ج.م"}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td bgcolor="#1e3a8a" style="padding: 12px 15px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="right" style="color: #ffffff; font-weight: bold; font-size: 15px;">الإجمالي النهائي:</td>
                    <td align="left" style="color: #ffffff; font-weight: bold; font-size: 18px;">${finalTotal} ج.م</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  `;

  html += "</body></html>";

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename ? filename + '.doc' : 'فاتورة_صيانة.doc';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};