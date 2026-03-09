'use client';

import { useState } from 'react';
import { Exercise, logPracticeSession } from '@/app/actions';
import { Check, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import styles from './components.module.css';

export default function ExerciseItem({ exercise }: { exercise: Exercise }) {
    const [isPending, setIsPending] = useState(false);
    const [justPracticed, setJustPracticed] = useState(false);

    // Simple relative time formatter
    const formatRelativeTime = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'Never practiced';
        const date = new Date(dateStr);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffHours < 24) {
            if (diffHours === 0) return 'Practiced just now';
            return `Practiced ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        }

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Practiced yesterday';
        return `Practiced ${diffDays} days ago`;
    };

    const getUrgencyClass = (dateStr: string | null | undefined) => {
        if (!dateStr) return styles.urgencyRed;
        
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays >= 5) return styles.urgencyRed;
        if (diffDays >= 3) return styles.urgencyYellow;
        if (diffDays <= 1) return styles.urgencyGreen;
        return '';
    };

    const handlePractice = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation if button is clicked
        if (isPending) return;

        setIsPending(true);
        try {
            await logPracticeSession(exercise.id);
            setJustPracticed(true);
            setTimeout(() => setJustPracticed(false), 2000);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Link href={`/exercise/${exercise.id}`} className={`${styles.exerciseCard} ${getUrgencyClass(exercise.last_practiced_at)}`}>
            <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{exercise.title}</h3>
            </div>

            <div className={styles.cardBody}>
                <p className={styles.notesPreview}>
                    {exercise.notes ? exercise.notes : 'No notes added yet.'}
                </p>
            </div>

            <div className={styles.cardFooter}>
                <div className={styles.timeInfo}>
                    <Clock size={14} className={styles.timeIcon} />
                    <span className={styles.timeText}>{formatRelativeTime(exercise.last_practiced_at)}</span>
                    <span className={styles.countBadge}>
                        {exercise.practice_count_7d}x this week
                    </span>
                </div>

                <button
                    className={`${styles.practiceButton} ${justPracticed ? styles.practiceSuccess : ''}`}
                    onClick={handlePractice}
                    disabled={isPending || justPracticed}
                >
                    {justPracticed ? (
                        <Check size={18} />
                    ) : isPending ? (
                        <span className={styles.spinner}>...</span>
                    ) : (
                        'Practice'
                    )}
                </button>
            </div>

            <div className={styles.cardHoverEffect}>
                <ChevronRight size={20} />
            </div>
        </Link>
    );
}
