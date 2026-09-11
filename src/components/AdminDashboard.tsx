import { useEffect, useState, FormEvent } from "react";
import { Persona, PersonaVideo } from "../types";
import { Lock, LogOut, Plus, Trash2, Edit2, PlayCircle, ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
  const [secret, setSecret] = useState(localStorage.getItem("adminSecret") || "");
  const [authenticated, setAuthenticated] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Forms
  const [view, setView] = useState<"list" | "personaForm" | "videoForm">("list");
  const [editingPersona, setEditingPersona] = useState<Partial<Persona>>({});
  const [editingVideo, setEditingVideo] = useState<Partial<PersonaVideo>>({});

  useEffect(() => {
    if (secret) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/personas", {
        headers: { "x-admin-secret": secret }
      });
      if (res.ok) {
        setAuthenticated(true);
        localStorage.setItem("adminSecret", secret);
        const data = await res.json();
        setPersonas(data);
      } else {
        setAuthenticated(false);
        localStorage.removeItem("adminSecret");
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const login = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    checkAuth();
  };

  const logout = () => {
    localStorage.removeItem("adminSecret");
    setAuthenticated(false);
    setSecret("");
  };

  const generatePrompt = async () => {
    try {
      const res = await fetch("/api/admin/generate-prompt", {
        method: "POST",
        headers: { 
          "x-admin-secret": secret,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editingPersona)
      });
      if (res.ok) {
        const data = await res.json();
        setEditingPersona(prev => ({ ...prev, systemPrompt: data.prompt }));
      }
    } catch (e) {
      alert("Failed to generate prompt");
    }
  };

  const savePersona = async (e: FormEvent) => {
    e.preventDefault();
    const url = editingPersona.id ? `/api/admin/personas/${editingPersona.id}` : "/api/admin/personas";
    const method = editingPersona.id ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "x-admin-secret": secret,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editingPersona)
      });
      
      if (res.ok) {
        checkAuth();
        setView("list");
      } else {
        alert("Failed to save persona");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deletePersona = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(`/api/admin/personas/${id}`, {
        method: "DELETE",
        headers: { "x-admin-secret": secret }
      });
      checkAuth();
    } catch (e) {}
  };

  const saveVideo = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { 
          "x-admin-secret": secret,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editingVideo)
      });
      
      if (res.ok) {
        checkAuth();
        setView("list");
      } else {
        alert("Failed to save video");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(`/api/admin/videos/${id}`, {
        method: "DELETE",
        headers: { "x-admin-secret": secret }
      });
      checkAuth();
    } catch (e) {}
  };

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>;
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <form onSubmit={login} className="bg-neutral-900 p-8 rounded-2xl border border-white/10 w-full max-w-sm flex flex-col gap-6">
          <div className="flex flex-col items-center mb-4">
            <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-neutral-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Access</h1>
          </div>
          
          <input
            type="password"
            placeholder="Admin Secret"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500"
            required
          />
          <button type="submit" className="w-full bg-white text-black font-semibold rounded-xl py-3 hover:bg-neutral-200 transition-colors">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6 md:p-12">
      <header className="flex justify-between items-center mb-12 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Persona Admin</h1>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto">
        {view === "list" && (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Managed Personas</h2>
              <button 
                onClick={() => { setEditingPersona({ active: true }); setView("personaForm"); }}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-neutral-200"
              >
                <Plus className="w-4 h-4" /> New Persona
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personas.map(p => (
                <div key={p.id} className="bg-neutral-900 border border-white/5 rounded-2xl p-6 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-white">{p.name}</h3>
                      <p className="text-sm text-neutral-500">/{p.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingPersona(p); setView("personaForm"); }} className="p-2 text-neutral-400 hover:text-white bg-neutral-800 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deletePersona(p.id)} className="p-2 text-red-400 hover:text-red-300 bg-neutral-800 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-white/5 pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-semibold text-neutral-400">Videos ({p.videos?.length || 0})</h4>
                      <button 
                        onClick={() => { setEditingVideo({ personaId: p.id, active: true }); setView("videoForm"); }}
                        className="text-xs text-purple-400 hover:text-purple-300"
                      >
                        + Add Video
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {p.videos?.map(v => (
                        <div key={v.id} className="flex justify-between items-center bg-neutral-800/50 p-2 rounded border border-white/5 text-xs">
                          <span className="truncate flex-1 max-w-[150px]">{v.title}</span>
                          <button onClick={() => deleteVideo(v.id)} className="text-red-400 p-1"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "personaForm" && (
          <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6 md:p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">{editingPersona.id ? "Edit Persona" : "New Persona"}</h2>
            <form onSubmit={savePersona} className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Name</label>
                  <input type="text" required value={editingPersona.name || ""} onChange={e => setEditingPersona({...editingPersona, name: e.target.value})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">URL Slug</label>
                  <input type="text" required value={editingPersona.slug || ""} onChange={e => setEditingPersona({...editingPersona, slug: e.target.value})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Age</label>
                  <input type="number" value={editingPersona.age || ""} onChange={e => setEditingPersona({...editingPersona, age: parseInt(e.target.value) || null})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">City</label>
                  <input type="text" value={editingPersona.city || ""} onChange={e => setEditingPersona({...editingPersona, city: e.target.value})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Country</label>
                  <input type="text" value={editingPersona.country || ""} onChange={e => setEditingPersona({...editingPersona, country: e.target.value})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Occupation</label>
                  <input type="text" value={editingPersona.occupation || ""} onChange={e => setEditingPersona({...editingPersona, occupation: e.target.value})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Short Description / Bio (for homepage)</label>
                <input type="text" required value={editingPersona.description || ""} onChange={e => setEditingPersona({...editingPersona, description: e.target.value})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Profile Image URL (Optional)</label>
                <input type="url" value={editingPersona.profileImage || ""} onChange={e => setEditingPersona({...editingPersona, profileImage: e.target.value})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Cover Image URL (Optional, cinematic wide)</label>
                <input type="url" value={editingPersona.coverImage || ""} onChange={e => setEditingPersona({...editingPersona, coverImage: e.target.value})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Gallery Images (Comma separated URLs)</label>
                <textarea value={editingPersona.gallery || ""} onChange={e => setEditingPersona({...editingPersona, gallery: e.target.value})} className="w-full h-24 bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Personality</label>
                <textarea required value={editingPersona.personality || ""} onChange={e => setEditingPersona({...editingPersona, personality: e.target.value})} className="w-full h-24 bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Background</label>
                <textarea required value={editingPersona.background || ""} onChange={e => setEditingPersona({...editingPersona, background: e.target.value})} className="w-full h-24 bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Interests (Comma separated)</label>
                <input type="text" required value={editingPersona.interests || ""} onChange={e => setEditingPersona({...editingPersona, interests: e.target.value})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Hobbies</label>
                <input type="text" value={editingPersona.hobbies || ""} onChange={e => setEditingPersona({...editingPersona, hobbies: e.target.value})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Likes</label>
                  <input type="text" value={editingPersona.likes || ""} onChange={e => setEditingPersona({...editingPersona, likes: e.target.value})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Dislikes</label>
                  <input type="text" value={editingPersona.dislikes || ""} onChange={e => setEditingPersona({...editingPersona, dislikes: e.target.value})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Speaking Style</label>
                  <input type="text" required value={editingPersona.speakingStyle || ""} onChange={e => setEditingPersona({...editingPersona, speakingStyle: e.target.value})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Emoji Frequency</label>
                  <input type="text" placeholder="Low, Medium, High" value={editingPersona.emojiFrequency || ""} onChange={e => setEditingPersona({...editingPersona, emojiFrequency: e.target.value})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Flirt Level (0-4)</label>
                  <input type="number" min="0" max="4" value={editingPersona.flirtLevel || 0} onChange={e => setEditingPersona({...editingPersona, flirtLevel: parseInt(e.target.value) || 0})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
                </div>
              </div>

              <div className="border border-white/10 rounded-xl p-4 bg-neutral-950 relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-neutral-400">Custom Additional System Prompt (Optional)</label>
                  <button type="button" onClick={generatePrompt} className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded hover:bg-purple-500/30">Auto Generate</button>
                </div>
                <textarea value={editingPersona.systemPrompt || ""} onChange={e => setEditingPersona({...editingPersona, systemPrompt: e.target.value})} className="w-full h-48 bg-transparent border-none outline-none font-mono text-sm text-neutral-300" placeholder="Leave empty to auto-generate or write custom instructions..."></textarea>
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <button type="button" onClick={() => setView("list")} className="px-6 py-2 rounded-lg font-medium text-neutral-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-neutral-200">Save Persona</button>
              </div>
            </form>
          </div>
        )}

        {view === "videoForm" && (
          <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6 md:p-8 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">Add Video URL</h2>
            <form onSubmit={saveVideo} className="flex flex-col gap-6">
              
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Video Title</label>
                <input type="text" required value={editingVideo.title || ""} onChange={e => setEditingVideo({...editingVideo, title: e.target.value})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Direct Video URL (MP4, WebM)</label>
                <input type="url" required value={editingVideo.url || ""} onChange={e => setEditingVideo({...editingVideo, url: e.target.value})} className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500" />
                <p className="text-xs text-neutral-500 mt-2">Must be a direct link to a video file, not a webpage like YouTube.</p>
              </div>

              {editingVideo.url && (
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden border border-white/10 relative">
                  <video src={editingVideo.url} controls className="w-full h-full object-contain" />
                </div>
              )}

              <div className="flex justify-end gap-4 mt-4">
                <button type="button" onClick={() => setView("list")} className="px-6 py-2 rounded-lg font-medium text-neutral-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-neutral-200">Save Video</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
