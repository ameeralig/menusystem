
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would normally send the form data to a server
    // For now, we'll just show a toast
    toast({
      title: "تم إرسال رسالتك بنجاح",
      description: "سنقوم بالرد عليك في أقرب وقت ممكن.",
    });
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      message: ""
    });
  };

  return (
    <div className="min-h-screen bg-[#fff0e8]">
      <header className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 relative">
              متجرك الرقمي
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-[#ff9178]"></div>
            </h1>
          </div>
          
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="text-gray-600 text-sm sm:text-base"
          >
            العودة للرئيسية
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">تواصل معنا</h1>
        
        <div className="max-w-lg mx-auto bg-white p-4 sm:p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                الاسم
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full"
                placeholder="أدخل اسمك الكامل"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full"
                placeholder="أدخل بريدك الإلكتروني"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                الرسالة
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full min-h-[120px] sm:min-h-[150px]"
                placeholder="أدخل رسالتك هنا..."
              />
            </div>
            
            <Button type="submit" className="w-full coral-button">
              إرسال الرسالة
            </Button>
          </form>
        </div>
      </div>

      <footer className="bg-white py-6 sm:py-8 mt-12 sm:mt-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mt-6 sm:mt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} متجرك الرقمي. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
