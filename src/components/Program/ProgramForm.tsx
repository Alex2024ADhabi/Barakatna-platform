import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { programApi } from "@/lib/api/program/programApi";
import {
  Program,
  ProgramStatus,
  ProgramPriority,
} from "@/lib/api/program/types";

interface ProgramFormProps {
  program?: Program;
  onSubmit: (data: Program) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Program name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  status: z.string(),
  priority: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  budget: z.number().positive({ message: "Budget must be positive" }),
  managerId: z.string().min(1, { message: "Manager ID is required" }),
  tags: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(),
});

export const ProgramForm: React.FC<ProgramFormProps> = ({
  program,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [tagInput, setTagInput] = useState("");
  const [objectiveInput, setObjectiveInput] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: program?.name || "",
      description: program?.description || "",
      status: program?.status || "planning",
      priority: program?.priority || "medium",
      startDate: program?.startDate ? new Date(program.startDate) : new Date(),
      endDate: program?.endDate ? new Date(program.endDate) : new Date(),
      budget: program?.budget || 0,
      managerId: program?.managerId || "",
      tags: program?.tags || [],
      objectives: program?.objectives || [],
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const programData = {
      ...values,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
      spentBudget: program?.spentBudget || 0,
      remainingBudget: values.budget - (program?.spentBudget || 0),
      id: program?.id || "",
      programNumber: program?.programNumber || "",
      createdAt: program?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(programData as Program);
  };

  const addTag = () => {
    if (tagInput.trim() !== "") {
      const currentTags = form.getValues("tags") || [];
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue("tags", [...currentTags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag),
    );
  };

  const addObjective = () => {
    if (objectiveInput.trim() !== "") {
      const currentObjectives = form.getValues("objectives") || [];
      form.setValue("objectives", [
        ...currentObjectives,
        objectiveInput.trim(),
      ]);
      setObjectiveInput("");
    }
  };

  const removeObjective = (objective: string) => {
    const currentObjectives = form.getValues("objectives") || [];
    form.setValue(
      "objectives",
      currentObjectives.filter((o) => o !== objective),
    );
  };

  return (
    <div className={`p-4 ${directionClass}`}>
      <h2 className="text-2xl font-bold mb-6">
        {program ? t("Edit Program") : t("Create New Program")}
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Program Name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("Enter program name")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Program Manager")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("Enter manager ID")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Status")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select status")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="planning">{t("Planning")}</SelectItem>
                      <SelectItem value="active">{t("Active")}</SelectItem>
                      <SelectItem value="on-hold">{t("On Hold")}</SelectItem>
                      <SelectItem value="completed">
                        {t("Completed")}
                      </SelectItem>
                      <SelectItem value="cancelled">
                        {t("Cancelled")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Priority")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select priority")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">{t("Low")}</SelectItem>
                      <SelectItem value="medium">{t("Medium")}</SelectItem>
                      <SelectItem value="high">{t("High")}</SelectItem>
                      <SelectItem value="critical">{t("Critical")}</SelectItem>
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
                  <FormLabel>{t("Start Date")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={"w-full pl-3 text-left font-normal"}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>{t("Pick a date")}</span>
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
                        disabled={(date) => date < new Date("1900-01-01")}
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
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("End Date")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={"w-full pl-3 text-left font-normal"}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>{t("Pick a date")}</span>
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
                        disabled={(date) =>
                          date < form.getValues("startDate") ||
                          date < new Date("1900-01-01")
                        }
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
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Budget (SAR)")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("Enter budget amount")}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
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
                <FormLabel>{t("Description")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("Enter program description")}
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>{t("Tags")}</FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.getValues("tags")?.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={t("Add a tag")}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag}>
                {t("Add")}
              </Button>
            </div>
          </div>

          <div>
            <FormLabel>{t("Objectives")}</FormLabel>
            <div className="space-y-2 mb-2">
              {form.getValues("objectives")?.map((objective, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <span>{objective}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeObjective(objective)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={t("Add an objective")}
                value={objectiveInput}
                onChange={(e) => setObjectiveInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addObjective();
                  }
                }}
              />
              <Button type="button" onClick={addObjective}>
                {t("Add")}
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("Cancel")}
            </Button>
            <Button type="submit">{t("Save Program")}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProgramForm;
