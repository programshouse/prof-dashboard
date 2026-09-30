import { Link } from "react-router-dom";
import GridShape from "../../components/common/GridShape";
import PageMeta from "../../components/common/PageMeta";
import useGoBack from "../../hooks/useGoBack";

/**
 * Shared layout for every error screen (404, route errors, ...).
 * Mirrors the sign-in screen: white content side + brand side with the logo.
 */
export default function ErrorLayout({
  code = "404",
  title = "Page not found",
  message = "The page you are looking for doesn't exist or has been moved.",
  details,
  showRetry = false,
}) {
  const goBack = useGoBack();

  return (
    <>
      <PageMeta title={`${code} | Prof`} description={title} />

      <div className="relative z-1 flex min-h-screen flex-col bg-white lg:flex-row">

        

        {/* ---------- Content panel ---------- */}
        <div className="flex flex-1 items-center justify-center px-6 py-14 sm:px-10">
          <div className="w-full max-w-[460px] text-center lg:text-left">
            <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-theme-xs font-medium text-brand-600">
              Error {code}
            </span>

            <h1 className="mt-5 text-[96px] font-bold leading-none tracking-tight text-brand-600 sm:text-[120px]">
              {code}
            </h1>

            <h2 className="mt-4 text-title-sm font-semibold text-gray-800">
              {title}
            </h2>

            <p className="mt-3 text-base text-gray-500">{message}</p>

            {details && (
              <p className="mt-4 break-words rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left text-theme-sm text-gray-600">
                {details}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 focus:outline-none focus:ring-3 focus:ring-brand-500/20"
              >
                Back to Dashboard
              </Link>

              {showRetry ? (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 hover:text-gray-800"
                >
                  Try again
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 hover:text-gray-800"
                >
                  Go back
                </button>
              )}
            </div>

            <p className="mt-12 text-theme-sm text-gray-400">
              &copy; {new Date().getFullYear()} Prof. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
