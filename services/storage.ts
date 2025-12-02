import { User, Note, AuthResponse } from '../types';

const USERS_KEY = 'meetpulse_users';
const NOTES_KEY = 'meetpulse_notes';
const SESSION_KEY = 'meetpulse_session';

// Helper to delay execution to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const storageService = {
  // Auth
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    await delay(600);
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: (User & { password: string })[] = usersRaw ? JSON.parse(usersRaw) : [];

    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password, // In a real app, this MUST be hashed.
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const token = `fake-jwt-${newUser.id}`;
    const userToReturn = { id: newUser.id, name: newUser.name, email: newUser.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: userToReturn, token }));

    return { user: userToReturn, token };
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    await delay(600);
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: (User & { password: string })[] = usersRaw ? JSON.parse(usersRaw) : [];

    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const token = `fake-jwt-${user.id}`;
    const userToReturn = { id: user.id, name: user.name, email: user.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: userToReturn, token }));

    return { user: userToReturn, token };
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getSession: (): AuthResponse | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  // Notes
  getNotes: async (userId: string): Promise<Note[]> => {
    await delay(400);
    const notesRaw = localStorage.getItem(NOTES_KEY);
    const allNotes: Note[] = notesRaw ? JSON.parse(notesRaw) : [];
    return allNotes.filter(n => n.userId === userId).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  saveNote: async (note: Partial<Note> & { userId: string }): Promise<Note> => {
    await delay(500);
    const notesRaw = localStorage.getItem(NOTES_KEY);
    const allNotes: Note[] = notesRaw ? JSON.parse(notesRaw) : [];

    const now = new Date().toISOString();
    let savedNote: Note;

    if (note.id) {
      // Update
      const index = allNotes.findIndex(n => n.id === note.id);
      if (index === -1) throw new Error('Note not found');
      
      savedNote = {
        ...allNotes[index],
        ...note,
        updatedAt: now,
      };
      allNotes[index] = savedNote;
    } else {
      // Create
      savedNote = {
        id: crypto.randomUUID(),
        userId: note.userId,
        title: note.title || 'Untitled Meeting',
        content: note.content || '',
        participants: note.participants || [],
        tags: note.tags || [],
        createdAt: now,
        updatedAt: now,
        summary: note.summary,
        actionItems: note.actionItems
      };
      allNotes.push(savedNote);
    }

    localStorage.setItem(NOTES_KEY, JSON.stringify(allNotes));
    return savedNote;
  },

  deleteNote: async (noteId: string) => {
    await delay(300);
    const notesRaw = localStorage.getItem(NOTES_KEY);
    const allNotes: Note[] = notesRaw ? JSON.parse(notesRaw) : [];
    const newNotes = allNotes.filter(n => n.id !== noteId);
    localStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
  }
};
