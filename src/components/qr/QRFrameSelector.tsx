import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { QRSettings } from "@/pages/QRGenerator";

interface QRFrameSelectorProps {
  settings: QRSettings;
  onSettingsChange: (key: keyof QRSettings, value: any) => void;
}

const frameTypes = [
  { id: 'none', name: 'بدون إطار', preview: '◌' },
  { id: 'simple', name: 'إطار بسيط', preview: '▢' },
  { id: 'rounded', name: 'إطار مستدير', preview: '⬚' },
  { id: 'double', name: 'إطار مزدوج', preview: '◎' },
];

const QRFrameSelector = ({ settings, onSettingsChange }: QRFrameSelectorProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">نوع الإطار</Label>
      <div className="grid grid-cols-2 gap-3">
        {frameTypes.map((frame) => (
          <Card 
            key={frame.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              settings.frameType === frame.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onSettingsChange('frameType', frame.id)}
          >
            <CardContent className="p-3 text-center">
              <div className="text-2xl mb-1">{frame.preview}</div>
              <div className="text-xs font-medium">{frame.name}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* خيارات الإطار المتقدمة */}
      {settings.frameType && settings.frameType !== 'none' && (
        <div className="space-y-3 pt-3 border-t">
          <div>
            <Label htmlFor="frame-color" className="text-sm">لون الإطار</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                id="frame-color"
                value={settings.frameColor || '#000000'}
                onChange={(e) => onSettingsChange('frameColor', e.target.value)}
                className="w-10 h-8 rounded border"
              />
              <span className="text-xs text-muted-foreground">
                {settings.frameColor || '#000000'}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="frame-width" className="text-sm">سمك الإطار</Label>
            <input
              type="range"
              id="frame-width"
              min="1"
              max="20"
              value={settings.frameWidth || 4}
              onChange={(e) => onSettingsChange('frameWidth', parseInt(e.target.value))}
              className="w-full mt-1"
            />
            <div className="text-xs text-muted-foreground text-center">
              {settings.frameWidth || 4} بكسل
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRFrameSelector;