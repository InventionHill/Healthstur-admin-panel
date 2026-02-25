import * as LucideIcons from 'lucide-react';
import React from 'react';

export interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
    name?: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
    const Icon = name ? ((LucideIcons as any)[name] || LucideIcons.Activity) : LucideIcons.Activity;
    if (!Icon) return null;
    return <Icon {...props} />;
}
