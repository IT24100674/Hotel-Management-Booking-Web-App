import React from "react";

const Footer = () => {


  return (
    <footer className="mt-auto w-full pt-16 pb-8 bg-primary-dark text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

        {/* Brand Section */}
        <div className="flex flex-col gap-4">
          <h2 className="font-playfair text-2xl font-bold" style={{ color: '#c5a059' }}>Golden Waves</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Experience the epitome of luxury and comfort right by the ocean.
            Where every wave tells a story and every stay becomes a memory.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-4">
          <h3 className="font-playfair text-lg font-semibold" style={{ color: '#c5a059' }}>Quick Links</h3>
          <ul className="flex flex-col gap-2 text-sm text-gray-400">
            <li><a href="/" className="hover:text-secondary transition-colors">Home</a></li>
            <li><a href="/halls" className="hover:text-secondary transition-colors">Venues</a></li>
            <li><a href="/menu" className="hover:text-secondary transition-colors">Dining Menu</a></li>
            <li><a href="/about" className="hover:text-secondary transition-colors">About Us</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-4">
          <h3 className="font-playfair text-lg font-semibold" style={{ color: '#c5a059' }}>Contact Us</h3>
          <ul className="flex flex-col gap-3 text-sm text-gray-400">
            <li className="flex items-start gap-3">
              <span>📍</span>
              <span>123 Ocean Drive, Coastal City,<br /> CA 90210</span>
            </li>
            <li className="flex items-center gap-3">
              <span>📞</span>
              <span>+1 (555) 123-4567</span>
            </li>
            <li className="flex items-center gap-3">
              <span>✉️</span>
              <span>reservations@goldenwaves.com</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-4">
          <h3 className="font-playfair text-lg font-semibold" style={{ color: '#c5a059' }}>Newsletter</h3>
          <p className="text-gray-400 text-sm">Subscribe for exclusive offers and updates.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-secondary w-full"
            />
            <button className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        <p>
          © {new Date().getFullYear()} Golden Waves Hotel. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

