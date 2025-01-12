export interface TreeOptions {
    excludePatterns: string[];
    maxDepth: number;
    showFiles: boolean;
    showSize: boolean;
    aiMinimalMode?: boolean;
    maxChildrenCount?: number;
    maxDepthBeforeCollapse?: number;
}

export class TreeOptionsBuilder {
    private options: TreeOptions = {
        excludePatterns: [],
        maxDepth: -1,
        showFiles: true,
        showSize: true
    };

    withExcludePatterns(patterns: string[]): TreeOptionsBuilder {
        this.options.excludePatterns = patterns;
        return this;
    }

    withMaxDepth(depth: number): TreeOptionsBuilder {
        this.options.maxDepth = depth;
        return this;
    }

    withShowFiles(show: boolean): TreeOptionsBuilder {
        this.options.showFiles = show;
        return this;
    }

    withShowSize(show: boolean): TreeOptionsBuilder {
        this.options.showSize = show;
        return this;
    }

    withAIMinimalMode(enabled: boolean): TreeOptionsBuilder {
        this.options.aiMinimalMode = enabled;
        return this;
    }

    withMaxChildrenCount(count: number): TreeOptionsBuilder {
        this.options.maxChildrenCount = count;
        return this;
    }

    withMaxDepthBeforeCollapse(depth: number): TreeOptionsBuilder {
        this.options.maxDepthBeforeCollapse = depth;
        return this;
    }

    build(): TreeOptions {
        return { ...this.options };
    }
} 