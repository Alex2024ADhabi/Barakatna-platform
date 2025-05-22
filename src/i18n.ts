import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

// Default translations for fallback
const resources = {
  en: {
    translation: {
      dashboard: "Dashboard",
      admin: "Administration",
      assessments: "Assessments",
      projects: "Projects",
      budget: "Budget",
      supplier: "Supplier",
      pricelist: "Price List",
      cohort: "Cohort",
      beneficiaries: "Beneficiaries",
      pending_approvals: "Pending Approvals",
      recent_activities: "Recent Activities",
      upcoming_tasks: "Upcoming Tasks",
      activity_item: "Activity {{number}}",
      task_item: "Task {{number}}",
      client: "Client",
      financial: "Financial",
      login: "Login",
      register: "Register",
      reset_password: "Reset Password",
      email: "Email",
      password: "Password",
      confirm_password: "Confirm Password",
      enter_email: "Enter your email",
      enter_password: "Enter your password",
      confirm_your_password: "Confirm your password",
      barakatna_platform: "Barakatna Platform",
      healthcare_platform: "Healthcare Platform",
      committees: "Committees",
      schedule_meeting: "Schedule Meeting",
      edit_committee: "Edit Committee",
      committee_members: "Committee Members",
      pending_submissions: "Pending Submissions",
      committee_meetings: "Committee Meetings",
      add_member: "Add Member",
      submitted_by: "Submitted by {{name}}",
      review: "Review",
      no_pending_submissions: "No pending submissions",
      date: "Date",
      time: "Time",
      location: "Location",
      status: "Status",
      actions: "Actions",
      view_agenda: "View Agenda",
      view_minutes: "View Minutes",
      edit: "Edit",
    },
  },
  ar: {
    translation: {
      dashboard: "لوحة المعلومات",
      admin: "الإدارة",
      assessments: "التقييمات",
      projects: "المشاريع",
      beneficiaries: "المستفيدين",
      pending_approvals: "الموافقات المعلقة",
      recent_activities: "الأنشطة الأخيرة",
      upcoming_tasks: "المهام القادمة",
      activity_item: "النشاط {{number}}",
      task_item: "المهمة {{number}}",
      client: "العميل",
    },
  },
};

i18n
  // Load translation using http -> see /public/locales
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Init i18next
  .init({
    fallbackLng: "en",
    debug: import.meta.env.DEV,
    resources, // Add default resources
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    react: {
      useSuspense: false,
    },
  })
  .catch((error) => {
    console.error("i18n initialization error:", error);
  });

export default i18n;
