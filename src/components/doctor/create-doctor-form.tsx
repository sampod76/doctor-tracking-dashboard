"use client";

import { DoctorFormValues, SPECIALIZATION } from "@/types/doctor";
import { Button, Form, Input, Modal, Select, Space, App } from "antd";
import {
  BankOutlined,
  LockOutlined,
  MailOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useCreateDoctorAccountMutation } from "@/redux/features/doctor/doctorApi";
import { useModal } from "../ui/modal";
import { hospitalOptions } from "@/constants/hospital";

const specializationOptions = Object.values(SPECIALIZATION).map((item) => ({
  label: item
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" "),
  value: item,
}));

const CreateDoctorForm = () => {
  const [form] = Form.useForm<DoctorFormValues>();
  const { closeModal } = useModal();
  const { message } = App.useApp();

  const [createDoctor, { isLoading }] = useCreateDoctorAccountMutation();

  const handleSubmit = async (values: DoctorFormValues) => {
    try {
      await createDoctor(values).unwrap();

      message.success("Doctor created successfully");

      // Reset form after successful creation
      form.resetFields();

      // Close modal
      closeModal();
    } catch (error: any) {
      message.error(error?.data?.message || error?.message || "Failed to create doctor");
    }
  };

  const handleReset = () => {
    form.resetFields();
  };

  const handleClose = () => {
    // Reset form whenever modal closes
    form.resetFields();

    closeModal();
  };

  return (
    <Form<DoctorFormValues>
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      requiredMark="optional"
      className="mt-6"
    >
      <Form.Item
        label="Doctor Name"
        name="name"
        rules={[
          {
            required: true,
            message: "Please enter doctor name",
          },
          {
            min: 2,
            message: "Name must be at least 2 characters",
          },
        ]}
      >
        <Input
          size="large"
          prefix={<UserOutlined className="text-gray-400" />}
          placeholder="Enter doctor name"
        />
      </Form.Item>

      <Form.Item
        label="Email Address"
        name="email"
        rules={[
          {
            required: true,
            message: "Please enter email address",
          },
          {
            type: "email",
            message: "Please enter a valid email address",
          },
        ]}
      >
        <Input
          size="large"
          prefix={<MailOutlined className="text-gray-400" />}
          placeholder="doctor@example.com"
        />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[
          {
            required: true,
            message: "Please enter password",
          },
          {
            min: 8,
            message: "Password must be at least 8 characters",
          },
        ]}
      >
        <Space.Compact className="w-full">
          <Input.Password
            size="large"
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Enter password"
            className="w-full"
          />
        </Space.Compact>
      </Form.Item>

      <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
        <Form.Item
          label="Phone Number"
          name="phone"
          rules={[
            {
              required: true,
              message: "Please enter phone number",
            },
          ]}
        >
          <Input
            size="large"
            prefix={<PhoneOutlined className="text-gray-400" />}
            placeholder="01812000000"
          />
        </Form.Item>

        <Form.Item
          label="Specialization"
          name="specialization"
          rules={[
            {
              required: true,
              message: "Please select specialization",
            },
          ]}
        >
          <Select
            size="large"
            placeholder="Select specialization"
            options={specializationOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
      </div>

      <Form.Item
        label="Hospital"
        name="hospital"
        rules={[
          {
            required: true,
            message: "Please select or enter hospital name",
          },
        ]}
        getValueFromEvent={(value: string[]) => value?.[value.length - 1]}
        getValueProps={(value?: string) => ({
          value: value ? [value] : [],
        })}
      >
        <Select
          mode="tags"
          size="large"
          placeholder="Select or type hospital name"
          options={hospitalOptions}
          showSearch
          optionFilterProp="label"
          maxCount={1}
          suffixIcon={<BankOutlined className="text-gray-400" />}
          tokenSeparators={[","]}
        />
      </Form.Item>

      <div className="mt-6 flex items-center justify-end border-t border-gray-100 pt-5">
        <Space>
          <Button size="large" htmlType="button" disabled={isLoading} onClick={handleReset}>
            Reset
          </Button>

          <Button size="large" htmlType="button" disabled={isLoading} onClick={handleClose}>
            Cancel
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isLoading}
            className="bg-orange-500 hover:!bg-orange-600"
          >
            Create Doctor
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default CreateDoctorForm;
