import { getExercises } from '@/app/actions';
import AddExercise from '@/components/AddExercise';
import ExerciseItem from '@/components/ExerciseItem';
import styles from './page.module.css';
import { Music } from 'lucide-react';

export default async function Home() {
  const exercises = await getExercises();

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.iconBox}>
            <Music size={28} className={styles.icon} />
          </div>
          <div>
            <h1 className={styles.title}>Piano Tracker</h1>
            <p className={styles.subtitle}>Log your daily practice sessions</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <AddExercise />
        </div>
      </header>

      <section className={styles.listSection}>
        <h2 className={styles.sectionTitle}>Your Repertoire & Exercises</h2>
        {exercises.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No exercises yet. Add one above to get started!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {exercises.map((exercise) => (
              <ExerciseItem key={exercise.id} exercise={exercise} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
