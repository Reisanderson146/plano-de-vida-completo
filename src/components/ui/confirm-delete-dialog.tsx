import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => void;
  destructive?: boolean;
}

export function ConfirmDeleteDialog({
  trigger,
  title,
  description,
  confirmText,
  onConfirm,
  destructive = true,
}: ConfirmDeleteDialogProps) {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  const isMatch = inputValue.trim().toLowerCase() === confirmText.trim().toLowerCase();

  const handleConfirm = () => {
    if (isMatch) {
      onConfirm();
      setOpen(false);
      setInputValue('');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setInputValue('');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="mx-4 sm:mx-auto max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3 py-4">
          <Label htmlFor="confirm-input" className="text-sm text-muted-foreground">
            Digite <span className="font-semibold text-foreground">"{confirmText}"</span> para confirmar:
          </Label>
          <Input
            id="confirm-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={confirmText}
            className="rounded-xl"
            autoComplete="off"
          />
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto rounded-xl">
            Cancelar
          </AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            disabled={!isMatch}
            variant={destructive ? "destructive" : "default"}
            className="w-full sm:w-auto rounded-xl"
          >
            Excluir Permanentemente
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
