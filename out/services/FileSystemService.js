"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemTreeGenerator = void 0;
const fs = __importStar(require("fs"));
const minimatch_1 = require("minimatch");
const path = __importStar(require("path"));
class FileSystemTreeGenerator {
    constructor() {
        this.DEFAULT_MAX_CHILDREN = 50;
        this.DEFAULT_MAX_DEPTH = 5;
    }
    generateTree(rootPath, options) {
        return this.generateTreeNode(rootPath, options, 0);
    }
    shouldExclude(childPath, childName, options) {
        const relativePath = path.relative(process.cwd(), childPath);
        return options.excludePatterns.some(pattern => {
            if (childName === pattern || childName.toLowerCase() === pattern.toLowerCase()) {
                return true;
            }
            if (pattern.includes('*')) {
                return (0, minimatch_1.minimatch)(relativePath, pattern, { dot: true, matchBase: true }) ||
                    (0, minimatch_1.minimatch)(childName, pattern, { dot: true, matchBase: true });
            }
            if (pattern.includes('**')) {
                return (0, minimatch_1.minimatch)(relativePath, pattern, { dot: true });
            }
            return false;
        });
    }
    shouldCollapse(currentDepth, childrenCount, options) {
        if (!options.aiMinimalMode) {
            return false;
        }
        const maxDepth = options.maxDepthBeforeCollapse ?? this.DEFAULT_MAX_DEPTH;
        const maxChildren = options.maxChildrenCount ?? this.DEFAULT_MAX_CHILDREN;
        return currentDepth > maxDepth || childrenCount > maxChildren;
    }
    generateTreeNode(nodePath, options, currentDepth) {
        const stats = fs.statSync(nodePath);
        const name = path.basename(nodePath);
        // Базовый узел
        const node = {
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
                });
                // Проверяем необходимость схлопывания
                if (this.shouldCollapse