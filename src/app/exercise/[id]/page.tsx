import { getExerciseById, getPracticeHistory } from '@/app/actions';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import EditNotes from '@/components/EditNotes';
import { notFound } from 'next/navigation';
import styles from './page.module.css';

export default async function ExerciseDetail(
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const exercise = await getExerciseById(params.id);

    if (!exercise) {
        notFound();
    }

    const history = await getPracticeHistory(params.id);

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={20} />
                    Back to list
                </Link>
                <h1 className={styles.title}>{exercise.title}</h1>
                <div className={styles.meta}>
                    <div className={styles.metaItem}>
                        <Calendar size={16} />
                        <span>Added {new Date(exercise.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <Clock size={16} />
                        <span>Practiced {exercise.practice_count} times</span>
                    </div>
                </div>
            </header>

            <div className={styles.content}>
                <section className={styles.notesSection}>
                    <h2 className={styles.sectionTitle}>Notes</h2>
                    <EditNotes id={exercise.id} initialNotes={exercise.notes} />
                </section>

                <aside className={styles.historySidebar}>
                    <h2 className={styles.sectionTitle}>Practice History</h2>

                    {history.length === 0 ? (
                        <div className={styles.emptyHistory}>
                            <p>You haven't practiced this yet.</p>
                        </div>
                    ) : (
                        <ul className={styles.historyList}>
                            {history.map((session) => (
                                <li key={session.id} className={styles.historyItem}>
                                    <div className={styles.historyMarker}></div>
                                    <div className={styles.historyData}>
                                        <p className={styles.historyDate}>
                                            {new Date(session.practiced_at).toLocaleDateString(undefined, {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        <p className={styles.historyTime}>
                                            {new Date(session.practiced_at).toLocaleTimeString(undefined, {
                                                hour: 'numeric',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>
            </div>
        </main>
    );
}
