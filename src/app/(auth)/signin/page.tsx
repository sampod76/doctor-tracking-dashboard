"use client";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { login } from "@/redux/features/auth/authSlice";
import { baseApi } from "@/redux/api/baseApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import type { LoginPayload } from "@/types/auth";
import { apiErrorMessage } from "@/utils/api-error";
import { authHeroImage, authLogoImage } from "@/config/auth-images";
import { ArrowRightOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { App, Button, Form, Input } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const DEMO_EMAIL = "admin@doctortracker.com";
const DEMO_PASSWORD = "Admin@12345";

export default function LoginPage() {
  const [form] = Form.useForm<LoginPayload>();
  const { message } = App.useApp();
  const [signIn, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.accessToken);
  useEffect(() => {
    if (token) router.replace("/dashboard");
  }, [token, router]);
  async function handleLogin(values: LoginPayload) {
    try {
      const response = await signIn({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      }).unwrap();
      if (!response.success) {
        message.error(response.message || "Sign in failed");
        return;
      }
      dispatch(baseApi.util.resetApiState());
      dispatch(login(response.data));
      message.success(response.message || "Login successful");
      router.replace("/dashboard");
    } catch (error) {
      message.error(apiErrorMessage(error, "Unable to sign in. Please try again."));
    }
  }
  function handleDemoFill() {
    form.setFieldsValue({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
  }
  return (
    <main className="flex min-h-[100svh] min-h-screen items-center justify-center bg-sky-50 bg-[url('/background.webp')] bg-cover bg-center bg-no-repeat px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-[1500px] items-center lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 xl:gap-12">
        <div className="hidden min-w-0 items-center justify-center lg:flex" aria-hidden="true">
          <Image
            {...authHeroImage}
            alt=""
            priority
            className="h-auto max-h-[650px] w-full object-contain"
          />
        </div>
        <section className="mx-auto w-full max-w-[480px] rounded-3xl border border-white/70 bg-white/90 px-6 py-8 shadow-[0_16px_48px_rgba(42,112,170,0.08)] backdrop-blur-sm sm:px-10 sm:py-10 lg:px-8 xl:px-10 xl:py-12">
          <Link
            href="/"
            className="mx-auto mb-6 flex w-fit justify-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
            aria-label="Doctor Tracker Home"
          >
            <Image
              {...authLogoImage}
              alt="Doctor Tracker"
              priority
              className="h-auto w-32 object-contain xl:w-[152px]"
            />
          </Link>
          <h1 className="mb-3 text-center text-3xl font-bold tracking-tight text-[#101d46] xl:text-4xl">
            Sign In
          </h1>
          <p className="mb-8 text-center text-sm leading-6 text-slate-500 sm:text-base">
            Sign in with your email and password
          </p>
          <Form<LoginPayload>
            form={form}
            layout="vertical"
            onFinish={handleLogin}
            disabled={isLoading}
            className="w-full"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Enter a valid email" },
              ]}
              className="mb-5"
            >
              <Input
                prefix={<UserOutlined className="text-slate-500" />}
                placeholder="Enter your email address"
                autoComplete="username"
                size="large"
                className="rounded-xl px-4"
                style={{
                  height: 50,
                  fontSize: 15,
                  borderColor: "#cbd5e1",
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Password is required" }]}
              className="mb-6"
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-500" />}
                placeholder="Enter your password"
                autoComplete="current-password"
                size="large"
                className="rounded-xl px-4"
                style={{
                  height: 50,
                  fontSize: 15,
                  borderColor: "#cbd5e1",
                }}
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              disabled={isLoading}
              block
              size="large"
              className="rounded-xl text-base font-semibold"
              style={{
                height: 50,
                backgroundColor: "#3b82f6",
                borderColor: "#3b82f6",
              }}
            >
              Sign In <ArrowRightOutlined />
            </Button>
            <Button
              type="default"
              htmlType="button"
              block
              size="large"
              onClick={handleDemoFill}
              disabled={isLoading}
              className="!mt-3 !h-[50px] !rounded-xl !text-base !font-medium [&:not(:disabled):hover]:!bg-blue-50 [&:not(:disabled)]:!border-blue-500 [&:not(:disabled)]:!bg-white [&:not(:disabled)]:!text-blue-600"
            >
              Auto Fill Admin Login
            </Button>
          </Form>
        </section>
      </div>
    </main>
  );
}
