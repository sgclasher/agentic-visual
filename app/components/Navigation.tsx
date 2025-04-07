'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Navigation items definition
const navigationItems = [
  { name: 'Home', href: '/' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Executive View', href: '/executive-view' },
  { name: 'Use Case Comparison', href: '/use-case-comparison' },
  { name: 'Use Case Detail', href: '/use-case-view' },
  { name: 'Configure', href: '/config' },
];

// Memoized NavLink component for better performance
const NavLink = memo(({ 
  href, 
  isActive, 
  isMobile = false,
  children 
}: { 
  href: string; 
  isActive: boolean; 
  isMobile?: boolean;
  children: React.ReactNode;
}) => {
  const baseClasses = isActive
    ? 'bg-blue-700 text-white'
    : 'text-blue-100 hover:bg-blue-500';
  
  const desktopClasses = `px-3 py-2 rounded-md text-sm font-medium ${baseClasses}`;
  const mobileClasses = `block px-3 py-2 rounded-md text-base font-medium ${baseClasses}`;
  
  return (
    <Link
      href={href}
      className={isMobile ? mobileClasses : desktopClasses}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
});

NavLink.displayName = 'NavLink';

const Navigation = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Memoized toggle menu handler
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prevState => !prevState);
  }, []);

  return (
    <nav className="bg-blue-600 text-white" aria-label="Main Navigation">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2" aria-label="ServiceNow Agentic AI Home">
                <span className="font-bold text-xl">ServiceNow <span className="bg-yellow-400 text-blue-800 px-1.5 py-0.5 rounded">Agentic AI</span></span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4" role="navigation">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.name}
                    href={item.href}
                    isActive={pathname === item.href}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">{isMenuOpen ? 'Close main menu' : 'Open main menu'}</span>
              <svg
                className={`block h-6 w-6 ${isMenuOpen ? 'hidden' : 'block'}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div 
        className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`} 
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3" role="navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              href={item.href}
              isActive={pathname === item.href}
              isMobile={true}
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default memo(Navigation); 