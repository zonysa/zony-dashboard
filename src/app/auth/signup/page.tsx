"use client";

import Image from "next/image";

import { SignupForm } from "@/components/auth/SignupForm";

export default function Page() {
  return (
    <div className="flex flex-col gap-3 min-w-full items-center justify-start">
      <Image
        className="absolute right-0 bottom-0 z-0"
        src="/icons/login-illustration.svg"
        alt="Signup Illustration"
        width={630}
        height={388}
      />
      <div className="w-full max-w-lg z-1">
        <SignupForm />
      </div>
    </div>
  );
}
