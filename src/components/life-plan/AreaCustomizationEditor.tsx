import { useState } from 'react';
import { LIFE_AREAS, AREA_HEX_COLORS, LifeArea } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, RotateCcw, Check, X, Palette } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const COLOR_PRESETS = [
  '#8b5cf6', '#7c3aed', '#6d28d9',
  '#3b82f6', '#2563eb', '#1d4ed8',
  '#ec4899', '#db2777', '#be185d',
  '#f97316', '#ea580c', '#c2410c',
  '#22c55e', '#16a34a', '#15803d',
  '#06b6d4', '#0891b2', '#0e7490',
  '#ef4444', '#dc2626', '#b91c1c',
  '#f59e0b', '#d97706', '#b45309',
];

export interface AreaConfig {
  id: LifeArea;
  label: string;
  color: string;
}

interface AreaCustomizationEditorProps {
  areas: AreaConfig[];
  onAreasChange: (areas: AreaConfig[]) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AreaCustomizationEditor({ 
  areas, 
  onAreasChange, 
  isOpen = false, 
  onOpenChange 
}: AreaCustomizationEditorProps) {
  const [editingArea, setEditingArea] = useState<LifeArea | null>(null);
  const [tempLabel, setTempLabel] = useState('');
  const [tempColor, setTempColor] = useState('');

  const handleStartEdit = (areaId: LifeArea) => {
    const area = areas.find(a => a.id === areaId);
    if (area) {
      setEditingArea(areaId);
      setTempLabel(area.label);
      setTempColor(area.color);
    }
  };

  const handleSaveEdit = () => {
    if (!editingArea) return;
    
    onAreasChange(areas.map(a => 
      a.id === editingArea 
        ? { ...a, label: tempLabel, color: tempColor }
        : a
    ));
    setEditingArea(null);
  };

  const handleCancelEdit = () => {
    setEditingArea(null);
  };

  const handleResetArea = (areaId: LifeArea) => {
    const defaultArea = LIFE_AREAS.find(a => a.id === areaId);
    const defaultColor = AREA_HEX_COLORS[areaId];
    if (defaultArea) {
      onAreasChange(areas.map(a => 
        a.id === areaId 
          ? { ...a, label: defaultArea.label, color: defaultColor }
          : a
      ));
    }
  };

  const hasCustomization = (areaId: LifeArea) => {
    const area = areas.find(a => a.id === areaId);
    const defaultArea = LIFE_AREAS.find(a => a.id === areaId);
    const defaultColor = AREA_HEX_COLORS[areaId];
    return area?.label !== defaultArea?.label || area?.color !== defaultColor;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" type="button" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Personalizar Áreas (nome e cor)
          </span>
          <span className="text-xs text-muted-foreground">
            {isOpen ? 'Fechar' : 'Expandir'}
          </span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-2">
        {areas.map((area) => {
          const isEditing = editingArea === area.id;
          const isCustomized = hasCustomization(area.id);
          const defaultArea = LIFE_AREAS.find(a => a.id === area.id);

          return (
            <div key={area.id} className="border rounded-lg p-3">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: tempColor }} />
                    <span className="text-sm font-medium">Editando: {defaultArea?.label}</span>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Nome da área</Label>
                    <Input
                      value={tempLabel}
                      onChange={(e) => setTempLabel(e.target.value)}
                      placeholder={defaultArea?.label}
                      maxLength={30}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Cor</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={tempColor}
                        onChange={(e) => setTempColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0"
                      />
                      <div className="flex flex-wrap gap-1">
                        {COLOR_PRESETS.slice(0, 12).map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setTempColor(color)}
                            className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${tempColor === color ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" type="button" onClick={handleSaveEdit}>
                      <Check className="w-3 h-3 mr-1" />
                      Salvar
                    </Button>
                    <Button size="sm" variant="ghost" type="button" onClick={handleCancelEdit}>
                      <X className="w-3 h-3 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: area.color }} />
                    <div>
                      <p className="font-medium text-sm">{area.label}</p>
                      {isCustomized && (
                        <p className="text-xs text-muted-foreground">Personalizado</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" type="button" onClick={() => handleStartEdit(area.id)}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    {isCustomized && (
                      <Button size="sm" variant="ghost" type="button" onClick={() => handleResetArea(area.id)}>
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
