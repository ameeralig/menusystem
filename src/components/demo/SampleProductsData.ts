
import { Product } from "@/types/product";

// Sample products data
export const sampleProducts: Product[] = [
  {
    id: "1",
    name: "ريزو",
    description: "أرز على الطريقة الإيطالية مع الزعفران والخضروات الطازجة",
    price: 12000,
    image_url: "/lovable-uploads/risotto.png",
    category: "الأطباق الرئيسية",
    is_new: true,
    is_popular: true
  },
  {
    id: "2",
    name: "كنتاكي",
    description: "دجاج مقلي مقرمش مع توابل خاصة وصوص سري",
    price: 18000,
    image_url: "/lovable-uploads/fried-chicken.png",
    category: "الأطباق الرئيسية",
    is_new: false,
    is_popular: true
  },
  {
    id: "3",
    name: "برجر",
    description: "برجر لحم مشوي مع جبنة ذائبة وخضروات طازجة",
    price: 15000,
    image_url: "/lovable-uploads/burger.png",
    category: "الأطباق الرئيسية",
    is_new: true,
    is_popular: false
  },
  {
    id: "4",
    name: "أجنحة مقرمشة",
    description: "أجنحة دجاج مقلية مع صوص حار خاص",
    price: 14000,
    image_url: "/lovable-uploads/spicy-wings.png",
    category: "المقبلات الحارة",
    is_new: false,
    is_popular: true
  },
  {
    id: "5",
    name: "كبة حلبية",
    description: "كبة مقلية محشوة باللحم والصنوبر على الطريقة الحلبية",
    price: 12000,
    image_url: "/lovable-uploads/kibbeh.png",
    category: "المقبلات الحارة",
    is_new: true,
    is_popular: false
  },
  {
    id: "6",
    name: "بطاطا حارة",
    description: "بطاطا مقلية مع توابل حارة وصوص خاص",
    price: 8000,
    image_url: "/lovable-uploads/spicy-fries.png",
    category: "المقبلات الحارة",
    is_new: false,
    is_popular: false
  },
  {
    id: "7",
    name: "بيتزا",
    description: "بيتزا إيطالية أصلية مع صلصة طماطم وجبن موزاريلا",
    price: 20000,
    image_url: "/lovable-uploads/pizza.png",
    category: "الأطباق الرئيسية",
    is_new: true,
    is_popular: true
  },
  {
    id: "8",
    name: "جوانح بوفالو",
    description: "أجنحة دجاج متبلة بصوص البوفالو الحار",
    price: 16000,
    image_url: "/lovable-uploads/buffalo-wings.png",
    category: "المقبلات الحارة",
    is_new: false,
    is_popular: true
  }
];

