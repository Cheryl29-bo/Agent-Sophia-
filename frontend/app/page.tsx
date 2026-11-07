'use client';

import { useEffect, useState } from 'react';
import {
  createProfile,
  getJobs,
  getRecommendations,
  saveJob,
  type ExperienceLevel,
  type Job,
  type ProfileInput,
  type Recommendation,
} from '../lib/api';

type ProfileForm = {
  full_name: string;
  education: string;
  skills: string;
  experience_level: ExperienceLevel;
  preferred_roles: string;
  preferred_locations: string;
  career_interests: string;
};

const experienceLevels: ExperienceLevel[] = ['Student', 'Fresher', 'Entry-level', 'Mid-level', 'Senior'];
const splitValues = (value: string) =>
  value.split(',').map((item) => item.trim()).filter(Boolean);

const initialForm: ProfileForm = {
  full_name: '',
  education: '',
  skills: '',
  experience_level: 'Fresher',
  preferred_roles: '',
  preferred_locations: '',
  career_interests: '',
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function prettyDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Home() {
  const [profileId, setProfileId] = useState<number | null>(null);
  const [profile, setProfile] = useState<ProfileInput | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  const [savingJobIds, setSavingJobIds] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [jobsLoading, setJobsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [form, setForm] = useState<ProfileForm>(initialForm);

  useEffect(() => {
    let active = true;
    getJobs()
      .then((result) => {
        if (active) setJobs(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Could not load sample jobs.');
      })
      .finally(() => {
        if (active) setJobsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function submitProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileLoading(true);
    setError('');
    setNotice('');

    const candidate: ProfileInput = {
      full_name: form.full_name.trim(),
      education: form.education.trim(),
      skills: splitValues(form.skills),
      experience_level: form.experience_level,
      preferred_roles: splitValues(form.preferred_roles),
      preferred_locations: splitValues(form.preferred_locations),
      career_interests: splitValues(form.career_interests),
    };

    if (!candidate.skills.length || !candidate.preferred_roles.length || !candidate.preferred_locations.length) {
      setError('Add at least one skill, preferred role, and preferred location.');
      setProfileLoading(false);
      return;
    }

    try {
      const created = await createProfile(candidate);
      setProfileId(created.id);
      setProfile(candidate);
      setRecommendations([]);
      setRecommendations(await getRecommendations(created.id));
      setNotice('Your profile is ready. Here are the closest matches from our sample listings.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create your profile.');
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleSaveJob(jobId: number) {
    if (!profileId || savedJobIds.includes(jobId) || savingJobIds.includes(jobId)) return;
    setError('');
    setSavingJobIds((current) => [...current, jobId]);
    try {
      await saveJob(profileId, jobId);
      setSavedJobIds((current) => [...current, jobId]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this job.');
    } finally {
      setSavingJobIds((current) => current.filter((id) => id !== jobId));
    }
  }

  const savedJobs = jobs.filter((job) => savedJobIds.includes(job.id));
  const shownJobCount = profile ? recommendations.length : jobs.length;

  return (
    <div className="min-h-screen">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Sophia home">
          <span className="brand-mark" aria-hidden="true">s</span>
          <span>SOPHIA</span>
          <span className="brand-divider" />
          <span className="brand-caption">CAREER COMPANION</span>
        </a>
        <nav className="topnav" aria-label="Main navigation">
          <a className="topnav-link active" href="#overview">Overview</a>
          <a className="topnav-link" href="#opportunities">Opportunities</a>
          <a className="topnav-link" href="#saved">Saved jobs <span className="nav-count">{savedJobs.length}</span></a>
        </nav>
        <a className="profile-chip" href="#profile">
          <span className="avatar">{profile ? initials(profile.full_name) : 'Y'}</span>
          <span>{profile?.full_name ?? 'Your profile'}</span>
        </a>
      </header>

      <main id="overview" className="dashboard">
        <section className="welcome-row">
          <div>
            <p className="eyebrow">YOUR CAREER, IN FOCUS</p>
            <h1>{profile ? `Welcome back, ${profile.full_name.split(' ')[0]}.` : 'Make your next move.'}</h1>
            <p className="welcome-copy">
              A clearer path to work that fits your skills, interests, and ambitions.
            </p>
          </div>
          <div className="sample-pill"><span /> Sample workspace</div>
        </section>

        <section className="stats-grid" aria-label="Career dashboard summary">
          <article className="stat-card">
            <span className="stat-icon lavender" aria-hidden="true">✦</span>
            <div><p className="stat-label">YOUR PROFILE</p><p className="stat-value">{profile ? 'Complete' : 'Not started'}</p></div>
            <span className={`stat-status ${profile ? 'status-ready' : ''}`}>{profile ? 'Ready' : 'Start here'}</span>
          </article>
          <article className="stat-card">
            <span className="stat-icon mint" aria-hidden="true">⌕</span>
            <div><p className="stat-label">{profile ? 'PERSONALIZED MATCHES' : 'SAMPLE OPPORTUNITIES'}</p><p className="stat-value">{shownJobCount} roles</p></div>
            <span className="stat-status">{profile ? 'Ranked for you' : 'Preview'}</span>
          </article>
          <article className="stat-card">
            <span className="stat-icon peach" aria-hidden="true">♡</span>
            <div><p className="stat-label">SAVED JOBS</p><p className="stat-value">{savedJobs.length} saved</p></div>
            <a className="stat-action" href="#saved">View list <span aria-hidden="true">↗</span></a>
          </article>
        </section>

        {error && <div role="alert" className="feedback error-feedback">{error}</div>}
        {notice && <div role="status" className="feedback success-feedback">{notice}</div>}

        <div className="content-grid">
          <aside id="profile" className="profile-panel">
            <div className="panel-heading">
              <span className="step-number">01</span>
              <div>
                <p className="eyebrow">GET STARTED</p>
                <h2>Build your profile</h2>
              </div>
            </div>
            <p className="panel-intro">Tell us a little about where you are and where you want to go.</p>

            <form onSubmit={submitProfile} className="profile-form">
              <label>
                <span>Your name</span>
                <input
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={160}
                  value={form.full_name}
                  placeholder="e.g. Alex Morgan"
                  onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                />
              </label>
              <label>
                <span>Education</span>
                <input
                  required
                  minLength={2}
                  maxLength={240}
                  value={form.education}
                  placeholder="e.g. BSc in Economics"
                  onChange={(event) => setForm({ ...form, education: event.target.value })}
                />
              </label>
              <label>
                <span>Skills <small>Separate with commas</small></span>
                <input
                  required
                  value={form.skills}
                  placeholder="Research, Excel, Python"
                  onChange={(event) => setForm({ ...form, skills: event.target.value })}
                />
              </label>
              <label>
                <span>Experience level</span>
                <select
                  value={form.experience_level}
                  onChange={(event) => {
                    const selectedLevel = experienceLevels.find((level) => level === event.target.value);
                    if (selectedLevel) setForm({ ...form, experience_level: selectedLevel });
                  }}
                >
                  {experienceLevels.map((level) => <option key={level}>{level}</option>)}
                </select>
              </label>
              <label>
                <span>Roles you’re interested in <small>Separate with commas</small></span>
                <input
                  required
                  value={form.preferred_roles}
                  placeholder="Data analyst, researcher"
                  onChange={(event) => setForm({ ...form, preferred_roles: event.target.value })}
                />
              </label>
              <label>
                <span>Preferred locations <small>Separate with commas</small></span>
                <input
                  required
                  value={form.preferred_locations}
                  placeholder="Remote, Lagos"
                  onChange={(event) => setForm({ ...form, preferred_locations: event.target.value })}
                />
              </label>
              <label>
                <span>Career interests <small>Optional</small></span>
                <input
                  value={form.career_interests}
                  placeholder="Climate, fintech, health"
                  onChange={(event) => setForm({ ...form, career_interests: event.target.value })}
                />
              </label>
              <button className="primary-button" type="submit" disabled={profileLoading}>
                {profileLoading ? 'Finding your matches…' : profile ? 'Create a new profile & find matches' : 'Find my matches'}
                {!profileLoading && <span aria-hidden="true">→</span>}
              </button>
              <p className="form-note">Used to calculate matches and save roles in this development workspace.</p>
            </form>
          </aside>

          <div className="results-column">
            <section className="recommendations-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">A THOUGHTFUL PLACE TO START</p>
                  <h2>{profile ? 'Your recommended roles' : 'Opportunities to explore'}</h2>
                  <p className="section-description">
                    {profile
                      ? 'Ranked against your profile with clear reasons for every match.'
                      : 'Create your profile to see personalized recommendations.'}
                  </p>
                </div>
                <span className="result-count">{profile ? recommendations.length : jobs.length} roles</span>
              </div>

              {profile && recommendations.length > 0 ? (
                <div className="recommendation-list">
                  {recommendations.map((recommendation, index) => (
                    <article className="recommendation-card" key={recommendation.job.id}>
                      <div className="job-card-top">
                        <div className="company-avatar" aria-hidden="true">{initials(recommendation.job.company)}</div>
                        <div className="job-title-wrap">
                          <div className="job-labels">
                            {index === 0 && <span className="best-fit-label">TOP MATCH</span>}
                            {recommendation.job.is_sample && <span className="sample-label">SAMPLE</span>}
                          </div>
                          <h3>{recommendation.job.title}</h3>
                          <p>{recommendation.job.company} <span>·</span> {recommendation.job.location}</p>
                        </div>
                        <div className="match-score">
                          <strong>{recommendation.score}<small>%</small></strong>
                          <span>MATCH</span>
                        </div>
                      </div>
                      <p className="match-explanation">{recommendation.explanation}</p>
                      <div className="skill-list" aria-label="Skills match">
                        {recommendation.matched_skills.map((skill) => (
                          <span className="skill-tag matched" key={`matched-${skill}`}>✓ {skill}</span>
                        ))}
                        {recommendation.missing_skills.map((skill) => (
                          <span className="skill-tag missing" key={`missing-${skill}`}>To grow: {skill}</span>
                        ))}
                      </div>
                      <div className="job-card-footer">
                        <span>{recommendation.job.employment_type} <span>·</span> Posted {prettyDate(recommendation.job.posting_date)}</span>
                        <button
                          className={`save-button ${savedJobIds.includes(recommendation.job.id) ? 'is-saved' : ''}`}
                          type="button"
                          disabled={!profileId || savedJobIds.includes(recommendation.job.id) || savingJobIds.includes(recommendation.job.id)}
                          onClick={() => handleSaveJob(recommendation.job.id)}
                        >
                          {savingJobIds.includes(recommendation.job.id)
                            ? 'Saving…'
                            : savedJobIds.includes(recommendation.job.id) ? '✓ Saved' : '♡ Save job'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon" aria-hidden="true">✳</span>
                  <h3>{jobsLoading ? 'Loading opportunities…' : profile ? 'No recommendations yet' : 'Your next step starts with you'}</h3>
                  <p>{jobsLoading
                    ? 'Getting the latest sample roles ready.'
                    : profile
                      ? 'There are no roles to recommend right now. Check back when more listings are available.'
                      : 'Add your skills and goals to see how each role lines up with what matters to you.'}</p>
                  {!profile && <a className="text-link" href="#profile">Build your profile <span aria-hidden="true">↑</span></a>}
                </div>
              )}
              {profile && recommendations.length === 0 && !jobsLoading && jobs.length > 0 && (
                <div className="browse-fallback">
                  <p>Want to browse the available listings while we load your matches?</p>
                  <a className="text-link" href="#opportunities">Browse all sample roles <span aria-hidden="true">↓</span></a>
                </div>
              )}
              <p className="method-note"><span aria-hidden="true">ⓘ</span> Match scores are transparent heuristics—not AI predictions or hiring probabilities.</p>
            </section>

            <section id="opportunities" className="opportunities-panel">
              <div className="section-heading compact-heading">
                <div>
                  <p className="eyebrow">THE STARTING LINEUP</p>
                  <h2>Sample opportunities</h2>
                </div>
                <span className="result-count">{jobs.length} listings</span>
              </div>
              <p className="section-description listing-disclaimer">
                Fictional listings for exploring the experience. These are not live vacancies.
              </p>
              {jobsLoading ? (
                <p className="loading-copy">Loading sample listings…</p>
              ) : jobs.length === 0 ? (
                <p className="loading-copy">No sample listings are available. Make sure the API is running, then try refreshing.</p>
              ) : (
                <div className="listing-grid">
                  {jobs.map((job) => (
                    <article className="listing-card" key={job.id}>
                      <div className="listing-card-heading">
                        <div className="company-avatar small-avatar" aria-hidden="true">{initials(job.company)}</div>
                        <span className="sample-label">SAMPLE</span>
                      </div>
                      <h3>{job.title}</h3>
                      <p className="listing-company">{job.company}</p>
                      <p className="listing-description">{job.description}</p>
                      <div className="listing-meta">
                        <span>{job.location}</span>
                        <span>{job.employment_type}</span>
                      </div>
                      <div className="listing-skills">
                        {job.required_skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}
                        {job.required_skills.length > 3 && <span>+{job.required_skills.length - 3}</span>}
                      </div>
                      <div className="listing-footer">
                        <span>Posted {prettyDate(job.posting_date)}</span>
                        <span className="preview-only">Preview only</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section id="saved" className="saved-panel">
              <div className="section-heading compact-heading">
                <div>
                  <p className="eyebrow">KEEP THE GOOD ONES CLOSE</p>
                  <h2>Saved jobs</h2>
                </div>
                <span className="result-count">{savedJobs.length} saved</span>
              </div>
              {savedJobs.length ? (
                <ul className="saved-list">
                  {savedJobs.map((job) => (
                    <li key={job.id}>
                      <div className="company-avatar small-avatar" aria-hidden="true">{initials(job.company)}</div>
                      <div><strong>{job.title}</strong><span>{job.company} · {job.location}</span></div>
                      <span className="sample-label">SAMPLE</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="saved-empty">
                  <span aria-hidden="true">♡</span>
                  <p>Roles you save will be collected here for easy reference.</p>
                </div>
              )}
              <p className="method-note"><span aria-hidden="true">ⓘ</span> Saved roles are linked to your profile in this development workspace.</p>
            </section>
          </div>
        </div>

        <footer className="page-footer">
          <span className="footer-brand"><span className="brand-mark" aria-hidden="true">s</span> SOPHIA</span>
          <p>Built to help you explore your next step with confidence.</p>
          <span>Sample data · No live job scraping</span>
        </footer>
      </main>
    </div>
  );
}
