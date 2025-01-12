import { DirectoryNode, FileNode, ProjectStructure, TreeNode } from '../../domain/entities/TreeNode';

export class TreeFormatterService {
    formatForAI(node: TreeNode): string {
        const projectStructure = this.convertToProjectStructure(node);
        return JSON.stringify(projectStructure, null, 2);
    }

    private convertToProjectStructure(node: TreeNode): ProjectStructure {
        return {
            name: node.name,
            structure: this.buildStructureTree(node)
        };
    }

    private buildStructureTree(node: TreeNode): DirectoryNode {
        const base = {
            type: 'directory' as const,
            name: node.name,
            path: node.path
        };

        if (node.isPlaceholder) {
            return {
                ...base,
                children: []
            };
        }

        if (!node.children || typeof node.children === 'string') {
            return { ...base, children: [] };
        }

        const children = node.children
            .sort((a, b) => {
                if (a.isDirectory === b.isDirectory) {
                    return a.name.localeCompare(b.name);
                }
                return a.isDirectory ? -1 : 1;
            })
            .map(child => this.convertNode(child));

        return {
            ...base,
            children
        };
    }

    private convertNode(node: TreeNode): FileNode | DirectoryNode {
        if (!node.isDirectory) {
            return {
                type: 'file',
                name: node.name,
                path: node.path
            };
        }

        return this.buildStructureTree(node);
    }

    formatForHuman(node: TreeNode, prefix: string = ''): string {
        let result = '';
        const icon = node.isDirectory ? '📁' : '📄';
        const name = node.name;
        
        result += `${prefix}${icon} ${name}\n`;

        if (node.children && typeof node.children !== 'string' && node.children.length > 0) {
            const sortedChildren = [...node.children].sort((a, b) => {
                if (a.isDirectory === b.isDirectory) {
                    return a.name.localeCompare(b.name);
                }
                return a.isDirectory ? -1 : 1;
            });

            for (let i = 0; i < sortedChildren.length; i++) {
                const child = sortedChildren[i];
                const isLast = i === sortedChildren.length - 1;
                const newPrefix = prefix + (isLast ? '    ' : '│   ');
                const childPrefix = prefix + (isLast ? '└── ' : '├── ');
                result += this.formatForHuman(child, childPrefix);
            }
        } else if (node.children === "skipped") {
            const childPrefix = prefix + '└── ';
            result += `${childPrefix}... (${node.children_skipped} items skipped)\n`;
        }

        return result;
    }
} 