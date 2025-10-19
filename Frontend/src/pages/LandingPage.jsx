import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BoltIcon,
  LightBulbIcon,
  ChevronUpIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  FaTwitterSquare,
  FaLinkedin,
  FaInstagram,
  FaFacebookSquare,
} from "react-icons/fa";

import heroImgLeft from "../assets/TopLeft.png";
import heroImgRight from "../assets/BottomRight.png";
import howImg from "../assets/HowItsWorks.png";
import featuresImg from "../assets/BillFetch.png";
import contactImg from "../assets/ContactandSupport.png";
import Logo from "../assets/LogoPowerpay.png";

// Reusable Glass Card
const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg rounded-2xl ${className}`}
  >
    {children}
  </div>
);

// Animated Counter
const Counter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef();
  const observer = useRef();

  useEffect(() => {
    observer.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const increment = end / (duration / 50);
          const interval = setInterval(() => {
            start += increment;
            if (start >= end) {
              start = end;
              clearInterval(interval);
            }
            setCount(Math.floor(start));
          }, 50);
          observer.current.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.current.observe(ref.current);
    return () => observer.current && observer.current.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}</span>;
};

const LandingPage = () => {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate(); // 🚀 for navigation

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="relative text-white scroll-smooth">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 left-0 flex justify-between items-center px-6 py-4 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="text-2xl font-bold text-yellow-400">
          <img src={Logo} alt="logo" className="w-[150px]" />
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-6 text-gray-200 font-medium">
          {["how", "features", "contact"].map((item) => (
            <li key={item} className="relative">
              <a
                href={`#${item}`}
                className="!no-underline hover:!text-white !transition !relative
        after:!content-[''] after:!absolute after:!bottom-0 
        after:![left:calc(1/11*0%)] 
        after:![--tw-translate-x:-50%] after:![--tw-translate-y:-50%]
        after:!h-[1.4px] after:!w-0 after:!bg-white 
        after:!transition-all after:!duration-300 after:!transform 
        hover:after:!w-full"
              >
                {item === "how"
                  ? "How It Works"
                  : item.charAt(0).toUpperCase() + item.slice(1)}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-yellow-400 !text-white rounded-lg font-semibold hover:bg-yellow-300 transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 bg-transparent border border-yellow-400 !text-white rounded-lg font-semibold hover:bg-yellow-400 hover:text-gray-900 transition"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden z-50 border border-white p-1 rounded-lg !bg-transparent !bg-none "
          onClick={() => setNavOpen(!navOpen)}
        >
          {navOpen ? (
            <XMarkIcon className="w-8 h-8 text-white" />
          ) : (
            <Bars3Icon className="w-8 h-8 text-white" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {navOpen && (
        <div className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex flex-col items-center justify-center space-y-8">
          {["how", "features", "contact"].map((item) => (
            <a
              key={item}
              href={`#${item}`}
              className="!no-underline text-xl font-semibold text-yellow-400 hover:text-white transition relative after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-[1.5px] after:bg-white after:transition-all after:duration-300 hover:after:left-0 hover:after:w-full"
              onClick={() => setNavOpen(false)}
            >
              {item === "how"
                ? "How It Works"
                : item.charAt(0).toUpperCase() + item.slice(1)}
            </a>
          ))}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setNavOpen(false);
                navigate("/login");
              }}
              className="px-6 py-3 bg-yellow-400 !text-white rounded-lg font-semibold hover:bg-yellow-300 transition"
            >
              Login
            </button>
            <button
              onClick={() => {
                setNavOpen(false);
                navigate("/register");
              }}
              className="px-6 py-3 bg-transparent border border-yellow-400 !text-white rounded-lg font-semibold hover:bg-yellow-400 hover:!text-white transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-24 pt-24 bg-gradient-to-tr from-[#232526] via-[#414345] to-[#ffb347] overflow-hidden">
        <img
          src={heroImgLeft}
          alt="Hero Left"
          className="absolute bottom-0 left-0 w-40 sm:w-60 lg:w-100 opacity-100 animate-float"
        />
        <img
          src={heroImgRight}
          alt="Hero Right"
          className="absolute bottom-0 right-0 w-40 sm:w-60 lg:w-105 opacity-100 animate-float-reverse"
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-8 animate-fadeIn">
            PowerPe - Electricity Bill Management
          </h1>
          <p className="text-gray-200 mb-12 max-w-3xl animate-fadeIn delay-200">
            Efficient, accurate, and modern solution to generate, track, and
            manage electricity bills for your customers with real-time
            monitoring.
          </p>
          <button
            onClick={() => {
              setNavOpen(false);
              navigate("/login");
            }}
            className="bg-yellow-400 !text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-yellow-300 transition-transform hover:scale-105 animate-fadeIn delay-400"
          >
            Get Started <ArrowRightIcon className="w-5 h-5" />
          </button>
          <div className="mt-12 flex justify-center gap-4 animate-bounce">
            <LightBulbIcon className="w-6 h-6 text-yellow-400" />
            <LightBulbIcon className="w-6 h-6 text-yellow-500" />
            <LightBulbIcon className="w-6 h-6 text-yellow-600" />
            <LightBulbIcon className="w-6 h-6 text-yellow-800" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how"
        className="min-h-screen py-24 px-4 sm:px-6 lg:px-24 bg-[#1c1c1c] flex flex-col items-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-yellow-400 text-center animate-slideIn">
          How It Works
        </h2>
        <img
          src={howImg}
          alt="How It Works Illustration"
          className="w-full max-w-3xl mb-12 rounded-xl shadow-lg"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
          <GlassCard className="p-8 text-center hover-glow transition-transform duration-300">
            <UserGroupIcon className="w-12 h-12 mx-auto mb-4 text-yellow-400 animate-bounce" />
            <h3 className="text-2xl font-semibold mb-2">Add Customers</h3>
            <p className="text-gray-200 mb-4">
              Easily add customers with their details and manage them in one
              central place.
            </p>
            <p className="text-3xl font-bold text-yellow-400">
              <Counter end={1200} />+
            </p>
            <p className="text-gray-300 text-sm">Customers Added</p>
          </GlassCard>
          <GlassCard className="p-8 text-center hover-glow transition-transform duration-300">
            <BoltIcon className="w-12 h-12 mx-auto mb-4 text-yellow-400 animate-bounce" />
            <h3 className="text-2xl font-semibold mb-2">Generate Bills</h3>
            <p className="text-gray-200 mb-4">
              Generate electricity bills automatically based on consumption,
              ensuring accurate billing every month.
            </p>
            <p className="text-3xl font-bold text-yellow-400">
              <Counter end={8500} />+
            </p>
            <p className="text-gray-300 text-sm">Bills Generated</p>
          </GlassCard>
          <GlassCard className="p-8 text-center hover-glow transition-transform duration-300">
            <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-4 text-yellow-400 animate-bounce" />
            <h3 className="text-2xl font-semibold mb-2">Monitor Payments</h3>
            <p className="text-gray-200 mb-4">
              Track payment status, notify customers, and receive payments
              seamlessly.
            </p>
            <p className="text-3xl font-bold text-yellow-400">
              <Counter end={7200} />+
            </p>
            <p className="text-gray-300 text-sm">Payments Collected</p>
          </GlassCard>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="min-h-screen py-24 px-4 sm:px-6 lg:px-24 bg-[#232323] flex flex-col items-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-yellow-400 text-center animate-slideIn">
          Features
        </h2>
        <img
          src={featuresImg}
          alt="Features Illustration"
          className="w-full max-w-3xl mb-12 rounded-xl shadow-lg"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
          <GlassCard className="p-8 hover-glow transition-transform duration-300">
            <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
              <BoltIcon className="w-6 h-6 text-yellow-400" /> Real-Time
              Dashboard
            </h3>
            <p className="text-gray-200">
              Monitor all customers, bills, and payments in real-time with a
              sleek interactive dashboard.
            </p>
          </GlassCard>
          <GlassCard className="p-8 hover-glow transition-transform duration-300">
            <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
              <CurrencyDollarIcon className="w-6 h-6 text-yellow-400" />{" "}
              Automated Billing
            </h3>
            <p className="text-gray-200">
              Automatically calculate bills based on consumption and dynamic
              rates for complete accuracy.
            </p>
          </GlassCard>
          <GlassCard className="p-8 hover-glow transition-transform duration-300">
            <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
              <MapPinIcon className="w-6 h-6 text-yellow-400" /> Secure &
              Reliable
            </h3>
            <p className="text-gray-200">
              All customer and payment data is safely encrypted and stored in a
              secure environment.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Contact & Support */}
      <section
        id="contact"
        className="min-h-screen py-24 px-4 sm:px-6 lg:px-24 bg-[#1c1c1c] flex flex-col items-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-yellow-400 text-center animate-slideIn">
          Contact & Support
        </h2>
        <img
          src={contactImg}
          alt="Contact Illustration"
          className="w-full max-w-3xl mb-12 rounded-xl shadow-lg"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full text-center">
          <GlassCard className="p-8 hover-glow transition-transform duration-300">
            <PhoneIcon className="w-10 h-10 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-2xl font-semibold mb-2">Customer Care</h3>
            <p className="text-gray-200">+91 1800-123-456</p>
          </GlassCard>
          <GlassCard className="p-8 hover-glow transition-transform duration-300">
            <EnvelopeIcon className="w-10 h-10 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-2xl font-semibold mb-2">Email Support</h3>
            <p className="text-gray-200">support@powerpe.com</p>
          </GlassCard>
          <GlassCard className="p-8 hover-glow transition-transform duration-300">
            <MapPinIcon className="w-10 h-10 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-2xl font-semibold mb-2">Office Address</h3>
            <p className="text-gray-200">123 PowerPe Lane, Mumbai, India</p>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-12"
        style={{
          background: "color-mix(in oklab, #414345 40%, #383636fc)",
        }}
      >
        <div className="container mx-auto px-6 text-gray-300">
          <div className="flex justify-center gap-8 text-center">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-yellow-400">
                <img src={Logo} alt="logo" className="w-[150px] mx-auto" />
              </h2>
              <p className="text-sm sm:text-base max-w-xl mx-auto">
                Simplifying electricity bill management for everyone. Our
                mission is to provide a seamless, secure, and efficient platform
                for all your power needs.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center mt-8">
            <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4 mb-4">
              {[FaTwitterSquare, FaLinkedin, FaInstagram, FaFacebookSquare].map(
                (Icon, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="text-yellow-400 footer-icon text-2xl transition"
                  >
                    <Icon />
                  </a>
                )
              )}
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm sm:text-base">
            <p>&copy; 2025 PowerPe. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-yellow-400 text-gray-900 rounded-full shadow-lg hover:bg-yellow-300 transition z-50"
        >
          <ChevronUpIcon className="w-6 h-6" />
        </button>
      )}

      {/* Animations and Glow Effects */}
      <style>{`
        html { scroll-behavior: smooth; }
        .animate-fadeIn { animation: fadeIn 1s ease forwards; opacity: 0; }
        .animate-slideIn { animation: slideIn 1s ease forwards; opacity: 0; transform: translateY(40px); }
        .delay-200 { animation-delay: 0.2s; }
        .delay-400 { animation-delay: 0.4s; }

        @keyframes fadeIn { to { opacity: 1; } }
        @keyframes slideIn { to { opacity: 1; transform: translateY(0); } }

        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-reverse { animation: float 4s ease-in-out infinite reverse; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }

        /* Hover glow effect for cards */
        .hover-glow:hover {
          box-shadow: 0 0 10px 2px #FFD700, 0 0 20px 4px #FF8C00;
          transform: translateY(-3px);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        /* Hover glow effect for footer icons */
        .footer-icon:hover {
          filter: drop-shadow(0 0 6px #FFD700) drop-shadow(0 0 12px #FF8C00);
          transform: scale(1.2);
          transition: transform 0.3s, filter 0.3s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
