"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CourseCard } from "./CourseCard";
import { CourseListSkeleton } from "./CourseListSkeleton";
import {
  getInstructorCoursesOptimized,
  getCategories,
} from "@/actions/courses";
import type { PaginatedCourses } from "@/types/course";
import { Search, SortAsc, SortDesc } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

// Debounce hook for search optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface CoursesListProps {
  readonly searchParams: {
    query?: string;
    categoryId?: string;
    status?: string;
    page?: string;
  };
}

export function CoursesList({ searchParams }: CoursesListProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  const [coursesData, setCoursesData] = useState<PaginatedCourses>({
    courses: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  });

  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.query ?? "");

  const [filters, setFilters] = useState({
    categoryId: searchParams.categoryId ?? "",
    status: (searchParams.status ?? "") as
      | ""
      | "DRAFT"
      | "PUBLISHED"
      | "ARCHIVED",
    sortBy: "createdAt" as "title" | "createdAt" | "updatedAt" | "price",
    sortOrder: "desc" as "asc" | "desc",
  });

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Load categories only once
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesResult = await getCategories();
        setCategories(categoriesResult);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);
  // Load courses when filters or pagination change
  useEffect(() => {
    const loadCourses = async () => {
      setSearchLoading(true);
      try {
        const coursesResult = await getInstructorCoursesOptimized({
          query: debouncedSearchTerm,
          categoryId: filters.categoryId || undefined,
          status: filters.status || undefined,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          page: parseInt(searchParams.page ?? "1"),
          limit: 10,
        });

        setCoursesData(coursesResult);
      } catch (error) {
        console.error("Error loading courses:", error);
      } finally {
        setSearchLoading(false);
        setLoading(false);
      }
    };

    loadCourses();
  }, [
    debouncedSearchTerm,
    filters.categoryId,
    filters.status,
    filters.sortBy,
    filters.sortOrder,
    searchParams.page,
  ]);

  // Update URL with search params
  const updateSearchParams = (
    newQuery?: string,
    newFilters?: typeof filters
  ) => {
    const params = new URLSearchParams();

    if (newQuery) params.set("query", newQuery);
    if (newFilters?.categoryId) params.set("categoryId", newFilters.categoryId);
    if (newFilters?.status) params.set("status", newFilters.status);
    if (newFilters?.sortBy !== "createdAt")
      params.set("sortBy", newFilters?.sortBy ?? "createdAt");
    if (newFilters?.sortOrder !== "desc")
      params.set("sortOrder", newFilters?.sortOrder ?? "desc");

    router.push(`/instructor/courses?${params.toString()}`);
  };
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams(searchTerm, filters);
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateSearchParams(searchTerm, newFilters);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set("page", page.toString());
    router.push(`/instructor/courses?${params.toString()}`);
  };
  // Toggle sort order
  const toggleSortOrder = () => {
    const newSortOrder: "asc" | "desc" =
      filters.sortOrder === "asc" ? "desc" : "asc";
    const newFilters = { ...filters, sortOrder: newSortOrder };
    setFilters(newFilters);
    updateSearchParams(searchTerm, newFilters);
  };

  if (loading) {
    return <CourseListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Input */}{" "}
          <div className="relative">
            {searchLoading ? (
              <Spinner
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                size="sm"
              />
            ) : (
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            )}{" "}
            <Input
              type="text"
              placeholder="Search courses by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <select
                value={filters.categoryId}
                onChange={(e) =>
                  handleFilterChange("categoryId", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Created Date</option>
                <option value="title">Title</option>
                <option value="updatedAt">Updated Date</option>
                <option value="price">Price</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={toggleSortOrder}
                className="flex-1"
              >
                {filters.sortOrder === "asc" ? (
                  <SortAsc className="h-4 w-4 mr-2" />
                ) : (
                  <SortDesc className="h-4 w-4 mr-2" />
                )}
                {filters.sortOrder === "asc" ? "Ascending" : "Descending"}
              </Button>
            </div>
          </div>
        </form>
      </div>
      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          {coursesData.pagination.total} course
          {coursesData.pagination.total !== 1 ? "s" : ""} found
        </p>
      </div>
      {/* Courses Grid */}
      {coursesData.courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchParams.query ||
              searchParams.categoryId ||
              searchParams.status
                ? "Try adjusting your search criteria or filters."
                : "You haven't created any courses yet."}
            </p>
            <Button asChild>
              <a href="/instructor/courses/new">Create Your First Course</a>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesData.courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
      {/* Pagination */}
      {coursesData.pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            disabled={!coursesData.pagination.hasPreviousPage}
            onClick={() => handlePageChange(coursesData.pagination.page - 1)}
          >
            Previous
          </Button>

          <div className="flex space-x-1">
            {Array.from(
              { length: coursesData.pagination.totalPages },
              (_, i) => i + 1
            ).map((page) => (
              <Button
                key={page}
                variant={
                  page === coursesData.pagination.page ? "default" : "outline"
                }
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            disabled={!coursesData.pagination.hasNextPage}
            onClick={() => handlePageChange(coursesData.pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}{" "}
    </div>
  );
}
