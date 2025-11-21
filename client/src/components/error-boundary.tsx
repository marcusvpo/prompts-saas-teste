import React from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-background">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Algo deu errado</AlertTitle>
            <AlertDescription className="mt-2">
              {this.state.error?.message || "Ocorreu um erro inesperado."}
            </AlertDescription>
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                Recarregar Página
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.history.back()}
              >
                Voltar
              </Button>
            </div>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
