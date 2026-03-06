import React from 'react';
import { getIconById, isIconUrl } from '../lib/icons';
import { LucideIcon } from 'lucide-react';

interface IconRendererProps {
  iconId: string | null | undefined;
  className?: string;
  size?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ iconId, className = '', size }) => {
  if (isIconUrl(iconId)) {
    return (
      <img 
        src={iconId!} 
        alt="Icon" 
        className={`object-contain ${className}`} 
        style={size ? { width: size, height: size } : { width: '100%', height: '100%' }}
        referrerPolicy="no-referrer"
      />
    );
  }

  const IconComp = getIconById(iconId) as LucideIcon;
  return <IconComp className={className} size={size || 24} />;
};
