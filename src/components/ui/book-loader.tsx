import { cn } from "@/lib/utils";

interface BookLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const BookLoader = ({ className, size = "md" }: BookLoaderProps) => {
  const sizeClasses = {
    sm: "w-[100px] h-[70px]",
    md: "w-[200px] h-[140px]",
    lg: "w-[300px] h-[210px]"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="book-loader-container">
        <style>{`
          .book-loader-container {
            display: inline-block;
          }
          
          .book-loader {
            ${size === "sm" ? "width: 100px; height: 70px;" : ""}
            ${size === "md" ? "width: 200px; height: 140px;" : ""}
            ${size === "lg" ? "width: 300px; height: 210px;" : ""}
            background: #979794;
            box-sizing: border-box;
            position: relative;
            border-radius: 8px;
            perspective: 1000px;
          }

          .book-loader:before {
            content: '';
            position: absolute;
            left: 10px;
            right: 10px;
            top: 10px;
            bottom: 10px;
            border-radius: 8px;
            background: #f5f5f5 no-repeat;
            background-size: ${size === "sm" ? "30px 5px" : size === "lg" ? "90px 15px" : "60px 10px"};
            background-image: 
              linear-gradient(#ddd 100px, transparent 0),
              linear-gradient(#ddd 100px, transparent 0), 
              linear-gradient(#ddd 100px, transparent 0), 
              linear-gradient(#ddd 100px, transparent 0), 
              linear-gradient(#ddd 100px, transparent 0), 
              linear-gradient(#ddd 100px, transparent 0);
            background-position: 
              ${size === "sm" ? "7.5px 15px, 7.5px 30px, 7.5px 45px, 52.5px 15px, 52.5px 30px, 52.5px 45px" : 
                size === "lg" ? "22.5px 45px, 22.5px 90px, 22.5px 135px, 157.5px 45px, 157.5px 90px, 157.5px 135px" :
                "15px 30px, 15px 60px, 15px 90px, 105px 30px, 105px 60px, 105px 90px"};
            box-shadow: 0 0 10px rgba(0,0,0,0.25);
          }

          .book-loader:after {
            content: '';
            position: absolute;
            width: calc(50% - 10px);
            right: 10px;
            top: 10px;
            bottom: 10px;
            border-radius: 8px;
            background: #fff no-repeat;
            background-size: ${size === "sm" ? "30px 5px" : size === "lg" ? "90px 15px" : "60px 10px"};
            background-image: 
              linear-gradient(#ddd 100px, transparent 0), 
              linear-gradient(#ddd 100px, transparent 0), 
              linear-gradient(#ddd 100px, transparent 0);
            background-position: 
              ${size === "sm" ? "50% 15px, 50% 30px, 50% 45px" : 
                size === "lg" ? "50% 45px, 50% 90px, 50% 135px" :
                "50% 30px, 50% 60px, 50% 90px"};
            transform: rotateY(0deg);
            transform-origin: left center;
            animation: paging 1s linear infinite;
          }

          @keyframes paging {
            to {
              transform: rotateY(-180deg);
            }
          }
        `}</style>
        <div className={cn("book-loader", sizeClasses[size])} />
      </div>
    </div>
  );
};

export default BookLoader;
