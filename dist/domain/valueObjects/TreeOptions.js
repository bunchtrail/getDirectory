"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeOptionsBuilder = void 0;
class TreeOptionsBuilder {
    constructor() {
        this.options = {
            excludePatterns: [],
            maxDepth: -1,
            showFiles: true,
            showSize: true
        };
    }
    withExcludePatterns(patterns) {
        this.options.excludePatterns = patterns;
        return this;
    }
    withMaxDepth(depth) {
        this.options.maxDepth = depth;
        return this;
    }
    withShowFiles(show) {
        this.options.showFiles = show;
        return this;
    }
    withShowSize(show) {
        this.options.showSize = show;
        return this;
    }
    withAIMinimalMode(enabled) {
        this.options.aiMinimalMode = enabled;
        return this;
    }
    withMaxChildrenCount(count) {
        this.options.maxChildrenCount = count;
        return this;
    }
    withMaxDepthBeforeCollapse(depth) {
        this.options.maxDepthBeforeCollapse = depth;
        return this;
    }
    build() {
        return { ...this.options };
    }
}
exports.TreeOptionsBuilder = TreeOptionsBuilder;
//# sourceMappingURL=TreeOptions.js.map