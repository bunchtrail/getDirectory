export interface TreeNode {
    name: string;
    type: 'directory' | 'file';
    isDirectory: boolean;
    children?: TreeNode[] | 'skipped';
    isPlaceholder?: boolean;
    children_skipped?: number;
    size?: number;
}

export interface TreeMetadata {
    total_nodes: number;
    total_files: number;
    total_directories: number;
    max_depth: number;
    root: string;
    show_size: boolean;
}

export interface TreeStats {
    metadata: TreeMetadata;
    extension_stats: Record<string, number>;
    nodes: TreeNode[];
    relationships: Array<{from: string; to: string}>;
}

export interface FormatterOptions {
    showSize?: boolean;
    aiMinimalMode?: boolean;
    importantExtensions?: string[];
} 