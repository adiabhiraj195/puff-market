"use client";

export function Provider({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    )
}
export function WrapServerComponent({ children }: { children: React.ReactNode }) {
    return (
        <div>
            {children}
        </div>
    )
}