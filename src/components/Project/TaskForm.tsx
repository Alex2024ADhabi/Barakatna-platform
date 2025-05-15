import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { projectApi } from "@/lib/api/project/projectApi";
import { Project, ProjectTask } from "@/lib/api/project/types";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";

interface TaskFormProps {
  task?: ProjectTask | null;
  projectId?: number;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  projectId,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Define form schema with zod
  const formSchema = z.object({
    projectId: z.number().int().positive(),
    taskName: z
      .string()
      .min(1, {
        message: t("project.taskNameRequired", "Task name is required"),
      }),
    description: z.string().optional(),
    startDate: z.date().optional(),
    dueDate: z.date(),
    assignedToId: z.number().int().positive().optional(),
    statusId: z.number().int().min(1).max(3),
    priorityLevel: z.number().int().min(1).max(3).optional(),
    estimatedHours: z.number().positive().optional(),
    dependsOnTaskId: z.number().int().positive().optional().nullable(),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: projectId || 1,
      taskName: "",
      description: "",
      startDate: undefined,
      dueDate: new Date(),
      assignedToId: undefined,
      statusId: 1, // Default to "Pending"
      priorityLevel: 2, // Default to "Medium"
      estimatedHours: undefined,
      dependsOnTaskId: undefined,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch projects for dropdown
        const projectsResponse = await projectApi.getProjects({
          page: 1,
          pageSize: 100,
          language: "en",
        });

        if (projectsResponse.success && projectsResponse.data) {
          setProjects(projectsResponse.data.items || []);
        }

        // Fetch tasks for dependencies dropdown
        const tasksResponse = await projectApi.getAllProjectTasks({
          page: 1,
          pageSize: 100,
          language: "en",
        });

        if (tasksResponse.success && tasksResponse.data) {
          setTasks(tasksResponse.data.items || []);
        }

        // If editing an existing task, populate form
        if (task) {
          form.reset({
            projectId: task.projectId,
            taskName: task.taskName,
            description: task.description || "",
            startDate: task.startDate ? new Date(task.startDate) : undefined,
            dueDate: new Date(task.dueDate),
            assignedToId: task.assignedToId,
            statusId: task.statusId,
            priorityLevel: task.priorityLevel,
            estimatedHours: task.estimatedHours,
            dependsOnTaskId: task.dependsOnTaskId || undefined,
          });
        } else if (projectId) {
          form.setValue("projectId", projectId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [task, projectId, form]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    onSave(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${directionClass}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!projectId && (
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("project.project", "Project")}</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem
                            key={project.projectId}
                            value={project.projectId.toString()}
                          >
                            {project.projectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="taskName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("project.taskName", "Task Name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Install bathroom grab bars"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="statusId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("project.status", "Status")}</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">
                        {t("project.pending", "Pending")}
                      </SelectItem>
                      <SelectItem value="2">
                        {t("project.inProgress", "In Progress")}
                      </SelectItem>
                      <SelectItem value="3">
                        {t("project.completed", "Completed")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priorityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("project.priority", "Priority Level")}
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">
                        {t("project.high", "High")}
                      </SelectItem>
                      <SelectItem value="2">
                        {t("project.medium", "Medium")}
                      </SelectItem>
                      <SelectItem value="3">
                        {t("project.low", "Low")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("project.startDate", "Start Date")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>{t("project.pickDate", "Pick a date")}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("project.dueDate", "Due Date")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>{t("project.pickDate", "Pick a date")}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("project.estimatedHours", "Estimated Hours")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="4"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dependsOnTaskId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("project.dependsOn", "Depends On Task")}
                  </FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value ? parseInt(value) : undefined)
                    }
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dependency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">
                        {t("project.noDependency", "No Dependency")}
                      </SelectItem>
                      {tasks
                        .filter((t) => t.taskId !== task?.taskId) // Don't show current task
                        .map((task) => (
                          <SelectItem
                            key={task.taskId}
                            value={task.taskId.toString()}
                          >
                            {task.taskName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("project.description", "Description")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t(
                      "project.taskDescriptionPlaceholder",
                      "Enter task description...",
                    )}
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button type="submit">
              {task
                ? t("project.updateTask", "Update Task")
                : t("project.createTask", "Create Task")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TaskForm;
