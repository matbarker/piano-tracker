'use client';

import { useState } from 'react';
import { addExercise } from '@/app/actions';
import { Plus, X, Menu, Play, Settings, Archive } from 'lucide-react';
import Link from 'next/link';
import styles from './components.module.css';

interface NavMenuProps {
    currentMode: 'practice' | 'manage';
    isArchivedView: boolean;
}

export default function NavMenu({ currentMode, isArchivedView }: NavMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Add Exercise Form State
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [category, setCategory] = useState('technique');
    const [priority, setPriority] = useState(0);
    const [isPending, setIsPending] = useState(false);

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsPending(true);
        try {
            await addExercise(title.trim(), notes.trim(), category, priority);
            setTitle('');
            setNotes('');
            setCategory('technique');
            setPriority(0);
            setShowAddModal(false);
            setIsOpen(false);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className={styles.menuButton}
                aria-label="Navigation Menu"
            >
                <Menu size={24} />
            </button>

            {isOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
                    <div className={styles.sideMenu} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.menuHeader}>
                            <h2>Menu</h2>
                            <button onClick={() => setIsOpen(false)} className={styles.closeButton}>
                                <X size={24} />
                            </button>
                        </div>

                        <nav className={styles.menuNav}>
                            <Link 
                                href="/?mode=practice" 
                                className={`${styles.menuLink} ${currentMode === 'practice' ? styles.activeMenuLink : ''}`}
                                onClick={() => setIsOpen(false)}
                            >
                                <Play size={20} />
                                <span>Practice Mode</span>
                            </Link>
                            <Link 
                                href="/?mode=manage" 
                                className={`${styles.menuLink} ${currentMode === 'manage' && !isArchivedView ? styles.activeMenuLink : ''}`}
                                onClick={() => setIsOpen(false)}
                            >
                                <Settings size={20} />
                                <span>Manage Exercises</span>
                            </Link>
                            <Link 
                                href="/?mode=manage&archived=true" 
                                className={`${styles.menuLink} ${isArchivedView ? styles.activeMenuLink : ''}`}
                                onClick={() => setIsOpen(false)}
                            >
                                <Archive size={20} />
                                <span>Archived Exercises</span>
                            </Link>
                            
                            <hr className={styles.menuDivider} />
                            
                            <button 
                                className={styles.menuLink}
                                onClick={() => setShowAddModal(true)}
                            >
                                <Plus size={20} />
                                <span>Add New Exercise</span>
                            </button>
                        </nav>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Add New Exercise</h2>
                            <button onClick={() => setShowAddModal(false)} className={styles.closeButton}>
                                <X size={24} />
                            </button>
                        </div>
                        <form className={styles.modalForm} onSubmit={handleAddSubmit}>
                            <div className={styles.formGroup}>
                                <label>Title</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="What do you want to practice?"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={isPending}
                                    required
                                />
                            </div>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Category</label>
                                    <select 
                                        className={styles.select}
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        disabled={isPending}
                                    >
                                        <option value="song">Song</option>
                                        <option value="scale">Scale</option>
                                        <option value="technique">Technique</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Priority</label>
                                    <label className={styles.priorityToggle}>
                                        <input 
                                            type="checkbox" 
                                            checked={priority === 1}
                                            onChange={(e) => setPriority(e.target.checked ? 1 : 0)}
                                            disabled={isPending}
                                        />
                                        High Priority
                                    </label>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description (Optional)</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Add notes, tempo, or specific focus areas..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                            <button
                                type="submit"
                                className={styles.primaryButton}
                                disabled={isPending || !title.trim()}
                            >
                                <Plus size={20} />
                                {isPending ? 'Adding...' : 'Add Exercise'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
