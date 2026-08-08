import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Check, X, Loader2, Users, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button, Card, Badge, cn } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';

interface PendingTeam {
  _id: string;
  name: string;
  description: string;
  leader: { _id: string; name: string };
  members: any[];
  requests: any[];
  maxMembers: number;
}

interface Registration {
  _id: string;
  event: { _id: string; title: string };
  user: { _id: string; name: string; email: string };
  details: {
    department: string;
    year: string;
    phone: string;
    motivation: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
  registeredAt: string;
}

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Teams' | 'Registrations'>('Teams');
  const [teams, setTeams] = useState<PendingTeam[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [teamsRes, regsRes] = await Promise.all([
        fetch('/api/admin/teams/pending'),
        fetch('/api/admin/registrations')
      ]);

      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        setTeams(teamsData);
      }
      if (regsRes.ok) {
        const regsData = await regsRes.json();
        setRegistrations(regsData);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      // Allow them to see access denied instead of immediately redirecting, to make testing easy
    } else if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user, loading]);

  const handleApproveTeam = async (teamId: string) => {
    setActionInProgress(teamId);
    try {
      const res = await fetch(`/api/admin/teams/${teamId}/approve`, { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Team approved');
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectTeam = async (teamId: string) => {
    setActionInProgress(teamId);
    try {
      const res = await fetch(`/api/admin/teams/${teamId}/reject`, { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Team rejected');
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleApproveRegistration = async (regId: string) => {
    setActionInProgress(regId);
    try {
      const res = await fetch(`/api/admin/registrations/${regId}/approve`, { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Registration approved');
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectRegistration = async (regId: string) => {
    setActionInProgress(regId);
    try {
      const res = await fetch(`/api/admin/registrations/${regId}/reject`, { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Registration rejected');
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-12 h-12 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin shadow-[0_0_15px_rgba(0,245,255,0.2)]" />
        <p className="text-neon-cyan font-mono text-xs animate-pulse">CHECKING SECURE PERMISSIONS...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-24">
        <Card glow variant="cyan" className="border-soft-red/20 bg-dark-surface/40 backdrop-blur-2xl p-10 text-center relative overflow-hidden glass-panel">
          <div className="absolute top-0 left-0 w-full h-1 bg-soft-red" />
          <AlertTriangle className="w-16 h-16 text-soft-red mx-auto mb-6 drop-shadow-[0_0_15px_rgba(255,77,77,0.5)] animate-bounce" />
          <h1 className="text-3xl font-black tracking-tighter mb-4 uppercase text-text-primary">ACCESS DENIED</h1>
          <p className="text-text-secondary font-mono text-sm leading-relaxed mb-8">
            &gt; SECURE PROTOCOL ALERT: Administrative clearance levels are required to view this sector. Identity not verified.
          </p>
          <Button variant="outline" onClick={() => navigate('/')} className="w-full uppercase tracking-widest text-xs py-3">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div>
          <Badge variant="cyan" className="mb-4">Admin Console</Badge>
          <h1 className="text-5xl font-black tracking-tighter mb-2">COMMAND <span className="text-neon-cyan drop-shadow-[0_0_10px_rgba(0,245,255,0.3)]">HQ</span></h1>
          <p className="text-text-secondary font-mono text-sm">&gt; Authorized sector: Manage pending squads and verify event operations.</p>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={fetchData} variant="outline" size="sm" className="p-2 gap-2 uppercase tracking-widest text-[10px]">
            <RefreshCw className="w-4 h-4 animate-spin-slow" /> Refresh Network
          </Button>
          <div className="flex bg-dark-surface p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button
              onClick={() => setActiveTab('Teams')}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3",
                activeTab === 'Teams' ? "bg-neon-cyan text-dark-bg shadow-[0_0_15px_rgba(0,245,255,0.3)]" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Users className="w-4 h-4" /> Pending Squads
            </button>
            <button
              onClick={() => setActiveTab('Registrations')}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3",
                activeTab === 'Registrations' ? "bg-electric-purple text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Calendar className="w-4 h-4" /> Operations Enroll
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin shadow-[0_0_15px_rgba(0,245,255,0.2)]" />
          <p className="text-neon-cyan font-mono text-xs animate-pulse">QUERYING CENTRAL DATABASE...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'Teams' ? (
            <motion.div
              key="teams"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {teams.length === 0 ? (
                <Card className="text-center py-16 border-white/5 glass-panel">
                  <Users className="w-12 h-12 text-text-secondary/20 mx-auto mb-4" />
                  <p className="text-text-secondary font-mono text-sm uppercase tracking-widest">&gt; NO PENDING SQUAD CREATION PROTOCOLS DISCOVERED.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {teams.map((team) => (
                    <div key={team._id}>
                      <Card glow variant="cyan" className="h-full flex flex-col group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-12 bg-neon-cyan shadow-[0_0_10px_rgba(0,245,255,0.5)]" />
                        <div className="flex justify-between items-start mb-6">
                          <Badge variant="cyan" className="font-mono">PENDING_APPROVAL</Badge>
                          <Badge variant="purple" className="font-mono">{team.members?.length || 1}/{team.maxMembers} NODES</Badge>
                        </div>

                        <h3 className="text-2xl font-black mb-2 tracking-tight">{team.name}</h3>
                        <p className="text-[10px] text-text-secondary mb-4 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                          Commander: <span className="text-text-primary">{team.leader?.name || 'Unknown'}</span>
                        </p>
                        <p className="text-text-secondary text-sm mb-8 flex-grow leading-relaxed font-mono opacity-80">{team.description}</p>

                        <div className="flex gap-4 pt-6 border-t border-white/5">
                          <Button
                            onClick={() => handleApproveTeam(team._id)}
                            variant="cyan"
                            className="flex-1 py-3 gap-2 text-[10px] font-black uppercase tracking-widest"
                            disabled={actionInProgress === team._id}
                          >
                            {actionInProgress === team._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleRejectTeam(team._id)}
                            variant="outline"
                            className="flex-1 py-3 gap-2 text-[10px] font-black uppercase tracking-widest hover:border-soft-red hover:text-soft-red transition-all"
                            disabled={actionInProgress === team._id}
                          >
                            {actionInProgress === team._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                            Reject
                          </Button>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="registrations"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {registrations.length === 0 ? (
                <Card className="text-center py-16 border-white/5 glass-panel">
                  <Calendar className="w-12 h-12 text-text-secondary/20 mx-auto mb-4" />
                  <p className="text-text-secondary font-mono text-sm uppercase tracking-widest">&gt; NO EVENT REGISTRATION DATA DISCOVERED.</p>
                </Card>
              ) : (
                <Card className="overflow-hidden p-0 border-white/5 glass-panel">
                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/5">
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Node</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Operation / Event</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Details</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Motivation</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Status</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-xs text-text-secondary">
                        {registrations.map((reg) => (
                          <tr key={reg._id} className="hover:bg-white/5 transition-all">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-text-primary font-sans">{reg.user?.name || 'Unknown'}</span>
                                <span className="text-[10px] text-text-secondary">{reg.user?.email || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-text-primary font-sans text-sm">{reg.event?.title || 'Unknown Event'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1 text-[10px]">
                                <span>Dept: {reg.details?.department || 'N/A'}</span>
                                <span>Year: {reg.details?.year || 'N/A'}</span>
                                <span>Phone: {reg.details?.phone || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 max-w-xs truncate" title={reg.details?.motivation}>
                              {reg.details?.motivation || 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant={
                                  reg.status === 'Approved' ? 'green' :
                                  reg.status === 'Pending' ? 'cyan' : 'red'
                                }
                                className="text-[8px] font-mono tracking-widest"
                              >
                                {reg.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleApproveRegistration(reg._id)}
                                  className="p-2 bg-neon-green/10 hover:bg-neon-green/20 text-neon-green rounded-xl transition-all border border-neon-green/20"
                                  title="Approve Node"
                                  disabled={actionInProgress === reg._id}
                                >
                                  {actionInProgress === reg._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleRejectRegistration(reg._id)}
                                  className="p-2 bg-soft-red/10 hover:bg-soft-red/20 text-soft-red rounded-xl transition-all border border-soft-red/20"
                                  title="Reject Node"
                                  disabled={actionInProgress === reg._id}
                                >
                                  {actionInProgress === reg._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Admin;
