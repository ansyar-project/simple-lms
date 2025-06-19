import RegisterForm from "@/components/forms/register-form";

export default function RegisterPage() {
  return (
    <main
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      aria-labelledby="register-title"
    >
      <h1 id="register-title" className="sr-only">
        Register
      </h1>
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]">
          <svg
            className="absolute inset-0 h-full w-full opacity-30"
            width="100%"
            height="100%"
            viewBox="0 0 700 700"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <circle
                cx="117.5"
                cy="117.5"
                r="317.5"
                fill="#3b82f6"
                fillOpacity="0.1"
              />
              <circle
                cx="582.5"
                cy="582.5"
                r="217.5"
                fill="#1e40af"
                fillOpacity="0.15"
              />
              <circle
                cx="350"
                cy="350"
                r="150"
                fill="#60a5fa"
                fillOpacity="0.05"
              />
            </g>
          </svg>
        </div>
      </div>

      <div className="relative z-10">
        <RegisterForm />
      </div>
    </main>
  );
}
