import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

export default function LoadingSpin() {
  return <Spin indicator={<LoadingOutlined spin />} size="large" />;
}
