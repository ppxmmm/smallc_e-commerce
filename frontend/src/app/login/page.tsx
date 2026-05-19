import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      description="Sign in to continue shopping and manage your SmallC orders."
      mode="login"
      title="Welcome back"
    >
      <LoginForm />
    </AuthShell>
  );
}
