import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4" />
      <Button
        variant={i18n.language === "en" ? "default" : "outline"}
        size="sm"
        onClick={() => changeLanguage("en")}
        className="h-8 px-2"
      >
        {t("common.english")}
      </Button>
      <Button
        variant={i18n.language === "ar" ? "default" : "outline"}
        size="sm"
        onClick={() => changeLanguage("ar")}
        className="h-8 px-2"
      >
        {t("common.arabic")}
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
