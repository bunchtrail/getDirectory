import { FormatterOptions, TreeMetadata, TreeNode, TreeStats } from '../types';

export class TreeFormatter {
    private options: FormatterOptions;

    constructor(options: FormatterOptions = {}) {
        this.options = {
            showSize: false,
            aiMinimalMode: false,
            importantExtensions: ['.ts', '.js', '.json'],
            ...options
        };
    }

    public formatTreeForAI(node: TreeNode): TreeStats {
        if (this.options.aiMinimalMode) {
            return {
                metadata: this.collectMetadata(node),
                extension_stats: {},
                nodes: [this.buildMinimalTree(node)],
                relationships: []
            };
        }

        const stats = this.collectStats(node);
        return {
            metadata: this.collectMetadata(node),
            extension_stats: stats.extensionStats,
            nodes: [node],
            relationships: this.buildRelationships(node)
        };
    }

    public formatTreeForHuman(node: TreeNode, prefix: string = ''): string {
        if (node.isPlaceholder) {
            return `${prefix}... (${node.children_skipped} items skipped)`;
        }

        const icon = node.isDirectory ? '📁' : '📄';
        let result = `${prefix}${icon} ${node.name}`;
        
        if (this.options.showSize && !node.isDirectory && node.size !== undefined) {
            result += ` (${this.formatSize(node.size)})`;
        }

        if (node.children && Array.isArray(node.children)) {
            result += '\n';
            const childPrefix = prefix + '│   ';
            node.children.forEach((child, index) => {
                if (index === node.children!.length - 1) {
                    result += this.formatTreeForHuman(child, prefix + '└── ');
                } else {
                    result += this.formatTreeForHuman(child, prefix + '├── ');
                }
                if (index < node.children!.length - 1) {
                    result += '\n';
                }
            });
        }

        return result;
    }

    private buildMinimalTree(node: TreeNode): TreeNode {
        if (!node.isDirectory) {
            return {
                name: node.name,
                type: 'file',
                isDirectory: false
            };
        }

        if (node.children && Array.isArray(node.children) && node.children.length > 10) {
            return {
                name: node.name,
                type: 'directory',
                isDirectory: true,
                children: 'skipped',
                children_skipped: node.children.length
            };
        }

        return {
            name: node.name,
            type: 'directory',
            isDirectory: true,
            children: node.children && Array.isArray(node.children) 
                ? node.children.map(child => this.buildMinimalTree(child))
                : undefined
        };
    }

    private collectStats(node: TreeNode): { extensionStats: Record<string, number> } {
        const extensionStats: Record<string, number> = {};

        const processNode = (n: TreeNode) => {
            if (!n.isDirectory) {
                const ext = this.getFileExtension(n.name);
                extensionStats[ext] = (extensionStats[ext] || 0) + 1;
            }

            if (n.children && Array.isArray(n.children)) {
                n.children.forEach(processNode);
            }
        };

        processNode(node);
        return { extensionStats };
    }

    private collectMetadata(node: TreeNode): TreeMetadata {
        let totalNodes = 0;
        let totalFiles = 0;
        let totalDirectories = 0;
        let maxDepth = 0;

        const processNode = (n: TreeNode, depth: number) => {
            totalNodes++;
            if (n.isDirectory) {
                totalDirectories++;
            } else {
                totalFiles++;
            }
            maxDepth = Math.max(maxDepth, depth);

            if (n.children && Array.isArray(n.children)) {
                n.children.forEach(child => processNode(child, depth + 1));
            }
        };

        processNode(node, 0);

        return {
            total_nodes: totalNodes,
            total_files: totalFiles,
            total_directories: totalDirectories,
            max_depth: maxDepth,
            root: node.name,
            show_size: this.options.showSize || false
        };
    }

    private buildRelationships(node: TreeNode): Array<{from: string; to: string}> {
        const relationships: Array<{from: string; to: string}> = [];

        const processNode = (n: TreeNode, parent?: string) => {
            if (parent) {
                relationships.push({ from: parent, to: n.name });
            }

            if (n.children && Array.isArray(n.children)) {
                n.children.forEach(child => processNode(child, n.name));
            }
        };

        processNode(node);
        return relationships;
    }

    private getFileExtension(filename: string): string {
        const ext = filename.split('.').pop();
        return ext ? `.${ext}` : 'no-extension';
    }

    private formatSize(size: number): string {
        const units = ['B', 'KB', 'MB', 'GB'];
        let unitIndex = 0;
        let value = size;

        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex++;
        }

        return `${Math.round(value * 100) / 100} ${units[unitIndex]}`;
    }
} 