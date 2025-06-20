"use client";

import { FC, useState } from "react";
import { gradeSubmission } from "@/actions/assignments";
import { SubmissionWithUser } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface SubmissionGradingFormProps {
  submission: SubmissionWithUser;
  onGraded?: () => void;
}

export const SubmissionGradingForm: FC<SubmissionGradingFormProps> = ({
  submission,
  onGraded,
}) => {
  const [score, setScore] = useState(submission.score ?? 0);
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGrade(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await gradeSubmission(submission.id, score, feedback);
      onGraded?.();
    } catch (err) {
      setError('Failed to save grade. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleGrade} className="space-y-2">
      {error && (
        <div className="text-red-500 text-sm" role="alert" aria-live="assertive">
          {error}
        </div>
      )}
      <Input
        type="number"
        min={0}
        max={100}
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
        disabled={isLoading}
        placeholder="Score"
      />
      <Textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        disabled={isLoading}
        placeholder="Feedback"
      />
      <Button type="submit" disabled={isLoading}>
        Save Grade
      </Button>
    </form>
  );
};
