const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export type ProfileInput = { full_name:string; education:string; skills:string[]; experience_level:string; preferred_roles:string[]; preferred_locations:string[]; career_interests:string[] };
export async function createProfile(data: ProfileInput) {
  const response = await fetch(`${API}/api/profiles`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
  if (!response.ok) throw new Error((await response.json()).detail || 'Could not create profile');
  return response.json();
}
export async function getJobs() { const r=await fetch(`${API}/api/jobs`,{cache:'no-store'}); if(!r.ok) throw new Error('Could not load jobs'); return r.json(); }
export async function getRecommendations(id:number) { const r=await fetch(`${API}/api/recommendations/${id}`,{cache:'no-store'}); if(!r.ok) throw new Error('Could not load recommendations'); return r.json(); }
export async function saveJob(profileId:number, jobId:number) { const r=await fetch(`${API}/api/profiles/${profileId}/saved-jobs/${jobId}`,{method:'POST'}); if(!r.ok) throw new Error('Could not save job'); return r.json(); }
