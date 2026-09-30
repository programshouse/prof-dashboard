import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import ErrorLayout from "./ErrorLayout";

/** Used as the router `errorElement` – catches runtime/loader errors. */
export default function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <ErrorLayout
        code="404"
        title="Page not found"
        message="We can't seem to find the page you are looking for."
      />
    );
  }

  const status = isRouteErrorResponse(error) ? String(error.status) : "500";
  const details = import.meta.env.DEV
    ? error?.message || error?.statusText
    : undefined;

  return (
    <ErrorLayout
      code={status}
      title="Something went wrong"
      message="An unexpected error occurred while loading this page. Please try again."
      details={details}
      showRetry
    />
  );
}
