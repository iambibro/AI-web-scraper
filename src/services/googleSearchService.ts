import { GoogleSearch } from "@langchain/google-search";
import { SearchResult } from "@langchain/core/documents";

export class GoogleSearchService {
    private search: GoogleSearch;

    constructor() {
        // Initialize Google Search with your API key
        this.search = new GoogleSearch({
            apiKey: process.env.GOOGLE_SEARCH_API_KEY,
            searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
        });
    }

    /**
     * Perform a Google search and return the results
     * @param query The search query
     * @param numResults Number of results to return (default: 10)
     * @returns Promise<SearchResult[]>
     */
    async searchGoogle(query: string, numResults: number = 10): Promise<SearchResult[]> {
        try {
            const results = await this.search.search(query, {
                numResults,
            });
            return results;
        } catch (error) {
            console.error('Error performing Google search:', error);
            throw new Error('Failed to perform Google search');
        }
    }

    /**
     * Get detailed information about a specific search result
     * @param result SearchResult object
     * @returns Detailed information about the result
     */
    getResultDetails(result: SearchResult): {
        title: string;
        link: string;
        snippet: string;
    } {
        return {
            title: result.title || '',
            link: result.link || '',
            snippet: result.snippet || '',
        };
    }
} 