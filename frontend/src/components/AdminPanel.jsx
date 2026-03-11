import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Edit2, Shield, Database, AlertTriangle, Lock, LogOut } from 'lucide-react';
import { squadAPI, playerAPI, applicationAPI, initDatabase } from '../services/api';

// Admin credentials - CHANGE THIS IN PRODUCTION!
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'eastleigh2024';

const AdminPanel = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [activeTab, setActiveTab] = useState('squads');
  const [squads, setSquads] = useState([]);
  const [players, setPlayers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  const [showSquadForm, setShowSquadForm] = useState(false);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingSquad, setEditingSquad] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);

  const [squadForm, setSquadForm] = useState({
    name: '', age_group: '', formation: '4-3-3', head_coach: '', assistant_coach: ''
  });
  const [playerForm, setPlayerForm] = useState({
    first_name: '', last_name: '', age: '', position: 'MID', squad_id: '',
    stats_goals: 0, stats_assists: 0, stats_matches: 0, quote: ''
  });

  useEffect(() => {
    const auth = sessionStorage.getItem('eastleigh_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);


  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('eastleigh_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid username or password');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('eastleigh_admin_auth');
    setUsername('');
    setPassword('');
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'squads') {
        const data = await squadAPI.getAll();
        setSquads(data);
      } else if (activeTab === 'players') {
        const [squadsData, playersData] = await Promise.all([
          squadAPI.getAll(),
          playerAPI.getAll()
        ]);
        setSquads(squadsData);
        setPlayers(playersData);
      } else if (activeTab === 'applications') {
        const data = await applicationAPI.getAll();
        setApplications(data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const requestConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const executeConfirm = () => {
    if (confirmAction) confirmAction();
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const handleInitDatabase = async () => {
    try {
      await initDatabase();
      alert('Database initialized successfully!');
      loadData();
    } catch (err) {
      alert('Failed to initialize database: ' + err.message);
    }
  };

  const handleCreateSquad = async (e) => {
    e.preventDefault();
    try {
      await squadAPI.create(squadForm);
      setShowSquadForm(false);
      setSquadForm({ name: '', age_group: '', formation: '4-3-3', head_coach: '', assistant_coach: '' });
      loadData();
    } catch (err) {
      alert('Failed to create squad: ' + err.message);
    }
  };

  const handleUpdateSquad = async (e) => {
    e.preventDefault();
    try {
      await squadAPI.update(editingSquad.id, squadForm);
      setEditingSquad(null);
      setShowSquadForm(false);
      loadData();
    } catch (err) {
      alert('Failed to update squad: ' + err.message);
    }
  };

  const handleDeleteSquad = (id) => {
    requestConfirm('Are you sure? This will delete all players in this squad.', async () => {
      try {
        await squadAPI.delete(id);
        loadData();
      } catch (err) {
        alert('Failed to delete squad: ' + err.message);
      }
    });
  };

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    try {
      await playerAPI.create(playerForm);
      setShowPlayerForm(false);
      setPlayerForm({
        first_name: '', last_name: '', age: '', position: 'MID', squad_id: '',
        stats_goals: 0, stats_assists: 0, stats_matches: 0, quote: ''
      });
      loadData();
    } catch (err) {
      alert('Failed to create player: ' + err.message);
    }
  };

  const handleUpdatePlayer = async (e) => {
    e.preventDefault();
    try {
      await playerAPI.update(editingPlayer.id, playerForm);
      setEditingPlayer(null);
      setShowPlayerForm(false);
      loadData();
    } catch (err) {
      alert('Failed to update player: ' + err.message);
    }
  };

  const handleDeletePlayer = (id) => {
    requestConfirm('Are you sure you want to delete this player?', async () => {
      try {
        await playerAPI.delete(id);
        loadData();
      } catch (err) {
        alert('Failed to delete player: ' + err.message);
      }
    });
  };

  const handleMovePlayer = async (playerId, newSquadId) => {
    try {
      await playerAPI.moveToSquad(playerId, parseInt(newSquadId));
      loadData();
    } catch (err) {
      alert('Failed to move player: ' + err.message);
    }
  };

  const handleUpdateApplicationStatus = async (id, status) => {
    try {
      await applicationAPI.updateStatus(id, status);
      loadData();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const startEditSquad = (squad) => {
    setEditingSquad(squad);
    setSquadForm({
      name: squad.name,
      age_group: squad.age_group,
      formation: squad.formation,
      head_coach: squad.head_coach || '',
      assistant_coach: squad.assistant_coach || ''
    });
    setShowSquadForm(true);
  };

  const startEditPlayer = (player) => {
    setEditingPlayer(player);
    setPlayerForm({
      first_name: player.first_name,
      last_name: player.last_name,
      age: player.age || '',
      position: player.position,
      squad_id: player.squad_id,
      stats_goals: player.stats?.goals || 0,
      stats_assists: player.stats?.assists || 0,
      stats_matches: player.stats?.matches || 0,
      quote: player.quote || ''
    });
    setShowPlayerForm(true);
  };

  const getSquadName = (id) => squads.find(s => s.id === id)?.name || 'Unknown';

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-gray-400 mt-2">Eastleigh FC Academy</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400"
                placeholder="Enter Passsword"
                required
              />
            </div>
            
            {authError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm text-center">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Login
            </button>
          </form>

          <button
            onClick={onClose}
            className="w-full mt-4 glass py-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            Back to Website
          </button>
        </div>
      </div>
    );
  }

  // CONFIRMATION MODAL
  const ConfirmModal = () => {
    if (!showConfirmModal) return null;
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="glass rounded-2xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 mb-4 text-yellow-400">
            <AlertTriangle className="w-8 h-8" />
            <h3 className="text-xl font-bold">Confirm Action</h3>
          </div>
          <p className="text-gray-300 mb-6">{confirmMessage}</p>
          <div className="flex space-x-3">
            <button
              onClick={executeConfirm}
              className="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded-lg font-semibold"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="flex-1 glass hover:bg-white/10 py-2 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // MAIN ADMIN PANEL
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-4">
      <ConfirmModal />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold">Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogout}
              className="glass px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            <button onClick={onClose} className="glass p-2 rounded-lg hover:bg-white/10">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          {['squads', 'players', 'applications'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                activeTab === tab ? 'bg-blue-600' : 'glass'
              }`}
            >
              {tab}
            </button>
          ))}
          <button
            onClick={handleInitDatabase}
            className="glass px-4 py-2 rounded-lg font-medium text-cyan-400 hover:bg-cyan-400/20 flex items-center space-x-2"
          >
            <Database className="w-4 h-4" />
            <span>Init DB</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        {/* SQUADS TAB */}
        {activeTab === 'squads' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Squads</h2>
              <button
                onClick={() => {
                  setEditingSquad(null);
                  setSquadForm({ name: '', age_group: '', formation: '4-3-3', head_coach: '', assistant_coach: '' });
                  setShowSquadForm(true);
                }}
                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Squad</span>
              </button>
            </div>

            {showSquadForm && (
              <form onSubmit={editingSquad ? handleUpdateSquad : handleCreateSquad} className="glass rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">{editingSquad ? 'Edit Squad' : 'New Squad'}</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Squad Name"
                    value={squadForm.name}
                    onChange={(e) => setSquadForm({...squadForm, name: e.target.value})}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Age Group (e.g. 18+)"
                    value={squadForm.age_group}
                    onChange={(e) => setSquadForm({...squadForm, age_group: e.target.value})}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                    required
                  />
                  <select
                    value={squadForm.formation}
                    onChange={(e) => setSquadForm({...squadForm, formation: e.target.value})}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                  >
                    <option value="4-3-3">4-3-3</option>
                    <option value="4-4-2">4-4-2</option>
                    <option value="4-2-3-1">4-2-3-1</option>
                    <option value="3-5-2">3-5-2</option>
                    <option value="5-3-2">5-3-2</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Head Coach"
                    value={squadForm.head_coach}
                    onChange={(e) => setSquadForm({...squadForm, head_coach: e.target.value})}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Assistant Coach"
                    value={squadForm.assistant_coach}
                    onChange={(e) => setSquadForm({...squadForm, assistant_coach: e.target.value})}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 md:col-span-2"
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg">
                    {editingSquad ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSquadForm(false);
                      setEditingSquad(null);
                    }}
                    className="glass px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {squads.map((squad) => (
                <div key={squad.id} className="glass rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{squad.name}</h3>
                    <div className="flex space-x-1">
                      <button onClick={() => startEditSquad(squad)} className="p-1 hover:text-cyan-400">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteSquad(squad.id)} className="p-1 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Age: {squad.age_group}</p>
                  <p className="text-sm text-gray-400 mb-1">Formation: {squad.formation}</p>
                  <p className="text-sm text-gray-400 mb-1">Coach: {squad.head_coach || 'TBD'}</p>
                  <p className="text-sm text-cyan-400 mt-2">{squad.players?.length || 0} players</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Players</h2>
              <button
                onClick={() => {
                  setEditingPlayer(null);
                  setPlayerForm({
                    first_name: '', last_name: '', age: '', position: 'MID', squad_id: '',
                    stats_goals: 0, stats_assists: 0, stats_matches: 0, quote: ''
                  });
                  setShowPlayerForm(true);
                }}
                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Player</span>
              </button>
            </div>

            {showPlayerForm && (
              <form onSubmit={editingPlayer ? handleUpdatePlayer : handleCreatePlayer} className="glass rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">{editingPlayer ? 'Edit Player' : 'New Player'}</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={playerForm.first_name}
                    onChange={(e) => setPlayerForm({...playerForm, first_name: e.target.value})}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={playerForm.last_name}
                    onChange={(e) => setPlayerForm({...playerForm, last_name: e.target.value})}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    value={playerForm.age}
                    onChange={(e) => setPlayerForm({...playerForm, age: e.target.value})}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                  />
                  <select
                    value={playerForm.position}
                    onChange={(e) => setPlayerForm({...playerForm, position: e.target.value})}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                  >
                    <option value="GK">Goalkeeper</option>
                    <option value="DEF">Defender</option>
                    <option value="MID">Midfielder</option>
                    <option value="FWD">Forward</option>
                  </select>
                  <select
                    value={playerForm.squad_id}
                    onChange={(e) => setPlayerForm({...playerForm, squad_id: parseInt(e.target.value)})}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                    required
                  >
                    <option value="">Select Squad</option>
                    {squads.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Goals"
                    value={playerForm.stats_goals}
                    onChange={(e) => setPlayerForm({...playerForm, stats_goals: parseInt(e.target.value) || 0})}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Assists"
                    value={playerForm.stats_assists}
                    onChange={(e) => setPlayerForm({...playerForm, stats_assists: parseInt(e.target.value) || 0})}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Matches"
                    value={playerForm.stats_matches}
                    onChange={(e) => setPlayerForm({...playerForm, stats_matches: parseInt(e.target.value) || 0})}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Quote"
                    value={playerForm.quote}
                    onChange={(e) => setPlayerForm({...playerForm, quote: e.target.value})}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 md:col-span-3"
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg">
                    {editingPlayer ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlayerForm(false);
                      setEditingPlayer(null);
                    }}
                    className="glass px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full glass rounded-xl overflow-hidden">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Age</th>
                    <th className="text-left p-4">Position</th>
                    <th className="text-left p-4">Squad</th>
                    <th className="text-left p-4">Stats (G/A/M)</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id} className="border-t border-white/10">
                      <td className="p-4">{player.full_name}</td>
                      <td className="p-4">{player.age || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          player.position === 'GK' ? 'bg-yellow-500/20 text-yellow-400' :
                          player.position === 'DEF' ? 'bg-blue-500/20 text-blue-400' :
                          player.position === 'MID' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {player.position}
                        </span>
                      </td>
                      <td className="p-4">{getSquadName(player.squad_id)}</td>
                      <td className="p-4 text-sm">
                        {player.stats?.goals}/{player.stats?.assists}/{player.stats?.matches}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button onClick={() => startEditPlayer(player)} className="p-1 hover:text-cyan-400">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <select
                            onChange={(e) => handleMovePlayer(player.id, e.target.value)}
                            className="bg-transparent text-xs border border-white/20 rounded px-2 py-1"
                            value={player.squad_id}
                            title="Move to squad"
                          >
                            {squads.map((s) => (
                              <option key={s.id} value={s.id}>Move to {s.name}</option>
                            ))}
                          </select>
                          <button onClick={() => handleDeletePlayer(player.id)} className="p-1 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Applications</h2>
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="glass rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">{app.first_name} {app.last_name}</h3>
                      <p className="text-sm text-gray-400">{app.email} • {app.phone}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      app.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                      app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Position: {app.position} • DOB: {app.date_of_birth}</p>
                  <p className="text-sm mb-3">{app.message}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                      className="px-3 py-1 bg-green-600/20 text-green-400 rounded text-sm hover:bg-green-600/30"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                      className="px-3 py-1 bg-red-600/20 text-red-400 rounded text-sm hover:bg-red-600/30"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleUpdateApplicationStatus(app.id, 'reviewed')}
                      className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded text-sm hover:bg-blue-600/30"
                    >
                      Mark Reviewed
                    </button>
                  </div>
                </div>
              ))}
              {applications.length === 0 && (
                <p className="text-gray-400 text-center py-8">No applications yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;