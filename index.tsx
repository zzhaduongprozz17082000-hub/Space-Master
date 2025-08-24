import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

// --- TYPES ---
interface FileItem {
    id: string;
    parentId: string | null;
    type: 'folder' | 'file';
    name: string;
    size?: string;
    modified: string;
    color?: string; // Optional color for folders
    sharing?: 'Can view' | 'Can edit' | 'No Access'; // For folder sharing status
    sharedWith?: { email: string; access: 'Can view' | 'Can edit' }[]; // For specific user sharing
    deletedTimestamp?: string | null; // For soft delete
    lastAccessed?: string | null; // For recent files
    isStarred?: boolean; // For starred items
}

// --- MOCK DATA ---
const initialMockFiles: FileItem[] = [];

// Mock database now includes passwords
const mockRegisteredUsers = [{ email: 'user@example.com', password: 'password123' }];


// --- SVG IONS ---
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.841C34.553 4.806 29.602 2.5 24 2.5C11.318 2.5 2.5 11.318 2.5 24s8.818 21.5 21.5 21.5S45.5 36.682 45.5 24c0-1.543-.138-3.041-.389-4.417z"></path>
    <path fill="#FF3D00" d="M6.306 14.691c-1.229 2.22-1.927 4.757-1.927 7.551s.698 5.331 1.927 7.551L10.82 25.14C9.988 23.498 9.5 21.618 9.5 19.82s.488-1.678 1.32-3.129L6.306 14.691z"></path>
    <path fill="#4CAF50" d="M24 45.5c5.602 0 10.553-2.306 14.202-6.159L34.18 34.86C31.543 36.948 28.016 38 24 38c-4.418 0-8.225-2.213-10.49-5.524L8.402 36.1C12.152 41.194 17.694 45.5 24 45.5z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.008 5.008C41.832 34.896 44.5 30.016 44.5 24c0-1.543-.138-3.041-.389-4.417z"></path>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24">
    <path fill="#1877F2" d="M22.676 0H1.324C.593 0 0 .593 0 1.324v21.352C0 23.407.593 24 1.324 24h11.494v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.324V1.324C24 .593 23.407 0 22.676 0z"></path>
  </svg>
);


// --- COMPONENTS ---

/**
 * Login Page Component
 * @param onLogin - Function to call when login is successful
 */
const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSwitchForm = (registering: boolean) => {
    setIsRegistering(registering);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      // Registration Logic
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }

      const hasNumber = /[0-9]/.test(password);
      const hasLetter = /[a-zA-Z]/.test(password);

      if (password.length <= 6 || !hasNumber || !hasLetter) {
        setError('Password must be longer than 6 characters and include both letters and numbers.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (mockRegisteredUsers.some(user => user.email === email)) {
        setError('This email is already registered. Please log in.');
        return;
      }
      // In a real app, you would now call your registration API
      // Add new user to our mock DB
      mockRegisteredUsers.push({ email, password });
      console.log('Registration successful for:', email);
      onLogin(); // Log in the user directly after registration
    } else {
      // Login Logic
      const user = mockRegisteredUsers.find(u => u.email === email);
      if (!user || user.password !== password) {
        setError('Incorrect email or password. Please try again.');
        return;
      }
      // If credentials are correct
      onLogin();
    }
  };

  return (
    <div className="container">
      <div className="login-card">
        {isRegistering ? (
          <>
            <h1>Create an account</h1>
            <p>Get started with your new Space Master account.</p>
            <form onSubmit={handleSubmit} noValidate>
              {error && <p className="error-message">{error}</p>}
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="input-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input type="password" id="confirm-password" placeholder="••••••••" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary">Sign Up</button>
            </form>
            <p className="form-switcher">
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); handleSwitchForm(false); }}>
                Log in
              </a>
            </p>
          </>
        ) : (
          <>
            <h1>Welcome to Space Master</h1>
            <p>Log in to continue to your account.</p>
            <form onSubmit={handleSubmit} noValidate>
              {error && <p className="error-message">{error}</p>}
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary">Log In</button>
            </form>
            <p className="form-switcher">
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); handleSwitchForm(true); }}>
                Sign up
              </a>
            </p>
          </>
        )}
        
        <div className="sso-divider">Or continue with</div>
        
        <div className="sso-buttons">
          <button className="sso-btn">
            <GoogleIcon /> Google
          </button>
          <button className="sso-btn">
            <FacebookIcon /> Facebook
          </button>
        </div>
      </div>
    </div>
  );
};


/**
 * Create Folder Modal Component
 */
const CreateFolderModal = ({ isOpen, onClose, onCreate }: { isOpen: boolean; onClose: () => void; onCreate: (name: string) => void; }) => {
    if (!isOpen) return null;

    const [folderName, setFolderName] = useState('');

    const handleCreate = () => {
        if (folderName.trim()) {
            onCreate(folderName.trim());
            setFolderName(''); // Reset for next time
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCreate();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>New folder</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <input
                        type="text"
                        placeholder="Untitled folder"
                        value={folderName}
                        onChange={e => setFolderName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button onClick={handleCreate} className="btn btn-primary" disabled={!folderName.trim()}>Create</button>
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmationModal = ({ item, context, onClose, onConfirm }: { item: FileItem | null; context: 'drive' | 'trash'; onClose: () => void; onConfirm: () => void; }) => {
    if (!item) return null;

    const isTrashContext = context === 'trash';
    const title = isTrashContext ? "Delete forever?" : "Move to trash?";
    const message = isTrashContext
        ? `Are you sure you want to permanently delete <strong>${item.name}</strong>? This action cannot be undone.`
        : `Do you want to move <strong>${item.name}</strong> to the trash?`;
    const confirmText = isTrashContext ? "Delete forever" : "Move to trash";
    const confirmClass = isTrashContext ? "btn-danger" : "btn-primary";

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <p dangerouslySetInnerHTML={{ __html: message }} />
                    {item.type === 'folder' && <p className="warning-text">Everything inside will also be affected.</p>}
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button onClick={onConfirm} className={`btn ${confirmClass}`}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

const ClearTrashConfirmationModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Clear Trash?</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <p>Are you sure you want to permanently delete all items in the trash? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button onClick={onConfirm} className="btn btn-danger">Clear Trash</button>
                </div>
            </div>
        </div>
    );
};

const ShareModal = ({ isOpen, onClose, item, onUpdateSharing, currentUserEmail }: { 
    isOpen: boolean; 
    onClose: () => void; 
    item: FileItem | null; 
    onUpdateSharing: (updatedItem: FileItem) => void;
    currentUserEmail: string;
}) => {
    if (!isOpen || !item) return null;

    const [newEmail, setNewEmail] = useState('');
    const [newAccess, setNewAccess] = useState<'Can view' | 'Can edit'>('Can view');
    const [error, setError] = useState('');

    const handleAddShare = () => {
        setError('');
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(newEmail)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (newEmail === currentUserEmail) {
             setError('You cannot share an item with yourself.');
             return;
        }
        if (item.sharedWith?.some(user => user.email === newEmail)) {
            setError('This user already has access.');
            return;
        }

        const updatedSharedWith = [...(item.sharedWith || []), { email: newEmail, access: newAccess }];
        onUpdateSharing({ ...item, sharedWith: updatedSharedWith });
        setNewEmail('');
        setNewAccess('Can view');
    };

    const handleUpdateAccess = (emailToUpdate: string, access: 'Can view' | 'Can edit') => {
        const updatedSharedWith = item.sharedWith?.map(share => 
            share.email === emailToUpdate ? { ...share, access } : share
        );
        onUpdateSharing({ ...item, sharedWith: updatedSharedWith });
    };

    const handleRemoveAccess = (emailToRemove: string) => {
        const updatedSharedWith = item.sharedWith?.filter(share => share.email !== emailToRemove);
        onUpdateSharing({ ...item, sharedWith: updatedSharedWith });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content share-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Share "{item.name}"</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <div className="share-add-person">
                        <input
                            type="email"
                            placeholder="Enter email address"
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                        />
                        <select
                            value={newAccess}
                            onChange={e => setNewAccess(e.target.value as 'Can view' | 'Can edit')}
                            className="share-permission-select"
                        >
                            <option value="Can view">Can view</option>
                            <option value="Can edit">Can edit</option>
                        </select>
                        <button onClick={handleAddShare} className="btn btn-primary share-btn" disabled={!newEmail}>Share</button>
                    </div>
                    {error && <p className="error-message share-error">{error}</p>}
                    
                    <h3 className="share-people-title">People with access</h3>
                    <div className="share-people-list">
                        <div className="share-person owner">
                            <i className="material-icons">account_circle</i>
                            <div className="share-person-info">
                                <span>You ({currentUserEmail})</span>
                                <span className="share-person-email">Owner</span>
                            </div>
                            <span className="share-person-access">Owner</span>
                        </div>
                        {item.sharedWith?.map(user => (
                            <div key={user.email} className="share-person">
                                <i className="material-icons">account_circle</i>
                                <div className="share-person-info">
                                    <span>{user.email}</span>
                                    <span className="share-person-email">{user.access}</span>
                                </div>
                                <div className="share-person-actions">
                                    <select
                                        value={user.access}
                                        onChange={e => handleUpdateAccess(user.email, e.target.value as 'Can view' | 'Can edit')}
                                        className="share-permission-select small"
                                    >
                                        <option value="Can view">Can view</option>
                                        <option value="Can edit">Can edit</option>
                                    </select>
                                    <button onClick={() => handleRemoveAccess(user.email)} className="remove-share-btn">
                                        <i className="material-icons">close</i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-primary">Done</button>
                </div>
            </div>
        </div>
    );
};

const ContextMenu = ({ x, y, item, view, onClose, onRename, onDelete, onRestore, onToggleStar, onChangeColor, onShare }: { 
    x: number; 
    y: number; 
    item: FileItem; 
    view: 'drive' | 'recent' | 'trash' | 'starred' | 'shared';
    onClose: () => void; 
    onRename: () => void; 
    onDelete: () => void; 
    onRestore: () => void;
    onToggleStar: () => void;
    onChangeColor: (color: string) => void;
    onShare: () => void;
}) => {
    const FOLDER_COLORS = ['#ffca28', '#f44336', '#4caf50', '#2196f3', '#9c27b0', '#795548'];

    return (
        <div className="context-menu" style={{ top: y, left: x }} onClick={onClose}>
            {view === 'trash' ? (
                <>
                    <div className="context-menu-item" onClick={onRestore}>
                        <i className="material-icons">restore</i> <span>Restore</span>
                    </div>
                    <div className="context-menu-separator"></div>
                    <div className="context-menu-item danger" onClick={onDelete}>
                        <i className="material-icons">delete_forever</i> <span>Delete forever</span>
                    </div>
                </>
            ) : (
                 <>
                    <div className="context-menu-item" onClick={onToggleStar}>
                        <i className="material-icons">{item.isStarred ? 'star' : 'star_border'}</i> 
                        <span>{item.isStarred ? 'Remove from Starred' : 'Add to Starred'}</span>
                    </div>
                    <div className="context-menu-item" onClick={onRename}>
                        <i className="material-icons">drive_file_rename_outline</i> <span>Rename</span>
                    </div>
                    <div className="context-menu-item" onClick={onShare}>
                        <i className="material-icons">share</i> <span>Share</span>
                    </div>
                   
                    {item.type === 'folder' && (
                        <>
                            <div className="context-menu-separator"></div>
                            <div className="context-menu-item no-hover">
                                <i className="material-icons">palette</i> <span>Change color</span>
                            </div>
                            <div className="color-palette">
                                {FOLDER_COLORS.map(color => (
                                    <div key={color} className="color-swatch" style={{ backgroundColor: color }} onClick={() => onChangeColor(color)}></div>
                                ))}
                            </div>
                        </>
                    )}
                    
                    <div className="context-menu-separator"></div>
                    <div className="context-menu-item danger" onClick={onDelete}>
                        <i className="material-icons">delete</i> <span>Move to trash</span>
                    </div>
                 </>
            )}
        </div>
    );
};

const ProfileMenu = ({ onLogout, onClose }: { onLogout: () => void; onClose: () => void; }) => {
    const handleMenuClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <div className="profile-menu">
            <div className="profile-menu-item" onClick={(e) => handleMenuClick(e, onClose)}>
                <i className="material-icons">person_outline</i>
                <span>Edit Account Info</span>
            </div>
            <div className="profile-menu-item" onClick={(e) => handleMenuClick(e, onClose)}>
                <i className="material-icons">photo_camera</i>
                <span>Change Avatar</span>
            </div>
            <div className="context-menu-separator"></div>
            <div className="profile-menu-item danger" onClick={(e) => handleMenuClick(e, onLogout)}>
                <i className="material-icons">logout</i>
                <span>Logout</span>
            </div>
        </div>
    );
};


/**
 * Main Application Component (File Browser, etc.)
 * @param onLogout - Function to call to log out
 */
const MainApp = ({ onLogout }: { onLogout: () => void }) => {
  const [files, setFiles] = useState<FileItem[]>(initialMockFiles);
  const [navigation, setNavigation] = useState({
    view: 'drive' as 'drive' | 'recent' | 'trash' | 'starred' | 'shared',
    breadcrumbs: [{ id: null as string | null, name: 'My Drive' }],
  });
  const { view: currentView, breadcrumbs } = navigation;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FileItem | null>(null);
  const [isClearTrashModalOpen, setIsClearTrashModalOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: FileItem } | null>(null);
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [sharingItem, setSharingItem] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  const currentUserEmail = 'user@example.com';


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close context menu
      if (contextMenu) {
        setContextMenu(null);
      }
      // Close profile menu
      if (isProfileMenuOpen && profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      // Close filter dropdown
      if (isFilterDropdownOpen && filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu, isProfileMenuOpen, isFilterDropdownOpen]);

  const uniqueFileTypes = useMemo(() => {
    const extensions = new Set<string>();
    files.forEach(file => {
        if (file.type === 'file' && file.name.includes('.')) {
            const parts = file.name.split('.');
            if (parts.length > 1) {
                const ext = parts[parts.length - 1].toLowerCase();
                if (ext) extensions.add(ext);
            }
        }
    });
    return Array.from(extensions).sort();
  }, [files]);

  const displayedFiles = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    const isSearching = trimmedQuery || fileTypeFilter;
    
    if (isSearching) {
        return files.filter(file => {
            if (file.deletedTimestamp) return false;

            const nameMatch = trimmedQuery ? file.name.toLowerCase().includes(trimmedQuery) : true;
            
            const typeMatch = fileTypeFilter 
                ? file.type === 'file' && file.name.toLowerCase().endsWith(`.${fileTypeFilter}`)
                : true;

            if (fileTypeFilter && file.type === 'folder') {
                return false;
            }

            return nameMatch && typeMatch;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }


    if (currentView === 'drive') {
      if (breadcrumbs.length === 0) return [];
      const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id;
      return files.filter(file => file.parentId === currentFolderId && !file.deletedTimestamp).sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
    }
    if (currentView === 'recent') {
      return files
        .filter(file => file.lastAccessed && !file.deletedTimestamp)
        .sort((a, b) => new Date(b.lastAccessed!).getTime() - new Date(a.lastAccessed!).getTime())
        .slice(0, 20);
    }
    if (currentView === 'starred') {
      return files
        .filter(file => file.isStarred && !file.deletedTimestamp)
        .sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });
    }
    if (currentView === 'trash') {
       return files.filter(file => file.deletedTimestamp).sort((a, b) => new Date(b.deletedTimestamp!).getTime() - new Date(a.deletedTimestamp!).getTime());
    }
    if (currentView === 'shared') {
      return files
        .filter(file => file.sharedWith?.some(user => user.email === currentUserEmail) && !file.deletedTimestamp)
        .sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });
    }
    return [];
  }, [files, currentView, breadcrumbs, searchQuery, fileTypeFilter]);

  const getPageTitle = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery || fileTypeFilter) {
        return `Search results`;
    }
    if (breadcrumbs.length === 0) return 'Space Master';
    return breadcrumbs[breadcrumbs.length - 1].name;
  };
  
  const handleNavigate = (view: 'drive' | 'recent' | 'trash' | 'starred' | 'shared') => {
    // Reset any view-specific state to prevent inconsistencies
    setIsCreateFolderModalOpen(false);
    setItemToDelete(null);
    setContextMenu(null);
    setRenamingItemId(null);
    setRenameValue('');
    setSearchQuery('');
    setFileTypeFilter('');

    let newBreadcrumbs;
    if (view === 'drive') {
        newBreadcrumbs = [{ id: null, name: 'My Drive' }];
    } else if (view === 'recent') {
        newBreadcrumbs = [{ id: 'recent_root', name: 'Recent' }];
    } else if (view === 'starred') {
        newBreadcrumbs = [{ id: 'starred_root', name: 'Starred' }];
    } else if (view === 'shared') {
        newBreadcrumbs = [{ id: 'shared_root', name: 'Shared with me' }];
    } else { // trash
        newBreadcrumbs = [{ id: 'trash_root', name: 'Trash' }];
    }

    setNavigation({
        view,
        breadcrumbs: newBreadcrumbs
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || breadcrumbs.length === 0) return;

    const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id;
    const now = new Date().toISOString();
    const newFiles: FileItem[] = Array.from(selectedFiles).map(file => ({
      id: `${Date.now()}-${file.name}`,
      parentId: currentFolderId,
      type: 'file',
      name: file.name,
      size: formatFileSize(file.size),
      modified: now.split('T')[0],
      lastAccessed: now,
      isStarred: false,
      sharedWith: [],
    }));

    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };
  
  const handleCreateFolder = (folderName: string) => {
    if (breadcrumbs.length === 0) return;
    const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id;
    const newFolder: FileItem = {
        id: `${Date.now()}-${folderName}`,
        parentId: currentFolderId,
        type: 'folder',
        name: folderName,
        modified: new Date().toISOString().split('T')[0],
        sharing: 'No Access',
        isStarred: false,
        sharedWith: [],
    };
    setFiles(prevFiles => [newFolder, ...prevFiles]);
    setIsCreateFolderModalOpen(false);
  };

  const findFolderPath = (targetItem: FileItem): { id: string | null; name: string }[] => {
    const path = [];
    let current: FileItem | undefined = targetItem;
    while(current) {
        path.unshift({ id: current.id, name: current.name });
        current = files.find(f => f.id === current!.parentId);
    }
    return path;
  };
  
  const handleItemDoubleClick = (item: FileItem) => {
      // Always update last accessed time on double click
      const updatedFiles = files.map(f => f.id === item.id ? { ...f, lastAccessed: new Date().toISOString() } : f);
      setFiles(updatedFiles);
      
      if (item.type === 'folder') {
          if (searchQuery.trim() || fileTypeFilter) {
              // Navigating from a search result
              const folderPath = findFolderPath(item);
              setNavigation({
                  view: 'drive',
                  breadcrumbs: [{ id: null, name: 'My Drive' }, ...folderPath]
              });
              setSearchQuery(''); // Clear search
              setFileTypeFilter(''); // Clear filter
          } else if (currentView === 'drive' || currentView === 'starred' || currentView === 'shared') {
              // Normal navigation
               setNavigation({ view: 'drive', breadcrumbs: [...breadcrumbs, { id: item.id, name: item.name }] });
          }
      }
      // If it's a file, we've already updated its access time. Nothing else to do.
  };

  const handleBreadcrumbClick = (index: number) => {
      setNavigation(prev => ({ ...prev, breadcrumbs: prev.breadcrumbs.slice(0, index + 1) }));
  };
  
  const handleDelete = (item: FileItem) => {
      setItemToDelete(item);
  };

  const handleRestore = (item: FileItem) => {
      const getDescendantIds = (folderId: string): string[] => {
          let children = files.filter(f => f.parentId === folderId);
          let descendantIds: string[] = children.map(c => c.id);
          children.filter(c => c.type === 'folder').forEach(c => {
              descendantIds = [...descendantIds, ...getDescendantIds(c.id)];
          });
          return descendantIds;
      };
      const idsToRestore = [item.id, ...(item.type === 'folder' ? getDescendantIds(item.id) : [])];
      setFiles(prevFiles =>
          prevFiles.map(f =>
              idsToRestore.includes(f.id) ? { ...f, deletedTimestamp: null } : f
          )
      );
      setContextMenu(null);
  };
  
  const confirmDelete = () => {
      if (!itemToDelete) return;

      const getDescendantIds = (folderId: string): string[] => {
          let children = files.filter(f => f.parentId === folderId);
          let descendantIds: string[] = children.map(c => c.id);
          children.filter(c => c.type === 'folder').forEach(c => {
              descendantIds = [...descendantIds, ...getDescendantIds(c.id)];
          });
          return descendantIds;
      };

      const idsToDelete = [itemToDelete.id, ...(itemToDelete.type === 'folder' ? getDescendantIds(itemToDelete.id) : [])];

      if (currentView === 'trash') { // Permanent delete
          setFiles(prevFiles => prevFiles.filter(f => !idsToDelete.includes(f.id)));
      } else { // Move to trash
          const now = new Date().toISOString();
          setFiles(prevFiles =>
              prevFiles.map(f =>
                  idsToDelete.includes(f.id) ? { ...f, deletedTimestamp: now } : f
              )
          );
      }
      
      setItemToDelete(null);
  };

  const handleConfirmClearTrash = () => {
      setFiles(prevFiles => prevFiles.filter(f => !f.deletedTimestamp));
      setIsClearTrashModalOpen(false);
  };
  
  const handleContextMenu = (e: React.MouseEvent, item: FileItem) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.pageX, y: e.pageY, item });
  };
  
  const handleStartRename = () => {
      if (!contextMenu) return;
      setRenamingItemId(contextMenu.item.id);
      setRenameValue(contextMenu.item.name);
      setContextMenu(null);
  };

  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setRenameValue(e.target.value);
  };

  const handleRenameSubmit = (e: React.FormEvent | React.FocusEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (renamingItemId && renameValue.trim()) {
          setFiles(prevFiles =>
              prevFiles.map(file =>
                  file.id === renamingItemId ? { ...file, name: renameValue.trim() } : file
              )
          );
      }
      setRenamingItemId(null);
      setRenameValue('');
  };

  const handleToggleStar = (itemToStar: FileItem) => {
    setFiles(prevFiles =>
        prevFiles.map(file =>
            file.id === itemToStar.id ? { ...file, isStarred: !file.isStarred } : file
        )
    );
    setContextMenu(null); // Close context menu if open
  };

  const handleChangeColor = (color: string) => {
      if (!contextMenu) return;
      setFiles(prevFiles =>
          prevFiles.map(file =>
              file.id === contextMenu.item.id ? { ...file, color: color } : file
          )
      );
      setContextMenu(null);
  };

  const handleUpdateSharing = (updatedItem: FileItem) => {
    setFiles(prevFiles => 
        prevFiles.map(file => file.id === updatedItem.id ? updatedItem : file)
    );
    setSharingItem(updatedItem);
  };
  
  const isSearching = searchQuery.trim() || fileTypeFilter;

  return (
    <div className="main-app">
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        multiple
      />
      <CreateFolderModal 
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onCreate={handleCreateFolder}
      />
      <DeleteConfirmationModal
          item={itemToDelete}
          context={currentView === 'trash' ? 'trash' : 'drive'}
          onClose={() => setItemToDelete(null)}
          onConfirm={confirmDelete}
      />
       <ClearTrashConfirmationModal 
        isOpen={isClearTrashModalOpen}
        onClose={() => setIsClearTrashModalOpen(false)}
        onConfirm={handleConfirmClearTrash}
      />
      <ShareModal
          isOpen={!!sharingItem}
          onClose={() => setSharingItem(null)}
          item={sharingItem}
          onUpdateSharing={handleUpdateSharing}
          currentUserEmail={currentUserEmail}
      />
      {contextMenu && (
          <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              item={contextMenu.item}
              view={currentView}
              onClose={() => setContextMenu(null)}
              onRename={handleStartRename}
              onDelete={() => handleDelete(contextMenu.item)}
              onRestore={() => handleRestore(contextMenu.item)}
              onToggleStar={() => handleToggleStar(contextMenu.item)}
              onChangeColor={handleChangeColor}
              onShare={() => setSharingItem(contextMenu.item)}
          />
      )}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Space Master</h1>
        </div>
        <nav>
          <ul>
            <li><a href="#" className={currentView === 'drive' ? 'active' : ''} onClick={(e) => { e.preventDefault(); handleNavigate('drive'); }}><i className="material-icons">folder</i> My Drive</a></li>
            <li><a href="#" className={currentView === 'shared' ? 'active' : ''} onClick={(e) => { e.preventDefault(); handleNavigate('shared'); }}><i className="material-icons">group</i> Shared with me</a></li>
            <li><a href="#" className={currentView === 'recent' ? 'active' : ''} onClick={(e) => { e.preventDefault(); handleNavigate('recent'); }}><i className="material-icons">history</i> Recent</a></li>
            <li><a href="#" className={currentView === 'starred' ? 'active' : ''} onClick={(e) => { e.preventDefault(); handleNavigate('starred'); }}><i className="material-icons">star_border</i> Starred</a></li>
            <li><a href="#" className={currentView === 'trash' ? 'active' : ''} onClick={(e) => { e.preventDefault(); handleNavigate('trash'); }}><i className="material-icons">delete</i> Trash</a></li>
          </ul>
        </nav>
        {!isSearching && currentView === 'drive' && (
            <div className="sidebar-actions">
               <button className="new-folder-btn" onClick={() => setIsCreateFolderModalOpen(true)}>
                <i className="material-icons">create_new_folder</i>
                New folder
              </button>
              <button className="upload-btn" onClick={handleUploadClick}>
                <i className="material-icons">cloud_upload</i>
                Upload file
              </button>
            </div>
        )}
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="search-container">
            <div className="search-bar">
                <i className="material-icons">search</i>
                <input 
                  type="text" 
                  placeholder="Search in Drive" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="search-clear-btn" onClick={() => setSearchQuery('')}>&times;</button>
                )}
            </div>
             <div className="search-filter-container" ref={filterDropdownRef}>
                <button className="search-filter-btn" onClick={() => setIsFilterDropdownOpen(prev => !prev)}>
                    <i className="material-icons">filter_list</i>
                    <span>{fileTypeFilter ? fileTypeFilter.toUpperCase() : 'All types'}</span>
                    <i className="material-icons">arrow_drop_down</i>
                </button>
                {isFilterDropdownOpen && uniqueFileTypes.length > 0 && (
                    <div className="search-filter-dropdown">
                        <div 
                            className={`search-filter-item ${!fileTypeFilter ? 'active' : ''}`}
                            onClick={() => { setFileTypeFilter(''); setIsFilterDropdownOpen(false); }}
                        >
                            All types
                        </div>
                        {uniqueFileTypes.map(type => (
                            <div 
                                key={type}
                                className={`search-filter-item ${fileTypeFilter === type ? 'active' : ''}`}
                                onClick={() => { setFileTypeFilter(type); setIsFilterDropdownOpen(false); }}
                            >
                                {type.toUpperCase()}
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>

          <div className="user-profile" ref={profileMenuRef} onClick={() => setIsProfileMenuOpen(prev => !prev)}>
            <span>User Name</span>
            <i className="material-icons">account_circle</i>
            {isProfileMenuOpen && (
              <ProfileMenu
                onLogout={onLogout}
                onClose={() => setIsProfileMenuOpen(false)}
              />
            )}
          </div>
        </header>

        <section className="file-browser">
            <div className="browser-header">
                <h2>{getPageTitle()}</h2>
                 {currentView === 'trash' && displayedFiles.length > 0 && (
                    <button className="clear-trash-btn" onClick={() => setIsClearTrashModalOpen(true)}>
                        <i className="material-icons">delete_sweep</i>
                        <span>Clear Trash</span>
                    </button>
                )}
                {!isSearching && (currentView === 'drive' || currentView === 'starred' || currentView === 'shared') && breadcrumbs.length > 0 && breadcrumbs[0].name !== 'Shared with me' && (
                    <nav className="breadcrumbs">
                      {breadcrumbs.map((crumb, index) => (
                        <span key={crumb.id || 'root'} className="breadcrumb-item">
                          {index < breadcrumbs.length - 1 ? (
                            <a href="#" onClick={(e) => { e.preventDefault(); handleBreadcrumbClick(index); }}>
                              {crumb.name}
                            </a>
                          ) : (
                            <span>{crumb.name}</span>
                          )}
                        </span>
                      ))}
                    </nav>
                )}
            </div>
          <div className="file-grid">
            {displayedFiles.length === 0 ? (
                <p className="empty-drive-message">
                    {isSearching 
                      ? `No results found for your criteria.`
                      : currentView === 'drive' 
                      ? 'This folder is empty. Upload a file or create a folder to get started.'
                      : currentView === 'recent' 
                      ? 'No recently accessed items.'
                      : currentView === 'starred'
                      ? 'No starred items. Star files and folders for quick access.'
                      : currentView === 'shared'
                      ? 'No items have been shared with you.'
                      : 'Trash is empty.'
                    }
                </p>
            ) : (
                displayedFiles.map(file => (
                  <div key={file.id} className={`file-item ${currentView === 'trash' ? 'trashed-item' : ''}`} onDoubleClick={() => handleItemDoubleClick(file)}>
                    {currentView !== 'trash' && (
                        <button 
                            className={`star-btn ${file.isStarred ? 'starred' : ''}`} 
                            onClick={(e) => { e.stopPropagation(); handleToggleStar(file); }}
                        >
                            <i className="material-icons">{file.isStarred ? 'star' : 'star_border'}</i>
                        </button>
                    )}
                    <div className="file-item-icon-wrapper">
                      <i className="material-icons" style={{ color: file.type === 'folder' ? (file.color || '#ffca28') : 'var(--primary-accent)'}}>
                        {file.type === 'folder' ? 'folder' : 'article'}
                      </i>
                      {(file.sharedWith && file.sharedWith.length > 0) && (
                        <div className="folder-sharing-status">
                            <i className="material-icons">group</i>
                        </div>
                      )}
                    </div>
                    {renamingItemId === file.id ? (
                        <form onSubmit={handleRenameSubmit} className="rename-form">
                           <input
                                type="text"
                                value={renameValue}
                                onChange={handleRenameChange}
                                onBlur={handleRenameSubmit}
                                onKeyDown={(e) => { if (e.key === 'Escape') setRenamingItemId(null); }}
                                autoFocus
                                className="rename-input"
                            />
                        </form>
                    ) : (
                       <span className="file-item-name">{file.name}</span>
                    )}
                    <span className="file-item-info">
                      {file.type === 'file' && file.size ? `${file.size} - ` : ''}
                      {file.modified}
                    </span>
                    <button className="options-btn" onClick={(e) => handleContextMenu(e, file)}>
                        <i className="material-icons">more_vert</i>
                    </button>
                  </div>
                ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

/**
 * Admin Dashboard Component
 * This is a placeholder for future implementation.
 */
const AdminDashboard = () => {
    // This component will be built out in a future request.
    return <div>Admin Dashboard</div>
}


/**
 * Main App Container
 */
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simple state to toggle between user and admin view
  // In a real app, this would be based on user roles from an API
  const [isAdminView, setIsAdminView] = useState(false); 

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }
  
  // In a real app, you might use a router here to switch between pages
  if (isAdminView) {
      return <AdminDashboard />;
  }

  return <MainApp onLogout={() => setIsLoggedIn(false)} />;
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);