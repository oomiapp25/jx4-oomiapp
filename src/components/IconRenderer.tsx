import React from 'react';
import { getIconById, isIconUrl } from '../lib/icons';
import { LucideIcon } from 'lucide-react';

interface IconRendererProps {
  iconId: string | null | undefined;
  className?: string;
  size?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ iconId, className = '', size = 24 }) => {
  if (isIconUrl(iconId)) {
    return (
      <img 
        src={iconId!} 
        alt="Icon" 
        className={`object-contain ${className}`} 
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    );
  }

  const IconComp = getIconById(iconId) as LucideIcon;
  return <IconComp className={className} size={size} />;
};
