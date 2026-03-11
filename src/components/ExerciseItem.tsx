'use client';

import { useState } from 'react';
import { Exercise, logPracticeSession } from '@/app/actions';
import { Check, Clock, ChevronRight, Music, Hash, Activity, Star, Archive, Trash2 } from 'lucide-react';
import Link from 'next/link';
import styles from './components.module.css';

interface ExerciseItemProps {
    exercise: Exercise;
    mode: 'practice' | 'manage';
}

export default function ExerciseItem({ exercise, mode }: ExerciseItemProps) {
    const [isPending, setIsPending] = useState(false);
    const [justPracticed, setJustPracticed] = useState(false);

    const categoryIcons = {
        song: <Music size={18} />,
        scale: <Hash size={18} />,
        technique: <Activity size={18} />,
    };

    // Simple relative time formatter
    const formatRelativeTime = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'Never practiced';
        const date = new Date(dateStr);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffHours < 24) {
            if (diffHours === 0) return 'Just now';
            return `${diffHours}h ago`;
        }

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays}d ago`;
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
        e.preventDefault(); 
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

    const activityData = exercise.activity_map ? exercise.activity_map.split(',') : ['0','0','0','0','0','0','0'];

    return (
        <Link 
            href={`/exercise/${exercise.id}`} 
            className={`${styles.exerciseCard} ${getUrgencyClass(exercise.last_practiced_at)} ${mode === 'practice' ? styles.practiceModeCard : styles.manageModeCard}`}
        >
            <div className={styles.cardHeader}>
                <div className={styles.titleGroup}>
                    <div className={`${styles.categoryIcon} ${styles[exercise.category]}`}>
                        {categoryIcons[exercise.category as keyof typeof categoryIcons] || <Activity size={18} />}
                    </div>
                    <div className={styles.titleAndMeta}>
                        <h3 className={styles.cardTitle}>{exercise.title}</h3>
                        {mode === 'manage' && (
                            <div className={styles.lastPracticedMeta}>
                                Last practiced: {formatRelativeTime(exercise.last_practiced_at)}
                            </div>
                        )}
                    </div>
                    {exercise.priority === 1 && (
                        <div className={styles.priorityBadge}>
                            <Star size={12} fill="currentColor" />
                            <span>High</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.cardFooter}>
                <div className={styles.statsWrapper}>
                    <div className={styles.activityGrid}>
                        {activityData.map((val, i) => (
                            <div 
                                key={i} 
                                className={`${styles.gridSquare} ${val === '1' ? styles.activeSquare : ''}`}
                                title={`Activity ${6-i} days ago`}
                            />
                        ))}
                    </div>
                    {mode !== 'manage' && (
                        <div className={styles.timeInfo}>
                            <Clock size={12} />
                            <span className={styles.timeText}>{formatRelativeTime(exercise.last_practiced_at)}</span>
                        </div>
                    )}
                </div>

                {mode === 'practice' ? (
                    <button
                        className={`${styles.practiceButton} ${styles.practiceModeBtn} ${justPracticed ? styles.practiceSuccess : ''}`}
                        onClick={handlePractice}
                        disabled={isPending || justPracticed}
                    >
                        {justPracticed ? (
                            <Check size={18} />
                        ) : isPending ? (
                            <span className={styles.spinner}>...</span>
                        ) : (
                            'I Practiced This'
                        )}
                    </button>
                ) : (
                    <div className={styles.statusBadges}>
                        {exercise.is_archived === 1 && (
                            <span className={`${styles.statusBadge} ${styles.archivedBadge}`}>
                                <Archive size={12} />
                                Archived
                            </span>
                        )}
                        {exercise.is_deleted === 1 && (
                            <span className={`${styles.statusBadge} ${styles.deletedBadge}`}>
                                <Trash2 size={12} />
                                Deleted
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.cardHoverEffect}>
                <ChevronRight size={20} />
            </div>
        </Link>
    );
}
