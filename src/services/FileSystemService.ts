import * as fs from 'fs';
import { minimatch } from 'minimatch';
import * as path from 'path';
import { ITreeGenerator, TreeNode, TreeOptions } from '../domain/interfaces/ITreeGenerator';

export class FileSystemTreeGenerator implements ITreeGenerator {
    private readonly DEFAULT_MAX_CHILDREN = 50;
    private readonly DEFAULT_MAX_DEPTH = 5;

    generateTree(rootPath: string, options: TreeOptions): TreeNode {
        return this.generateTreeNode(rootPath, options, 0);
    }

    private shouldExclude(childPath: string, childName: string, options: TreeOptions): boolean {
        const relativePath = path.relative(process.cwd(), childPath);
        
        return options.excludePatterns.some(pattern => {
            if (childName === pattern || childName.toLowerCase() === pattern.toLowerCase()) {
                return true;
            }
            
            if (pattern.includes('*')) {
                return minimatch(relativePath, pattern, { dot: true, matchBase: true }) ||
                       minimatch(childName, pattern, { dot: true, matchBase: true });
            }
            
            if (pattern.includes('**')) {
                return minimatch(relativePath, pattern, { dot: true });
            }
            
            return false;
        });
    }

    private shouldCollapse(currentDepth: number, childrenCount: number, options: TreeOptions): boolean {
        if (!options.aiMinimalMode) {
            return false;
        }

        const maxDepth = options.maxDepthBeforeCollapse ?? this.DEFAULT_MAX_DEPTH;
        const maxChildren = options.maxChildrenCount ?? this.DEFAULT_MAX_CHILDREN;

        return currentDepth > maxDepth || childrenCount > maxChildren;
    }

    private generateTreeNode(nodePath: string, options: TreeOptions, currentDepth: number): TreeNode {
        const stats = fs.statSync(nodePath);
        const name = path.basename(nodePath);

        // Базовый узел
        const node: TreeNode = {
            name,
            path: nodePath,
            isDirectory: stats.isDirectory(),
            size: options.showSize ? stats.size : undefined
        };

        // Проверяем максимальную глубину из опций
        if (options.maxDepth !== -1 && currentDepth > options.maxDepth) {
            return node;
        }

        if (stats.isDirectory()) {
            try {
                const allChildren = fs.readdirSync(nodePath);
                const filteredChildren = allChildren.filter(child => {
                    const childPath = path.join(nodePath, child);
                    
                    if (!options.showFiles && !fs.statSync(childPath).isDirectory()) {
                        return false;
                    }

                    return !this.shouldExclude(childPath, child, options);
  