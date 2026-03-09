'use client';

import { useState } from 'react';
import { addExercise } from '@/app/actions';
import { Plus, X, Menu } from 'lucide-react';
import styles from './components.module.css';

export default function AddExercise() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsPending(true);
        try {
            await addExercise(title.trim(), notes.trim());
            setTitle('');
            setNotes('');
            setIsExpanded(false);
        } finally {
            setIsPending(false);
        }
    };

    if (!isExpanded) {
        return (
            <button 
                onClick={() => setIsExpanded(true)}
                className={styles.menuButton}
                aria-label="Add Exercise Menu"
            >
                <Menu size={24} />
            </button>
        );
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Add New Exercise</h2>
                    <button onClick={() => setIsExpanded(false)} className={styles.closeButton}>
                        <X size={24} />
                    </button>
                </div>
                <form className={styles.modalForm} onSubmit={handleSubmit}>
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
    );
}
