import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: Register,
});

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.auth.register({
        email,
        password,
        full_name: fullName,
      });
      toast.success("Signature Registered", {
        description: "Your technical advisory credentials have been established.",
      });
      navigate({ to: "/login" });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during credential establishment.";
      toast.error("Registration Failed", {
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
          <h1 className="text-3xl font-extrabold tracking-tighter uppercase">Establish_Identity</h1>
          <p className="text-muted-foreground font-mono text-xs mt-2">/Registration_Protocol</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Full_Name
            </label>
            <input
              type="text"
              required
              className="w-full bg-surface/50 border border-border px-4 py-3 text-sm font-mono focus:border-accent outline-none"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Email_Address
            </label>
            <input
              type="email"
              required
              className="w-full bg-surface/50 border border-border px-4 py-3 text-sm font-mono focus:border-accent outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Access_Key
            </label>
            <input
              type="password"
              required
              minLength={8}
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
            {isLoading ? "Establishing..." : "Commit_Signature →"}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          Already registered?{" "}
          <Link to="/login" className="text-accent underline underline-offset-4">
            Initialize_Session
          </Link>
        </p>
      </div>
    </div>
  );
}
