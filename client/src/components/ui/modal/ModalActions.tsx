import { Button } from "@/components/ui/button";

interface ModalActionsProps {
  mode: 'view' | 'edit' | 'add';
  onClose: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
  isSaving?: boolean;
  isDeleting?: boolean;
}

const ModalActions = ({ 
  mode, 
  onClose, 
  onSave, 
  onDelete,
  isLoading = false,
  isSaving = false,
  isDeleting = false
}: ModalActionsProps) => {
  if (mode === 'view') {
    return (
      <div className="flex justify-between items-center">
        <div>
          {onDelete && (
            <Button 
              variant="destructive" 
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onClose} disabled={isSaving}>
        Cancel
      </Button>
      <Button onClick={onSave} disabled={isSaving || isLoading}>
        {isSaving ? "Saving..." : mode === 'add' ? "Add Item" : "Save Changes"}
      </Button>
    </div>
  );
};

export default ModalActions;
