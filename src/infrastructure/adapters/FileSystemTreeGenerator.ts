import * as fs from 'fs';
import * as minimatch from 'minimatch';
import * as path from 'path';
import { TreeNode } from '../../domain/entities/TreeNode';
import { ITreeGenerator } from '../../domain/ports/ITreeGenerator';
import { TreeOptions } from '../../domain/valueObjects/TreeOptions';

export class FileSystemTreeGenerator implements ITreeGenerator {
    private readonly DEFAULT_MAX_CHILDREN = 50;
    private readonly DEFAULT_MAX_DEPTH = 5;

    async generateTree(rootPath: string, options: TreeOptions): Promise<TreeNode> {
        return this.generateTreeNode(rootPath, options, 0);
    }

    private shouldExclude(childPath: string, childName: string, options: TreeOptions): boolean {
        const relativePath = path.relative(process.cwd(), childPath);
        
        return options.excludePatterns.some(pattern => {
            if (childName === pattern || childName.toLowerCase() === pattern.toLowerCase()) {
                return true;
            }
            
            if (pattern.includes('*')) {
                return minimatch.default(relativePath, pattern, { dot: true, matchBase: true }) ||
                       minimatch.default(childName, pattern, { dot: true, matchBase: true });
            }
            
            if (pattern.includes('**')) {
                return minimatch.default(relativePath, pattern, { dot: true });
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

        const node: TreeNode = {
            name,
            path: nodePath,
            isDirectory: stats.isDirectory(),
        };

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
                });

                if (this.shouldCollapse(currentDepth, filteredChildren.length, options)) {
                    node.isPlaceholder = true;
                    node.children_skipped = filteredChildren.length;
                    node.children = "skipped";
                } else {
                    node.children = filteredChildren
                        .map(child => this.generateTreeNode(
                            path.join(nodePath, child),
                            options,
                            currentDepth + 1
                        ));
                }
            } catch (error) {
                console.error(`Error reading directory ${nodePath}:`, error);
            }
        }

        return node;
    }
} 