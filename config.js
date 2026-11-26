// ⚙️ إعدادات منصة المستشار
window.RC_CONFIG = {
  // رابط Google Apps Script (Web app URL) اللي بينتهي بـ /exec — سيبه فاضي لحد ما تعمل الشيت
  endpoint: "https://script.google.com/macros/s/AKfycbypz4DwzoPji1nUJQQ6d1B9qSUKncRpqilURYSerOUCPG_jwpfjqyv8f_2OZ3gztKbs/exec",
  // غيّر الرقم ده (مثلاً لتاريخ اليوم) كل ما تحدّث ملفات data عشان الموبايلات تاخد الجديد
  dataVersion: "8a12dee9a5",
  // تاريخ آخر تحديث لكل مصدر، بيظهر تحت كل إجابة على حسب مصدرها. غيّره لما تحدّث الملف ده بس
  dataDates: { products: "2026-11-13", guide: "2026-11-13", staff: "2026-11-05" },

  // 💳 برامج التقسيط في الحاسبة: الاسم والمدد المتاحة بس.
  //   النسب والمصاريف مش هنا عشان العروض بتتغير كل يوم تقريباً: المستشار بيكتبها في الحاسبة لكل عميل، ومش بتتحفظ.
  installments: [
    { id: "raya",     name: "تقسيط راية المباشر", months: [6, 9, 12, 18, 24, 30, 36], rate: null, fee: null, down: null },
    { id: "valu",     name: "فاليو",              months: [6, 9, 12, 18, 24, 36, 48, 60], rate: null, fee: null, down: null },
    { id: "souhoula", name: "سهولة",              months: [6, 9, 12, 18, 24, 36], rate: null, fee: null, down: null },
    { id: "contact",  name: "كونتكت",             months: [6, 9, 12, 18, 24, 36, 48], rate: null, fee: null, down: null },
    { id: "aman",     name: "أمان",               months: [6, 9, 12, 18, 24, 36], rate: null, fee: null, down: null },
    { id: "halan",    name: "حالاً",              months: [6, 9, 12, 18, 24], rate: null, fee: null, down: null },
    { id: "bank",     name: "بطاقات البنوك",      months: [6, 12, 18, 24, 36], rate: null, fee: null, down: null, note: "حسب عرض البنك على البطاقة" }
  ]
};
