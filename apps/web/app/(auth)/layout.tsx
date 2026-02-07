import Image from 'next/image';
import { Logo } from '@/components/ui';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex">
            {/* Left Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-primary/10 via-primary/5 to-background">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                    <Image
                        src="/images/hero/auth.webp"
                        alt="Event reservations hero"
                        fill
                        className="object-cover opacity-20"
                        priority
                    />
                    <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-transparent to-background/40" />
                </div>

                {/* Animated Background Elements */}
                <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-start p-16 w-full max-w-xl mx-auto">
                    <div className="space-y-8">
                        {/* Logo */}
                        <div className="inline-block">
                            <Logo />
                        </div>

                        {/* Heading */}
                        <div className="space-y-4">
                            <h1 className="text-5xl font-bold leading-tight text-foreground">
                                Welcome to Your
                                <br />
                                <span className="text-primary">Event Experience</span>
                            </h1>
                            <p className="text-muted text-lg leading-relaxed">
                                Discover amazing events, connect with communities, and create
                                unforgettable memories. Your journey starts here.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Form Section */}
            <div className="flex-1 flex flex-col bg-background">
                {/* Mobile Logo */}
                <div className="lg:hidden p-6 border-b border-border bg-surface/50">
                    <Logo />
                </div>
                {children}
            </div>
        </div>
    );
}