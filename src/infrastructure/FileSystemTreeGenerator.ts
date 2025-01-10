import * as fs from 'fs';
import * as path from 'path';
import { ITreeGenerator, TreeNode, TreeOptions } from '../domain/interfaces/ITreeGenerator';

export class FileSystemTreeGenerator implements ITreeGenerator {
    generateTree(rootPath: string, options: TreeOptions): TreeNode {
        return this.generateTreeNode(rootPath, options, 0);
    }

    private generateTreeNode(nodePath: string, options: TreeOptions, currentDepth: number): TreeNode {
        const stats = fs.statSync(nodePath);
        const name = path.basename(nodePath);

        if (options.maxDepth !== -1 && currentDepth > options.maxDepth) {
            return {
                name,
                path: nodePath,
                isDirectory: stats.isDirectory(),
                size: options.showSize ? stats.size : undefined
            };
        }

        const node: TreeNode = {
            name,
            path: nodePath,
            isDirectory: stats.isDirectory(),
            size: options.showSize ? stats.size : undefined
        };

        if (stats.isDirectory()) {
            try {
                const children = fs.readdirSync(nodePath)
                    .filter(child => {
                        const childPath = path.join(nodePath, child);
                        const isExcluded = options.excludePatterns.some(pattern => 
                            childPath.includes(pattern) || child === pattern
                        );
                        if (!options.showFiles && !fs.statSync(childPath).isDirectory()) {
                            return false;
                        }
                        return !isExcluded;
                    })
                    .map(child => this.generateTreeNode(
                        path.join(nodePath, child),
                        options,
                        currentDepth + 1
                    ));

                node.children = children;
            } catch (error) {
                console.error(`Error reading directory ${nodePath}:`, error);
            }
        }

        return node;
    }
} 