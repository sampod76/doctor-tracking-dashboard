/* eslint-disable @next/next/no-img-element */
"use client";

import Link from 'next/link';
import Image from "next/image";
import type React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="w-full max-w-6xl overflow-hidden shadow-2xl border-0 rounded bg-white">
                <div className="flex min-h-[700px]">
                    {/* Left Side - Login Form */}
                    <div className="flex-1 flex items-center justify-center px-12">
                        <div className="w-full max-w-md space-y-8">
                            {/* Logo */}
                            <Link href="/">
                                 <div className="flex justify-center items-center">
                                <Image
                                    src={"/auth-logo.png"}
                                    width={384}
                                    height={50}
                                    alt="Naria Holidays"
                                    className="w-44"
                                />
                            </div>
                            </Link>
                           
                            {children}
                        </div>
                    </div>

                    {/* Right Side - Travel Banner */}
                    <div className="flex-1 relative overflow-hidden hidden lg:block">
                        <div className="absolute inset-0">
                            <img
                                src="/auth-banner.jpg"
                                alt="Travel destinations around the world"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/60 via-orange-500/30 to-orange-700/50"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
