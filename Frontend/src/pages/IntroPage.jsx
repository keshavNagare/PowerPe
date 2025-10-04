import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../assets/LogoPowerpay.png";


const IntroPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-auto bg-no-repeat h-64 w-full poster md:flex flex-col items-center justify-center h-screen h-64 w-full bg-auto bg-center poster">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-extrabold text-gray-800 mb-4 bg-[#d75c00] px-[10px] py-[8px] rounded-[10px] "
      >
         <img src={logo} alt="logo" className="w-[250px]" />
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-lg text-gray-700 text-center max-w-lg  " 
      >
        <p className="font-[800] text-[1.2rem] text-[black] ">
        Simplify electricity bill management with easy payments, secure
        transactions, and detailed history all in one place.
        </p>
      </motion.p>

      <motion.div
        className="flex gap-4 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 bg-orange-500 text-white rounded-2xl shadow-md hover:bg-orange-600 transition"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/register")}
          className="px-6 py-3 bg-white border border-orange-400 text-orange-600 rounded-2xl shadow-md hover:bg-orange-100 transition"
        >
          Register
        </button>
      </motion.div>
    </div>
  );
};

export default IntroPage;
