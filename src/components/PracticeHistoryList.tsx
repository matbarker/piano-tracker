'use client';

import { PracticeSession } from '@/app/actions';
import styles from '@/app/exercise/[id]/page.module.css';

interface PracticeHistoryListProps {
    history: PracticeSession[];
}

export default function PracticeHistoryList({ history }: PracticeHistoryListProps) {
    if (history.length === 0) {
        return (
            <div className={styles.emptyHistory}>
                <p>You haven&apos;t practiced this yet.</p>
            </div>
        );
    }

    return (
        <ul className={styles.historyList}>
            {history.map((session) => {
                // Append 'Z' to tell the browser this is a UTC timestamp
                const date = new Date(session.practiced_at.replace(' ', 'T') + 'Z');
                return (
                    <li key={session.id} className={styles.historyItem}>
                        <div className={styles.historyMarker}></div>
                        <div className={styles.historyData}>
                            <p className={styles.historyDate}>
                                {date.toLocaleDateString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                            <p className={styles.historyTime}>
                                {date.toLocaleTimeString(undefined, {
                                    hour: 'numeric',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
