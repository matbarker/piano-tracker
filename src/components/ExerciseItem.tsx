'use client';

import { useState } from 'react';
import { Exercise, logPracticeSession } from '@/app/actions';
import { Check, Clock, ChevronRight, Music, Hash, Activity, Star, Archive, Trash2, AlertCircle } from 'lucide-react';
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
        // Force UTC interpretation by using ISO format and appending 'Z'
        const date = new Date(dateStr.replace(' ', 'T') + 'Z');
        const now = new Date();
        
        // Check if it's the same calendar day locally
        const isSameDay = date.getFullYear() === now.getFullYear() &&
                          date.getMonth() === now.getMonth() &&
                          date.getDate() === now.getDate();
        
        if (isSameDay) return 'Today';

        // Check if it was yesterday
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.getFullYear() === yesterday.getFullYear() &&
                            date.getMonth() === yesterday.getMonth() &&
                            date.getDate() === yesterday.getDate();

        if (isYesterday) return 'Yesterday';

        // Calculate calendar day difference
        const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dateAtMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diffDays = Math.round((todayAtMidnight.getTime() - dateAtMidnight.getTime()) / (1000 * 60 * 60 * 24));
        
        return `${diffDays}d ago`;
    };

    const getUrgencyClass = (dateStr: string | null | undefined) => {
        if (!dateStr) return styles.urgencyRed;
        
        // Force UTC interpretation to match formatRelativeTime
        const date = new Date(dateStr.replace(' ', 'T') + 'Z');
        const now = new Date();
        
        // Calculate calendar day difference
        const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dateAtMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diffDays = Math.round((todayAtMidnight.getTime() - dateAtMidnight.getTime()) / (1000 * 60 * 60 * 24));

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

    const isStale = (() => {
        if (!exercise.last_practiced_at) return true;
        const date = new Date(exercise.last_practiced_at.replace(' ', 'T') + 'Z');
        const now = new Date();
        const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dateAtMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diffDays = Math.round((todayAtMidnight.getTime() - dateAtMidnight.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 6;
    })();

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
                    <div className={styles.badgesWrapper}>
                        {isStale && (
                            <div className={styles.staleBadge}>
                                <AlertCircle size={12} fill="currentColor" opacity={0.8}/>
                                <span>Stale</span>
                            </div>
                        )}
                        {exercise.priority === 1 && (
                            <div className={styles.priorityBadge}>
                                <Star size={12} fill="currentColor" />
                                <span>High</span>
                            </div>
                        )}
                    </div>
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
                            <><Check size={16} /> Done</>
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
