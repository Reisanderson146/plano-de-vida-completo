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

// Expanded color palette with many more options
const COLOR_PRESETS = [
  // Reds
  '#ef4444', '#dc2626', '#b91c1c', '#f87171', '#fca5a5',
  // Oranges
  '#f97316', '#ea580c', '#c2410c', '#fb923c', '#fdba74',
  // Yellows
  '#eab308', '#ca8a04', '#a16207', '#facc15', '#fde047',
  // Limes
  '#84cc16', '#65a30d', '#4d7c0f', '#a3e635', '#bef264',
  // Greens
  '#22c55e', '#16a34a', '#15803d', '#4ade80', '#86efac',
  // Teals
  '#14b8a6', '#0d9488', '#0f766e', '#2dd4bf', '#5eead4',
  // Cyans
  '#06b6d4', '#0891b2', '#0e7490', '#22d3ee', '#67e8f9',
  // Blues
  '#3b82f6', '#2563eb', '#1d4ed8', '#60a5fa', '#93c5fd',
  // Indigos
  '#6366f1', '#4f46e5', '#4338ca', '#818cf8', '#a5b4fc',
  // Purples
  '#8b5cf6', '#7c3aed', '#6d28d9', '#a78bfa', '#c4b5fd',
  // Pinks
  '#ec4899', '#db2777', '#be185d', '#f472b6', '#f9a8d4',
  // Roses
  '#f43f5e', '#e11d48', '#be123c', '#fb7185', '#fda4af',
  // Grays
  '#64748b', '#475569', '#334155', '#94a3b8', '#cbd5e1',
  // Browns
  '#92400e', '#78350f', '#a16207', '#d97706', '#f59e0b',
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
                    <div className="flex items-start gap-3 mt-1">
                      <input
                        type="color"
                        value={tempColor}
                        onChange={(e) => setTempColor(e.target.value)}
                        className="w-12 h-12 rounded cursor-pointer border-0 flex-shrink-0"
                      />
                      <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto p-1">
                        {COLOR_PRESETS.map((color, idx) => (
                          <button
                            key={`${color}-${idx}`}
                            type="button"
                            onClick={() => setTempColor(color)}
                            className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${tempColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:ring-1 hover:ring-primary/50'}`}
                            style={{ backgroundColor: color }}
                            title={color}
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
