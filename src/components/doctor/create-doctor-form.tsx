"use client";

import { apiErrorMessage } from "@/utils/api-error";
import { useEffect } from "react";
import {
  type DoctorDetails,
  type DoctorFormValues,
  type UpdateDoctorValues,
  SPECIALIZATION,
} from "@/types/doctor";
import { Button, Form, Input, Select, Space, App, Switch } from "antd";
import {
  IdcardOutlined,
  BankOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  useCreateDoctorAccountMutation,
  useUpdateDoctorMutation,
} from "@/redux/features/doctor/doctorApi";
import { useModal } from "../ui/modal";
import { hospitalOptions } from "@/constants/hospital";

const specializationOptions = Object.values(SPECIALIZATION).map((item) => ({
  label: item
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" "),
  value: item,
}));

type DoctorFormFields = Omit<DoctorFormValues, "password"> & {
  password?: string;
  isActive?: boolean;
};

type DoctorFormProps = {
  onSuccess?: () => void;
} & ({ mode?: "create"; doctor?: never } | { mode: "edit"; doctor: DoctorDetails });

const CreateDoctorForm = ({ mode = "create", doctor, onSuccess }: DoctorFormProps) => {
  const [form] = Form.useForm<DoctorFormFields>();
  const { open, closeModal } = useModal();
  const { message } = App.useApp();

  const [createDoctor, { isLoading: isCreating }] = useCreateDoctorAccountMutation();
  const [updateDoctor, { isLoading: isUpdating }] = useUpdateDoctorMutation();
  const isLoading = mode === "edit" ? isUpdating : isCreating;

  useEffect(() => {
    form.resetFields();
    if (open && mode === "edit" && doctor) {
      form.setFieldsValue({
        name: doctor.name,
        medicalRegistrationNo: doctor.medicalRegistrationNo,
        email: doctor.email,
        phone: doctor.phone,
        hospital: doctor.hospital,
        specialization: doctor.specialization,
        isActive: doctor.isActive,
      });
    }
  }, [open, mode, doctor, form]);

  const handleSubmit = async (values: DoctorFormFields) => {
    if (isLoading) return;
    try {
      const profile = {
        name: values.name,
        medicalRegistrationNo: values.medicalRegistrationNo.trim(),
        phone: values.phone,
        hospital: values.hospital,
        specialization: values.specialization,
      };
      if (mode === "edit") {
        if (!doctor) return;
        const body: UpdateDoctorValues = {
          ...profile,
          isActive: values.isActive ?? doctor.isActive,
        };
        await updateDoctor({ id: doctor._id, body }).unwrap();
      } else {
        if (!values.password) return;
        const body: DoctorFormValues = {
          ...profile,
          email: values.email,
          password: values.password,
        };
        await createDoctor(body).unwrap();
      }
      message.success(
        mode === "edit" ? "Doctor updated successfully." : "Doctor created successfully",
      );


      form.resetFields();


      closeModal();
      onSuccess?.();
    } catch (error: unknown) {
      message.error(
        apiErrorMessage(
          error,
          mode === "edit" ? "Failed to update doctor" : "Failed to create doctor",
        ),
      );
    }
  };

  const handleReset = () => {
    form.resetFields();
    if (mode === "edit" && doctor) form.setFieldsValue(doctor);
  };

  const handleClose = () => {

    form.resetFields();

    closeModal();
  };

  return (
    <Form<DoctorFormFields>
      form={form}
      disabled={isLoading}
      layout="vertical"
      onFinish={handleSubmit}
      requiredMark="optional"
      className="doctor-compact-form"
    >
      <h3 className="mb-3 pr-8 text-lg font-semibold">
        {mode === "edit" ? "Edit Doctor" : "Create Doctor"}
      </h3>
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
          size="middle"
          prefix={<UserOutlined className="text-gray-400" />}
          placeholder="Enter doctor name"
        />
      </Form.Item>

      <Form.Item
        label="Medical Registration No."
        name="medicalRegistrationNo"
        normalize={(value: string) => value.trim()}
        rules={[
          { required: true, whitespace: true, message: "Please enter medical registration number" },
          { max: 100, message: "Medical registration number must be at most 100 characters" },
        ]}
      >
        <Input
          size="middle"
          prefix={<IdcardOutlined className="text-gray-400" />}
          placeholder="Enter medical registration number"
          maxLength={100}
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
          size="middle"
          prefix={<MailOutlined className="text-gray-400" />}
          disabled={mode === "edit"}
          placeholder="doctor@example.com"
        />
      </Form.Item>

      {mode === "create" && (
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
              size="middle"
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Enter password"
              className="w-full"
            />
          </Space.Compact>
        </Form.Item>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-x-3 sm:grid-cols-2">
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
            size="middle"
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
            size="middle"
            placeholder="Select specialization"
            options={specializationOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
      </div>

      <div
        className={
          mode === "edit"
            ? "grid min-w-0 grid-cols-1 gap-x-3 sm:grid-cols-[minmax(0,1fr)_88px]"
            : "min-w-0"
        }
      >
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
            size="middle"
            placeholder="Select or type hospital name"
            options={hospitalOptions}
            showSearch
            optionFilterProp="label"
            maxCount={1}
            suffixIcon={<BankOutlined className="text-gray-400" />}
            tokenSeparators={[","]}
          />
        </Form.Item>

        {mode === "edit" && (
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}
      </div>

      <div className="mt-1 flex flex-wrap items-center justify-end border-t border-gray-100 pt-3">
        <Space size={6} wrap>
          <Button size="middle" htmlType="button" disabled={isLoading} onClick={handleReset}>
            Reset
          </Button>

          <Button size="middle" htmlType="button" disabled={isLoading} onClick={handleClose}>
            Cancel
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            size="middle"
            loading={isLoading}
            className="bg-orange-500 hover:!bg-orange-600"
          >
            {mode === "edit" ? "Update Doctor" : "Create Doctor"}
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default CreateDoctorForm;
