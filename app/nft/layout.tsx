
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function NftLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col min-h-screen bg-black text-white selection:bg-blue-500/30">
            <Navbar />
            <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {children}
            </main>
            <Footer />
        </div>
    );
}

