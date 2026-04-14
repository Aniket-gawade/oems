import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { ErrorState } from "@/components/feedback/error-state";

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly resetKey: string;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

class PageErrorBoundaryInner extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Page render error", error, errorInfo);
  }

  public componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          description="A rendering error occurred on this page. Retry to recover."
          onRetry={() => this.setState({ hasError: false })}
          title="We hit a rendering issue"
        />
      );
    }

    return this.props.children;
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }
}

export const PageErrorBoundary = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  return <PageErrorBoundaryInner resetKey={location.pathname}>{children}</PageErrorBoundaryInner>;
};
