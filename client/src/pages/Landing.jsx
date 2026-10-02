import { Link } from 'react-router-dom';
import './Landing.css';

const AVATAR_COLORS = ['#d64550', '#f5a623', '#6b9080', '#e08a3e', '#b3555f', '#4d7c6f'];

const storyAvatars = [
  { label: 'Maya', initial: 'M' },
  { label: 'Jordan', initial: 'J' },
  { label: 'Priya', initial: 'P' },
  { label: 'Tomás', initial: 'T' },
  { label: 'Chen', initial: 'C' },
  { label: 'Aisha', initial: 'A' },
];

export default function Landing() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-header-inner">
          <span className="landing-wordmark">Campus Connect</span>
          <nav className="landing-header-links">
            <Link to="/login">Log in</Link>
            <Link to="/signup" className="landing-header-cta">
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <section
        className="landing-hero"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(20,33,61,0.55) 0%, rgba(20,33,61,0.75) 55%, rgba(20,33,61,0.96) 100%), url('https://media.gettyimages.com/id/894924922/photo/torontos-six-newest-subway-stations-opened-on-the-line-1-extension-that-adds-8-6-kilometres.jpg?s=594x594&w=gi&k=20&c=SQzmv_jwIYjcYl3XsxUT_LZWCaaIi8yCDmF0wWmw5TU=')",
        }}
      >
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <h1>Your campus, all in one feed.</h1>
            <p className="landing-hero-sub">
              Share what's happening, join your department's group, and message classmates
              directly — Campus Connect brings your university online without the group-chat
              chaos.
            </p>
            <div className="landing-hero-actions">
              <Link to="/signup" className="landing-btn landing-btn-primary">
                Create your account
              </Link>
              <Link to="/login" className="landing-btn landing-btn-ghost">
                Log in
              </Link>
            </div>

            <div className="landing-story-row" aria-hidden="true">
              {storyAvatars.map((person, i) => (
                <span
                  key={person.label}
                  className="landing-story-avatar"
                  style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                >
                  {person.initial}
                </span>
              ))}
              <span className="landing-story-label">Groups forming on campus right now</span>
            </div>
          </div>

          <div className="landing-hero-preview" aria-hidden="true">
            <article className="landing-pin-card">
              <div className="landing-pin" />
              <header>
                <span className="landing-pin-avatar">M</span>
                <div>
                  <strong>Maya</strong>
                  <span>Computer Science</span>
                </div>
              </header>
              <p>Anyone else's 9am discrete math professor forgetting we exist during reading week?</p>
              <footer>
                <span>24 likes</span>
                <span>8 comments</span>
              </footer>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-feature-row">
        <div className="landing-feature-row-inner">
          <div className="landing-feature-photo">
            <img
              src="https://res.cloudinary.com/gjw1irbe/image/upload/v1790902683/campus-connect/n6pd3tzeaiou6phfnzmt.jpg"
              alt="Students sharing notes and studying together in a bright common room"
              loading="lazy"
            />
            <div className="landing-feature-blob landing-feature-blob--marigold" />
          </div>
          <div className="landing-feature-copy">
            <h2>One feed for the whole campus</h2>
            <p>
              Post updates, photos, and questions — to everyone, or just the people in your
              group. No more digging through five different chats to find out what's going on.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-feature-row landing-feature-row--reverse">
        <div className="landing-feature-row-inner">
          <div className="landing-feature-photo">
            <img
              src="https://res.cloudinary.com/gjw1irbe/image/upload/v1790902644/campus-connect/qwoeujueecajxrlujaoo.jpg"
              alt="A group of university students talking together outdoors on campus steps"
              loading="lazy"
            />
            <div className="landing-feature-blob landing-feature-blob--sage" />
          </div>
          <div className="landing-feature-copy">
            <h2>A group for every department, club, and course</h2>
            <p>
              Find the ones that already exist, or start your own in under a minute. Every
              group gets its own feed, so conversations stay where they belong.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-feature-row">
        <div className="landing-feature-row-inner">
          <div className="landing-feature-photo">
            <img
              src="https://res.cloudinary.com/gjw1irbe/image/upload/v1790902659/campus-connect/xkt0njhcco5wssiscshm.jpg"
              alt="Two students chatting and laughing together outdoors"
              loading="lazy"
            />
            <div className="landing-feature-blob landing-feature-blob--cherry" />
          </div>
          <div className="landing-feature-copy">
            <h2>Real people, real time</h2>
            <p>
              Search for classmates by name or major, connect, and message instantly — with
              live notifications so you never miss a reply.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-how">
        <div className="landing-section-inner">
          <h2>Getting started takes about two minutes</h2>
          <div className="landing-steps">
            <div className="landing-step-card">
              <span className="landing-step-num">1</span>
              <h3>Create your account</h3>
              <p>Just your name, email, and a password — no waiting on approval.</p>
            </div>
            <div className="landing-step-card">
              <span className="landing-step-num">2</span>
              <h3>Find your people</h3>
              <p>Search for classmates and join your department or club's group.</p>
            </div>
            <div className="landing-step-card">
              <span className="landing-step-num">3</span>
              <h3>Show up</h3>
              <p>Post, comment, and message — notifications keep you in the loop as it happens.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-closing">
        <div className="landing-section-inner">
          <h2>Everyone's already posting. Don't be the last one in the group chat.</h2>
          <Link to="/signup" className="landing-btn landing-btn-light">
            Create your account
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <span>Campus Connect</span>
        <span>Built for your campus, one group at a time.</span>
      </footer>
    </div>
  );
}