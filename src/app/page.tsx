import { getExercises } from '@/app/actions';
import NavMenu from '@/components/NavMenu';
import ExerciseItem from '@/components/ExerciseItem';
import Link from 'next/link';
import styles from './page.module.css';
import { Music } from 'lucide-react';

export default async function Home(
    props: { searchParams: Promise<{ archived?: string; mode?: string; sort?: string }> }
) {
  const searchParams = await props.searchParams;
  const isArchivedView = searchParams?.archived === 'true';
  const mode = (searchParams?.mode as 'practice' | 'manage') || 'practice';
  const sort = (searchParams?.sort as 'title' | 'last_practiced' | 'priority') || 'priority';
  
  const exercises = await getExercises(
    isArchivedView ? 'archived' : 'active', 
    mode,
    sort
  );

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
          <NavMenu currentMode={mode} isArchivedView={isArchivedView} />
        </div>
      </header>

      <section className={styles.listSection}>
        <div className={styles.listHeader}>
          <div className={styles.headerTitles}>
            <h2 className={styles.sectionTitle}>
              {mode === 'practice' 
                ? 'Today\'s Practice Routine' 
                : isArchivedView ? 'Archived Exercises' : 'Complete Repertoire'
              }
            </h2>
            {mode === 'manage' && (
              <div className={styles.sortControls}>
                <span>Sort by:</span>
                <Link 
                  href={`/?mode=manage${isArchivedView ? '&archived=true' : ''}&sort=priority`}
                  className={`${styles.sortLink} ${sort === 'priority' ? styles.activeSort : ''}`}
                >
                  Priority
                </Link>
                <Link 
                  href={`/?mode=manage${isArchivedView ? '&archived=true' : ''}&sort=title`}
                  className={`${styles.sortLink} ${sort === 'title' ? styles.activeSort : ''}`}
                >
                  A-Z
                </Link>
                <Link 
                  href={`/?mode=manage${isArchivedView ? '&archived=true' : ''}&sort=last_practiced`}
                  className={`${styles.sortLink} ${sort === 'last_practiced' ? styles.activeSort : ''}`}
                >
                  Last Practiced
                </Link>
              </div>
            )}
          </div>

          {mode === 'manage' && (
            <div className={styles.tabs}>
              <Link 
                href="/?mode=manage" 
                className={`${styles.tab} ${!isArchivedView ? styles.activeTab : ''}`}
              >
                Active
              </Link>
              <Link 
                href="/?mode=manage&archived=true" 
                className={`${styles.tab} ${isArchivedView ? styles.activeTab : ''}`}
              >
                Archived
              </Link>
            </div>
          )}
        </div>
        
        {exercises.length === 0 ? (
          <div className={styles.emptyState}>
            <p>
              {mode === 'practice' 
                ? 'All done for today! Great job.' 
                : isArchivedView ? 'No archived exercises.' : 'No exercises yet. Add one above to get started!'
              }
            </p>
          </div>
        ) : (
          <div className={mode === 'practice' ? styles.grid : styles.list}>
            {exercises.map((exercise) => (
              <ExerciseItem key={exercise.id} exercise={exercise} mode={mode} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
