import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { QrCode, ArrowLeft, Download, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import QRColorController from "@/components/qr/QRColorController";
import QRLogoUploader from "@/components/qr/QRLogoUploader";
import QRPreview from "@/components/qr/QRPreview";
import QRShapeController from "@/components/qr/QRShapeController";
import QRAdvancedColorController from "@/components/qr/QRAdvancedColorController";
import QRTemplateSelector from "@/components/qr/QRTemplateSelector";
import QRFrameSelector from "@/components/qr/QRFrameSelector";
import QRTextController from "@/components/qr/QRTextController";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface QRSettings {
  foregroundColor: string;
  backgroundColor: string;
  logoFile: File | null;
  logoSize: number;
  text: string;
  size: number;
  errorLevel: 'L' | 'M' | 'Q' | 'H';
  // أشكال الأجزاء
  dotsType?: string;
  cornerSquareType?: string;
  cornerDotType?: string;
  // ألوان متقدمة
  dotsColor?: string;
  cornerSquareColor?: string;
  cornerDotColor?: string;
  // إعدادات الإطار
  frameType?: string;
  frameColor?: string;
  frameWidth?: number;
  // إعدادات النص
  textPosition?: string;
  customText?: string;
  textSize?: number;
  textColor?: string;
  textFont?: string;
  textWeight?: string;
  textAlign?: string;
  textMargin?: number;
}

const QRGenerator = () => {
  const [qrSettings, setQRSettings] = useState<QRSettings>({
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    logoFile: null,
    logoSize: 20,
    text: 'https://example.com',
    size: 300,
    errorLevel: 'M',
    // أشكال الأجزاء
    dotsType: 'square',
    cornerSquareType: 'square',
    cornerDotType: 'square',
    // ألوان متقدمة
    dotsColor: '#000000',
    cornerSquareColor: '#000000',
    cornerDotColor: '#000000',
    // إعدادات الإطار
    frameType: 'none',
    frameColor: '#000000',
    frameWidth: 4,
    // إعدادات النص
    textPosition: 'none',
    customText: '',
    textSize: 16,
    textColor: '#000000',
    textFont: 'Arial',
    textWeight: 'normal',
    textAlign: 'center',
    textMargin: 10
  });

  // حالات طي الأقسام
  const [openSections, setOpenSections] = useState({
    content: false,
    templates: false,
    shapes: false,
    colors: false,
    logo: false,
    frame: false,
    text: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSettingsChange = useCallback((key: keyof QRSettings, value: any) => {
    setQRSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleApplyTemplate = useCallback((template: Partial<QRSettings>) => {
    setQRSettings(prev => ({
      ...prev,
      ...template
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 me-2" />
              العودة
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <QrCode className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">مولد رمز QR المتقدم</h1>
              <p className="text-muted-foreground">اصنع رمز QR مخصص بالألوان واللوجو الخاص بك</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* إعدادات التحكم */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3"
          >
            {/* النص المراد تحويله */}
            <Collapsible open={openSections.content} onOpenChange={() => toggleSection('content')}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      محتوى الرمز
                      {openSections.content ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="qr-text">النص أو الرابط</Label>
                      <Input
                        id="qr-text"
                        value={qrSettings.text}
                        onChange={(e) => handleSettingsChange('text', e.target.value)}
                        placeholder="أدخل النص أو الرابط المراد تحويله"
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="qr-size">حجم الرمز</Label>
                        <Input
                          id="qr-size"
                          type="number"
                          min="200"
                          max="800"
                          value={qrSettings.size}
                          onChange={(e) => handleSettingsChange('size', parseInt(e.target.value))}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="error-level">مستوى تصحيح الأخطاء</Label>
                        <select
                          id="error-level"
                          value={qrSettings.errorLevel}
                          onChange={(e) => handleSettingsChange('errorLevel', e.target.value as 'L' | 'M' | 'Q' | 'H')}
                          className="mt-2 w-full p-2 border border-input bg-background rounded-md text-sm"
                        >
                          <option value="L">منخفض (7%)</option>
                          <option value="M">متوسط (15%)</option>
                          <option value="Q">عالي (25%)</option>
                          <option value="H">عالي جداً (30%)</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Separator className="my-2" />

            {/* القوالب الجاهزة */}
            <Collapsible open={openSections.templates} onOpenChange={() => toggleSection('templates')}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      القوالب الجاهزة
                      {openSections.templates ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <QRTemplateSelector onApplyTemplate={handleApplyTemplate} />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Separator className="my-2" />

            {/* أشكال الأجزاء */}
            <Collapsible open={openSections.shapes} onOpenChange={() => toggleSection('shapes')}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      أشكال الأجزاء
                      {openSections.shapes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <QRShapeController
                      settings={qrSettings}
                      onSettingsChange={handleSettingsChange}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Separator className="my-2" />

            {/* تحكم متقدم في الألوان */}
            <Collapsible open={openSections.colors} onOpenChange={() => toggleSection('colors')}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      تحكم متقدم في الألوان
                      {openSections.colors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <QRAdvancedColorController
                      settings={qrSettings}
                      onSettingsChange={handleSettingsChange}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Separator className="my-1" />

            {/* إطارات الرمز */}
            <Collapsible open={openSections.frame} onOpenChange={() => toggleSection('frame')}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      إطارات الرمز
                      {openSections.frame ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <QRFrameSelector
                      settings={qrSettings}
                      onSettingsChange={handleSettingsChange}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Separator className="my-1" />

            {/* النص المخصص */}
            <Collapsible open={openSections.text} onOpenChange={() => toggleSection('text')}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      النص المخصص
                      {openSections.text ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <QRTextController
                      settings={qrSettings}
                      onSettingsChange={handleSettingsChange}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Separator className="my-1" />

            {/* رفع اللوجو */}
            <Collapsible open={openSections.logo} onOpenChange={() => toggleSection('logo')}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      إضافة لوجو
                      {openSections.logo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <QRLogoUploader
                      settings={qrSettings}
                      onSettingsChange={handleSettingsChange}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </motion.div>

          {/* معاينة وتحميل */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <QRPreview settings={qrSettings} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;