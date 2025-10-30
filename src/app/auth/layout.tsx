import AuthHeader from "@/components/auth/AuthHeader";
import { AuthRedirect } from "@/components/auth/AuthRedirect";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthRedirect>
      <div className="flex flex-col gap-10 w-full items-center justify-start px-6 pt-6 ">
        <AuthHeader />
        {children}
      </div>
    </AuthRedirect>
  );
}
