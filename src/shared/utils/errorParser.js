/**
 * Professional Error Parser
 * Converts API errors into user-friendly Uzbek messages.
 */
export const parseError = (error) => {
  if (!error) return 'Noma\'lum xatolik yuz berdi';

  const status = error.response?.status;
  const message = error.response?.data?.message;

  if (message) return message;

  switch (status) {
    case 400:
      return 'So\'rov noto\'g\'ri yuborildi. Ma\'lumotlarni tekshiring.';
    case 401:
      return 'Tizimga kirish ruxsati yo\'q yoki seans muddati tugagan.';
    case 403:
      return 'Ushbu amalni bajarish uchun huquqingiz yetarli emas.';
    case 404:
      return 'So\'ralgan ma\'lumot topilmadi.';
    case 422:
      return 'Yuborilgan ma\'lumotlarda xatolik bor.';
    case 500:
      return 'Serverda ichki xatolik yuz berdi. Keyinroq qayta urinib ko\'ring.';
    default:
      if (error.code === 'ECONNABORTED') return 'So\'rov kutish vaqti tugadi. Internet aloqasini tekshiring.';
      if (!window.navigator.onLine) return 'Internet aloqasi mavjud emas.';
      return 'Server bilan bog\'lanishda xatolik yuz berdi.';
  }
};
