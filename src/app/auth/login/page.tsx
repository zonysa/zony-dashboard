"use client";

import Image from "next/image";

import { LoginForm } from "@/components/auth/LoginForm";

export default function Page() {
  return (
    <div className="flex flex-col gap-3 min-w-full items-center justify-starjt">
      <Image
        className="absolute right-0 bottom-0 -z-0"
        src="/icons/login-illustration.svg"
        alt="Login Illustration"
        width={630}
        height={388}
      />
      <div className="w-full max-w-1/3 z-1">
        <LoginForm />
      </div>
    </div>
  );
}
