"use client"

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useRouter } from "next/navigation";

export default function BackButton() {
    const router = useRouter();
    const styles = {
        button: {
            backgroundColor: "#f0f0f0",
            borderColor: "#d9d9d9",
            width: "100%",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
    }
    return (
        <Button
            icon={<ArrowLeftOutlined />}
            size="large"
            type="dashed"
            onClick={() => router.back()}
            style={styles.button}
        >
            Go Back
        </Button>
    );
}
