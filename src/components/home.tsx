import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  ChevronRightIcon,
  HomeIcon,
  LayoutDashboardIcon,
  Settings2Icon,
  UserIcon,
} from "lucide-react";
import DashboardOverview from "./Dashboard/DashboardOverview";
import RoomAssessmentManager from "./Assessment/RoomAssessmentManager";
import WorkflowNavigatorWithLanguage from "./Workflow/WorkflowNavigatorWithLanguage";

const Home = () => {
  // Default state for client type selection
  const [clientType, setClientType] = React.useState("fdf");
  const [language, setLanguage] = React.useState("en");

  // Mock summary statistics
  const summaryStats = {
    activeProjects: 24,
    pendingAssessments: 12,
    completedProjects: 156,
    upcomingInspections: 8,
  };

  return (
    <div
      className="min-h-screen bg-background"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <HomeIcon className="h-6 w-6" />
            <h1 className="text-xl font-bold">Barakatna Platform</h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            >
              {language === "en" ? "العربية" : "English"}
            </Button>

            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {/* Client Type Selection */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">
            {language === "en" ? "Select Client Type" : "اختر نوع العميل"}
          </h2>
          <div className="flex flex-wrap gap-4">
            <Card
              className={`w-full cursor-pointer border-2 sm:w-[300px] ${clientType === "fdf" ? "border-primary" : "border-border"}`}
              onClick={() => setClientType("fdf")}
            >
              <CardHeader>
                <CardTitle>
                  {language === "en" ? "FDF Client" : "عميل FDF"}
                </CardTitle>
                <CardDescription>
                  {language === "en"
                    ? "Family Development Foundation"
                    : "مؤسسة تنمية الأسرة"}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className={`w-full cursor-pointer border-2 sm:w-[300px] ${clientType === "adha" ? "border-primary" : "border-border"}`}
              onClick={() => setClientType("adha")}
            >
              <CardHeader>
                <CardTitle>
                  {language === "en" ? "ADHA Client" : "عميل ADHA"}
                </CardTitle>
                <CardDescription>
                  {language === "en"
                    ? "Abu Dhabi Housing Authority"
                    : "هيئة أبوظبي للإسكان"}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className={`w-full cursor-pointer border-2 sm:w-[300px] ${clientType === "cash" ? "border-primary" : "border-border"}`}
              onClick={() => setClientType("cash")}
            >
              <CardHeader>
                <CardTitle>
                  {language === "en" ? "Cash Client" : "عميل نقدي"}
                </CardTitle>
                <CardDescription>
                  {language === "en"
                    ? "Direct Payment Clients"
                    : "عملاء الدفع المباشر"}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Workflow Navigator */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">
            {language === "en" ? "Project Workflow" : "سير عمل المشروع"}
          </h2>
          <WorkflowNavigatorWithLanguage
            clientType={clientType}
            language={language}
          />
        </div>

        {/* Summary Statistics */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">
            {language === "en" ? "Summary Statistics" : "إحصائيات ملخصة"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>
                  {language === "en" ? "Active Projects" : "المشاريع النشطة"}
                </CardDescription>
                <CardTitle className="text-3xl">
                  {summaryStats.activeProjects}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {language === "en" ? "In Progress" : "قيد التنفيذ"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>
                  {language === "en"
                    ? "Pending Assessments"
                    : "التقييمات المعلقة"}
                </CardDescription>
                <CardTitle className="text-3xl">
                  {summaryStats.pendingAssessments}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700"
                >
                  {language === "en" ? "Awaiting Review" : "في انتظار المراجعة"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>
                  {language === "en"
                    ? "Completed Projects"
                    : "المشاريع المكتملة"}
                </CardDescription>
                <CardTitle className="text-3xl">
                  {summaryStats.completedProjects}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {language === "en" ? "Finished" : "منتهي"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>
                  {language === "en"
                    ? "Upcoming Inspections"
                    : "عمليات التفتيش القادمة"}
                </CardDescription>
                <CardTitle className="text-3xl">
                  {summaryStats.upcomingInspections}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700"
                >
                  {language === "en" ? "Scheduled" : "مجدول"}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">
            {language === "en" ? "Dashboard" : "لوحة المعلومات"}
          </h2>
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview" className="text-base">
                <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                {language === "en" ? "Overview" : "نظرة عامة"}
              </TabsTrigger>
              <TabsTrigger value="assessments" className="text-base">
                <ClipboardIcon className="mr-2 h-4 w-4" />
                {language === "en" ? "Assessments" : "التقييمات"}
              </TabsTrigger>
              <TabsTrigger value="projects" className="text-base">
                <HomeIcon className="mr-2 h-4 w-4" />
                {language === "en" ? "Projects" : "المشاريع"}
              </TabsTrigger>
              <TabsTrigger value="calendar" className="text-base">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {language === "en" ? "Calendar" : "التقويم"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <DashboardOverview clientType={clientType} language={language} />
            </TabsContent>

            <TabsContent value="assessments">
              <RoomAssessmentManager
                clientType={clientType}
                language={language}
              />
            </TabsContent>

            <TabsContent value="projects">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "en" ? "Active Projects" : "المشاريع النشطة"}
                  </CardTitle>
                  <CardDescription>
                    {language === "en"
                      ? "Manage your ongoing projects"
                      : "إدارة المشاريع الجارية"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((project) => (
                      <div
                        key={project}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <h3 className="font-medium">
                            Project #{project}0{project}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {language === "en"
                              ? "Phase 2: Planning"
                              : "المرحلة 2: التخطيط"}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "en" ? "Upcoming Schedule" : "الجدول القادم"}
                  </CardTitle>
                  <CardDescription>
                    {language === "en"
                      ? "View your upcoming appointments and deadlines"
                      : "عرض المواعيد والمواعيد النهائية القادمة"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((event) => (
                      <div
                        key={event}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <h3 className="font-medium">
                            {language === "en"
                              ? `Site Visit: Project #10${event}`
                              : `زيارة الموقع: المشروع #10${event}`}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(2023, 5, event + 10).toLocaleDateString(
                              language === "en" ? "en-US" : "ar-AE",
                            )}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          {language === "en" ? "View Details" : "عرض التفاصيل"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">
            {language === "en" ? "Quick Actions" : "إجراءات سريعة"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              className="h-auto flex-col gap-2 p-6 text-lg"
              variant="outline"
            >
              <UserIcon className="h-6 w-6" />
              {language === "en" ? "New Beneficiary" : "مستفيد جديد"}
            </Button>

            <Button
              className="h-auto flex-col gap-2 p-6 text-lg"
              variant="outline"
            >
              <ClipboardIcon className="h-6 w-6" />
              {language === "en" ? "New Assessment" : "تقييم جديد"}
            </Button>

            <Button
              className="h-auto flex-col gap-2 p-6 text-lg"
              variant="outline"
            >
              <HomeIcon className="h-6 w-6" />
              {language === "en" ? "New Project" : "مشروع جديد"}
            </Button>

            <Button
              className="h-auto flex-col gap-2 p-6 text-lg"
              variant="outline"
            >
              <Settings2Icon className="h-6 w-6" />
              {language === "en" ? "Settings" : "الإعدادات"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Missing ClipboardIcon component
const ClipboardIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
};

export default Home;
