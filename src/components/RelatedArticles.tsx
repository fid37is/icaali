import { Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import Link from 'next/link';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  content: string;
  source: string;
  publishedAt: string;
  location: { city?: string; country?: string };
  url: string;
}

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  return (
    <Card className="bg-surface-light dark:bg-surface-dark">
      <CardMedia
        component="img"
        height="140"
        image={article.imageUrl || '/placeholder-image.jpg'}
        alt={article.title}
      />
      <CardContent className="text-text">
        <Typography variant="h5">{article.title || 'Untitled'}</Typography>
        <Typography>{article.description || 'No description available'}</Typography>
        <Typography variant="caption" color="text.secondary">
          {article.source} | {new Date(article.publishedAt).toLocaleDateString()}
        </Typography>
        <Link href={`/article/${article.id}`} passHref>
          <Button variant="contained" color="primary">Read More</Button>
        </Link>
      </CardContent>
    </Card>
  );
}