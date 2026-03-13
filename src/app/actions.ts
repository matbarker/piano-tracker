'use server';

import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export type Exercise = {
    id: string;
    title: string;
    notes: string;
    created_at: string;
    is_deleted: number;
    is_archived: number;
    category: 'song' | 'scale' | 'technique';
    priority: number;
    last_practiced_at?: string | null;
    practice_count: number;
    practice_count_7d: number;
    is_practiced_today: number;
    activity_map: string; // 7 chars of '0' or '1'
};

export type PracticeSession = {
    id: string;
    exercise_id: string;
    practiced_at: string;
};

export async function getExercises(
    filter: 'active' | 'archived' = 'active', 
    mode: 'practice' | 'manage' = 'manage',
    sortBy: 'title' | 'last_practiced' | 'priority' = 'priority',
    search: string = ''
): Promise<Exercise[]> {
    const db = getDb();

    let orderBy = '';
    switch (sortBy) {
        case 'title':
            orderBy = 'e.title ASC';
            break;
        case 'last_practiced':
            orderBy = 'MAX(p.practiced_at) DESC NULLS LAST, e.title ASC';
            break;
        case 'priority':
        default:
            orderBy = `
                e.priority DESC,
                CASE 
                    WHEN MAX(p.practiced_at) IS NULL THEN 1
                    WHEN MAX(p.practiced_at) <= datetime('now', '+8 hours', '-5 days') THEN 1
                    WHEN MAX(p.practiced_at) <= datetime('now', '+8 hours', '-3 days') THEN 2
                    WHEN MAX(p.practiced_at) <= datetime('now', '+8 hours', '-1 day') THEN 3
                    ELSE 4
                END ASC,
                MAX(p.practiced_at) ASC NULLS FIRST, 
                e.title ASC`;
            break;
    }

    const searchPattern = `%${search}%`;

    // Fetch exercises and their latest practice session
    const exercises = db.prepare(`
    SELECT 
      e.id, 
      e.title, 
      e.notes, 
      e.created_at,
      e.is_deleted,
      e.is_archived,
      e.category,
      e.priority,
      MAX(p.practiced_at) as last_practiced_at,
      COUNT(p.id) as practice_count,
      COUNT(CASE WHEN p.practiced_at >= datetime('now', '+8 hours', '-7 days') THEN 1 END) as practice_count_7d,
      CASE WHEN MAX(p.practiced_at) >= date('now', '+8 hours') THEN 1 ELSE 0 END as is_practiced_today,
      (
        SELECT group_concat(has_practiced)
        FROM (
          SELECT 
            CASE WHEN EXISTS (
              SELECT 1 FROM practice_sessions ps 
              WHERE ps.exercise_id = e.id 
              AND ps.practiced_at >= date('now', '+8 hours', '-' || (6-val) || ' days')
              AND ps.practiced_at < date('now', '+8 hours', '-' || (5-val) || ' days')
            ) THEN '1' ELSE '0' END as has_practiced
          FROM (SELECT 0 as val UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6)
          ORDER BY val DESC
        )
      ) as activity_map
    FROM exercises e
    LEFT JOIN practice_sessions p ON e.id = p.exercise_id
    WHERE e.is_deleted = 0 
      AND e.is_archived = ?
      AND (e.title LIKE ? OR e.notes LIKE ?)
    GROUP BY e.id, e.title, e.notes, e.created_at, e.is_deleted, e.is_archived, e.category, e.priority
    HAVING ? = 'manage' OR is_practiced_today = 0
    ORDER BY ${orderBy}
  `).all(filter === 'archived' ? 1 : 0, searchPattern, searchPattern, mode) as Exercise[];

    return exercises;
}

export async function getExerciseById(id: string): Promise<Exercise | undefined> {
    const db = getDb();
    const exercise = db.prepare(`
    SELECT 
      e.id, 
      e.title, 
      e.notes, 
      e.created_at,
      e.is_deleted,
      e.is_archived,
      e.category,
      e.priority,
      MAX(p.practiced_at) as last_practiced_at,
      COUNT(p.id) as practice_count,
      COUNT(CASE WHEN p.practiced_at >= datetime('now', '+8 hours', '-7 days') THEN 1 END) as practice_count_7d,
      CASE WHEN MAX(p.practiced_at) >= date('now', '+8 hours') THEN 1 ELSE 0 END as is_practiced_today,
      CASE WHEN MAX(p.practiced_at) >= date('now', '+8 hours') THEN 1 ELSE 0 END as is_practiced_today
    FROM exercises e
    LEFT JOIN practice_sessions p ON e.id = p.exercise_id
    WHERE e.id = ? AND e.is_deleted = 0
    GROUP BY e.id, e.title, e.notes, e.created_at, e.is_deleted, e.is_archived, e.category, e.priority
  `).get(id) as Exercise | undefined;

    return exercise;
}

export async function getPracticeHistory(exerciseId: string): Promise<PracticeSession[]> {
    const db = getDb();
    return db.prepare(`
    SELECT id, exercise_id, practiced_at
    FROM practice_sessions
    WHERE exercise_id = ?
    ORDER BY practiced_at DESC
  `).all(exerciseId) as PracticeSession[];
}

export async function addExercise(title: string, notes: string = '', category: string = 'technique', priority: number = 0) {
    try {
        const db = getDb();
        const id = crypto.randomUUID();

        db.prepare(`
        INSERT INTO exercises (id, title, notes, category, priority)
        VALUES (?, ?, ?, ?, ?)
    `).run(id, title, notes, category, priority);

        revalidatePath('/');
        return { success: true, id };
    } catch (error: any) {
        console.error("Database Error:", error);
        throw new Error(`Failed to add exercise: ${error?.message || error}`);
    }
}

export async function updateExercise(id: string, data: { title: string; notes: string; category: string; priority: number }) {
    try {
        const db = getDb();

        db.prepare(`
        UPDATE exercises
        SET title = ?, notes = ?, category = ?, priority = ?
        WHERE id = ?
    `).run(data.title, data.notes, data.category, data.priority, id);

        revalidatePath('/');
        revalidatePath(`/exercise/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("Database Error:", error);
        throw new Error(`Failed to update exercise: ${error?.message || error}`);
    }
}

export async function updateExerciseNotes(id: string, notes: string) {
    try {
        const db = getDb();

        db.prepare(`
        UPDATE exercises
        SET notes = ?
        WHERE id = ?
    `).run(notes, id);

        revalidatePath('/');
        revalidatePath(`/exercise/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("Database Error:", error);
        throw new Error(`Failed to update notes: ${error?.message || error}`);
    }
}

export async function logPracticeSession(exerciseId: string) {
    try {
        const db = getDb();
        const id = crypto.randomUUID();

        db.prepare(`
        INSERT INTO practice_sessions (id, exercise_id)
        VALUES (?, ?)
    `).run(id, exerciseId);

        revalidatePath('/');
        revalidatePath(`/exercise/${exerciseId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Database Error:", error);
        throw new Error(`Failed to log practice session: ${error?.message || error}`);
    }
}

export async function deleteExercise(id: string) {
    try {
        const db = getDb();
        db.prepare(`
            UPDATE exercises
            SET is_deleted = 1
            WHERE id = ?
        `).run(id);

        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error("Database Error:", error);
        throw new Error(`Failed to delete exercise: ${error?.message || error}`);
    }
}

export async function toggleArchiveExercise(id: string, archive: boolean) {
    try {
        const db = getDb();
        db.prepare(`
            UPDATE exercises
            SET is_archived = ?
            WHERE id = ?
        `).run(archive ? 1 : 0, id);

        revalidatePath('/');
        revalidatePath(`/exercise/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("Database Error:", error);
        throw new Error(`Failed to archive exercise: ${error?.message || error}`);
    }
}
