import { TreeNode } from '../entities/TreeNode';
import { TreeOptions } from '../valueObjects/TreeOptions';

export interface ITreeGenerator {
    generateTree(rootPath: string, options: TreeOptions): Promise<TreeNode>;
} 