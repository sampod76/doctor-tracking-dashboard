import { CopyOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import React, { useState } from "react";

interface CopyButtonProps {
    title: string;
    text: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ title, text }) => {
    const [tooltipTitle, setTooltipTitle] = useState(title);

    const handleCopy = (value: string) => {
        navigator.clipboard.writeText(value);
        setTooltipTitle("Copied!");

        setTimeout(() => {
            setTooltipTitle(title);
        }, 1500);
    };

    return (
        <Tooltip title={tooltipTitle}>
            <Button
                type="text"
                icon={<CopyOutlined />}
                size="small"
                onClick={() => handleCopy(text)}
            />
        </Tooltip>
    );
};

export default CopyButton;
