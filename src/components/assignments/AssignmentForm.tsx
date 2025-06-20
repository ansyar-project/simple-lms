import { FC } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assignmentSchema } from "@/lib/validations";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";

interface AssignmentFormProps {
  onSubmit: (data: z.infer<typeof assignmentSchema>) => Promise<void>;
  defaultValues?: Partial<z.infer<typeof assignmentSchema>>;
  isLoading?: boolean;
}

export const AssignmentForm: FC<AssignmentFormProps> = ({
  onSubmit,
  defaultValues,
  isLoading,
}) => {
  const form = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      maxScore: 100,
      submissionFormat: "TEXT",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block font-medium mb-1">
          Title
        </label>
        <Input id="title" {...form.register("title")} disabled={isLoading} />
      </div>
      <div>
        <label htmlFor="description" className="block font-medium mb-1">
          Description
        </label>
        <Textarea
          id="description"
          {...form.register("description")}
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="maxScore" className="block font-medium mb-1">
          Max Score
        </label>
        <Input
          id="maxScore"
          type="number"
          {...form.register("maxScore", { valueAsNumber: true })}
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="submissionFormat" className="block font-medium mb-1">
          Submission Format
        </label>
        <Controller
          control={form.control}
          name="submissionFormat"
          render={({ field }) => (
            <Select {...field} disabled={isLoading}>
              <SelectItem value="TEXT">Text</SelectItem>
              <SelectItem value="FILE">File</SelectItem>
              <SelectItem value="BOTH">Text & File</SelectItem>
            </Select>
          )}
        />
      </div>
      <div>
        <label htmlFor="dueDate" className="block font-medium mb-1">
          Due Date
        </label>
        <Input
          id="dueDate"
          type="date"
          {...form.register("dueDate", {
            setValueAs: (value) => value ? new Date(value) : undefined,
          })}
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {defaultValues ? "Update Assignment" : "Create Assignment"}
      </Button>
    </form>
  );
};
