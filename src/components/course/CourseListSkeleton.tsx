export function CourseListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filter skeleton */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Results count skeleton */}
      <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
