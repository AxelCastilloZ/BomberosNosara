import { motion } from "framer-motion";
import { FaPhone } from "react-icons/fa";

export default function PhoneButton() {
  return (
    <motion.a
      href="tel:+50687090614"
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md flex items-center justify-center space-x-3 mx-auto w-fit"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <FaPhone />
      <span>LLAMAR +506 87090614</span>
    </motion.a>
  );
}
