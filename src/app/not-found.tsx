import { Button, Result } from "antd";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Link href={"/dashboard"}>
            <Button type="primary">Back Home</Button>
          </Link>
        }
      />
    </div>
  );
}
