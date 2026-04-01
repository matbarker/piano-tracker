import { getExerciseById, getPracticeHistory } from '@/app/actions';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import EditExercise from '@/components/EditExercise';
import ExerciseActions from './ExerciseActions';
import PracticeHistoryList from '@/components/PracticeHistoryList';
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
                        <span>Added {new Date(exercise.created_at.replace(' ', 'T') + 'Z').toLocaleDateString()}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <Clock size={16} />
                        <span>Practiced {exercise.practice_count} times</span>
                    </div>
                </div>
            </header>

            <div className={styles.content}>
                <section className={styles.notesSection}>
                    <h2 className={styles.sectionTitle}>Exercise Details</h2>
                    <EditExercise exercise={exercise} />
                    <ExerciseActions id={exercise.id} isArchived={!!exercise.is_archived} />
                </section>

                <aside className={styles.historySidebar}>
                    <h2 className={styles.sectionTitle}>Practice History</h2>

                    <PracticeHistoryList history={history} />
                </aside>
            </div>
        </main>
    );
}
