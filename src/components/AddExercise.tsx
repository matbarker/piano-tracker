'use client';

import { useState } from 'react';
import { addExercise } from '@/app/actions';
import { Plus } from 'lucide-react';
import styles from './components.module.css';

export default function AddExercise() {
    const [title, setTitle] = useState('');
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsPending(true);
        try {
            await addExercise(title.trim());
            setTitle('');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form className={styles.addForm} onSubmit={handleSubmit}>
            <input
                type="text"
                className={styles.input}
                placeholder="What do you want to practice? (e.g. C Major Scale)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isPending}
                required
            />
            <button
                type="submit"
                className={styles.primaryButton}
                disabled={isPending || !title.trim()}
            >
                <Plus size={20} />
                {isPending ? 'Adding...' : 'Add Exercise'}
            </button>
        </form>
    );
}
