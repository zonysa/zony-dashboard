"use client";
import React from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function OTP() {
  return (
    <div className="w-full flex flex-col gap-20 items-center justify-center p-6 md:p-10">
      <Card className="w-2/4 flex justify-center items-center">
        <CardHeader className="w-full">
          <CardTitle className="text-center w-full">
            Enter Code was sent to your email
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full flex justify-center items-center">
          <div className="w-full">
            <form className="w-full flex-col flex justify-center items-center">
              <InputOTP maxLength={6}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                  <InputOTPSlot index={6} />
                </InputOTPGroup>
              </InputOTP>
              <Button
                // onClick={onPress}
                type="submit"
                className="w-3/4 mt-8 py-3.5"
              >
                Confirm
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OTP;
