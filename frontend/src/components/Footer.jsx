import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <div className="mb-3 sm:mb-4">
              <Logo className="h-12 sm:h-16" />
            </div>
            <p className="text-xs sm:text-sm text-gray-400">
              Your trusted source for premium OTT subscriptions at unbeatable prices.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Quick Links</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link to="/shop" className="text-xs sm:text-sm hover:text-primary-400 transition">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-xs sm:text-sm hover:text-primary-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-xs sm:text-sm hover:text-primary-400 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Support</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link to="/faq" className="text-xs sm:text-sm hover:text-primary-400 transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-xs sm:text-sm hover:text-primary-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-xs sm:text-sm hover:text-primary-400 transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Connect With Us</h3>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="mailto:support@digitaldudes.com" className="text-gray-400 hover:text-primary-400 transition">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-4 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Digital Dudes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
