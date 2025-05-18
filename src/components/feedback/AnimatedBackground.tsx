
import { motion } from "framer-motion";

const AnimatedBackground = () => {
  return (
    <>
      {/* خلفية متحركة */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#E5DEFF] to-white dark:from-gray-900 dark:to-gray-800 -z-10"></div>
      
      {/* دوائر متحركة */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed rounded-full bg-primary/5 -z-5"
          initial={{
            width: Math.random() * 300 + 100,
            height: Math.random() * 300 + 100,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0.3
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight
            ],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: Math.random() * 100 + 100,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      ))}
      
      {/* تأثيرات نيون إضافية في الخلفية */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 blur-[100px] rounded-full -z-5"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -z-5"></div>
    </>
  );
};

export default AnimatedBackground;
