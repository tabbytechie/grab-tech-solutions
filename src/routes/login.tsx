import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.auth.login(email, password);
      toast.success("Identity Verified", {
        description: "Welcome back to the advisory network.",
      });
      navigate({ to: "/dashboard" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid credentials provided.";
      toast.error("Access Denied", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-sans p-6">
      <div className="w-full max-w-md border border-border bg-surface/30 backdrop-blur-sm p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tighter uppercase">Initialize_Session</h1>
          <p className="text-muted-foreground font-mono text-xs mt-2">/Verification_Required</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
            >
              Email_Address
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full bg-surface/50 border border-border px-4 py-3 text-sm font-mono focus:border-accent outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
            >
              Access_Key
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full bg-surface/50 border border-border px-4 py-3 text-sm font-mono focus:border-accent outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-accent text-accent-foreground font-bold text-xs uppercase tracking-widest hover:brightness-110 transition disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Establish_Connection →"}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          New advisor?{" "}
          <Link to="/register" className="text-accent underline underline-offset-4">
            Register_Signature
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
