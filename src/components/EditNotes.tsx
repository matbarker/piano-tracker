'use client';

import { useState } from 'react';
import { updateExerciseNotes } from '@/app/actions';
import { Save, Check } from 'lucide-react';
import styles from './components.module.css';

export default function EditNotes({ id, initialNotes }: { id: string, initialNotes: string }) {
    const [notes, setNotes] = useState(initialNotes);
    const [isPending, setIsPending] = useState(false);
    const [justSaved, setJustSaved] = useState(false);

    const handleSave = async () => {
        setIsPending(true);
        try {
            await updateExerciseNotes(id, notes);
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2000);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div>
            <textarea
                className={styles.textarea}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your practice notes here... Use this to keep track of difficult measures, fingering, target tempo, etc."
            />
            <button
                className={styles.primaryButton}
                onClick={handleSave}
                disabled={isPending || notes === initialNotes}
            >
                {justSaved ? (
                    <>
                        <Check size={18} /> Saved
                    </>
                ) : (
                    <>
                        <Save size={18} /> {isPending ? 'Saving...' : 'Save Notes'}
                    </>
                )}
            </button>
        </div>
    );
}
