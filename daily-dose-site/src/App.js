import React, { useState } from 'react';
import { Layout, Typography, Input, Button, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import './App.css';
import { GPT3_API_KEY } from './config';

const { Header, Content, Footer } = Layout;
const { Paragraph } = Typography;
const { Meta } = Card;

function App() {
  const [keywords, setKeywords] = useState('');
  const [articles, setArticles] = useState([]);
  const [summary, setSummary] = useState('');

  const handleKeywordsChange = (event) => {
    setKeywords(event.target.value);
  };

  const handleKeywordsSubmit = async () => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const todayStr = today.toISOString().split('T')[0];
    const lastWeekStr = lastWeek.toISOString().split('T')[0];
    
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${keywords}&from=${lastWeekStr}&to=${todayStr}&apiKey=aa808769dac44ecf8618c3b95ce45d32`
    );
    
    const filteredArticles = response.data.articles.filter(
      article => ["BBC News", "CNN", "Reuters", "Associated Press", "Bloomberg", "CNBC", "Financial Times", "The Economist", "The Wall Street Journal", "Business Insider", "Forbes", "The Guardian", "The New York Times", "The Washington Post", "USA Today"].includes(article.source.name)
    ).slice(0, 3);
    
    setArticles(filteredArticles);
    
    const articleTexts = filteredArticles.map((article) => article.content).join('\n');
    const summaryResponse = await axios.post(
      'https://api.openai.com/v1/engines/davinci-codex/completions',
      {
        prompt: articleTexts,
        max_tokens: 1024,
        n: 1,
        stop: ['\n\n'],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GPT3_API_KEY}`,
        },
      }
    );
    
    setSummary(summaryResponse.data.choices[0].text);
  };  

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header">
        <h1 className="header-title">Daily Dose</h1>
      </Header>
      <Content className="content">
        <Input
          placeholder="Enter keywords"
          onChange={handleKeywordsChange}
          value={keywords}
          className="input"
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleKeywordsSubmit}
          className="button"
        >
          Search
        </Button>
        {summary && (
          <Card className="summary-card">
            <Paragraph className="summary-content">{summary}</Paragraph>
          </Card>
        )}
        <div className="card-container">
          {articles.map((article, index) => (
            <Card
              key={index}
              hoverable
              className="card"
              cover={<img alt={article.title} src={article.urlToImage} />}
              onClick={() => window.open(article.url, '_blank')}
            >
              <Meta title={article.title} description={article.description} />
              <div className="card-footer">
                <span>{article.author}</span>
                <span>{new Date(article.publishedAt).toDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      </Content>
      <Footer className="footer">
        Daily Dose © 2023 
      </Footer>
    </Layout>
  );
}

export default App;
