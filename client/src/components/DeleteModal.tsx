import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function DeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Delete Lecture",
  description = "Are you sure you want to delete this lecture? This action cannot be undone and will permanently remove the lecture from the system."
}: DeleteModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-delete">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-4 mx-auto">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center" data-testid="text-modal-title">{title}</DialogTitle>
          <DialogDescription className="text-center" data-testid="text-modal-description">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-4 sm:gap-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            className="flex-1"
            data-testid="button-confirm-delete"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
