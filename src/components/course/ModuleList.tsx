"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderModules, deleteModule } from "@/actions/modules";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  GripVertical,
  Edit,
  Trash2,
  Plus,
  BookOpen,
  Clock,
  AlertCircle,
} from "lucide-react";

interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Array<{
    id: string;
    title: string;
    contentType: string;
    duration?: number;
  }>;
  _count: {
    lessons: number;
  };
}

interface ModuleListProps {
  courseId: string;
  modules: Module[];
  onEditModule: (module: Module) => void;
  onCreateLesson: (moduleId: string) => void;
  onEditLesson: (moduleId: string, lessonId: string) => void;
  onRefresh: () => void;
}

interface SortableModuleProps {
  module: Module;
  onEdit: (module: Module) => void;
  onDelete: (moduleId: string) => void;
  onCreateLesson: (moduleId: string) => void;
  onEditLesson: (moduleId: string, lessonId: string) => void;
}

function SortableModule({
  module,
  onEdit,
  onDelete,
  onCreateLesson,
  onEditLesson,
}: Readonly<SortableModuleProps>) {
  const { toast } = useToast();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this module? This will also delete all lessons in this module."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteModule(module.id);
      if (result.success) {
        onDelete(module.id);
        toast({
          title: "Success",
          description: "Module deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.message ?? "Failed to delete module",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      toast({
        title: "Error",
        description: "Failed to delete module",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const totalDuration = module.lessons.reduce((acc, lesson) => {
    return acc + (lesson.duration ?? 0);
  }, 0);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-shadow ${isDragging ? "shadow-lg" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-grab active:cursor-grabbing p-1 h-auto"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </Button>

            <div className="flex-1">
              <CardTitle className="text-lg">{module.title}</CardTitle>
              {module.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {module.description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{module._count.lessons} lessons</span>
                </div>
                {totalDuration > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(totalDuration)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(module)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {module.lessons.length === 0 ? (
          <div className="flex items-center justify-center p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                No lessons yet
              </p>
              <Button size="sm" onClick={() => onCreateLesson(module.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Lesson
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {module.lessons.map((lesson, index) => (
              <button
                key={lesson.id}
                type="button"
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer group w-full text-left"
                onClick={() => onEditLesson(module.id, lesson.id)}
              >
                <span className="text-xs text-muted-foreground w-6 text-center">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{lesson.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">
                      {lesson.contentType.toLowerCase()}
                    </span>
                    {lesson.duration && (
                      <>
                        <span>•</span>
                        <span>{formatDuration(lesson.duration)}</span>
                      </>
                    )}
                  </div>
                </div>{" "}
                <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => onCreateLesson(module.id)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ModuleList({
  courseId,
  modules,
  onEditModule,
  onCreateLesson,
  onEditLesson,
  onRefresh,
}: Readonly<ModuleListProps>) {
  const { toast } = useToast();
  const [items, setItems] = useState(modules);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      setIsReordering(true);
      try {
        const result = await reorderModules({
          courseId,
          moduleIds: newItems.map((item) => item.id),
        });
        if (!result.success) {
          // Revert on failure
          setItems([...items]);
          toast({
            title: "Error",
            description: result.message ?? "Failed to reorder modules",
            variant: "destructive",
          });
        } else {
          onRefresh();
        }
      } catch (error) {
        console.error("Error reordering modules:", error);
        setItems([...items]);
        toast({
          title: "Error",
          description: "Failed to reorder modules",
          variant: "destructive",
        });
      } finally {
        setIsReordering(false);
      }
    }
  };

  const handleDeleteModule = (moduleId: string) => {
    setItems(items.filter((item) => item.id !== moduleId));
    onRefresh();
  };

  // Update items when modules prop changes
  if (JSON.stringify(modules) !== JSON.stringify(items) && !isReordering) {
    setItems(modules);
  }

  if (modules.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Modules Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first module to start organizing your course content.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {items.map((module) => (
            <SortableModule
              key={module.id}
              module={module}
              onEdit={onEditModule}
              onDelete={handleDeleteModule}
              onCreateLesson={onCreateLesson}
              onEditLesson={onEditLesson}
            />
          ))}
        </div>
      </SortableContext>

      {isReordering && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-background p-4 rounded-lg shadow-lg">
            <p className="text-sm">Reordering modules...</p>
          </div>
        </div>
      )}
    </DndContext>
  );
}
