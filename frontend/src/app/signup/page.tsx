import { AuthShell } from "@/components/AuthShell";
import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <AuthShell
      description="Create a customer profile for saved carts, faster checkout, and order updates."
      mode="signup"
      title="Create your SmallC account"
    >
      <SignupForm />
    </AuthShell>
  );
}
