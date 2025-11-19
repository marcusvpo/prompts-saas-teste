import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { signIn, signUp, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }

      setLocation("/");
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 border rounded-lg shadow-sm bg-card">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Framework Vibe Coding</h1>
          <p className="text-muted-foreground">
            {isSignUp ? "Criar Conta" : "Fazer Login"}
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Carregando..."
              : isSignUp
                ? "Criar Conta"
                : "Fazer Login"}
          </Button>
        </form>

        <div className="text-center space-y-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-primary hover:underline"
            disabled={loading}
          >
            {isSignUp
              ? "Já tem conta? Fazer login"
              : "Não tem conta? Criar"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continue com
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full"
            disabled={loading}
            onClick={async () => {
              try {
                await signIn("admin@teste.com", "teste123");
                setLocation("/");
              } catch (err) {
                console.error("Demo auth error:", err);
              }
            }}
          >
            Acessar Demo
          </Button>
        </div>
      </div>
    </div>
  );
}
