export interface RectangleItem {
    type?: 'text' | 'icon';
    value: string;
    color?: string;
    size?: string;
    bold?: boolean;
}

export interface RectangleConfig {
    text: string;
    subtext?: string;
    color?: string; // legacy base color
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    icon?: string;
    width?: number;
    height?: number;
    animate?: boolean;
    items?: RectangleItem[];
}
