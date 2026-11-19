export type GuideLanguage = 'en' | 'ar';

export function guideLanguage(pathname: string): GuideLanguage {
  return /^\/ar(?:\/|$)/.test(pathname) ? 'ar' : 'en';
}

// Translation IDs include the context notes used by the installed Fumadocs version.
export const arabicInterface: Record<string, string> = {
  'Search(search dialog)': 'بحث',
  'Search(search trigger)': 'بحث',
  'Open Search(search trigger)(aria-label)': 'فتح البحث',
  'Close Search(search dialog)(aria-label)': 'إغلاق البحث',
  'No results found(search dialog)': 'لا توجد نتائج',
  'On this page(table of contents)': 'في هذه الصفحة',
  'Table of Contents(inline table of contents)': 'محتويات الصفحة',
  'No Headings(table of contents)': 'لا توجد عناوين',
  'Open Sidebar(aria-label)': 'فتح الشريط الجانبي',
  'Open Sidebar(sidebar)(aria-label)': 'فتح الشريط الجانبي',
  'Close Sidebar(aria-label)': 'إغلاق الشريط الجانبي',
  'Close Sidebar(sidebar)(aria-label)': 'إغلاق الشريط الجانبي',
  'Collapse Sidebar(sidebar)(aria-label)': 'طي الشريط الجانبي',
  'Hide Sidebar(sidebar)': 'إخفاء الشريط الجانبي',
  'Show Sidebar(sidebar)': 'إظهار الشريط الجانبي',
  'Toggle Menu(home layout header)(aria-label)': 'فتح قائمة التنقل',
  'Copy Anchor Link(heading anchor)(aria-label)': 'نسخ رابط العنوان',
  'Copied Anchor Link(heading anchor)(aria-label)': 'تم نسخ رابط العنوان',
  'Copy Link(accordion)(aria-label)': 'نسخ الرابط',
  'Copied Link(accordion)(aria-label)': 'تم نسخ الرابط',
  'Copy Text(code block)(aria-label)': 'نسخ النص',
  'Copied Text(code block)(aria-label)': 'تم نسخ النص',
  'Copy Markdown(page actions)': 'نسخ الصفحة بصيغة Markdown',
  'Copied Markdown(page actions)': 'تم نسخ الصفحة',
  'Open(page actions)': 'أدوات الصفحة',
  'View as Markdown(page actions)': 'عرض النص بصيغة Markdown',
  'Open in ChatGPT(page actions)': 'فتح في ChatGPT',
  'Open in Claude(page actions)': 'فتح في Claude',
  'Open in Cursor(page actions)': 'فتح في Cursor',
  'Open in GitHub(page actions)': 'فتح في GitHub',
  'Open in Scira AI(page actions)': 'فتح في Scira AI',
  'Read {url}, I want to ask questions about it.(page actions)': 'اقرأ الصفحة على {url} حتى أتمكّن من طرح أسئلة عنها',
  'Toggle Theme(theme switcher)(aria-label)': 'تبديل وضع العرض',
  'Light(theme switcher)(aria-label)': 'الوضع الفاتح',
  'Dark(theme switcher)(aria-label)': 'الوضع الداكن',
  'System(theme switcher)(aria-label)': 'حسب إعدادات الجهاز',
  'Theme(site menu)': 'المظهر',
  'Previous Page(pagination)': 'الصفحة السابقة',
  'Next Page(pagination)': 'الصفحة التالية',
  'Choose a language(language switcher)': 'اختر اللغة',
  'Choose a language(language switcher)(aria-label)': 'اختر اللغة',
  'Language(language switcher)': 'اللغة',
  'Last updated on(page footer)': 'آخر تحديث',
  'Page Not Found(404 not found page)': 'الصفحة غير موجودة',
  'Back to Home(404 not found page)': 'العودة إلى الصفحة الرئيسية',
  'Options(aria-label)': 'الخيارات',
};

export const englishInterface: Record<string, string> = {
  'Copy Markdown(page actions)': 'Copy page as Markdown',
  'Copied Markdown(page actions)': 'Page copied',
  'Open(page actions)': 'Page tools',
};
