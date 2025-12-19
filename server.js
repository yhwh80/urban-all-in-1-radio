require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple in-memory cache (15 min TTL)
const newsCache = {};
const CACHE_DURATION = 15 * 60 * 1000;

// Extract og:image from a URL
async function getOgImage(url) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout

        const response = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' }
        });
        clearTimeout(timeout);

        const html = await response.text();
        // Look for og:image meta tag
        const match = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
        return match ? match[1] : null;
    } catch (e) {
        return null;
    }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'website')));

// News API endpoint - proxies to Perplexity with caching
app.post('/api/news', async (req, res) => {
    const { topic } = req.body;
    const cacheKey = topic || 'music';

    // Check cache first
    if (newsCache[cacheKey] && (Date.now() - newsCache[cacheKey].timestamp < CACHE_DURATION)) {
        console.log(`📦 Cache hit for ${cacheKey}`);
        return res.json(newsCache[cacheKey].data);
    }

    if (!process.env.PERPLEXITY_API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    console.log(`🔄 Fetching fresh news for ${cacheKey}...`);

    // Build query based on topic
    const queries = {
        music: 'Latest UK urban music news, afrobeats, R&B, hip-hop, grime. Focus on UK artists like Stormzy, Central Cee, Dave, Raye, but include major global hip-hop news. Last 24 hours.',
        tech: 'Latest tech and AI news relevant to UK. Include major global tech stories about AI, startups, gadgets. Last 24 hours.',
        entertainment: 'Latest UK entertainment and culture news. TV, film, celebrity news focused on UK but include major global entertainment stories. Last 24 hours.'
    };

    const query = queries[topic] || queries.music;

    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar',
                messages: [
                    {
                        role: 'system',
                        content: `You are a news curator for Urban Radio, a UK-based music platform. Return news as a JSON array of 6-8 stories. Each story should have: title, summary (2-3 sentences), source, url, timeAgo (e.g. "2 hours ago"). Focus on UK first, then major global stories. Return ONLY valid JSON array, no markdown.`
                    },
                    {
                        role: 'user',
                        content: query
                    }
                ],
                max_tokens: 1500,
                temperature: 0.3
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]) {
            let content = data.choices[0].message.content;
            try {
                content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                let news = JSON.parse(content);

                // Fetch OG images in parallel for all stories with URLs
                console.log(`🖼️  Fetching images for ${news.length} stories...`);
                const imagePromises = news.map(story =>
                    story.url ? getOgImage(story.url) : Promise.resolve(null)
                );
                const images = await Promise.all(imagePromises);

                // Attach images to stories
                news = news.map((story, i) => ({
                    ...story,
                    imageUrl: images[i] || null
                }));

                const result = { news, citations: data.citations || [] };

                // Cache the result
                newsCache[cacheKey] = { data: result, timestamp: Date.now() };
                console.log(`✅ Cached ${cacheKey} (${news.length} stories, ${images.filter(Boolean).length} images)`);

                res.json(result);
            } catch (parseError) {
                res.json({ raw: content, citations: data.citations || [] });
            }
        } else {
            res.status(500).json({ error: 'Invalid response from Perplexity' });
        }
    } catch (error) {
        console.error('Perplexity API error:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Health check for Render
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve mobile routes
app.get('/mobile/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'website', req.path));
});

// Fallback to index.html for SPA-like behavior
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'website', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🎵 Urban Radio server running on port ${PORT}`);
    console.log(`   Local: http://localhost:${PORT}`);
});

