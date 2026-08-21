import { create } from 'zustand';
import { Room, Player, Team, GameSettings } from '@/types/game';
import { DEFAULT_GAME_SETTINGS } from '@/lib/constants';

interface RoomStoreState {
  currentRoom: Room | null;
  players: Player[];
  teams: Team[];
  isHost: boolean;
  myPlayerId: string;
  isUnlocked: boolean;

  setUnlocked: (unlocked: boolean) => void;
  createRoom: (title?: string, isPrivate?: boolean, pinCode?: string, customSettings?: Partial<GameSettings>, forcedCode?: string) => Room;
  joinRoom: (code: string, guestName: string, enteredPin?: string) => boolean;
  leaveRoom: () => void;
  setTeam: (playerId: string, teamId: string) => void;
  toggleReady: (playerId: string) => void;
  setPresenter: (playerId: string) => void;
  updateRoomSettings: (newSettings: Partial<GameSettings>) => void;
}

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const mockTeams: Team[] = [
  { id: 'team-blue', name: 'Mavi Takım', color: '#6366f1', score: 0, order_index: 0 },
  { id: 'team-red', name: 'Kırmızı Takım', color: '#ef4444', score: 0, order_index: 1 },
  { id: 'team-green', name: 'Yeşil Takım', color: '#10b981', score: 0, order_index: 2 },
  { id: 'team-yellow', name: 'Sarı Takım', color: '#f59e0b', score: 0, order_index: 3 },
];

export const useRoomStore = create<RoomStoreState>((set, get) => ({
  currentRoom: null,
  players: [],
  teams: mockTeams.slice(0, 2),
  isHost: false,
  myPlayerId: 'p-local',
  isUnlocked: false,

  setUnlocked: (unlocked) => set({ isUnlocked: unlocked }),

  createRoom: (title, isPrivate = false, pinCode, customSettings, forcedCode) => {
    const code = forcedCode ? forcedCode.toUpperCase() : generateRoomCode();
    const settings = { ...DEFAULT_GAME_SETTINGS, ...(customSettings || {}) };
    const room: Room = {
      id: `room-${Date.now()}`,
      code,
      title: title || 'Tabu Odası',
      is_private: isPrivate,
      password_hash: pinCode || null,
      settings,
      status: 'waiting',
      created_at: new Date().toISOString(),
    };

    const hostPlayer: Player = {
      id: 'p-host',
      guest_name: 'Oda Kurucusu (Host)',
      is_host: true,
      is_ready: true,
      is_presenter: true,
      team_id: 'team-blue',
    };

    const activeTeams = mockTeams.slice(0, settings.team_count || 2);

    set({
      currentRoom: room,
      players: [hostPlayer],
      teams: activeTeams,
      isHost: true,
      myPlayerId: hostPlayer.id,
      isUnlocked: true,
    });

    return room;
  },

  joinRoom: (code, guestName, enteredPin) => {
    const { currentRoom } = get();
    // Validate PIN if private
    if (currentRoom && currentRoom.is_private && currentRoom.password_hash) {
      if (currentRoom.password_hash !== enteredPin) {
        return false;
      }
    }

    const newPlayer: Player = {
      id: `p-${Date.now()}`,
      guest_name: guestName || `Oyuncu ${Math.floor(Math.random() * 100)}`,
      is_host: false,
      is_ready: false,
      is_presenter: false,
      team_id: 'team-red',
    };

    set((state) => ({
      players: [...state.players.filter(p => p.id !== newPlayer.id), newPlayer],
      myPlayerId: newPlayer.id,
      isUnlocked: true,
    }));

    return true;
  },

  leaveRoom: () => {
    set({
      currentRoom: null,
      players: [],
      isHost: false,
      isUnlocked: false,
    });
  },

  setTeam: (playerId, teamId) => {
    set((state) => ({
      players: state.players.map(p => p.id === playerId ? { ...p, team_id: teamId } : p)
    }));
  },

  toggleReady: (playerId) => {
    set((state) => ({
      players: state.players.map(p => p.id === playerId ? { ...p, is_ready: !p.is_ready } : p)
    }));
  },

  setPresenter: (playerId) => {
    set((state) => ({
      players: state.players.map(p => ({
        ...p,
        is_presenter: p.id === playerId
      }))
    }));
  },

  updateRoomSettings: (newSettings) => {
    set((state) => {
      if (!state.currentRoom) return state;
      const updatedSettings = { ...state.currentRoom.settings, ...newSettings };
      const teamCount = updatedSettings.team_count || 2;
      const activeTeams = mockTeams.slice(0, teamCount);

      return {
        currentRoom: {
          ...state.currentRoom,
          settings: updatedSettings
        },
        teams: activeTeams
      };
    });
  }
}));
