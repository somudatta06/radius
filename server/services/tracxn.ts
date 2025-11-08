import fetch from 'node-fetch';

interface TracxnCompany {
  name: string;
  domain?: string;
  description?: string;
  funding?: {
    total: number;
    currency: string;
  };
  employees?: number;
  founded?: number;
  headquarters?: string;
  categories?: string[];
}

interface TracxnCompetitor {
  name: string;
  domain: string;
  similarity: number;
  description?: string;
  funding?: number;
  employees?: number;
}

class TracxnService {
  private apiKey: string;
  private baseUrl = 'https://api.tracxn.com/1.0';

  constructor() {
    this.apiKey = process.env.TRACXN_API_KEY || '';
    if (!this.apiKey) {
      console.warn('TRACXN_API_KEY not found in environment variables');
    }
  }

  async searchCompany(domain: string): Promise<TracxnCompany | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search/companies?domain=${encodeURIComponent(domain)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.error(`Tracxn API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json() as any;
      
      if (!data || !data.companies || data.companies.length === 0) {
        return null;
      }

      const company = data.companies[0];
      return {
        name: company.name,
        domain: company.domain,
        description: company.description,
        funding: company.funding ? {
          total: company.funding.total_funding,
          currency: company.funding.currency || 'USD'
        } : undefined,
        employees: company.employees_count,
        founded: company.founded_year,
        headquarters: company.headquarters,
        categories: company.categories || []
      };
    } catch (error) {
      console.error('Error fetching company from Tracxn:', error);
      return null;
    }
  }

  async getCompetitors(domain: string, limit: number = 10): Promise<TracxnCompetitor[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/companies/competitors?domain=${encodeURIComponent(domain)}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.error(`Tracxn competitors API error: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json() as any;
      
      if (!data || !data.competitors) {
        return [];
      }

      return data.competitors.map((comp: any) => ({
        name: comp.name,
        domain: comp.domain,
        similarity: comp.similarity_score || 0.5,
        description: comp.description,
        funding: comp.funding?.total_funding,
        employees: comp.employees_count
      }));
    } catch (error) {
      console.error('Error fetching competitors from Tracxn:', error);
      return [];
    }
  }

  async getIndustryInsights(industry: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/industries/${encodeURIComponent(industry)}/insights`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching industry insights from Tracxn:', error);
      return null;
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

export const tracxnService = new TracxnService();
