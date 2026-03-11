'use client';

import { useState } from 'react';
import { Exercise, updateExercise } from '@/app/actions';
import { Save, Check } from 'lucide-react';
import styles from './components.module.css';

export default function EditExercise({ exercise }: { exercise: Exercise }) {
    const [title, setTitle] = useState(exercise.title);
    const [notes, setNotes] = useState(exercise.notes);
    const [category, setCategory] = useState(exercise.category);
    const [priority, setPriority] = useState(exercise.priority);
    const [isPending, setIsPending] = useState(false);
    const [justSaved, setJustSaved] = useState(false);

    const isChanged = 
        title !== exercise.title || 
        notes !== exercise.notes || 
        category !== exercise.category || 
        priority !== exercise.priority;

    const handleSave = async () => {
        setIsPending(true);
        try {
            await updateExercise(exercise.id, {
                title,
                notes,
                category,
                priority
            });
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2000);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className={styles.editForm}>
            <div className={styles.formGroup}>
                <label>Title</label>
                <input
                    type="text"
                    className={styles.input}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isPending}
                />
            </div>

            <div className={styles.row}>
                <div className={styles.formGroup}>
                    <label>Category</label>
                    <select 
                        className={styles.select}
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
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
                <label>Notes</label>
                <textarea
                    className={styles.textarea}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your practice notes here..."
                />
            </div>

            <button
                className={styles.primaryButton}
                onClick={handleSave}
                disabled={isPending || !isChanged}
            >
                {justSaved ? (
                    <>
                        <Check size={18} /> Saved
                    </>
                ) : (
                    <>
                        <Save size={18} /> {isPending ? 'Saving...' : 'Save Changes'}
                    </>
                )}
            </button>
        </div>
    );
}
