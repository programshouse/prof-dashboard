import { HelmetProvider, Helmet } from "react-helmet-async";

const PageMeta = ({
  title = "Dashboard | Prof",
  description = "Professional Dashboard for Prof Services",
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
  </Helmet>
);

export const AppWrapper = ({ children }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;
