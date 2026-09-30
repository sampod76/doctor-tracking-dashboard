import React from "react";
import styled from "styled-components";

// Extend DefaultTheme to include "heading-color"
import "styled-components";

declare module "styled-components" {
    export interface DefaultTheme {
        ["heading-color"]: string;
    }
}

interface HeadingProps {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    children: React.ReactNode;
    className?: string;
    id?: string;
}

const H1 = styled.h1`
    font-size: 24px;
    font-weight: 600;
    color: ${(props) => props.theme["heading-color"]};
    margin: 0;
`;

const H2 = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: ${(props) => props.theme["heading-color"]};
    margin: 0;
`;

const H3 = styled.h3`
    font-size: 18px;
    font-weight: 500;
    color: ${(props) => props.theme["heading-color"]};
    margin: 0;
`;

const H4 = styled.h4`
    font-size: 16px;
    font-weight: 500;
    color: ${(props) => props.theme["heading-color"]};
    margin: 0;
`;

const H5 = styled.h5`
    font-size: 14px;
    font-weight: 500;
    color: ${(props) => props.theme["heading-color"]};
    margin: 0;
`;

const H6 = styled.h6`
    font-size: 12px;
    font-weight: 500;
    color: ${(props) => props.theme["heading-color"]};
    margin: 0;
`;

const headings = { H1, H2, H3, H4, H5, H6 };

const Heading: React.FC<HeadingProps> = ({
    as = "h1",
    children,
    className,
    id,
}) => {
    const StyledHeading =
        headings[as.toUpperCase() as keyof typeof headings] || H1;

    return (
        <StyledHeading className={className} id={id}>
            {children}
        </StyledHeading>
    );
};

export default Heading;
