import * as React from "react";
import { 
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Definición de los colores disponibles
const colors = [
  { name: "Azul", value: "blue", hsl: "201 96% 32%", bgClass: "bg-blue-600" },
  { name: "Verde", value: "green", hsl: "142 76% 36%", bgClass: "bg-green-600" },
  { name: "Ámbar", value: "amber", hsl: "36 100% 50%", bgClass: "bg-amber-400" },
  { name: "Rojo", value: "red", hsl: "0 84% 60%", bgClass: "bg-red-600" },
  { name: "Púrpura", value: "purple", hsl: "270 70% 40%", bgClass: "bg-purple-700" }
];

export function ColorSelector() {
  const [currentColor, setCurrentColor] = React.useState<string>("blue");

  // Al montar el componente, intenta recuperar el color guardado
  React.useEffect(() => {
    const savedColor = localStorage.getItem("appColor");
    if (savedColor) {
      setCurrentColor(savedColor);
      applyColorToRoot(savedColor);
    }
  }, []);

  // Aplica el color seleccionado al elemento root del HTML
  const applyColorToRoot = (colorValue: string) => {
    const color = colors.find(c => c.value === colorValue);
    if (color) {
      document.documentElement.style.setProperty("--primary", color.hsl);
    }
  };

  // Maneja el cambio de color
  const handleColorChange = (colorValue: string) => {
    setCurrentColor(colorValue);
    localStorage.setItem("appColor", colorValue);
    applyColorToRoot(colorValue);
  };

  return (
    <RadioGroup
      value={currentColor}
      onValueChange={handleColorChange}
      className="grid grid-cols-5 gap-4"
    >
      {colors.map(color => (
        <div key={color.value} className="flex items-center space-x-2">
          <RadioGroupItem 
            value={color.value} 
            id={`color-${color.value}`} 
            className="sr-only" 
          />
          <Label
            htmlFor={`color-${color.value}`}
            className={`h-10 w-10 cursor-pointer rounded-full flex items-center justify-center border-2 ${
              currentColor === color.value ? 'border-black dark:border-white' : 'border-transparent'
            } transition-all hover:scale-110`}
          >
            <span className={`h-7 w-7 rounded-full ${color.bgClass}`}></span>
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}