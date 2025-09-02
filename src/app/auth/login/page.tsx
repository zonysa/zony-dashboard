"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

import { LoginForm } from "@/components/auth/login-form";

export default function Page() {
  const router = useRouter();

  const handleNavToOTP = () => {
    router.replace("/auth/otp");
  };

  return (
    <div className="flex flex-col gap-3 min-w-full items-center justify-starjt  md:p-10">
      <Image
        className="absolute right-0 bottom-0 -z-0"
        src="/icons/login-illustration.svg"
        alt="Login Illustration"
        width={630}
        height={388}
      />
      <div className="w-full max-w-2/4 z-1">
        <LoginForm onPress={handleNavToOTP} />
      </div>
    </div>
  );
}
