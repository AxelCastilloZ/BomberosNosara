export type DonationType = 'recursos' | 'monetaria';

export interface DonationCardProps {
  type: DonationType;
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  onButtonClick: () => void;
  benefits?: string[];
  highlighted?: boolean;
}

export interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}
