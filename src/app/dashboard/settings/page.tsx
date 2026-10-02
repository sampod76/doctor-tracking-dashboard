"use client";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import { passwordSetSchema, PasswordSetValues } from "@/schema/change-password.schema";
import { apiErrorMessage } from "@/utils/api-error";
import { App, Button, Card, Form, Input } from "antd";
import { useRef } from "react";
export default function SettingsPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<PasswordSetValues>();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const submitting = useRef(false);
  async function submit(values: PasswordSetValues) {
    if (submitting.current || isLoading) return;
    const parsed = passwordSetSchema.safeParse(values);
    if (!parsed.success) {
      message.error(parsed.error.issues[0].message);
      return;
    }
    submitting.current = true;
    try {
      const response = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      if (!response.success) {
        message.error(apiErrorMessage({ data: response }, "Unable to change password"));
        return;
      }
      form.resetFields();
      message.success("Password changed successfully.");
    } catch (error) {
      message.error(apiErrorMessage(error, "Unable to change password"));
    } finally {
      submitting.current = false;
    }
  }
  return (
    <div className="p-4 sm:p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Settings</h2>
      <Card
        title="Change Password"
        className="mx-auto w-full max-w-xl rounded-lg shadow-md shadow-blue-200"
      >
        <Form form={form} layout="vertical" onFinish={submit} disabled={isLoading}>
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: "Please enter your current password." }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "Please enter your new password." },
              { min: 8, max: 128, message: "Use 8–128 characters" },
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your new password." },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  return !value || value === getFieldValue("newPassword")
                    ? Promise.resolve()
                    : Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Change Password
          </Button>
        </Form>
      </Card>
    </div>
  );
}
