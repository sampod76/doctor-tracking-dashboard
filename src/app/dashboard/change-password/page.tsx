"use client";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import useAuth from "@/hooks/useAuth";
import { passwordSetSchema, PasswordSetValues } from "@/schema/change-password.schema";
import { apiErrorMessage } from "@/utils/api-error";
import { Button, Card, Form, Input, message } from "antd";
export default function ChangePasswordPage() {
  const [form] = Form.useForm<PasswordSetValues>();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const { logout } = useAuth();
  async function submit(values: PasswordSetValues) {
    const parsed = passwordSetSchema.safeParse(values);
    if (!parsed.success) {
      message.error(parsed.error.issues[0].message);
      return;
    }
    try {
      const response = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      if (!response.success) {
        message.error(response.message || "Unable to change password");
        return;
      }
      form.resetFields();
      message.success(response.data.message || response.message || "Password changed successfully");
      await logout();
    } catch (error) {
      message.error(apiErrorMessage(error, "Unable to change password"));
    }
  }
  return (
    <Card title="Change Password" className="m-6 max-w-xl">
      <Form form={form} layout="vertical" onFinish={submit} disabled={isLoading}>
        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[{ required: true, message: "Current password is required" }]}
        >
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[{ required: true }, { min: 8, max: 128, message: "Use 8–128 characters" }]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={["newPassword"]}
          rules={[
            { required: true },
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
  );
}
