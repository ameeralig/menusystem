import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  style: {
    cardStyle: string;
    headerStyle: string;
    productCardStyle: string;
    categoryStyle: string;
  };
}

interface TemplateSelectorProps {
  currentTemplate: string;
  setCurrentTemplate: (template: string) => void;
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
}

const templates: Template[] = [
  {
    id: "default",
    name: "الافتراضي",
    description: "التصميم الكلاسيكي مع تأثيرات بسيطة",
    preview: "bg-gradient-to-br from-gray-50 to-gray-100",
    style: {
      cardStyle: "rounded-xl shadow-md hover:shadow-lg transition-all duration-300",
      headerStyle: "text-3xl md:text-4xl font-bold mb-8",
      productCardStyle: "bg-white rounded-xl shadow-sm hover:shadow-md",
      categoryStyle: "text-xl font-semibold mb-4"
    }
  },
  {
    id: "modern",
    name: "عصري",
    description: "تصميم حديث مع ظلال قوية وتأثيرات متقدمة",
    preview: "bg-gradient-to-br from-blue-50 to-indigo-100",
    style: {
      cardStyle: "rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-2 border-transparent hover:border-primary/20",
      headerStyle: "text-4xl md:text-5xl font-extrabold mb-10 drop-shadow-lg",
      productCardStyle: "bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1",
      categoryStyle: "text-2xl font-bold mb-6 tracking-wide"
    }
  },
  {
    id: "minimal",
    name: "بسيط",
    description: "تصميم نظيف وبسيط مع مساحات كبيرة",
    preview: "bg-gradient-to-br from-white to-gray-50",
    style: {
      cardStyle: "rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100",
      headerStyle: "text-2xl md:text-3xl font-medium mb-6 tracking-tight",
      productCardStyle: "bg-white rounded-lg shadow-sm hover:shadow border border-gray-50",
      categoryStyle: "text-lg font-medium mb-3 text-gray-700"
    }
  },
  {
    id: "elegant",
    name: "أنيق",
    description: "تصميم فاخر مع تدرجات ناعمة",
    preview: "bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50",
    style: {
      cardStyle: "rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 backdrop-blur-sm bg-white/90 border border-white/50",
      headerStyle: "text-4xl md:text-5xl font-bold mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent",
      productCardStyle: "bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl backdrop-blur-sm",
      categoryStyle: "text-2xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
    }
  },
  {
    id: "bold",
    name: "جريء",
    description: "تصميم قوي مع ألوان زاهية وتباين عالي",
    preview: "bg-gradient-to-br from-orange-50 to-red-100",
    style: {
      cardStyle: "rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 border-primary/10 hover:border-primary/30 transform hover:scale-[1.01]",
      headerStyle: "text-4xl md:text-6xl font-black mb-10 uppercase tracking-wider drop-shadow-2xl",
      productCardStyle: "bg-white rounded-2xl shadow-xl hover:shadow-2xl border-l-4 border-primary",
      categoryStyle: "text-3xl font-black mb-8 uppercase tracking-wide"
    }
  },
  {
    id: "soft",
    name: "ناعم",
    description: "تصميم هادئ مع انتقالات سلسة",
    preview: "bg-gradient-to-br from-teal-50 to-cyan-50",
    style: {
      cardStyle: "rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 bg-white/80 backdrop-blur-md",
      headerStyle: "text-3xl md:text-4xl font-semibold mb-8 text-gray-700",
      productCardStyle: "bg-white/70 backdrop-blur-sm rounded-3xl shadow-md hover:shadow-lg",
      categoryStyle: "text-xl font-semibold mb-5 text-gray-600"
    }
  }
];

const TemplateSelector = ({
  currentTemplate,
  setCurrentTemplate,
  handleSubmit,
  isLoading
}: TemplateSelectorProps) => {
  const handleTemplateSelect = async (templateId: string) => {
    setCurrentTemplate(templateId);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        اختر القالب المناسب لمتجرك - سيتم تطبيق التصميم على صفحة المعاينة
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleTemplateSelect(template.id)}
            className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
              currentTemplate === template.id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-gray-200 hover:border-primary/50 hover:shadow-sm"
            }`}
          >
            {currentTemplate === template.id && (
              <div className="absolute top-2 left-2 bg-primary text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
            
            <div className={`w-full h-24 ${template.preview} rounded-lg mb-3 flex items-center justify-center`}>
              <span className="text-xs text-gray-500 font-medium">معاينة</span>
            </div>
            
            <h4 className="font-semibold text-right mb-1">{template.name}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-right">
              {template.description}
            </p>
          </div>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full mt-4"
        disabled={isLoading}
      >
        {isLoading ? "جاري الحفظ..." : "حفظ القالب"}
      </Button>
    </div>
  );
};

export default TemplateSelector;
export { templates };
export type { Template };
