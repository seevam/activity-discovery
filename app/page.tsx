'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-ultra-light to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo/Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-primary mb-2">
            🎨 Identity Collage Builder
          </h1>
          <p className="text-xl text-gray-700">
            Ascend Now Career Exploration Platform
          </p>
        </div>

        {/* Mascot/Welcome Image */}
        <div className="mb-8">
          <div className="w-48 h-48 mx-auto bg-yellow-primary rounded-full flex items-center justify-center text-8xl animate-bounce">
            🎨
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome back! Let's create a visual story that shows the world who YOU are!
          </h2>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="font-semibold">15-20 minutes</div>
              <div className="text-sm text-gray-600">Time needed</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold">5 challenges</div>
              <div className="text-sm text-gray-600">Fun activities</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🏆</div>
              <div className="font-semibold">6 badges</div>
              <div className="text-sm text-gray-600">To earn</div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full md:w-auto"
          onClick={() => router.push('/collage/session1-input')}
        >
          Let's Get Started! →
        </Button>

        {/* Additional Info */}
        <p className="mt-6 text-gray-600 text-sm">
          You'll create a beautiful collage that shows your strengths, values,
          interests, and dreams!
        </p>
      </div>
    </div>
  );
}
