// React
import { useMemo, useState } from 'react';

// External libraries
import { Link } from 'react-router-dom';

// Local files
import { journalArticles } from '../data/journalArticles';

const categories = [
  'All stories',
  ...new Set(journalArticles.map((article) => article.category)),
];

// Shows the read-only local journal and working category filters.
export function JournalPage() {
  const [category, setCategory] = useState('All stories');
  const articles = useMemo(
    () =>
      category === 'All stories'
        ? journalArticles
        : journalArticles.filter((article) => article.category === category),
    [category],
  );
  const featured = articles[0];

  return (
    <main className="wrap page-main journal-page">
      <header className="journal-heading">
        <p className="eyebrow">The BookMyStay journal</p>
        <h1 tabIndex="-1">Stories for people who love to stay somewhere new.</h1>
        <p>Travel notes, practical tips, and stories to help you plan your next stay.</p>
      </header>
      <nav className="journal-categories" aria-label="Filter journal stories">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={
              category === item ? 'category-chip category-chip-active' : 'category-chip'
            }
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      {featured && (
        <article className="journal-featured">
          <div>
            <p className="eyebrow">
              {featured.category} · {featured.readTime} min read
            </p>
            <h2>
              <Link to={`/journal/${featured.slug}`}>{featured.title}</Link>
            </h2>
            <p>{featured.summary}</p>
            <Link className="primary-button" to={`/journal/${featured.slug}`}>
              Read the story
            </Link>
          </div>
          <div className="journal-featured-art" aria-hidden="true">
            <span>Go at your own pace</span>
          </div>
        </article>
      )}
      <section className="journal-latest" aria-labelledby="latest-stories">
        <div className="section-heading">
          <h2 id="latest-stories">
            {category === 'All stories' ? 'Latest stories' : category}
          </h2>
          <span>
            {articles.length} {articles.length === 1 ? 'story' : 'stories'}
          </span>
        </div>
        <div className="journal-card-grid">
          {articles.map((article) => (
            <article className="journal-card" key={article.slug}>
              <p className="eyebrow">
                {article.category} · {article.readTime} min read
              </p>
              <h3>
                <Link to={`/journal/${article.slug}`}>{article.title}</Link>
              </h3>
              <p>{article.summary}</p>
              <Link className="inline-link" to={`/journal/${article.slug}`}>
                Read article <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
