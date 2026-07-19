import AuthHeader from "@/components/auth/AuthHeader";
import { AuthRedirect } from "@/components/auth/AuthRedirect";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthRedirect>
      <div className="relative flex flex-col gap-6 sm:gap-10 w-full items-center justify-start px-4 sm:px-6 pt-6 pb-10 overflow-x-hidden">
        <AuthHeader />
        {children}
      </div>
    </AuthRedirect>
  );
}
