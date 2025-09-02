import AuthHeader from "@/components/auth/AuthHeader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-20 min-h-svh w-full items-center justify-start p-6 md:p-10">
      <AuthHeader />
      {children}
    </div>
  );
}
