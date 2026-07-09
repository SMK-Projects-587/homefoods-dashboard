import LoginForm from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh w-full items-center justify-center p-4">
      <div className="border-border bg-card w-full max-w-sm rounded-lg border p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-foreground text-lg font-semibold">HomeFoods</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sign in to the staff dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
