// Better approach - pass title as prop or use pathname
"use client";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Globe } from "lucide-react";
import { LanguageSwitcher } from "../LanguageSwitcher";

function AuthHeader() {
  const pathname = usePathname();

  const getTitle = () => {
    switch (pathname) {
      case "/auth/login":
        return "Login";
      case "/auth/verify-otp":
        return "Verify OTP";
      case "/auth/forgot-password":
        return "Reset Password";
      default:
        return "Authentication";
    }
  };

  return (
    <div className="flex w-full justify-between items-center">
      <Image src="/icons/zony-logo.svg" alt="Logo" width={80} height={40} />
      <h1 className="text-xl font-semibold">{getTitle()}</h1>
      <LanguageSwitcher />
    </div>
  );
}

export default AuthHeader;
