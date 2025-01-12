export interface TreeNode {
    name: string;
    path: string;
    isDirectory: boolean;
    isPlaceholder?: boolean;
    children_skipped?: number;
    children?: TreeNode[] | "skipped";
}

export interface ProjectStructure {
    name: string;
    structure: DirectoryNode;
}

export interface BaseNode {
    type: 'file' | 'directory';
    name: string;
    path: string;
}

export interface FileNode extends BaseNode {
    type: 'file';
}

export interface DirectoryNode extends BaseNode {
    type: 'directory';
    children: Array<FileNode | DirectoryNode>;
} 