import { ThemeProvider } from "@/components/theme-context";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App as AntdApp } from "antd";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Doctor Tracker",
  description: "A reusable Doctor Tracker boilerplate.",
};

const ReduxProvider = dynamic(() => import("@/provider/redux-provider"), {
  ssr: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="custom-sidebar-menu" suppressHydrationWarning>
        <ReduxProvider>
          <ThemeProvider>
            <AntdRegistry>
              <AntdApp>{children}</AntdApp>
            </AntdRegistry>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
