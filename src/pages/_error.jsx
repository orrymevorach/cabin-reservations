import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import ErrorPageTakeover from "@/components/shared/errorPageTakeover/errorPageTakeover";

// Server errors and client-side crashes both render this page, so guests see Highlands recovery steps
// and the support email instead of Next's bare "Internal Server Error" or "Application error" screen.
const CustomErrorComponent = (props) => {
  return <ErrorPageTakeover statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData) => {
  // In case this is running in a serverless function, await this in order to give Sentry
  // time to send the error before the lambda exits
  await Sentry.captureUnderscoreErrorException(contextData);

  // This will contain the status code of the response
  return Error.getInitialProps(contextData);
};

export default CustomErrorComponent;
