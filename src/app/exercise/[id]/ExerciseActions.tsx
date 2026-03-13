'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteExercise, toggleArchiveExercise } from '@/app/actions';
import { Trash2, Archive, ArchiveRestore } from 'lucide-react';
import styles from './page.module.css';

export default function ExerciseActions({ id, isArchived }: { id: string, isArchived: boolean }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this exercise? This action cannot be undone.')) {
            setIsDeleting(true);
            try {
                await deleteExercise(id);
                router.push('/');
            } catch (e) {
                setIsDeleting(false);
            }
        }
    };

    const handleArchiveToggle = async () => {
        setIsArchiving(true);
        try {
            await toggleArchiveExercise(id, !isArchived);
        } catch (e) {
        } finally {
            setIsArchiving(false);
        }
    };

    return (
        <div className={styles.actionsGroup}>
            <button 
                onClick={handleArchiveToggle} 
                disabled={isArchiving || isDeleting}
                className={styles.actionButton}
            >
                {isArchived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
                {isArchived ? 'Unarchive' : 'Archive'}
            </button>
            <button 
                onClick={handleDelete} 
                disabled={isDeleting || isArchiving}
                className={`${styles.actionButton} ${styles.deleteButton}`}
            >
                <Trash2 size={18} />
                {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
        </div>
    );
}
