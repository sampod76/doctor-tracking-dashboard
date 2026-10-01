"use client";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { login } from "@/redux/features/auth/authSlice";
import { baseApi } from "@/redux/api/baseApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import type { LoginPayload } from "@/types/auth";
import { apiErrorMessage } from "@/utils/api-error";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function LoginPage() {
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
  return (
    <div>
      <h1 className="mb-3 text-center text-3xl font-bold">Sign In</h1>
      <p className="mb-8 text-center text-gray-500">Sign in with your email and password</p>
      <Form<LoginPayload> layout="vertical" onFinish={handleLogin} disabled={isLoading}>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input prefix={<UserOutlined />} autoComplete="username" size="large" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Password is required" }]}
        >
          <Input.Password prefix={<LockOutlined />} autoComplete="current-password" size="large" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading} block size="large">
          Sign In
        </Button>
      </Form>
    </div>
  );
}
