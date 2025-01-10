import { TreeNode } from '../domain/interfaces/ITreeGenerator';

export class TreeFormatter {
    static formatTree(node: TreeNode, prefix: string = ''): string {
        let result = '';
        const name = node.name;
        const size = node.size ? ` (${this.formatSize(node.size)})` : '';
        
        result += `${prefix}${name}${size}\n`;

        if (node.children && node.children.length > 0) {
            node.children.forEach((child, index) => {
                const isLast = index === node.children!.length - 1;
                const newPrefix = prefix + (isLast ? '└── ' : '├── ');
                const childPrefix = prefix + (isLast ? '    ' : '│   ');
                result += this.formatTree(child, childPrefix);
            });
        }

        return result;
    }

    private static formatSize(size: number): string {
        const units = ['B', 'KB', 'MB', 'GB'];
        let value = size;
        let unitIndex = 0;

        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex++;
        }

        return `${value.toFixed(1)} ${units[unitIndex]}`;
    }
} 