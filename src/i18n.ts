import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          // Common
          "common.loading": "Loading...",
          "common.error": "Error",
          "common.success": "Success",

          // Navigation
          "navigation.dashboard": "Dashboard",
          "navigation.clientManagement": "Client Management",
          "navigation.beneficiaryManagement": "Beneficiary Management",
          "navigation.assessment": "Assessment",
          "navigation.committee": "Committee",
          "navigation.projects": "Projects",
          "navigation.procurement": "Procurement",
          "navigation.financial": "Financial",
          "navigation.administration": "Administration",
          "navigation.platformNavigation": "Platform Navigation",

          // Committee Module
          "committee.moduleTitle": "Committee Module",
          "committee.decisions": "Decisions",
          "committee.submissions": "Submissions",
          "committee.meetings": "Meetings",
          "committee.members": "Members",
          "committee.recentDecisions": "Recent Decisions",
          "committee.pendingSubmissions": "Pending Submissions",
          "committee.upcomingMeetings": "Upcoming Meetings",
          "committee.committeeMembers": "Committee Members",
          "committee.noSubmissions": "No pending submissions to review.",
          "committee.noMeetings": "No upcoming meetings scheduled.",
          "committee.noMembers": "No members to display.",
          "committee.management": "Committee Management",
          "committee.managementDescription":
            "Manage committee members and meetings",
          "committee.decisionTracking": "Decision Tracking",
          "committee.decisionTrackingDescription":
            "Track and review committee decisions",
        },
      },
      ar: {
        translation: {
          // Add Arabic translations here
        },
      },
    },
  });

export default i18n;
