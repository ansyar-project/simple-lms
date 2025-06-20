"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  GripVertical,
  Settings,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createQuiz, updateQuiz, publishQuiz } from "@/actions/quizzes";
import { TextAnimate } from "@/components/magicui/text-animate";
import { BoxReveal } from "@/components/magicui/box-reveal";
import type { QuizFormData, QuestionFormData, QuestionType } from "@/types";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DraggableProvidedDragHandleProps,
} from "@hello-pangea/dnd";

interface QuizBuilderProps {
  lessonId: string;
  initialData?: QuizFormData & { id?: string };
  onSave?: () => void;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "TRUE_FALSE", label: "True/False" },
  { value: "FILL_IN_BLANK", label: "Fill in the Blank" },
  { value: "SHORT_ANSWER", label: "Short Answer" },
  { value: "ESSAY", label: "Essay" },
];

const DEFAULT_QUESTION: QuestionFormData = {
  type: "MULTIPLE_CHOICE",
  question: "",
  options: ["", ""],
  correctAnswer: "",
  explanation: "",
  points: 1,
};

export function QuizBuilder({
  lessonId,
  initialData,
  onSave,
}: QuizBuilderProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [quizData, setQuizData] = useState<QuizFormData>({
    lessonId,
    title: initialData?.title || "",
    description: initialData?.description || "",
    instructions: initialData?.instructions || "",
    timeLimit: initialData?.timeLimit,
    attemptsAllowed: initialData?.attemptsAllowed || 1,
    shuffleQuestions: initialData?.shuffleQuestions || false,
    showResults: initialData?.showResults ?? true,
    passingScore: initialData?.passingScore,
    questions: initialData?.questions || [],
  });

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, { ...DEFAULT_QUESTION }],
    });
  };

  const updateQuestion = (
    index: number,
    question: Partial<QuestionFormData>
  ) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...question };
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const addOption = (questionIndex: number) => {
    const question = quizData.questions[questionIndex];
    if (question.options && question.options.length < 6) {
      updateQuestion(questionIndex, {
        options: [...question.options, ""],
      });
    }
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const question = quizData.questions[questionIndex];
    if (question.options) {
      const updatedOptions = [...question.options];
      updatedOptions[optionIndex] = value;
      updateQuestion(questionIndex, { options: updatedOptions });
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = quizData.questions[questionIndex];
    if (question.options && question.options.length > 2) {
      const updatedOptions = question.options.filter(
        (_, i) => i !== optionIndex
      );
      updateQuestion(questionIndex, { options: updatedOptions });
    }
  };
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(quizData.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setQuizData({ ...quizData, questions: items });
  };

  const handleSave = async () => {
    if (!quizData.title.trim()) {
      toast({
        title: "Error",
        description: "Quiz title is required",
        variant: "destructive",
      });
      return;
    }

    if (quizData.questions.length === 0) {
      toast({
        title: "Error",
        description: "At least one question is required",
        variant: "destructive",
      });
      return;
    }

    // Validate questions
    for (let i = 0; i < quizData.questions.length; i++) {
      const question = quizData.questions[i];
      if (!question.question.trim()) {
        toast({
          title: "Error",
          description: `Question ${i + 1} is required`,
          variant: "destructive",
        });
        return;
      }

      if (
        question.type === "MULTIPLE_CHOICE" &&
        (!question.options || question.options.length < 2)
      ) {
        toast({
          title: "Error",
          description: `Question ${i + 1} needs at least 2 options`,
          variant: "destructive",
        });
        return;
      }

      if (!question.correctAnswer || question.correctAnswer === "") {
        toast({
          title: "Error",
          description: `Question ${i + 1} needs a correct answer`,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const result = initialData?.id
        ? await updateQuiz({ ...quizData, id: initialData.id })
        : await createQuiz(quizData);

      if (result.success) {
        toast({
          title: "Success",
          description: initialData?.id
            ? "Quiz updated successfully"
            : "Quiz created successfully",
        });
        onSave?.();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save quiz",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!initialData?.id) {
      toast({
        title: "Error",
        description: "Save the quiz first before publishing",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await publishQuiz(initialData.id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Quiz published successfully",
        });
        onSave?.();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to publish quiz",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {" "}
      {/* Quiz Settings */}
      <Card className="border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <BoxReveal boxColor="#2563eb">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Settings className="h-5 w-5 text-blue-600" />
              <TextAnimate animation="blurInUp" by="word">
                Quiz Settings
              </TextAnimate>
            </CardTitle>
          </BoxReveal>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              {previewMode ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {previewMode ? "Edit Mode" : "Preview Mode"}
            </Button>
            {initialData?.id && (
              <Button
                onClick={handlePublish}
                disabled={loading}
                size="sm"
                variant="secondary"
                className="bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                Publish Quiz
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={loading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Quiz"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                value={quizData.title}
                onChange={(e) =>
                  setQuizData({ ...quizData, title: e.target.value })
                }
                placeholder="Enter quiz title"
                disabled={previewMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                value={quizData.timeLimit || ""}
                onChange={(e) =>
                  setQuizData({
                    ...quizData,
                    timeLimit: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="No time limit"
                disabled={previewMode}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={quizData.description}
              onChange={(e) =>
                setQuizData({ ...quizData, description: e.target.value })
              }
              placeholder="Brief description of the quiz"
              disabled={previewMode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={quizData.instructions}
              onChange={(e) =>
                setQuizData({ ...quizData, instructions: e.target.value })
              }
              placeholder="Detailed instructions for students"
              disabled={previewMode}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="attempts">Attempts Allowed</Label>
              <Input
                id="attempts"
                type="number"
                min="1"
                max="10"
                value={quizData.attemptsAllowed}
                onChange={(e) =>
                  setQuizData({
                    ...quizData,
                    attemptsAllowed: parseInt(e.target.value) || 1,
                  })
                }
                disabled={previewMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passingScore">Passing Score (%)</Label>
              <Input
                id="passingScore"
                type="number"
                min="0"
                max="100"
                value={quizData.passingScore || ""}
                onChange={(e) =>
                  setQuizData({
                    ...quizData,
                    passingScore: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                placeholder="No passing score"
                disabled={previewMode}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="shuffle"
                  checked={quizData.shuffleQuestions}
                  onCheckedChange={(checked) =>
                    setQuizData({
                      ...quizData,
                      shuffleQuestions: checked,
                    })
                  }
                  disabled={previewMode}
                />
                <Label htmlFor="shuffle">Shuffle Questions</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showResults"
                  checked={quizData.showResults}
                  onCheckedChange={(checked) =>
                    setQuizData({
                      ...quizData,
                      showResults: checked,
                    })
                  }
                  disabled={previewMode}
                />
                <Label htmlFor="showResults">Show Results</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Questions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Questions ({quizData.questions.length})</CardTitle>
          {!previewMode && (
            <Button onClick={addQuestion} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {quizData.questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                No questions yet. Click &ldquo;Add Question&rdquo; to get
                started.
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions" isDropDisabled={previewMode}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {quizData.questions.map((question, index) => (
                      <Draggable
                        key={index}
                        draggableId={index.toString()}
                        index={index}
                        isDragDisabled={previewMode}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <QuestionEditor
                              question={question}
                              index={index}
                              onUpdate={(updates) =>
                                updateQuestion(index, updates)
                              }
                              onRemove={() => removeQuestion(index)}
                              onAddOption={() => addOption(index)}
                              onUpdateOption={(optionIndex, value) =>
                                updateOption(index, optionIndex, value)
                              }
                              onRemoveOption={(optionIndex) =>
                                removeOption(index, optionIndex)
                              }
                              dragHandleProps={provided.dragHandleProps}
                              previewMode={previewMode}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface QuestionEditorProps {
  question: QuestionFormData;
  index: number;
  onUpdate: (updates: Partial<QuestionFormData>) => void;
  onRemove: () => void;
  onAddOption: () => void;
  onUpdateOption: (optionIndex: number, value: string) => void;
  onRemoveOption: (optionIndex: number) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  previewMode: boolean;
}

function QuestionEditor({
  question,
  index,
  onUpdate,
  onRemove,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  dragHandleProps,
  previewMode,
}: QuestionEditorProps) {
  const getQuestionTypeLabel = (type: QuestionType) => {
    return QUESTION_TYPES.find((t) => t.value === type)?.label || type;
  };

  if (previewMode) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Question {index + 1}</CardTitle>
            <Badge variant="secondary">
              {getQuestionTypeLabel(question.type)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="font-medium">{question.question}</div>

          {question.type === "MULTIPLE_CHOICE" && question.options && (
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    disabled
                    className="text-primary"
                  />
                  <span
                    className={
                      option === question.correctAnswer
                        ? "font-medium text-green-600"
                        : ""
                    }
                  >
                    {option}
                  </span>
                </div>
              ))}
            </div>
          )}

          {question.type === "TRUE_FALSE" && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input type="radio" name={`question-${index}`} disabled />
                <span
                  className={
                    question.correctAnswer === true
                      ? "font-medium text-green-600"
                      : ""
                  }
                >
                  True
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" name={`question-${index}`} disabled />
                <span
                  className={
                    question.correctAnswer === false
                      ? "font-medium text-green-600"
                      : ""
                  }
                >
                  False
                </span>
              </div>
            </div>
          )}

          {(question.type === "FILL_IN_BLANK" ||
            question.type === "SHORT_ANSWER") && (
            <div className="space-y-2">
              <Input placeholder="Your answer..." disabled />
              <div className="text-sm text-muted-foreground">
                Correct answer:{" "}
                <span className="font-medium text-green-600">
                  {question.correctAnswer}
                </span>
              </div>
            </div>
          )}

          {question.type === "ESSAY" && (
            <Textarea placeholder="Your essay answer..." disabled rows={4} />
          )}

          {question.explanation && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-900 mb-1">
                Explanation:
              </div>
              <div className="text-sm text-blue-800">
                {question.explanation}
              </div>
            </div>
          )}

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Points: {question.points}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div {...(dragHandleProps || {})} className="cursor-grab">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">Question {index + 1}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {getQuestionTypeLabel(question.type)}
            </Badge>
            <Button variant="destructive" size="sm" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select
              value={question.type}
              onValueChange={(value: QuestionType) =>
                onUpdate({ type: value, correctAnswer: "" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Points</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={question.points}
              onChange={(e) =>
                onUpdate({ points: parseInt(e.target.value) || 1 })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Question *</Label>
          <Textarea
            value={question.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            placeholder="Enter your question"
            rows={3}
          />
        </div>

        {/* Question Type Specific Fields */}
        {question.type === "MULTIPLE_CHOICE" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddOption}
                disabled={!question.options || question.options.length >= 6}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>
            <div className="space-y-2">
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${index}`}
                    checked={question.correctAnswer === option}
                    onChange={() => onUpdate({ correctAnswer: option })}
                    className="text-primary"
                  />
                  <Input
                    value={option}
                    onChange={(e) =>
                      onUpdateOption(optionIndex, e.target.value)
                    }
                    placeholder={`Option ${optionIndex + 1}`}
                    className="flex-1"
                  />
                  {question.options && question.options.length > 2 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemoveOption(optionIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {question.type === "TRUE_FALSE" && (
          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`tf-${index}`}
                  checked={question.correctAnswer === true}
                  onChange={() => onUpdate({ correctAnswer: true })}
                />
                <Label>True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`tf-${index}`}
                  checked={question.correctAnswer === false}
                  onChange={() => onUpdate({ correctAnswer: false })}
                />
                <Label>False</Label>
              </div>
            </div>
          </div>
        )}

        {(question.type === "FILL_IN_BLANK" ||
          question.type === "SHORT_ANSWER" ||
          question.type === "ESSAY") && (
          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <Input
              value={question.correctAnswer as string}
              onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
              placeholder="Enter the correct answer"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Explanation (optional)</Label>
          <Textarea
            value={question.explanation}
            onChange={(e) => onUpdate({ explanation: e.target.value })}
            placeholder="Explain why this is the correct answer"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}
