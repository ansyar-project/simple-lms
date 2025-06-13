import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function InstructorLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect if not authenticated or not instructor/admin
  if (!session?.user || !["INSTRUCTOR", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Instructor Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your courses and track student progress
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
