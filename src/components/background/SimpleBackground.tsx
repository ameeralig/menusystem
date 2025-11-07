const SimpleBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#000054]">
      {/* تدرج لوني بسيط */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#000054] via-[#000066] to-[#000054] opacity-80" />
      
      {/* نقاط صغيرة متحركة بشكل بطيء جداً */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDuration: Math.random() * 5 + 5 + 's',
              animationDelay: Math.random() * 3 + 's',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SimpleBackground;
