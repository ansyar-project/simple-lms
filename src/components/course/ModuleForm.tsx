"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import {
  createModule,
  updateModule,
  type ModuleFormState,
} from "@/actions/modules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Save, X } from "lucide-react";

interface ModuleFormProps {
  courseId: string;
  module?: {
    id: string;
    title: string;
    description?: string;
    order: number;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const initialState: ModuleFormState = {
  success: false,
};

export default function ModuleForm({
  courseId,
  module,
  onSuccess,
  onCancel,
}: Readonly<ModuleFormProps>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, formAction] = useFormState(
    module ? updateModule : createModule,
    initialState
  );

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      formAction(formData);
      if (state.success) {
        onSuccess?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {module ? "Edit Module" : "Create New Module"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="courseId" value={courseId} />
          {module && <input type="hidden" name="id" value={module.id} />}

          <div className="space-y-2">
            <Label htmlFor="title">Module Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter module title"
              defaultValue={module?.title}
              required
            />
            {state.errors?.title && (
              <p className="text-sm text-destructive">
                {state.errors.title[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter module description"
              defaultValue={module?.description}
              rows={3}
            />
            {state.errors?.description && (
              <p className="text-sm text-destructive">
                {state.errors.description[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              name="order"
              type="number"
              placeholder="0 for auto-order"
              defaultValue={module?.order ?? 0}
              min="0"
            />
            {state.errors?.order && (
              <p className="text-sm text-destructive">
                {state.errors.order[0]}
              </p>
            )}
          </div>

          {state.message && (
            <div
              className={`p-3 rounded-md ${
                state.success
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {state.message}
            </div>
          )}

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {module ? "Update Module" : "Create Module"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
