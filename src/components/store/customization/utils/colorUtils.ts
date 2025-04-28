
export const getContrastColor = (hexColor: string): string => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  return (yiq >= 128) ? '#000000' : '#ffffff';
};

export const getColorName = (hexColor: string, selectedTheme: string): string => {
  const theme = colorThemes.find(theme => theme.value === selectedTheme);
  if (theme) {
    return theme.name;
  }
  
  const themeByHex = colorThemes.find(theme => theme.hex.toLowerCase() === hexColor.toLowerCase());
  if (themeByHex) {
    return themeByHex.name;
  }
  
  return "لون مخصص";
};
