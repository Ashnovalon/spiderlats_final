import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import { SignInFlow } from "../types";
import { useState } from "react";
import { signIn } from "next-auth/react";

interface SignInCardProps {
  setState: (state: SignInFlow) => void;
}

export const SignInCard = ({ setState }: SignInCardProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Handle error state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Reset error on each submit

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password");
        console.log(result?.error);
      } else if (result?.ok) {
        window.location.href = "/home"; // Redirect to home page
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error(error); // Log the error for debugging
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>using email or other services</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-2.5" onSubmit={handleSubmit}>
          <input
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
          />
          <input
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required
          />
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Loading..." : "Continue"}
          </Button>
        </form>
        {error && <p className="text-red-500 text-sm">{error}</p>}{" "}
        {/* Error message */}
        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <Button
            className="w-full relative"
            size="lg"
            disabled={loading}
            onClick={() => signIn("google")}
            variant="outline"
          >
            Continue with Google
          </Button>
        </div>
        <p>
          Don't have an account?{" "}
          <span
            onClick={() => setState("signUp")}
            className="hover:underline cursor-pointer"
          >
            sign up
          </span>
        </p>
      </CardContent>
    </Card>
  );
};
