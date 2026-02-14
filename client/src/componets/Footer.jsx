import React from "react";

const Footer = () => {
  

  return (
    <footer className="mt-12 w-full py-4 text-sm bg-slate-800 text-white/70">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-3 items-center px-4">
        <p>
          Copyright © {new Date().getFullYear()} Golden Waves Hotel. All rights
          reserved.
        </p>
        <div className="flex items-center gap-4 md:ml-8">
          <a href="#" className="hover:text-white transition-all">
            Contact Us
          </a>
          <div className="h-8 w-px bg-white/20" />
          <a href="#" className="hover:text-white transition-all">
            Privacy Policy
          </a>
          <div className="h-8 w-px bg-white/20" />
          <a href="#" className="hover:text-white transition-all">
            Trademark Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

