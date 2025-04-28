
import { motion } from "framer-motion";
import { colorThemes } from "./colorThemes";
import { getContrastColor } from "../utils/colorUtils";

interface ColorPaletteProps {
  colorTheme: string;
  onColorChange: (value: string) => void;
}

const ColorPalette = ({ colorTheme, onColorChange }: ColorPaletteProps) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">الألوان الأساسية</h4>
      <div className="grid grid-cols-5 gap-2">
        {colorThemes.map((theme) => (
          <motion.button
            key={theme.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-full h-12 rounded-md cursor-pointer border-2 flex items-center justify-center ${
              colorTheme === theme.value ? 'border-[#ff9178]' : 'border-transparent'
            }`}
            style={{
              background: theme.hex,
              color: theme.id === "default" ? '#fff' : getContrastColor(theme.hex)
            }}
            onClick={() => onColorChange(theme.value)}
            title={theme.name}
          >
            {colorTheme === theme.value && (
              <div className="text-xs font-bold">{theme.name}</div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;
