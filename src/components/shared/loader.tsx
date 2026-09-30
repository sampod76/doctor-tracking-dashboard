"use client"

import { Spin } from "antd";

export default function Loader() {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "70vh",
                background: "#ffffff",
            }}
            className="bg-white z-50"
        >
            <Spin size="large" />
        </div>
    );
}
