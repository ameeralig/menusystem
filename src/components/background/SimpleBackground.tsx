import { motion } from "framer-motion";

const SimpleBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#000020]">
      {/* خلفية متدرجة محسنة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#000030] via-[#000050] to-[#000030]" />
      
      {/* شبكة متحركة */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 170, 255, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 170, 255, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* توهج علوي */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(59, 170, 255, 0.15) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />
      
      {/* توهج سفلي */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-0 right-0 w-[600px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(167, 139, 250, 0.12) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
      />
      
      {/* نجوم صغيرة */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              boxShadow: '0 0 6px rgba(255,255,255,0.8)',
            }}
          />
        ))}
      </div>
      
      {/* خطوط متحركة */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 h-px w-1/3 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
      />
      <motion.div
        initial={{ x: '200%' }}
        animate={{ x: '-100%' }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
        className="absolute top-3/4 h-px w-1/3 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"
      />
    </div>
  );
};

export default SimpleBackground;
