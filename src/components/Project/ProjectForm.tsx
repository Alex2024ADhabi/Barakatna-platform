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
import { ProjectType } from "@/lib/api/project/types";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { ClientType } from "@/lib/forms/types";
import { dynamicFormEngine } from "@/lib/services/DynamicFormEngine";
import { formRegistry } from "@/lib/forms/registry";
import { clientConfigService } from "@/services/clientConfigService";
import { useClient } from "@/context/ClientContext";
import { useProject } from "./ProjectContext";
import { useToast } from "@/components/ui/use-toast";
import eventBus, { EventType } from "@/services/eventBus";

interface ProjectFormProps {
  projectId?: number;
  onSave: (data: any) => void;
  onCancel: () => void;
  isDialog?: boolean;
  clientType?: ClientType; // Optional client type override
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  projectId,
  onSave,
  onCancel,
  isDialog = false,
  clientType: clientTypeOverride,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { directionClass } = useTranslatedDirection();
  const { clientType: contextClientType, clientConfig } = useClient();
  const { projectData, saveProject } = useProject();
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clientType, setClientType] = useState<ClientType>(
    clientTypeOverride ||
      contextClientType ||
      clientConfigService.getActiveClientType() ||
      ClientType.FDF,
  );
  const [formMetadata, setFormMetadata] = useState<any>(null);

  // Define form schema with zod - enhanced with client-specific validations
  const formSchema = z.object({
    projectCode: z
      .string()
      .min(1, {
        message: t("project.codeRequired", "Project code is required"),
      })
      .refine(
        (val) => {
          // Apply client-specific validation patterns
          if (clientType === ClientType.FDF) {
            return /^FDF-PRJ-\d{6}$/.test(val);
          } else if (clientType === ClientType.ADHA) {
            return /^ADHA-PRJ-\d{8}$/.test(val);
          }
          return true;
        },
        {
          message:
            clientType === ClientType.FDF
              ? t(
                  "project.fdfCodeFormat",
                  "FDF Project Code must be in format FDF-PRJ-XXXXXX",
                )
              : clientType === ClientType.ADHA
                ? t(
                    "project.adhaCodeFormat",
                    "ADHA Project Reference must be in format ADHA-PRJ-XXXXXXXX",
                  )
                : "",
        },
      ),
    projectName: z.string().min(1, {
      message: t("project.nameRequired", "Project name is required"),
    }),
    assessmentId: z.number().int().positive(),
    projectTypeId: z.number().int().positive(),
    statusId: z.number().int().min(1).max(3),
    startDate: z.date().optional(),
    targetCompletionDate: z.date(),
    projectManagerId: z.number().int().positive(),
    totalBudget: z.number().positive(),
    priorityLevel: z.number().int().min(1).max(3).optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    clientType: z.enum([
      ClientType.FDF,
      ClientType.ADHA,
      ClientType.CASH,
      ClientType.OTHER,
    ]),
  });

  // Initialize form with client-aware defaults
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectCode:
        clientType === ClientType.FDF
          ? "FDF-PRJ-"
          : clientType === ClientType.ADHA
            ? "ADHA-PRJ-"
            : "",
      projectName: "",
      assessmentId: 1, // Default value
      projectTypeId: 1, // Default value
      statusId: 1, // Default to "Pending"
      startDate: undefined,
      targetCompletionDate: new Date(),
      projectManagerId: 1, // Default value
      totalBudget: 0,
      priorityLevel: 2, // Default to "Medium"
      description: "",
      notes: "",
      clientType: clientType,
    },
  });

  useEffect(() => {
    // Load form metadata based on client type
    const loadFormMetadata = () => {
      try {
        const metadata = formRegistry.getClientSpecificFormMetadata(
          "project-creation-form",
          clientType,
        );
        setFormMetadata(metadata);
      } catch (error) {
        console.error("Error loading form metadata:", error);
      }
    };

    const fetchProjectTypes = async () => {
      try {
        setIsLoading(true);
        const response = await projectApi.getProjectTypes();
        if (response.success && response.data) {
          // Filter project types based on client type if needed
          const allTypes = response.data.items || [];
          const filteredTypes = clientType
            ? allTypes.filter(
                (type) =>
                  type.applicableClientTypes?.includes(clientType) ||
                  !type.applicableClientTypes,
              )
            : allTypes;
          setProjectTypes(filteredTypes);
        }
      } catch (error) {
        console.error("Error fetching project types:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFormMetadata();
    fetchProjectTypes();

    // If editing an existing project, fetch its data
    if (projectId) {
      const fetchProject = async () => {
        try {
          setIsLoading(true);
          const response = await projectApi.getProject(projectId);
          if (response.success && response.data) {
            const project = response.data;

            // If project has a client type, update our state
            if (project.clientType) {
              setClientType(project.clientType as ClientType);
            }

            form.reset({
              projectCode: project.projectCode,
              projectName: project.projectName,
              assessmentId: project.assessmentId,
              projectTypeId: project.projectTypeId,
              statusId: project.statusId,
              startDate: project.startDate
                ? new Date(project.startDate)
                : undefined,
              targetCompletionDate: new Date(project.targetCompletionDate),
              projectManagerId: project.projectManagerId,
              totalBudget: project.totalBudget,
              priorityLevel: project.priorityLevel,
              description: project.description || "",
              notes: project.notes || "",
              clientType: project.clientType || clientType,
            });

            // Track form parameters in the FormParameterTracker
            Object.entries(project).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                formRegistry.setFormParameterValue(
                  "project-creation-form",
                  key,
                  value,
                  project.clientType || clientType,
                );
              }
            });
          }
        } catch (error) {
          console.error("Error fetching project:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProject();
    } else {
      // For new projects, initialize form state with defaults from DynamicFormEngine
      const initialState = dynamicFormEngine.initializeFormState(
        "project-creation-form",
        clientType,
      );
      form.reset({
        ...form.getValues(),
        ...initialState,
        clientType: clientType,
      });
    }
  }, [projectId, clientType, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // Validate form using DynamicFormEngine
    const validation = dynamicFormEngine.validateForm(
      "project-creation-form",
      clientType,
      data,
    );

    if (!validation.valid) {
      // Display validation errors
      Object.entries(validation.errors).forEach(([field, errors]) => {
        form.setError(field as any, {
          type: "manual",
          message: errors[0],
        });
      });
      return;
    }

    // Track form parameters in the FormParameterTracker
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formRegistry.setFormParameterValue(
          "project-creation-form",
          key,
          value,
          clientType,
        );
      }
    });

    // Generate submission payload using DynamicFormEngine
    const payload = dynamicFormEngine.generateSubmissionPayload(
      "project-creation-form",
      clientType,
      data,
    );

    try {
      // If we're using the ProjectContext, save to it
      if (saveProject) {
        const success = await saveProject(payload);
        if (success) {
          toast({
            title: projectId ? t("project.updated") : t("project.created"),
            description: projectId
              ? t("project.projectUpdatedSuccess")
              : t("project.projectCreatedSuccess"),
          });

          // Publish event
          eventBus.publish({
            id: crypto.randomUUID(),
            type: projectId
              ? EventType.PROJECT_UPDATED
              : EventType.PROJECT_CREATED,
            timestamp: new Date().toISOString(),
            source: "ProjectForm",
            payload: payload,
          });

          // Call the onSave callback if provided
          if (onSave) {
            onSave(payload);
          }
        }
      } else if (onSave) {
        // Fall back to the onSave prop if no context
        onSave(payload);
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: t("common.error"),
        description: t("project.saveFailed"),
        variant: "destructive",
      });
    }
  };

  if (isLoading && projectId) {
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
            {/* Client Type Selection - Only show if not provided as prop */}
            {!clientTypeOverride && (
              <FormField
                control={form.control}
                name="clientType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("project.clientType", "Client Type")}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setClientType(value as ClientType);

                        // Update project code format based on client type
                        const newClientType = value as ClientType;
                        let codePrefix = "";
                        if (newClientType === ClientType.FDF) {
                          codePrefix = "FDF-PRJ-";
                        } else if (newClientType === ClientType.ADHA) {
                          codePrefix = "ADHA-PRJ-";
                        }

                        form.setValue("projectCode", codePrefix);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ClientType.FDF}>
                          {t("clientType.fdf", "Family Development Foundation")}
                        </SelectItem>
                        <SelectItem value={ClientType.ADHA}>
                          {t("clientType.adha", "Abu Dhabi Housing Authority")}
                        </SelectItem>
                        <SelectItem value={ClientType.CASH}>
                          {t("clientType.cash", "Cash Client")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="projectCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("project.code", "Project Code")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        clientType === ClientType.FDF
                          ? "FDF-PRJ-XXXXXX"
                          : clientType === ClientType.ADHA
                            ? "ADHA-PRJ-XXXXXXXX"
                            : "PRJ-2023-001"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {clientType === ClientType.FDF &&
                      t("project.fdfCodeHint", "Format: FDF-PRJ-XXXXXX")}
                    {clientType === ClientType.ADHA &&
                      t("project.adhaCodeHint", "Format: ADHA-PRJ-XXXXXXXX")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("project.name", "Project Name")}</FormLabel>
                  <FormControl>
                    <Input placeholder="Home Modification Project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("project.type", "Project Type")}</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projectTypes.map((type) => (
                        <SelectItem
                          key={type.projectTypeId}
                          value={type.projectTypeId.toString()}
                        >
                          {type.typeNameEN}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              name="targetCompletionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    {t("project.targetDate", "Target Completion Date")}
                  </FormLabel>
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
              name="totalBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("project.budget", "Total Budget (SAR)")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10000"
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(value);

                        // Track parameter change in FormParameterTracker
                        formRegistry.setFormParameterValue(
                          "project-creation-form",
                          "totalBudget",
                          value,
                          clientType,
                        );

                        // Process field dependencies
                        dynamicFormEngine.processFieldChange(
                          "project-creation-form",
                          "totalBudget",
                          value,
                          clientType,
                        );
                      }}
                    />
                  </FormControl>
                  {clientType === ClientType.FDF && (
                    <FormDescription>
                      {t(
                        "project.fdfBudgetLimit",
                        "FDF projects have a maximum budget of 150,000 SAR",
                      )}
                    </FormDescription>
                  )}
                  {clientType === ClientType.ADHA && (
                    <FormDescription>
                      {t(
                        "project.adhaBudgetLimit",
                        "ADHA projects have a maximum budget of 200,000 SAR",
                      )}
                    </FormDescription>
                  )}
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
                      "project.descriptionPlaceholder",
                      "Enter project description...",
                    )}
                    className="min-h-[100px]"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);

                      // Track parameter change in FormParameterTracker
                      formRegistry.setFormParameterValue(
                        "project-creation-form",
                        "projectDescription",
                        e.target.value,
                        clientType,
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("project.notes", "Notes")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t(
                      "project.notesPlaceholder",
                      "Enter additional notes...",
                    )}
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Client-specific fields */}
          {clientType === ClientType.FDF && (
            <div className="space-y-4 bg-blue-50 p-4 rounded-md">
              <h3 className="text-lg font-medium">
                {t("project.fdfSpecificInfo", "FDF Specific Information")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fdfApprovalDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t(
                          "project.fdfApprovalDocument",
                          "FDF Approval Document",
                        )}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            // In a real implementation, you would handle file upload here
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {clientType === ClientType.ADHA && (
            <div className="space-y-4 bg-green-50 p-4 rounded-md">
              <h3 className="text-lg font-medium">
                {t("project.adhaSpecificInfo", "ADHA Specific Information")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="adhaApprovalDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        {t("project.adhaApprovalDate", "ADHA Approval Date")}
                      </FormLabel>
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
                                <span>
                                  {t("project.pickDate", "Pick a date")}
                                </span>
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
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button type="submit">
              {projectId
                ? t("project.updateProject", "Update Project")
                : t("project.createProject", "Create Project")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProjectForm;
