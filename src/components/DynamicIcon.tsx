import * as LucideIcons from 'lucide-react';
import React from 'react';

export interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
    name?: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
    const iconMap: Record<string, string> = {
        'business': 'Briefcase',
        'employee': 'UserRound',
        'emplooy': 'UserRound', // Handling user typo
        'buciness': 'Briefcase', // Handling user typo
    };

    const lookupName = name ? (iconMap[name.toLowerCase()] || name) : null;
    const Icon = lookupName ? ((LucideIcons as any)[lookupName] || LucideIcons.Activity) : LucideIcons.Activity;

    if (!Icon) return null;
    return <Icon {...props} />;
}
