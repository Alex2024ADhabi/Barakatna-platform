import React from "react";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface CohortAnalyticsProps {
  cohortId?: number;
}

const CohortAnalytics: React.FC<CohortAnalyticsProps> = ({ cohortId }) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();

  // Mock data for analytics
  const attendanceData = [
    { week: 1, rate: 95 },
    { week: 2, rate: 92 },
    { week: 3, rate: 88 },
    { week: 4, rate: 90 },
    { week: 5, rate: 85 },
    { week: 6, rate: 82 },
    { week: 7, rate: 80 },
    { week: 8, rate: 78 },
  ];

  const memberStatusData = {
    active: 65,
    onHold: 8,
    dropped: 5,
    completed: 0,
  };

  const demographicData = {
    ageGroups: [
      { group: "60-65", count: 25 },
      { group: "66-70", count: 30 },
      { group: "71-75", count: 15 },
      { group: "76-80", count: 8 },
      { group: "80+", count: 0 },
    ],
    gender: {
      male: 38,
      female: 40,
    },
  };

  const getProgressColor = (value: number) => {
    if (value >= 90) return "bg-green-500";
    if (value >= 75) return "bg-blue-500";
    if (value >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className={`space-y-6 ${directionClass}`}>
      <Card>
        <CardHeader>
          <CardTitle>
            {t("cohort.attendanceAnalytics", "Attendance Analytics")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">
                {t("cohort.weeklyAttendance", "Weekly Attendance")}
              </h3>
              <Badge variant="outline">
                {t("cohort.averageAttendance", "Avg")}:{" "}
                {Math.round(
                  attendanceData.reduce((sum, week) => sum + week.rate, 0) /
                    attendanceData.length,
                )}
                %
              </Badge>
            </div>

            <div className="space-y-2">
              {attendanceData.map((week) => (
                <div key={week.week} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>
                      {t("cohort.week", "Week")} {week.week}
                    </span>
                    <span>{week.rate}%</span>
                  </div>
                  <Progress
                    value={week.rate}
                    className={getProgressColor(week.rate)}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="status">
        <TabsList className="w-full">
          <TabsTrigger value="status">
            {t("cohort.memberStatus", "Member Status")}
          </TabsTrigger>
          <TabsTrigger value="demographics">
            {t("cohort.demographics", "Demographics")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">
                      {t(
                        "cohort.memberStatusDistribution",
                        "Member Status Distribution",
                      )}
                    </h3>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{t("cohort.statuses.active", "Active")}</span>
                          <span>{memberStatusData.active}</span>
                        </div>
                        <Progress
                          value={
                            (memberStatusData.active /
                              (memberStatusData.active +
                                memberStatusData.onHold +
                                memberStatusData.dropped +
                                memberStatusData.completed)) *
                            100
                          }
                          className="bg-green-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{t("cohort.statuses.onHold", "On Hold")}</span>
                          <span>{memberStatusData.onHold}</span>
                        </div>
                        <Progress
                          value={
                            (memberStatusData.onHold /
                              (memberStatusData.active +
                                memberStatusData.onHold +
                                memberStatusData.dropped +
                                memberStatusData.completed)) *
                            100
                          }
                          className="bg-yellow-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{t("cohort.statuses.dropped", "Dropped")}</span>
                          <span>{memberStatusData.dropped}</span>
                        </div>
                        <Progress
                          value={
                            (memberStatusData.dropped /
                              (memberStatusData.active +
                                memberStatusData.onHold +
                                memberStatusData.dropped +
                                memberStatusData.completed)) *
                            100
                          }
                          className="bg-red-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>
                            {t("cohort.statuses.completed", "Completed")}
                          </span>
                          <span>{memberStatusData.completed}</span>
                        </div>
                        <Progress
                          value={
                            (memberStatusData.completed /
                              (memberStatusData.active +
                                memberStatusData.onHold +
                                memberStatusData.dropped +
                                memberStatusData.completed)) *
                            100
                          }
                          className="bg-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">
                      {t("cohort.retentionRate", "Retention Rate")}
                    </h3>
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {Math.round(
                            (memberStatusData.active /
                              (memberStatusData.active +
                                memberStatusData.dropped)) *
                              100,
                          )}
                          %
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t("cohort.activeMembers", "Active Members")}:{" "}
                          {memberStatusData.active}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t("cohort.droppedMembers", "Dropped Members")}:{" "}
                          {memberStatusData.dropped}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">
                    {t("cohort.ageDistribution", "Age Distribution")}
                  </h3>
                  <div className="space-y-2">
                    {demographicData.ageGroups.map((group) => (
                      <div key={group.group} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{group.group}</span>
                          <span>{group.count}</span>
                        </div>
                        <Progress
                          value={
                            (group.count /
                              demographicData.ageGroups.reduce(
                                (sum, g) => sum + g.count,
                                0,
                              )) *
                            100
                          }
                          className="bg-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">
                    {t("cohort.genderDistribution", "Gender Distribution")}
                  </h3>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{t("common.male", "Male")}</span>
                        <span>{demographicData.gender.male}</span>
                      </div>
                      <Progress
                        value={
                          (demographicData.gender.male /
                            (demographicData.gender.male +
                              demographicData.gender.female)) *
                          100
                        }
                        className="bg-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{t("common.female", "Female")}</span>
                        <span>{demographicData.gender.female}</span>
                      </div>
                      <Progress
                        value={
                          (demographicData.gender.female /
                            (demographicData.gender.male +
                              demographicData.gender.female)) *
                          100
                        }
                        className="bg-pink-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CohortAnalytics;
