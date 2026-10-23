// External libraries
import { Link, useParams } from 'react-router-dom';

// Local files
import { journalArticles } from '../data/journalArticles';

// Renders a readable journal story from the shared local collection.
export function JournalArticlePage() {
  const { slug } = useParams();
  const article = journalArticles.find((item) => item.slug === slug);

  if (!article) {
    return (
      <main className="wrap page-main">
        <h1 tabIndex="-1">Story not found</h1>
        <p className="empty-state">That journal story is no longer available.</p>
        <Link to="/journal">Back to the journal</Link>
      </main>
    );
  }

  return (
    <main className="wrap page-main article-page">
      <Link to="/journal" className="inline-link">
        ← Journal
      </Link>
      <article>
        <header>
          <p className="eyebrow">
            {article.category} · {article.readTime} min read
          </p>
          <h1 tabIndex="-1">{article.title}</h1>
          <p className="article-summary">{article.summary}</p>
        </header>
        <div className="article-body">
          {article.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <Link to="/stays" className="secondary-button article-explore">
          Explore stays
        </Link>
      </article>
    </main>
  );
}
