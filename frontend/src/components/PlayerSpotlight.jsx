import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import { playerAPI } from '../services/api';

const PlayerSpotlight = () => {
  const [activePlayer, setActivePlayer] = useState(0);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      let data = await playerAPI.getAll({ is_spotlight: true, limit: 4 });

      if (!data || data.length === 0) {
        // fallback if no spotlight players are set yet
        data = await playerAPI.getAll({ limit: 4 });
      }
      setPlayers(data.slice(0, 4));
      setLoading(false);
    } catch (error) {
      console.error('Failed to load players:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="spotlight" className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-pulse text-cyan-400">Loading players...</div>
        </div>
      </section>
    );
  }

  const getFullName = (player) =>
    (player.full_name || `${player.first_name || ''} ${player.last_name || ''}`).trim() || 'Unnamed Player';

  if (players.length === 0) {
    return (
      <section id="spotlight" className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
          No players found. Add players through the admin panel.
        </div>
      </section>
    );
  }

  const currentPlayer = players[activePlayer];

  return (
    <section id="spotlight" className="py-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Player <span className="gradient-text">Spotlight</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Meet the rising stars developing their skills at Eastleigh FC Academy
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="grid grid-cols-2 gap-4">
            {players.map((player, idx) => (
              <button
                key={player.id}
                onClick={() => setActivePlayer(idx)}
                className={`relative rounded-2xl overflow-hidden aspect-square transition-all duration-300 ${activePlayer === idx ? 'ring-4 ring-cyan-400 scale-105' : 'opacity-60 hover:opacity-100'}`}
              >
                <img 
                  src={player.image_url || `https://ui-avatars.com/api/?name=${player.first_name}+${player.last_name}&background=0D8ABC&color=fff&size=400`} 
                  alt={getFullName(player)} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="font-bold text-sm">{getFullName(player)}</div>
                  <div className="text-xs text-cyan-400">{player.position}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="glass rounded-3xl p-8 animate-fade-in">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-display text-3xl font-bold mb-1">{getFullName(currentPlayer)}</h3>
                <p className="text-cyan-400 font-medium">{currentPlayer.position}</p>
              </div>
              <div className="glass px-4 py-2 rounded-full">
                <span className="text-2xl font-bold">{currentPlayer.age || '--'}</span>
                <span className="text-sm text-gray-400 ml-1">years</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <div className="font-display text-2xl font-bold text-green-400">{currentPlayer.stats_goals ?? currentPlayer.stats?.goals ?? 0}</div>
                <div className="text-xs text-gray-400">Goals</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <div className="font-display text-2xl font-bold text-blue-400">{currentPlayer.stats_assists ?? currentPlayer.stats?.assists ?? 0}</div>
                <div className="text-xs text-gray-400">Assists</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <div className="font-display text-2xl font-bold text-white">{currentPlayer.stats_matches ?? currentPlayer.stats?.matches ?? 0}</div>
                <div className="text-xs text-gray-400">Matches</div>
              </div>
            </div>

            <div className="relative">
              <Quote className="w-8 h-8 text-cyan-400 opacity-50" />
              <p className="text-lg italic text-gray-300 ml-10 -mt-6">
                "{currentPlayer.quote || 'No quote available'}"
              </p>
            </div>

            <button className="w-full mt-6 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-semibold transition-colors">
              View Full Profile
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlayerSpotlight;