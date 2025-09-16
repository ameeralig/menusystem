import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { QRSettings } from "@/pages/QRGenerator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface QRTextControllerProps {
  settings: QRSettings;
  onSettingsChange: (key: keyof QRSettings, value: any) => void;
}

const textPositions = [
  { id: 'none', name: 'بدون نص', icon: '❌' },
  { id: 'bottom', name: 'أسفل الرمز', icon: '⬇️' },
  { id: 'top', name: 'أعلى الرمز', icon: '⬆️' },
  { id: 'left', name: 'يسار الرمز', icon: '⬅️' },
  { id: 'right', name: 'يمين الرمز', icon: '➡️' },
  { id: 'center', name: 'وسط الرمز', icon: '🎯' },
];

const QRTextController = ({ settings, onSettingsChange }: QRTextControllerProps) => {
  return (
    <div className="space-y-4">
      {/* تبديل وضع التحكم */}
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <Switch
          checked={settings.enableManualPosition || false}
          onCheckedChange={(checked) => onSettingsChange('enableManualPosition', checked)}
        />
        <Label>تحكم يدوي في الموضع</Label>
      </div>

      {/* إعدادات الموضع */}
      {settings.enableManualPosition ? (
        <div className="space-y-3">
          <Label className="text-sm font-medium">الموضع اليدوي (بكسل)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="text-x" className="text-xs">الموضع الأفقي (X)</Label>
              <Input
                id="text-x"
                type="number"
                value={settings.textX || 150}
                onChange={(e) => onSettingsChange('textX', parseInt(e.target.value))}
                min="0"
                max="400"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="text-y" className="text-xs">الموضع العمودي (Y)</Label>
              <Input
                id="text-y"
                type="number"
                value={settings.textY || 350}
                onChange={(e) => onSettingsChange('textY', parseInt(e.target.value))}
                min="0"
                max="400"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Label className="text-sm font-medium">موضع النص</Label>
          <div className="space-y-2">
            {textPositions.map((position) => (
              <Button
                key={position.id}
                variant={settings.textPosition === position.id ? "default" : "outline"}
                size="sm"
                onClick={() => onSettingsChange('textPosition', position.id)}
                className="w-full justify-start gap-2"
              >
                <span>{position.icon}</span>
                {position.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* إعدادات النص */}
      {((settings.textPosition && settings.textPosition !== 'none') || settings.enableManualPosition) && (
        <div className="space-y-4 pt-3 border-t">
          <div>
            <Label htmlFor="custom-text" className="text-sm">النص المخصص</Label>
            <Textarea
              id="custom-text"
              value={settings.customText || ''}
              onChange={(e) => onSettingsChange('customText', e.target.value)}
              placeholder="أدخل النص المراد إضافته"
              className="mt-1 min-h-[60px]"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="text-size" className="text-sm">حجم الخط</Label>
              <input
                type="range"
                id="text-size"
                min="8"
                max="48"
                value={settings.textSize || 16}
                onChange={(e) => onSettingsChange('textSize', parseInt(e.target.value))}
                className="w-full mt-1"
              />
              <div className="text-xs text-muted-foreground text-center">
                {settings.textSize || 16}px
              </div>
            </div>

            <div>
              <Label htmlFor="text-color" className="text-sm">لون النص</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  id="text-color"
                  value={settings.textColor || '#000000'}
                  onChange={(e) => onSettingsChange('textColor', e.target.value)}
                  className="w-8 h-8 rounded border"
                />
                <span className="text-xs text-muted-foreground">
                  {settings.textColor || '#000000'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="text-font" className="text-sm">نوع الخط</Label>
            <select
              id="text-font"
              value={settings.textFont || 'Arial'}
              onChange={(e) => onSettingsChange('textFont', e.target.value)}
              className="w-full mt-1 p-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Tahoma">Tahoma</option>
              <option value="Impact">Impact</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm">وزن الخط</Label>
              <select
                value={settings.textWeight || 'normal'}
                onChange={(e) => onSettingsChange('textWeight', e.target.value)}
                className="w-full mt-1 p-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="normal">عادي</option>
                <option value="bold">عريض</option>
                <option value="lighter">رفيع</option>
              </select>
            </div>

            <div>
              <Label className="text-sm">محاذاة النص</Label>
              <select
                value={settings.textAlign || 'center'}
                onChange={(e) => onSettingsChange('textAlign', e.target.value)}
                className="w-full mt-1 p-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="left">يسار</option>
                <option value="center">وسط</option>
                <option value="right">يمين</option>
              </select>
            </div>

            <div>
              <Label htmlFor="text-margin" className="text-sm">المسافة</Label>
              <input
                type="number"
                id="text-margin"
                min="0"
                max="100"
                value={settings.textMargin || 10}
                onChange={(e) => onSettingsChange('textMargin', parseInt(e.target.value))}
                className="w-full mt-1 p-2 border border-input bg-background rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRTextController;