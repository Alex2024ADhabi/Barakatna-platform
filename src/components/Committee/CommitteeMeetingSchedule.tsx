import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { Plus, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Committee, CommitteeMeeting } from "@/lib/api/committee/types";
import { committeeApi } from "@/lib/api/committee/committeeApi";
import { useToast } from "../ui/use-toast";
import { Status } from "@/lib/api/core/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";

interface CommitteeMeetingScheduleProps {
  committees: Committee[];
}

const CommitteeMeetingSchedule: React.FC<CommitteeMeetingScheduleProps> = ({
  committees,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<CommitteeMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date>(new Date());
  const [selectedMeeting, setSelectedMeeting] =
    useState<CommitteeMeeting | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMinutesOpen, setIsMinutesOpen] = useState(false);
  const [meetingMinutes, setMeetingMinutes] = useState("");

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await committeeApi.getCommitteeMeetings({
        page: 1,
        pageSize: 100,
        sortBy: "date",
        sortDirection: "asc",
      });

      if (response.success && response.data) {
        setMeetings(response.data.items);
      } else {
        // Mock data for development
        const mockMeetings: CommitteeMeeting[] = [
          {
            id: "meet-001",
            committeeId: "com-001",
            title: "Monthly Assessment Review",
            description: "Review and approve pending assessments",
            date: new Date(),
            startTime: "10:00",
            endTime: "12:00",
            location: "Conference Room A",
            isVirtual: false,
            status: Status.Pending,
            agenda: [
              {
                id: "agenda-001",
                meetingId: "meet-001",
                title: "Welcome and Introduction",
                description: "Opening remarks by the committee chair",
                presenter: "Ahmed Al Mansouri",
                duration: 15,
                order: 1,
                status: Status.Pending,
              },
              {
                id: "agenda-002",
                meetingId: "meet-001",
                title: "Assessment Review",
                description: "Review of pending assessments",
                presenter: "Sarah Johnson",
                duration: 45,
                order: 2,
                status: Status.Pending,
              },
            ],
            attendees: ["user-001", "user-002", "user-003"],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "meet-002",
            committeeId: "com-002",
            title: "Project Funding Review",
            description: "Review and approve project funding requests",
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            startTime: "14:00",
            endTime: "16:00",
            location: "Virtual Meeting",
            isVirtual: true,
            meetingLink: "https://zoom.us/j/123456789",
            status: Status.Pending,
            agenda: [
              {
                id: "agenda-003",
                meetingId: "meet-002",
                title: "Welcome and Introduction",
                description: "Opening remarks by the committee chair",
                presenter: "Mohammed Al Hashimi",
                duration: 15,
                order: 1,
                status: Status.Pending,
              },
              {
                id: "agenda-004",
                meetingId: "meet-002",
                title: "Funding Request Review",
                description: "Review of pending funding requests",
                presenter: "Fatima Al Zaabi",
                duration: 60,
                order: 2,
                status: Status.Pending,
              },
            ],
            attendees: ["user-002", "user-004", "user-005"],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        setMeetings(mockMeetings);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
      toast({
        title: "Error",
        description: "Failed to load committee meetings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCommitteeName = (committeeId: string): string => {
    const committee = committees.find((c) => c.id === committeeId);
    return committee ? committee.name : "Unknown Committee";
  };

  const getStatusBadgeVariant = (
    status: Status,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case Status.Completed:
        return "default";
      case Status.Pending:
        return "secondary";
      case Status.Cancelled:
        return "destructive";
      default:
        return "outline";
    }
  };

  const getMeetingsForDate = (date: Date): CommitteeMeeting[] => {
    return meetings.filter(
      (meeting) =>
        meeting.date.getDate() === date.getDate() &&
        meeting.date.getMonth() === date.getMonth() &&
        meeting.date.getFullYear() === date.getFullYear(),
    );
  };

  const selectedDateMeetings = getMeetingsForDate(date);

  const handleViewMeetingDetails = (meeting: CommitteeMeeting) => {
    setSelectedMeeting(meeting);
    setIsDetailsOpen(true);
  };

  const handleJoinMeeting = (meeting: CommitteeMeeting) => {
    if (meeting.isVirtual && meeting.meetingLink) {
      window.open(meeting.meetingLink, "_blank");
    } else {
      toast({
        title: "In-Person Meeting",
        description: `This meeting is scheduled to take place at ${meeting.location}`,
      });
    }
  };

  const handleSaveMinutes = () => {
    if (selectedMeeting && meetingMinutes.trim()) {
      // In a real app, this would call an API to save the minutes
      toast({
        title: "Success",
        description: "Meeting minutes saved successfully",
      });
      setIsMinutesOpen(false);

      // Update the meeting in the local state
      const updatedMeetings = meetings.map((meeting) =>
        meeting.id === selectedMeeting.id
          ? { ...meeting, minutes: meetingMinutes }
          : meeting,
      );
      setMeetings(updatedMeetings);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>{t("committee.calendar", "Meeting Calendar")}</CardTitle>
          <CardDescription>
            {t(
              "committee.calendarDescription",
              "Select a date to view scheduled meetings",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => date && setDate(date)}
            className="rounded-md border"
          />
          <div className="mt-4 space-y-2">
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {t("committee.scheduleMeeting", "Schedule Meeting")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            {t("committee.meetingsFor", "Meetings for")}{" "}
            {format(date, "MMMM d, yyyy")}
          </CardTitle>
          <CardDescription>
            {selectedDateMeetings.length > 0
              ? t("committee.meetingsCount", "{{count}} meetings scheduled", {
                  count: selectedDateMeetings.length,
                })
              : t(
                  "committee.noMeetings",
                  "No meetings scheduled for this date",
                )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">{t("common.loading", "Loading...")}</span>
            </div>
          ) : selectedDateMeetings.length === 0 ? (
            <div className="text-center p-6 border rounded-md">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                {t(
                  "committee.noMeetingsScheduled",
                  "No meetings scheduled for this date",
                )}
              </p>
              <Button className="mt-4" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                {t("committee.scheduleMeeting", "Schedule Meeting")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-4 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{meeting.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getCommitteeName(meeting.committeeId)}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(meeting.status)}>
                      {meeting.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm">
                    <p>
                      <span className="font-medium">
                        {t("committee.time", "Time")}:
                      </span>{" "}
                      {meeting.startTime} - {meeting.endTime}
                    </p>
                    <p>
                      <span className="font-medium">
                        {t("committee.location", "Location")}:
                      </span>{" "}
                      {meeting.isVirtual
                        ? t("committee.virtual", "Virtual Meeting")
                        : meeting.location}
                    </p>
                    <p className="mt-1">{meeting.description}</p>
                  </div>
                  <div className="mt-3 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewMeetingDetails(meeting)}
                    >
                      {t("committee.viewDetails", "View Details")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleJoinMeeting(meeting)}
                    >
                      {t("committee.joinMeeting", "Join Meeting")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meeting Details Dialog */}
      {selectedMeeting && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedMeeting.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">
                  {t("committee.details", "Meeting Details")}
                </h3>
                <div className="mt-2 space-y-2">
                  <div className="flex">
                    <span className="font-medium w-32">
                      {t("committee.committee", "Committee")}:
                    </span>
                    <span>{getCommitteeName(selectedMeeting.committeeId)}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">
                      {t("committee.date", "Date")}:
                    </span>
                    <span>
                      {format(new Date(selectedMeeting.date), "MMMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">
                      {t("committee.time", "Time")}:
                    </span>
                    <span>
                      {selectedMeeting.startTime} - {selectedMeeting.endTime}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">
                      {t("committee.location", "Location")}:
                    </span>
                    <span>
                      {selectedMeeting.isVirtual
                        ? t("committee.virtual", "Virtual Meeting")
                        : selectedMeeting.location}
                    </span>
                  </div>
                  {selectedMeeting.isVirtual && selectedMeeting.meetingLink && (
                    <div className="flex">
                      <span className="font-medium w-32">
                        {t("committee.link", "Meeting Link")}:
                      </span>
                      <a
                        href={selectedMeeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedMeeting.meetingLink}
                      </a>
                    </div>
                  )}
                  <div className="flex">
                    <span className="font-medium w-32">
                      {t("committee.status", "Status")}:
                    </span>
                    <Badge
                      variant={getStatusBadgeVariant(selectedMeeting.status)}
                    >
                      {selectedMeeting.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium">
                  {t("committee.description", "Description")}
                </h3>
                <p className="mt-1">{selectedMeeting.description}</p>
              </div>

              <div>
                <h3 className="font-medium">
                  {t("committee.agenda", "Agenda")}
                </h3>
                <div className="mt-2 space-y-2">
                  {selectedMeeting.agenda.map((item) => (
                    <div key={item.id} className="p-3 border rounded-md">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{item.title}</h4>
                        <span className="text-sm text-muted-foreground">
                          {item.duration} min
                        </span>
                      </div>
                      <p className="text-sm mt-1">{item.description}</p>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">
                          {t("committee.presenter", "Presenter")}:
                        </span>{" "}
                        {item.presenter}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMeetingMinutes(selectedMeeting.minutes || "");
                    setIsMinutesOpen(true);
                    setIsDetailsOpen(false);
                  }}
                >
                  {selectedMeeting.minutes
                    ? t("committee.viewMinutes", "View Minutes")
                    : t("committee.addMinutes", "Add Minutes")}
                </Button>
                <Button onClick={() => handleJoinMeeting(selectedMeeting)}>
                  {t("committee.joinMeeting", "Join Meeting")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Meeting Minutes Dialog */}
      {selectedMeeting && (
        <Dialog open={isMinutesOpen} onOpenChange={setIsMinutesOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {t("committee.meetingMinutes", "Meeting Minutes")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{selectedMeeting.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedMeeting.date), "MMMM d, yyyy")} |{" "}
                  {selectedMeeting.startTime} - {selectedMeeting.endTime}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="minutes" className="font-medium">
                  {t("committee.minutes", "Minutes")}
                </label>
                <Textarea
                  id="minutes"
                  rows={10}
                  placeholder={t(
                    "committee.enterMinutes",
                    "Enter meeting minutes here...",
                  )}
                  value={meetingMinutes}
                  onChange={(e) => setMeetingMinutes(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailsOpen(true);
                    setIsMinutesOpen(false);
                  }}
                >
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button onClick={handleSaveMinutes}>
                  {t("common.save", "Save")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CommitteeMeetingSchedule;
