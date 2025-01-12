"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeFormatterService = void 0;
class TreeFormatterService {
    formatForAI(node) {
        const projectStructure = this.convertToProjectStructure(node);
        return JSON.stringify(projectStructure, null, 2);
    }
    convertToProjectStructure(node) {
        return {
            name: node.name,
            structure: this.buildStructureTree(node)
        };
    }
    buildStructureTree(node) {
        const base = {
            type: 'directory',
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
    convertNode(node) {
        if (!node.isDirectory) {
            return {
                type: 'file',
                name: node.name,
                path: node.path
            };
        }
        return this.buildStructureTree(node);
    }
    formatForHuman(node, prefix = '') {
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
        }
        else if (node.children === "skipped") {
            const childPrefix = prefix + '└── ';
            result += `${childPrefix}... (${node.children_skipped} items skipped)\n`;
        }
        return result;
    }
}
exports.TreeFormatterService = TreeFormatterService;
//# sourceMappingURL=TreeFormatterService.js.map