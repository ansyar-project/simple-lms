import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to LMS
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A comprehensive Learning Management System built with modern web
            technologies. Start your learning journey today!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">For Students</h3>
              <p className="text-gray-600">
                Access courses, track your progress, and earn certificates.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">For Instructors</h3>
              <p className="text-gray-600">
                Create and manage courses, engage with students, and track
                analytics.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">For Admins</h3>
              <p className="text-gray-600">
                Manage users, oversee platform operations, and generate reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
