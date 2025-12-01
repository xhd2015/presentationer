export interface CRNode {
    id: string;
    text: string;
    subtext?: string;
    icon?: string;
    color?: string; // 'red', 'blue', 'yellow'
    isPulse?: boolean;
}

export interface CREdge {
    from: string;
    to: string;
    label?: string;
}

export interface ConnectedRectanglesConfig {
    layout?: 'row' | 'column';
    gap?: number;
    nodes: CRNode[];
    edges?: CREdge[];
}

