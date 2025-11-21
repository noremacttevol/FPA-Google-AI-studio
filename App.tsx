import React, { useState, useEffect, useRef } from 'react';
import { chatWithFPAi, analyzeInputForData } from './services/geminiService';
import { UserProfile, Skill, InventoryItem, ChatMessage, PendingAction, SkillLevel, SquadMember } from './types';

// Icons
const Icons = {
    Chat: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>,
    Profile: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
    Squad: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
    Wifi: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 13.5h7.5m-7.5 4.5h7.5m-9-9h10.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-10.5a2.25 2.25 0 01-2.25-2.25v-10.5a2.25 2.25 0 012.25-2.25z" /></svg>,
    WifiOff: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.5 10.5a6.002 6.002 0 00-1.276 1.941M13.5 13.5a6.002 6.002 0 001.276-1.941M12 15c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5zm-7.5 0a7.5 7.5 0 011.06-3.842m12.88 0A7.5 7.5 0 0121 15m-3 0a3 3 0 01-1.876 2.782M7.876 17.782A3 3 0 016 15" /></svg>,
    Bolt: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
    Plus: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
    X: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
};

// Mock Data
const INITIAL_USER: UserProfile = {
    id: 'user-1',
    name: 'Alex Chen',
    location: 'San Francisco, CA',
    skills: [
        { id: 's1', name: 'First Aid', level: SkillLevel.Beginner, verified: true }
    ],
    inventory: [
        { id: 'i1', name: 'Flashlight', quantity: 2, category: 'Lighting' },
        { id: 'i2', name: 'Canned Beans', quantity: 10, category: 'Food' }
    ],
    readinessScore: 42
};

const INITIAL_SQUAD: SquadMember[] = [
    { id: 'sq1', name: 'Sarah J.', role: 'Medic', status: 'Online', distance: '0.2 mi' },
    { id: 'sq2', name: 'Mike T.', role: 'Comms', status: 'Safe', distance: '0.5 mi' },
    { id: 'sq3', name: 'Davina R.', role: 'Logistics', status: 'Danger', distance: '1.2 mi' }
];

export default function App() {
    const [activeTab, setActiveTab] = useState<'chat' | 'profile' | 'squad'>('chat');
    const [isOffline, setIsOffline] = useState(false);
    const [user, setUser] = useState<UserProfile>(INITIAL_USER);
    const [squad, setSquad] = useState<SquadMember[]>(INITIAL_SQUAD);
    
    // Chat State
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: 'I am FPAi. I\'m ready to help you organize your squad and supplies. What\'s on your mind?', timestamp: new Date() }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // AI "Observer" State
    const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);

    // Effects
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            text: inputText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // 1. Kick off AI Observer in parallel
        if (!isOffline) {
            analyzeInputForData(userMsg.text).then(action => {
                if (action) {
                    setPendingActions(prev => [action, ...prev]);
                }
            });
        }

        // 2. Main Chat Response
        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const responseText = await chatWithFPAi(history, userMsg.text, isOffline);

        const aiMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'model',
            text: responseText,
            timestamp: new Date(),
            isOffline
        };

        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
    };

    const handleActionDecision = (action: PendingAction, approved: boolean) => {
        if (approved) {
            if (action.type === 'ADD_SKILL') {
                const newSkill: Skill = {
                    id: crypto.randomUUID(),
                    name: action.data.name || 'New Skill',
                    level: (action.data.level as SkillLevel) || SkillLevel.Beginner,
                    verified: false
                };
                setUser(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
            } else if (action.type === 'ADD_INVENTORY') {
                const newItem: InventoryItem = {
                    id: crypto.randomUUID(),
                    name: action.data.name || 'New Item',
                    quantity: action.data.quantity || 1,
                    category: action.data.category || 'Misc'
                };
                setUser(prev => ({ ...prev, inventory: [...prev.inventory, newItem] }));
            } else if (action.type === 'UPDATE_INFO') {
                // Handle general info updates (location etc)
                if (action.data.value && action.description.toLowerCase().includes('location')) {
                     setUser(prev => ({ ...prev, location: action.data.value }));
                }
            }
            
            // Optional: Add a system message confirming the update
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'system',
                text: `✓ Profile updated: ${action.description}`,
                timestamp: new Date()
            } as any]);
        }
        
        setPendingActions(prev => prev.filter(p => p.id !== action.id));
    };

    return (
        <div className="flex h-full w-full bg-fpa-dark text-fpa-text overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-16 sm:w-20 bg-fpa-panel flex flex-col items-center py-6 border-r border-slate-700 space-y-8 z-20">
                <div className="w-10 h-10 rounded-full bg-fpa-accent flex items-center justify-center text-fpa-dark font-bold text-xl shadow-lg shadow-fpa-accent/20">
                    F
                </div>
                <div className="flex flex-col space-y-6 w-full items-center flex-1">
                    <NavIcon active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<Icons.Chat />} label="Comms" />
                    <NavIcon active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<Icons.Profile />} label="Identity" />
                    <NavIcon active={activeTab === 'squad'} onClick={() => setActiveTab('squad')} icon={<Icons.Squad />} label="Squad" />
                </div>
                <button 
                    onClick={() => setIsOffline(!isOffline)}
                    className={`p-3 rounded-xl transition-all ${isOffline ? 'bg-fpa-danger/20 text-fpa-danger' : 'bg-slate-700/30 text-slate-400 hover:text-white'}`}
                    title="Toggle Offline Mode"
                >
                    {isOffline ? <Icons.WifiOff /> : <Icons.Wifi />}
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative min-w-0">
                {/* Header */}
                <header className="h-16 border-b border-slate-700 flex items-center justify-between px-6 bg-fpa-dark/90 backdrop-blur-sm z-10">
                    <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        {activeTab === 'chat' && 'SECURE CHANNEL'}
                        {activeTab === 'profile' && 'OPERATOR PROFILE'}
                        {activeTab === 'squad' && 'SQUAD STATUS'}
                        {isOffline && <span className="text-xs bg-fpa-danger text-white px-2 py-0.5 rounded font-bold tracking-wider animate-pulse">OFFLINE</span>}
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-slate-400">READINESS</div>
                            <div className="text-sm font-bold text-fpa-success">{user.readinessScore}%</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`} alt="Avatar" />
                        </div>
                    </div>
                </header>

                {/* View Content */}
                <main className="flex-1 overflow-hidden relative">
                    {activeTab === 'chat' && (
                        <div className="h-full flex flex-col">
                            <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
                                {messages.map(msg => (
                                    <MessageBubble key={msg.id} message={msg} />
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start animate-pulse">
                                        <div className="bg-fpa-panel rounded-2xl rounded-tl-none py-3 px-4 text-slate-400 text-sm">
                                            FPAi is calculating...
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-fpa-dark border-t border-slate-700">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Report status or ask for guidance..."
                                        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-fpa-accent text-slate-200 placeholder-slate-500 transition-colors"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!inputText.trim() || isTyping}
                                        className="bg-fpa-accent text-fpa-dark font-bold px-6 py-3 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        SEND
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="h-full overflow-y-auto p-6">
                            <div className="max-w-3xl mx-auto space-y-8">
                                <section>
                                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Skills & Certifications</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {user.skills.map(skill => (
                                            <div key={skill.id} className="bg-fpa-panel p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium text-fpa-text">{skill.name}</div>
                                                    <div className="text-xs text-fpa-accent">{skill.level}</div>
                                                </div>
                                                {skill.verified && <Icons.Check />}
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Inventory Manifest</h2>
                                    <div className="bg-fpa-panel rounded-lg border border-slate-700 overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-800/50 text-slate-400">
                                                <tr>
                                                    <th className="p-4 font-medium">Item</th>
                                                    <th className="p-4 font-medium">Category</th>
                                                    <th className="p-4 font-medium text-right">Qty</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700">
                                                {user.inventory.map(item => (
                                                    <tr key={item.id} className="hover:bg-slate-700/30">
                                                        <td className="p-4 font-medium text-slate-200">{item.name}</td>
                                                        <td className="p-4 text-slate-400">{item.category}</td>
                                                        <td className="p-4 text-right font-mono text-fpa-accent">{item.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {activeTab === 'squad' && (
                        <div className="h-full overflow-y-auto p-6">
                            <div className="max-w-3xl mx-auto grid gap-6">
                                {squad.map(member => (
                                    <div key={member.id} className="bg-fpa-panel p-6 rounded-xl border border-slate-700 flex items-center gap-6 relative overflow-hidden group">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                            member.status === 'Danger' ? 'bg-fpa-danger' : 
                                            member.status === 'Online' ? 'bg-fpa-success' : 'bg-slate-500'
                                        }`} />
                                        
                                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold">
                                            {member.name.charAt(0)}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{member.name}</h3>
                                            <p className="text-slate-400 text-sm">{member.role}</p>
                                        </div>

                                        <div className="text-right">
                                            <div className={`font-bold ${
                                                member.status === 'Danger' ? 'text-fpa-danger animate-pulse' : 
                                                member.status === 'Online' ? 'text-fpa-success' : 'text-slate-500'
                                            }`}>
                                                {member.status.toUpperCase()}
                                            </div>
                                            <div className="text-xs text-slate-500 font-mono">{member.distance}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* FPAi Insight Panel (Right Side) */}
            <div className="hidden lg:flex w-80 bg-slate-900/50 border-l border-slate-700 flex-col">
                <div className="p-4 border-b border-slate-700 bg-slate-800/30">
                    <h2 className="text-sm font-bold text-fpa-accent flex items-center gap-2">
                        <Icons.Bolt /> FPAi NEURAL LINK
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {pendingActions.length === 0 ? (
                        <div className="text-center text-slate-500 text-sm py-8">
                            <p className="mb-2">System Standing By</p>
                            <p className="text-xs opacity-60">Analyzing communications for actionable intelligence...</p>
                        </div>
                    ) : (
                        pendingActions.map(action => (
                            <div key={action.id} className="bg-slate-800 border border-fpa-accent/30 rounded-lg p-4 shadow-lg shadow-fpa-accent/5 animate-in slide-in-from-right fade-in duration-300">
                                <div className="text-xs font-bold text-fpa-accent uppercase mb-2 flex justify-between">
                                    {action.type.replace('_', ' ')}
                                    <span className="text-slate-500">{(action.confidence * 100).toFixed(0)}%</span>
                                </div>
                                <p className="text-sm text-slate-300 mb-4">{action.description}</p>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleActionDecision(action, true)}
                                        className="flex-1 bg-fpa-success/20 hover:bg-fpa-success/30 text-fpa-success border border-fpa-success/50 rounded py-1.5 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                                    >
                                        <Icons.Check /> CONFIRM
                                    </button>
                                    <button 
                                        onClick={() => handleActionDecision(action, false)}
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600 rounded py-1.5 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                                    >
                                        <Icons.X /> IGNORE
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 text-xs text-slate-600 text-center border-t border-slate-800">
                    PRIVACY ACTIVE • LOCAL FIRST
                </div>
            </div>
        </div>
    );
}

// Subcomponents
const NavIcon = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button 
        onClick={onClick}
        className={`p-3 rounded-xl transition-all group relative ${active ? 'bg-fpa-accent text-fpa-dark shadow-lg shadow-fpa-accent/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
    >
        {icon}
        <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700">
            {label}
        </div>
    </button>
);

const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    if (isSystem) {
        return (
            <div className="flex justify-center my-4">
                <div className="bg-slate-800/50 text-fpa-success text-xs font-mono py-1 px-3 rounded-full border border-fpa-success/20">
                    {message.text}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-5 py-4 shadow-sm ${
                isUser 
                    ? 'bg-fpa-accent text-fpa-dark rounded-tr-none font-medium' 
                    : 'bg-fpa-panel text-slate-200 rounded-tl-none border border-slate-700'
            }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</div>
                {message.isOffline && (
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        Local Mode
                    </div>
                )}
            </div>
        </div>
    );
};