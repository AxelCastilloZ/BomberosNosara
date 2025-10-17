import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface DangerZoneProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  isLoading?: boolean;
}

export const DangerZone: React.FC<DangerZoneProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  isLoading = false,
}) => {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-red-100 p-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-900 mb-1">
            {title}
          </h3>
          <p className="text-sm text-red-700 mb-4">
            {description}
          </p>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={onAction}
            disabled={isLoading}
          >
            {isLoading ? 'Eliminando...' : actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};