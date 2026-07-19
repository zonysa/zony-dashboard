"use client";

import Image from "next/image";

import { SignupForm } from "@/components/auth/SignupForm";

export default function Page() {
  return (
    <div className="relative flex w-full flex-col items-center justify-start gap-3 overflow-hidden">
      <Image
        className="absolute right-0 bottom-0 z-0 hidden w-[320px] h-auto sm:block md:w-[450px] lg:w-[630px]"
        src="/icons/login-illustration.svg"
        alt="Signup Illustration"
        width={630}
        height={388}
      />
      <div className="z-1 w-full max-w-sm sm:max-w-lg">
        <SignupForm />
      </div>
    </div>
  );
}
