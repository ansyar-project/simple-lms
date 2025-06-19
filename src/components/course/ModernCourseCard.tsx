import { MagicCard } from "@/components/magicui/magic-card";
import { BorderBeam } from "@/components/magicui/border-beam";
import { BlurFade } from "@/components/magicui/blur-fade";
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";

export interface ModernCourseCardProps {
  title: string;
  instructor: string;
  modules: number;
  progress: number;
  enrolledAt: Date;
  completedAt?: Date;
  onStart: () => void;
  onView: () => void;
  featured?: boolean;
}

export const ModernCourseCard: React.FC<ModernCourseCardProps> = ({
  title,
  instructor,
  modules,
  progress,
  enrolledAt,
  completedAt,
  onStart,
  onView,
  featured = false,
}) => {
  return (
    <div className="relative group">
      <MagicCard className="rounded-2xl overflow-hidden shadow-lg bg-blue-50 border border-blue-200">
        <BlurFade className="absolute inset-0 z-0 opacity-80" blur="10px">
          {/* Background blur effect, no visible children needed */}
          <></>
        </BlurFade>
        <div className="relative z-10 p-5">
          <BlurFade blur="0px">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-blue-900 line-clamp-2">
                  {title}
                </h3>
                {featured && (
                  <BorderBeam size={60} colorFrom="#3b82f6" colorTo="#1e40af" />
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-blue-700">by {instructor}</span>
                <span className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-0.5">
                  {modules} modules
                </span>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-blue-700">Progress</span>
                  <span className="font-medium text-blue-800">{progress}%</span>
                </div>
                <AnimatedCircularProgressBar
                  min={0}
                  max={100}
                  value={progress}
                  gaugePrimaryColor="#3b82f6"
                  gaugeSecondaryColor="#1e40af"
                  className="mx-auto"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-blue-600 mb-3">
                <span>Enrolled {enrolledAt.toLocaleDateString()}</span>
                {completedAt && (
                  <span className="flex items-center gap-1 text-blue-500">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.75l-6.172-6.172a4 4 0 115.656-5.656l.516.516.516-.516a4 4 0 115.656 5.656L12 17.75z" />
                    </svg>
                    Completed
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onStart}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-semibold transition-colors"
                >
                  {progress === 0 ? "Start Learning" : "Continue"}
                </button>
                <button
                  onClick={onView}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 rounded px-3 py-2"
                >
                  View
                </button>
              </div>
            </div>
          </BlurFade>
        </div>
      </MagicCard>
    </div>
  );
};
