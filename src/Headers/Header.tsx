import { useState, useEffect } from 'react';
import logoimg from '../../src/assets/logobank.png';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close menu if click is outside the menu and button
      if (!(event.target as HTMLElement).closest('.header-section') && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
  
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);
  

  return (
    <div className="header-section flex items-center justify-between h-[65px] bg-black text-white px-4 border-b">
      {/* Logo Section */}
      <div>
        <img src={logoimg} alt="Logo" className="h-8" />
      </div>

      {/* Desktop Navigation */}
      <div className="hidden sm:block ">
        <ul className="flex items-center gap-6">
          <li className="hover:text-gray-300 cursor-pointer">
            <Link to="/">Bank</Link>
          </li>
          <li className="hover:text-gray-300 cursor-pointer">
            <Link to="/client">Client</Link>
          </li>
          <li className="hover:text-gray-300 cursor-pointer">
            <Link to="/office">Office</Link>
          </li>
        </ul>
      </div>

      {/* Hamburger Button */}
      <div className="sm:hidden flex items-center">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`sm:hidden absolute left-0  right-0 bg-black  text-white p-4 transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'top-16' : 'top-[-200%]'
        }`}
      >
        <ul className="flex flex-col items-center gap-4">
          <li className="hover:text-gray-300 cursor-pointer">
            <Link to="/">Bank</Link>
          </li>
          <li className="hover:text-gray-300 cursor-pointer">
            <Link to="/client">Client</Link>
          </li>
          <li className="hover:text-gray-300 cursor-pointer">
            <Link to="/office">Office</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Header;












