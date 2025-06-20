import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submissionSchema } from "@/lib/validations";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AssignmentSubmissionFormProps {
  onSubmit: (data: z.infer<typeof submissionSchema>) => Promise<void>;
  isLoading?: boolean;
  assignmentId: string;
  submissionFormat: "TEXT" | "FILE" | "BOTH";
}

export const AssignmentSubmissionForm: FC<AssignmentSubmissionFormProps> = ({
  onSubmit,
  isLoading,
  assignmentId,
  submissionFormat,
}) => {
  const form = useForm<z.infer<typeof submissionSchema>>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { assignmentId },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {(submissionFormat === "TEXT" || submissionFormat === "BOTH") && (
        <div>
          <label htmlFor="content" className="block font-medium mb-1">
            Your Answer
          </label>
          <Textarea
            id="content"
            {...form.register("content")}
            disabled={isLoading}
          />
        </div>
      )}
      {(submissionFormat === "FILE" || submissionFormat === "BOTH") && (
        <div>
          <label htmlFor="fileUrl" className="block font-medium mb-1">
            Upload File
          </label>
          <Input
            id="fileUrl"
            type="file"
            disabled={isLoading}
            {...form.register("fileUrl")}
          />
        </div>
      )}
      <Button type="submit" disabled={isLoading}>
        Submit Assignment
      </Button>
    </form>
  );
};
