import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { Plus, Edit2, Trash2, Video, FileText, Heart, MessageCircle, LayoutGrid, Image as ImageIcon, Upload } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Post, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { OperationType, handleFirestoreError } from '../lib/utils';
import { Navigate, Link } from 'react-router-dom';

const Admin: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'text' as 'text' | 'video' | 'image',
    videoUrl: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (!isAdmin) return;
    
    const postsQ = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribePosts = onSnapshot(postsQ, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
    });

    const usersQ = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(usersQ, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        uid: (doc.data() as any).uid || doc.id 
      } as UserProfile)));
    });

    return () => {
      unsubscribePosts();
      unsubscribeUsers();
    };
  }, [isAdmin]);

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;


    try {
      if (editingPost) {
        await updateDoc(doc(db, 'posts', editingPost.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        
      } else {
        await addDoc(collection(db, 'posts'), {

          
  ...formData,
  authorId: user.uid,
  authorName: user.displayName,
  authorPhoto: user.photoURL,
  likesCount: 0,
  commentsCount: 0,
  createdAt: serverTimestamp(),

  // 🔥 FIX
  createdAtNumber: Date.now()
});
      }
      closeModal();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'posts', auth);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      type: post.type,
      videoUrl: post.videoUrl || '',
      imageUrl: post.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const toggleUserRole = async (targetUser: UserProfile) => {
    if (targetUser.uid === auth.currentUser?.uid) {
      alert("You cannot change your own role.");
      return;
    }
    
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const confirmMsg = `Are you sure you want to make ${targetUser.displayName} a ${newRole}?`;
    
    if (window.confirm(confirmMsg)) {
      try {
        console.log(`Attempting to change role of ${targetUser.uid} to ${newRole}`);
        const userRef = doc(db, 'users', targetUser.uid);
        await updateDoc(userRef, {
          role: newRole
        });
        alert(`Successfully updated ${targetUser.displayName} to ${newRole}`);
      } catch (error) {
        console.error("Role update failed:", error);
        handleFirestoreError(error, OperationType.UPDATE, `users/${targetUser.uid}`, auth);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) { // Roughly 800KB to account for Base64 bloat under 1MB limit
      alert("File is too large. Please choose an image under 800KB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `posts/${postId}`, auth);
    }
  };

  const handleDeleteUser = async (targetUser: UserProfile) => {
    if (targetUser.uid === auth.currentUser?.uid) {
      alert("You cannot delete your own profile.");
      return;
    }

    if (window.confirm(`Are you sure you want to PERMANENTLY delete ${targetUser.displayName}? This cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'users', targetUser.uid));
        alert(`Successfully deleted ${targetUser.displayName}`);
      } catch (error) {
        console.error("User deletion failed:", error);
        handleFirestoreError(error, OperationType.DELETE, `users/${targetUser.uid}`, auth);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    setFormData({ title: '', content: '', type: 'text', videoUrl: '', imageUrl: '' });
  };

  return (
    <div className="bg-[#f1f5f9] min-h-screen font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 p-8 flex justify-between items-center bg-white shadow-sm sticky top-0 z-10">
        <div>
          <h1 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">Content Sync Engine</h1>
          <p className="text-3xl font-black text-slate-900 tracking-tight">YourDomain.com <span className="text-blue-600 italic">Admin Terminal</span></p>
        </div>
        <div className="flex gap-4">
          <Link 
            to="/"
            className="hidden sm:flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all font-bold text-sm"
          >
            <LayoutGrid size={18} /> View Feed
          </Link>
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20"></div>
             <div className="text-[11px] text-slate-600 font-bold uppercase tracking-tight">Admin: {user?.displayName || 'User'}</div>
          </div>
          {activeTab === 'posts' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 active:scale-[0.98] font-bold text-sm"
            >
              <Plus size={20} /> Create Post
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="p-8 max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-slate-200/50 p-1 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'posts' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Content Posts
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            User Network
          </button>
        </div>

        {activeTab === 'posts' ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <LayoutGrid size={14} /> Active Inventory
              </h2>
              <div className="text-xs text-slate-400 font-medium lowercase italic">Total Entries: {posts.length}</div>
            </div>

            <div className="grid gap-4">
              {posts.map((post) => (
                <motion.div 
                  layout
                  key={post.id} 
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-6 flex-1">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                      post.type === 'video' ? 'bg-blue-50 border-blue-100 text-blue-600' : 
                      post.type === 'image' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                      'bg-indigo-50 border-indigo-100 text-indigo-600'
                    }`}>
                      {post.type === 'video' ? <Video size={24} /> : post.type === 'image' ? <ImageIcon size={24} /> : <FileText size={24} />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-slate-100 rounded uppercase tracking-tighter text-slate-500">
                          {post.type}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">#{post.id.slice(0, 8)}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight line-clamp-1">{post.title}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                           <Heart size={12} className="text-red-400" /> {post.likesCount} Likes
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-4">
                           <MessageCircle size={12} className="text-blue-400" /> {post.commentsCount} Comments
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-6">
                    <div className="text-right mr-4 hidden md:block">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Published</div>
                      <div className="text-xs font-mono font-medium text-slate-600">{post.createdAt?.toDate().toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(post)} 
                        className="h-10 w-10 flex items-center justify-center bg-slate-50 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)} 
                        className="h-10 w-10 flex items-center justify-center bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm shadow-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Registered Accounts</h2>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-full">{users.length} Total</span>
            </div>
            <div className="divide-y divide-slate-100">
              {users.map((u) => (
                <div key={u.uid} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={u.photoURL} alt="" className="h-11 w-11 rounded-full ring-2 ring-slate-100" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{u.displayName}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleUserRole(u)}
                        className={`text-[10px] font-bold px-3 py-1 rounded-lg transition-all ${
                          u.role === 'admin' 
                            ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' 
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100'
                        }`}
                      >
                        {u.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u)}
                        className="h-8 w-8 flex items-center justify-center bg-slate-100 text-slate-400 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${u.role === 'admin' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        {u.role}
                      </span>
                    </div>
                    <div className="hidden sm:block text-right min-w-[120px]">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Joined</p>
                      <p className="text-xs font-mono text-slate-600">{u.createdAt?.toDate().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Tool */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col border border-slate-200"
            >
              <div className="p-10 pb-6 flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingPost ? 'Update Entry' : 'New Creation'}</h2>
                  <p className="text-sm font-medium text-slate-400 mt-1 italic">Define your content parameters.</p>
                </div>
                <button onClick={closeModal} className="h-10 w-10 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 pt-4 space-y-8">
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2 group-focus-within:text-blue-600 transition-colors">Heading</label>
                    <input 
                      required
                      type="text" 
                      value={formData.title || ''}
                      onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-600 focus:bg-white focus:outline-none text-base font-bold transition-all placeholder:text-slate-300 shadow-inner shadow-slate-200/20"
                      placeholder="Title of this piece"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2 group-focus-within:text-blue-600 transition-colors">Narrative Body</label>
                    <textarea 
                      required
                      value={formData.content || ''}
                      onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-600 focus:bg-white focus:outline-none text-sm font-medium leading-relaxed transition-all placeholder:text-slate-300 shadow-inner shadow-slate-200/20"
                      placeholder="Draft your story here..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2 group-focus-within:text-blue-600 transition-colors">Format</label>
                      <select 
                        value={formData.type}
                        onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-600 focus:bg-white focus:outline-none text-sm font-bold bg-white cursor-pointer transition-all"
                      >
                        <option value="text">Text Article</option>
                        <option value="video">Video Insight</option>
                        <option value="image">Visual Image</option>
                      </select>
                    </div>

                    {formData.type === 'video' && (
                      <div className="group">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2 group-focus-within:text-blue-600 transition-colors">Video Endpoint</label>
                        <input 
                          type="url" 
                          value={formData.videoUrl || ''}
                          onChange={e => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-600 focus:bg-white focus:outline-none text-sm font-bold transition-all placeholder:text-slate-300 shadow-inner shadow-slate-200/20"
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                    )}

                    {formData.type === 'image' && (
                      <div className="space-y-4">
                        <div className="group">
                          <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2 group-focus-within:text-blue-600 transition-colors">Image Direct Link (Optional)</label>
                          <input 
                            type="url" 
                            value={formData.imageUrl || ''}
                            onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-blue-600 focus:bg-white focus:outline-none text-sm font-bold transition-all placeholder:text-slate-300 shadow-inner shadow-slate-200/20"
                            placeholder="https://..."
                          />
                        </div>
                        
                        <div className="relative">
                          <div className="flex items-center gap-4">
                            <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:border-blue-600 hover:bg-blue-50/50 cursor-pointer transition-all group">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleFileUpload}
                              />
                              <Upload size={24} className="text-slate-400 group-hover:text-blue-600 mb-2" />
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Choose Local Image</span>
                              <span className="text-[9px] text-slate-400 mt-1">Max 800KB (Firestore Limit)</span>
                            </label>
                            
                            {formData.imageUrl && (
                              <div className="w-24 h-24 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-100">
                                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                          {isUploading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl hover:bg-blue-700 active:scale-[0.99] transition-all text-lg shadow-2xl shadow-blue-500/40"
                  >
                    {editingPost ? 'Commit Changes' : 'Publish to Stream'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
