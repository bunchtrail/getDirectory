export interface TreeOptions {
    excludePatterns: string[];
    maxDepth: number;
    showFiles: boolean;
    showSize: boolean;
}

export interface TreeNode {
    name: string;
    path: string;
    size?: number;
    isDirectory: boolean;
    children?: TreeNode[];
}

export interface ITreeGenerator {
    generateTree(rootPath: string, options: TreeOptions): TreeNode;
} 