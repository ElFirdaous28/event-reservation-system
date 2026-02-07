import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-3xl text-center space-y-6">
          <h2 className="text-5xl font-bold">
            Discover & Reserve Events
          </h2>
          <p className="text-xl text-muted">
            Browse upcoming events and secure your spot with ease.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link
              href="/events"
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-lg font-medium"
            >
              Browse Events
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary-soft transition-colors text-lg font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>

    </div>
  );
}
