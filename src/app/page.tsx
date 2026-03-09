import { getExercises } from '@/app/actions';
import AddExercise from '@/components/AddExercise';
import ExerciseItem from '@/components/ExerciseItem';
import Link from 'next/link';
import styles from './page.module.css';
import { Music } from 'lucide-react';

export default async function Home(
    props: { searchParams: Promise<{ archived?: string }> }
) {
  const searchParams = await props.searchParams;
  const isArchivedView = searchParams?.archived === 'true';
  const exercises = await getExercises(isArchivedView ? 'archived' : 'active');

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
        <div className={styles.listHeader}>
          <h2 className={styles.sectionTitle}>
            {isArchivedView ? 'Archived Exercises' : 'Your Repertoire & Exercises'}
          </h2>
          <div className={styles.tabs}>
            <Link 
              href="/" 
              className={`${styles.tab} ${!isArchivedView ? styles.activeTab : ''}`}
            >
              Active
            </Link>
            <Link 
              href="/?archived=true" 
              className={`${styles.tab} ${isArchivedView ? styles.activeTab : ''}`}
            >
              Archived
            </Link>
          </div>
        </div>
        
        {exercises.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{isArchivedView ? 'No archived exercises.' : 'No exercises yet. Add one above to get started!'}</p>
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
