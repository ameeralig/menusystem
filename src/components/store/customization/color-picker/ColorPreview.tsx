
interface ColorPreviewProps {
  hexColor: string;
  colorName: string;
}

const ColorPreview = ({ hexColor, colorName }: ColorPreviewProps) => {
  return (
    <div className="pt-4 border-t mt-4">
      <h4 className="text-sm font-medium mb-2">معاينة اللون المختار</h4>
      <div className="flex items-center space-x-reverse space-x-2">
        <div
          className="w-10 h-10 rounded-full border"
          style={{ backgroundColor: hexColor }}
        />
        <div className="text-sm">
          <div>{colorName}</div>
          <div className="text-muted-foreground">{hexColor}</div>
        </div>
      </div>
    </div>
  );
};

export default ColorPreview;
