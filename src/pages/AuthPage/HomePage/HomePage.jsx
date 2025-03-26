import { useNavigate } from "react-router-dom";

function Header() {
  return (
    <header className="w-full bg-gray-800 p-4">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold">FPT Software</div>
        <nav className="space-x-6">
          <a href="/" className="text-white hover:text-teal-300">
            Home
          </a>
          <a href="/about" className="text-white hover:text-teal-300">
            About
          </a>
          <a href="/services" className="text-white hover:text-teal-300">
            Services
          </a>
          <a href="/contact" className="text-white hover:text-teal-300">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white py-4 mt-16">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        <div>&copy; 2025 FPT Software. All Rights Reserved.</div>
        <div>
          <a href="/privacy" className="hover:text-teal-300">
            Privacy Policy
          </a>
          <span className="mx-2">|</span>
          <a href="/terms" className="hover:text-teal-300">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}

function HomePage() {
  const navigate = useNavigate();

  const handleNavigateToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-r from-blue-300 to-teal-300 text-white">
      <Header />

      <div className="flex flex-1">
        {/* Left section */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-start p-8 md:p-16 space-y-8">
          <h1 className="text-5xl font-bold leading-tight">
            Welcome to the Future of Software
          </h1>
          <p className="text-lg">
            Join us and start building cutting-edge solutions with the latest
            technology at FPT Software.
          </p>
          <button
            onClick={handleNavigateToLogin}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-full shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105"
          >
            Get Started
          </button>
        </div>

        <div className="hidden md:flex w-1/2 justify-center items-center">
          <img
            src="https://career.fpt-software.com/wp-content/uploads/2020/07/fville-hanoi.jpg"
            alt="FPT Software"
            className="rounded-xl shadow-2xl"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default HomePage;
