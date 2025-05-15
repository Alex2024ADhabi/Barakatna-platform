import { useTranslation } from "react-i18next";

/**
 * Hook to get the current text direction based on language
 * @returns Object with isRTL boolean and directionClass string
 */
export const useTranslatedDirection = () => {
  const { i18n } = useTranslation();

  const isRTL = i18n.language === "ar";
  const directionClass = isRTL ? "rtl" : "ltr";

  return {
    isRTL,
    directionClass,
    direction: isRTL ? "rtl" : "ltr",
  };
};
