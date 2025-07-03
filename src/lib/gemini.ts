const API_KEY = 'AIzaSyBOGimQBv8crtbTdpQGwIcnsgSbQ9h5C5E'
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export class GeminiService {
  private async makeRequest(prompt: string): Promise<string> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text
      }
      
      throw new Error('Invalid response format')
    } catch (error) {
      console.error('Gemini API error:', error)
      throw error
    }
  }

  async generateBlogSummary(content: string): Promise<string> {
    try {
      const prompt = `Please create a concise, engaging summary of the following blog post content. The summary should be 2-3 sentences long and capture the main points and value proposition.

Blog content:
${content}

Summary:`

      const result = await this.makeRequest(prompt)
      return result.trim()
    } catch (error) {
      console.error('Error generating summary:', error)
      // Fallback to simple summary
      const sentences = content.split('. ').slice(0, 2)
      return sentences.join('. ') + (sentences.length === 2 ? '...' : '')
    }
  }

  async generateBlogIdeas(topic: string, count: number = 5): Promise<string[]> {
    try {
      const prompt = `Generate ${count} creative and engaging blog post ideas about "${topic}". Each idea should be specific, actionable, and appealing to readers. Format as a numbered list.`

      const result = await this.makeRequest(prompt)
      const ideas = result.trim().split('\n').filter(idea => idea.trim()).map(idea => {
        // Remove numbering if present
        return idea.replace(/^\d+\.\s*/, '').trim()
      })
      return ideas.slice(0, count)
    } catch (error) {
      console.error('Error generating blog ideas:', error)
      return [
        `How to get started with ${topic}`,
        `Top 10 ${topic} tips for beginners`,
        `The future of ${topic}`,
        `Common ${topic} mistakes to avoid`,
        `${topic} best practices guide`
      ]
    }
  }

  async improveBlogContent(content: string, improvement: string): Promise<string> {
    try {
      const prompt = `Please improve the following blog content based on this request: "${improvement}". Make it more engaging, professional, and well-structured while maintaining the original meaning.

Original content:
${content}

Improved content:`

      const result = await this.makeRequest(prompt)
      return result.trim()
    } catch (error) {
      console.error('Error improving content:', error)
      return content
    }
  }

  async generateSEOKeywords(title: string, content: string): Promise<string[]> {
    try {
      const prompt = `Based on this blog post title and content, suggest 10 relevant SEO keywords that would help with search engine optimization. Return only the keywords, one per line.

Title: ${title}
Content: ${content.substring(0, 500)}...

Keywords:`

      const result = await this.makeRequest(prompt)
      const keywords = result.trim().split('\n').filter(keyword => keyword.trim()).map(keyword => {
        // Clean up keywords
        return keyword.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim()
      })
      return keywords.slice(0, 10)
    } catch (error) {
      console.error('Error generating SEO keywords:', error)
      return []
    }
  }

  async chatResponse(message: string, context?: string): Promise<string> {
    try {
      const prompt = `You are an AI writing assistant for a blogging platform. Help users with writing, editing, SEO, content ideas, and blogging best practices. Be helpful, friendly, and informative.

${context ? `Context: ${context}` : ''}

User message: ${message}

Response:`

      const result = await this.makeRequest(prompt)
      return result.trim()
    } catch (error) {
      console.error('Error generating chat response:', error)
      return this.getFallbackResponse(message)
    }
  }

  async generateContentIdeas(niche: string, contentType: string = 'blog posts'): Promise<string[]> {
    try {
      const prompt = `Generate 8 creative ${contentType} ideas for the ${niche} niche. Each idea should be specific, engaging, and valuable to the target audience. Format as a numbered list.`

      const result = await this.makeRequest(prompt)
      const ideas = result.trim().split('\n').filter(idea => idea.trim()).map(idea => {
        return idea.replace(/^\d+\.\s*/, '').trim()
      })
      return ideas.slice(0, 8)
    } catch (error) {
      console.error('Error generating content ideas:', error)
      return [
        `Ultimate guide to ${niche}`,
        `Common ${niche} mistakes to avoid`,
        `${niche} trends for 2024`,
        `How to get started with ${niche}`,
        `${niche} tools and resources`,
        `${niche} case studies`,
        `${niche} tips for beginners`,
        `Advanced ${niche} strategies`
      ]
    }
  }

  async optimizeForSEO(title: string, content: string): Promise<{
    optimizedTitle: string
    metaDescription: string
    keywords: string[]
    suggestions: string[]
  }> {
    try {
      const prompt = `Analyze this blog post and provide SEO optimization suggestions:

Title: ${title}
Content: ${content.substring(0, 800)}...

Please provide:
1. An optimized title (50-60 characters)
2. A meta description (150-160 characters)
3. 5 primary keywords
4. 3 SEO improvement suggestions

Format your response as:
TITLE: [optimized title]
META: [meta description]
KEYWORDS: [keyword1, keyword2, keyword3, keyword4, keyword5]
SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]
- [suggestion 3]`

      const result = await this.makeRequest(prompt)
      const lines = result.trim().split('\n')
      
      let optimizedTitle = title
      let metaDescription = ''
      let keywords: string[] = []
      let suggestions: string[] = []
      
      for (const line of lines) {
        if (line.startsWith('TITLE:')) {
          optimizedTitle = line.replace('TITLE:', '').trim()
        } else if (line.startsWith('META:')) {
          metaDescription = line.replace('META:', '').trim()
        } else if (line.startsWith('KEYWORDS:')) {
          keywords = line.replace('KEYWORDS:', '').split(',').map(k => k.trim())
        } else if (line.startsWith('- ')) {
          suggestions.push(line.replace('- ', '').trim())
        }
      }
      
      return {
        optimizedTitle,
        metaDescription,
        keywords,
        suggestions
      }
    } catch (error) {
      console.error('Error optimizing for SEO:', error)
      return {
        optimizedTitle: title,
        metaDescription: content.substring(0, 150) + '...',
        keywords: [],
        suggestions: []
      }
    }
  }

  private getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('write') || lowerMessage.includes('writing')) {
      return "Here are some writing tips:\n\n1. Start with a compelling hook to grab attention\n2. Use clear, concise language\n3. Break up text with headers and bullet points\n4. Tell stories to engage readers\n5. End with a strong conclusion or call-to-action\n\nWhat specific aspect of writing would you like help with?"
    }
    
    if (lowerMessage.includes('seo') || lowerMessage.includes('search')) {
      return "For better SEO:\n\n1. Use relevant keywords naturally throughout your content\n2. Write descriptive titles (50-60 characters)\n3. Create compelling meta descriptions\n4. Use header tags (H1, H2, H3) properly\n5. Include internal and external links\n6. Optimize images with alt text\n7. Focus on user intent and valuable content\n\nWould you like me to help optimize a specific post?"
    }
    
    if (lowerMessage.includes('idea') || lowerMessage.includes('topic')) {
      return "Here are some blog post ideas:\n\n1. How-to guides in your field\n2. Industry trends and predictions\n3. Personal experiences and lessons learned\n4. Tool reviews and comparisons\n5. Behind-the-scenes content\n6. Expert interviews\n7. Case studies\n8. Common mistakes to avoid\n\nWhat niche or topic are you interested in?"
    }
    
    if (lowerMessage.includes('engagement') || lowerMessage.includes('engaging')) {
      return "To make content more engaging:\n\n1. Use storytelling techniques\n2. Ask questions to involve readers\n3. Include relevant examples and case studies\n4. Add visuals, images, or infographics\n5. Write in a conversational tone\n6. Use bullet points and short paragraphs\n7. Include actionable tips\n8. End with discussion questions\n\nWhat type of content are you working on?"
    }
    
    return "I'm here to help with all aspects of blogging! I can assist with:\n\n• Writing tips and techniques\n• SEO optimization\n• Content ideas and planning\n• Improving engagement\n• Blog structure and formatting\n• Keyword research\n• Content editing and improvement\n\nWhat would you like help with today?"
  }
}

export const geminiService = new GeminiService()