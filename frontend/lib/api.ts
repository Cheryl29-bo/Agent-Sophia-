const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export type ExperienceLevel = 'Student' | 'Fresher' | 'Entry-level' | 'Mid-level' | 'Senior';

export type ProfileInput = {
  full_name: string;
  education: string;
  skills: string[];
  experience_level: ExperienceLevel;
  preferred_roles: string[];
  preferred_locations: string[];
  career_interests: string[];
};

export type Profile = ProfileInput & { id: number };

export type Job = {
  id: number;
  title: string;
  company: string;
  description: string;
  required_skills: string[];
  experience_requirements: string;
  experience_level: string;
  education_requirements: string;
  location: string;
  employment_type: string;
  application_url: string;
  source: string;
  posting_date: string;
  is_sample: boolean;
};

export type Recommendation = {
  job: Job;
  score: number;
  explanation: string;
  matched_skills: string[];
  missing_skills: string[];
  components: Record<string, number>;
  score_type: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, init);
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body: { detail?: unknown } = await response.json();
      if (typeof body.detail === 'string') message = body.detail;
    } catch {
      // Keep the HTTP status message when the server does not return JSON.
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export function createProfile(data: ProfileInput): Promise<Profile> {
  return request<Profile>('/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function getJobs(): Promise<Job[]> {
  return request<Job[]>('/api/jobs', { cache: 'no-store' });
}

export function getRecommendations(id: number): Promise<Recommendation[]> {
  return request<Recommendation[]>(`/api/recommendations/${id}`, { cache: 'no-store' });
}

export function saveJob(profileId: number, jobId: number): Promise<{ saved: boolean; message?: string }> {
  return request<{ saved: boolean; message?: string }>(`/api/profiles/${profileId}/saved-jobs/${jobId}`, {
    method: 'POST',
  });
}
