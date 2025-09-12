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
      <Select>
        <SelectTrigger className="w-[100px]">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-gray-500" />
            <SelectValue placeholder="En" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Languages</SelectLabel>
            <SelectItem value="en">En</SelectItem>
            <SelectItem value="ar">AR</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default AuthHeader;
