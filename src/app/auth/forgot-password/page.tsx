/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
    useForgetPasswordMutation,
    useGetTokenOTPforgetPasswordMutation,
    useResendOtpMutation,
    useResetPasswordMutation,
} from "@/redux/features/auth/authApi";
import {
    EyeInvisibleOutlined,
    EyeTwoTone,
    MailOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ForgotPasswordAntd() {
    const router = useRouter();

    const [form] = Form.useForm();
    const [otpForm] = Form.useForm();
    const [passwordForm] = Form.useForm();

    const [step, setStep] = useState(1);
    const [countdown, setCountdown] = useState(59);
    const [resetToken, setResetToken] = useState("");

    const [getOtp] = useForgetPasswordMutation();
    const [verifyOtp] = useGetTokenOTPforgetPasswordMutation();
    const [resetPassword] = useResetPasswordMutation();
    const [resendOtp] = useResendOtpMutation();
    const [tokenId, setTokenId] = useState<string | null>(null);

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

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenParam = params.get("token_id");

        setTokenId(tokenParam);

        if (tokenParam) {
            setStep(2);
        }
    }, []);

    useEffect(() => {
        if (step === 2 && countdown > 0) {
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
    }, [step, countdown]);

    const handleEmailSubmit = async (values: { email: string }) => {
        try {
            const res: any = await getOtp({
                email: values.email,
                user_type: userType,
            });

            if (res.data?.success) {
                const searchParams = new URLSearchParams();
                searchParams.set("email", values.email);
                searchParams.set("token_id", res.data.data.token_id);

                router.push(`?${searchParams.toString()}`);
                setTokenId(res.data.data.token_id);
                setStep(2);
                setCountdown(59);
                message.success("OTP sent to your email.");
            } else {
                message.error(
                    res?.error?.data?.message || "Failed to send OTP"
                );
            }
        } catch {
            message.error("Something went wrong");
        }
    };

    const handleOtpSubmit = async (values: { otp: string }) => {
        if (!tokenId) return message.error("Missing token ID");

        try {
            const res: any = await verifyOtp({
                token_id: tokenId,
                otp: values.otp,
            });

            if (res.data?.success) {
                setResetToken(res.data.data.resetPasswordToken);
                setStep(3);
                message.success("OTP verified. Please reset your password.");
            } else {
                message.error(res?.error?.data?.message || "Invalid OTP");
            }
        } catch {
            message.error("Verification failed");
        }
    };

    const handlePasswordSubmit = async (values: {
        newPassword: string;
        confirmPassword: string;
    }) => {
        if (!tokenId) return message.error("Missing token ID");

        if (values.newPassword !== values.confirmPassword) {
            return message.error("Passwords do not match");
        }

        try {
            const res: any = await resetPassword({
                resetPasswordToken: resetToken,
                newPassword: values.newPassword,
                token_id: tokenId,
            });

            if (res.data?.success) {
                message.success(
                    "Password changed successfully. Redirecting..."
                );
                router.push("/auth/signin");
            } else {
                message.error(
                    res?.error?.data?.message || "Failed to reset password"
                );
            }
        } catch {
            message.error("Error resetting password");
        }
    };

    const handleResendOtp = async () => {
        if (!tokenId) {
            message.error("No token ID found");
            return;
        }

        try {
            const response: any = await resendOtp({ token_id: tokenId });

            if (response?.data?.success) {
                setCountdown(59);
                message.success(response?.data?.data?.message || "OTP resent.");
            } else {
                message.error("Failed to resend OTP.");
            }
        } catch {
            message.error("Error resending OTP.");
        }
    };

    return (
        <>
            <div>
                <h2 className="text-3xl font-bold text-gray-900">
                    {step === 1
                        ? "Forgot Password"
                        : step === 2
                        ? "Verify OTP"
                        : "Reset Password"}
                </h2>
                <p className="text-gray-600 mt-2">
                    {step === 2
                        ? `Enter the 6-digit OTP sent to ${
                              form.getFieldValue("email") || ""
                          }`
                        : "Welcome back! Please enter your details"}
                </p>
            </div>

            {step === 1 && (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleEmailSubmit}
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: "Email is required" },
                            { type: "email", message: "Enter a valid email" },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            size="large"
                            placeholder="Email Address"
                            className="h-12"
                        />
                    </Form.Item>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            className="h-12 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 border-none font-medium"
                        >
                            Send OTP
                        </Button>
                    </motion.div>
                </Form>
            )}

            {step === 2 && (
                <Form
                    form={otpForm}
                    layout="vertical"
                    onFinish={handleOtpSubmit}
                >
                    <Form.Item
                        name="otp"
                        rules={[
                            { required: true, message: "OTP is required" },
                            { len: 6, message: "OTP must be 6 digits" },
                        ]}
                    >
                        <Input.OTP
                            length={6}
                            size="large"
                            style={{ letterSpacing: 4 }}
                            separator={<span>-</span>}
                            className="h-12"
                        />
                    </Form.Item>

                    <div style={{ textAlign: "right", marginBottom: 12 }}>
                        {countdown > 0 ? (
                            <span style={{ fontSize: 14, color: "#999" }}>
                                Resend OTP in {countdown}s
                            </span>
                        ) : (
                            <Button type="link" onClick={handleResendOtp}>
                                Resend OTP
                            </Button>
                        )}
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            className="h-12 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 border-none font-medium"
                        >
                            Verify OTP
                        </Button>
                    </motion.div>
                </Form>
            )}

            {step === 3 && (
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordSubmit}
                >
                    <Form.Item
                        name="newPassword"
                        rules={[
                            { required: true, message: "Enter a new password" },
                        ]}
                    >
                        <Input.Password
                            placeholder="New Password"
                            iconRender={(visible) =>
                                visible ? (
                                    <EyeTwoTone />
                                ) : (
                                    <EyeInvisibleOutlined />
                                )
                            }
                            className="h-12"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                            {
                                required: true,
                                message: "Confirm your password",
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (
                                        !value ||
                                        getFieldValue("newPassword") === value
                                    ) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error("Passwords do not match")
                                    );
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            placeholder="Confirm Password"
                            iconRender={(visible) =>
                                visible ? (
                                    <EyeTwoTone />
                                ) : (
                                    <EyeInvisibleOutlined />
                                )
                            }
                            className="h-12"
                        />
                    </Form.Item>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            className="h-12 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 border-none font-medium"
                        >
                            Change Password
                        </Button>
                    </motion.div>
                </Form>
            )}
            <div className="flex justify-center text-sm">
                <span className="text-gray-600">Returning user?</span>
                <Link
                    href="/auth/signin"
                    className="ml-1 font-medium text-orange-500 hover:underline"
                >
                    Sign In
                </Link>
            </div>
        </>
    );
}
