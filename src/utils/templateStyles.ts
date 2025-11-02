import { templates } from "@/components/store/customization/TemplateSelector";

export const getTemplateStyles = (templateId: string = "default") => {
  const template = templates.find(t => t.id === templateId) || templates[0];
  return template.style;
};
