"use client"
import React from 'react'
import Link from 'next/link'

export default function LinkProvider({ children, href }: { children: React.ReactNode, href: string }) {
    return (
        <Link href={href}>
            {children}
        </Link>
    )
}
