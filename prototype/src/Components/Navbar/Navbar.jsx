import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md  top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600">Tazkarti</div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 text-gray-700 font-medium ml-auto mr-auto">
          <li>
            <Link to="/" className="hover:text-blue-500">
              Home
            </Link>
          </li>
          <li>
            <Link to={"/about"} className="hover:text-blue-500">
              About
            </Link>
          </li>
          <li>
            <Link to={"/services"} className="hover:text-blue-500">
              Services
            </Link>
          </li>
          <li>
            <Link to={"/login"} className="hover:text-blue-500">
              login
            </Link>
          </li>
        </ul>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="md:hidden bg-white px-4 pb-4 space-y-2 shadow-md">
          <li>
            <a href="#home" className="block py-2 border-b hover:text-blue-500">
              Home
            </a>
          </li>
          <li>
            <a
              href="#about"
              className="block py-2 border-b hover:text-blue-500"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#services"
              className="block py-2 border-b hover:text-blue-500"
            >
              Services
            </a>
          </li>
          <li>
            <a href="#contact" className="block py-2 hover:text-blue-500">
              Contact
            </a>
          </li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar;
