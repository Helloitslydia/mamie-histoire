'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="border-b border-purple-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link
              href="/"
              className="inline-flex items-center px-1 pt-1 text-gray-600 hover:text-[#9377F2] font-light transition-colors duration-200"
            >
              Enregistrer
            </Link>
            <Link
              href="/souvenirs"
              className="inline-flex items-center px-1 pt-1 text-gray-600 hover:text-[#9377F2] font-light transition-colors duration-200"
            >
              Mes Souvenirs
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
