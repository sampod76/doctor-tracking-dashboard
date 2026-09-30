"use client";
import Loader from "@/components/shared/loader";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useSession } from "@/provider/session-provider";
import {
  useResendOtpMutation,
  useSendLoginRequestMutation,
} from "@/redux/features/auth/authApi";
import { login } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { signin } from "@/service/auth";
import type { TError } from "@/types";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message } from "antd";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [tokenID, setTokenID] = useState("");
  const [countdown, setCountdown] = useState(59);
  const [redirect, setRedirect] = useState("/dashboard");
  const { setIsLoading } = useSession();
  const [loginForm] = Form.useForm();
  const [otpForm] = Form.useForm();
  const router = useRouter();

  const params = useSearchParams();
  const query = params.get("user_type");

  const dispatch = useAppDispatch();

  const [getLoginOTP] = useSendLoginRequestMutation();
  const [resendOtp] = useResendOtpMutation();

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token_id");
    const redirectParam = params.get("redirect");

    if (urlToken) {
      setTokenID(urlToken);
      setShowOtpForm(true);
    }
    if (redirectParam) {
      setRedirect(decodeURIComponent(redirectParam));
    }
  }, []);

  useEffect(() => {
    if (showOtpForm && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showOtpForm, countdown]);

  const getInitialUserType = (): string => {
    if (typeof window !== "undefined" && window.location.host) {
      const type = window.location.host.split(".")[0];

      if (type === "news") return "moderator";

      const USER_TYPE = ["admin", "moderator", "writer"];
      return USER_TYPE.includes(type) ? type : "admin";
    }
    return "admin";
  };

  const [userType] = useState(getInitialUserType);

  const handleLogin = async (values: { email: string; password: string }) => {
    setLocalLoading(true);
    setIsLoading(true);
    try {
      const response: any = await getLoginOTP({
        ...values,
        user_type: query || userType,
      }).unwrap();

      if (response?.success) {
        const tokenId = response?.data?.token_id;
        setTokenID(tokenId);
        setShowOtpForm(true);
        router.replace(
          `/auth/signin?token_id=${tokenId}&redirect=${encodeURIComponent(
            redirect
          )}`
        );
        message.success("OTP sent to your email.");
        setCountdown(59);
      } else {
        message.error(response?.data?.message || "Failed to send OTP");
      }
    } catch (error) {
      const errorResponse = error as TError;
      message.error(errorResponse?.data?.message || "Something went wrong");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleOtpVerify = async (values: { otp: string }) => {
    setOtpLoading(true);
    setLocalLoading(true);
    setIsLoading(true);
    try {
      const response = await signin({
        token_id: tokenID,
        otp: values.otp,
      });

      if (response.success) {
        localStorage.setItem("token", response.data.accessToken);

        dispatch(
          login({
            userData: response.data.userData,
            accessToken: response.data.accessToken,
          })
        );
        message.success("Logged In Successfully");
        router.replace(redirect);
      } else {
        message.error(response.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      const errorResponse = error as TError;
      message.error(errorResponse?.data?.message || "Something went wrong");
    } finally {
      setLocalLoading(false);
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!tokenID) {
      message.error("No token ID found");
      return;
    }
    const response: any = await resendOtp({
      token_id: tokenID,
    });

    if (response?.data?.success) {
      const tokenId = response?.data?.data.token_id;
      setTokenID(tokenId);
      setCountdown(59);
      message.success("OTP resent.");
    } else {
      message.error("Failed to resend OTP.");
    }
  };

  if (!mounted) {
    return <Loader />;
  }

  return (
    <>
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          {" "}
          {showOtpForm ? "Verify OTP" : "Sign In"}
        </h2>
        <p className="text-gray-600 mt-2">
          {showOtpForm
            ? `Enter the 6-digit OTP sent to ${
                loginForm.getFieldValue("email") || ""
              }`
            : "Welcome back! Please enter your details"}
        </p>
      </div>

      {/* Login Form */}
      {!showOtpForm ? (
        <Form
          form={loginForm}
          layout="vertical"
          onFinish={handleLogin}
          size="large"
          requiredMark={"optional"}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Email is required" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your email"
              className="h-12"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              className="h-12"
            />
          </Form.Item>

          <div className="flex justify-between items-center mb-4">
            <Checkbox>Remember for 30 Days</Checkbox>
            <Link href="/auth/forgot-password" className="text-orange-500">
              Forgot password
            </Link>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={localLoading}
            className="h-12 bg-gradient-to-r from-orange-500 to-orange-600 border-none font-medium"
          >
            Sign In
          </Button>
        </Form>
      ) : (
        <Form
          form={otpForm}
          layout="vertical"
          onFinish={handleOtpVerify}
          size="large"
        >
          <Form.Item
            name="otp"
            rules={[
              { required: true, message: "OTP is required" },
              { len: 6, message: "OTP must be 6 digits" },
            ]}
          >
            <Input.OTP
              size="large"
              length={6}
              separator={<span>-</span>}
              className="h-12"
            />
          </Form.Item>

          <div className="text-right mb-4">
            {countdown > 0 ? (
              <span className="text-gray-500">Resend OTP in {countdown}s</span>
            ) : (
              <Button
                type="link"
                className="text-orange-500 p-0"
                onClick={handleResendOtp}
              >
                Resend OTP
              </Button>
            )}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={otpLoading}
            block
            className="h-12 bg-gradient-to-r from-orange-500 to-orange-600 border-none font-medium"
          >
            Verify OTP
          </Button>
        </Form>
      )}
    </>
  );
}
