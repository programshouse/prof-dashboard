import ErrorLayout from "./ErrorLayout";

export default function NotFound() {
  return (
    <ErrorLayout
      code="404"
      title="Page not found"
      message="We can't seem to find the page you are looking for. It may have been moved or deleted."
    />
  );
}
