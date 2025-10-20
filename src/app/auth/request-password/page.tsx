"use client";

import Image from "next/image";
import { RequestPasswordForm } from "@/components/auth/RequestPasswordForm";

export default function Page() {
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
        <RequestPasswordForm />
      </div>
    </div>
  );
}
