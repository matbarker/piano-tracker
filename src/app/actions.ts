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
    last_practiced_at?: string | null;
    practice_count: number;
    practice_count_7d: number;
};

export type PracticeSession = {
    id: string;
    exercise_id: string;
    practiced_at: string;
};

export async function getExercises(filter: 'active' | 'archived' = 'active'): Promise<Exercise[]> {
    const db = getDb();

    // Fetch exercises and their latest practice session
    const exercises = db.prepare(`
    SELECT 
      e.id, 
      e.title, 
      e.notes, 
      e.created_at,
      e.is_deleted,
      e.is_archived,
      MAX(p.practiced_at) as last_practiced_at,
      COUNT(p.id) as practice_count,
      COUNT(CASE WHEN p.practiced_at >= datetime('now', '-7 days') THEN 1 END) as practice_count_7d
    FROM exercises e
    LEFT JOIN practice_sessions p ON e.id = p.exercise_id
    WHERE e.is_deleted = 0 AND e.is_archived = ?
    GROUP BY e.id, e.title, e.notes, e.created_at, e.is_deleted, e.is_archived
    ORDER BY 
      CASE 
        WHEN MAX(p.practiced_at) IS NULL THEN 1
        WHEN MAX(p.practiced_at) <= datetime('now', '-5 days') THEN 1
        WHEN MAX(p.practiced_at) <= datetime('now', '-3 days') THEN 2
        WHEN MAX(p.practiced_at) <= datetime('now', '-1 day') THEN 3
        ELSE 4
      END ASC,
      MAX(p.practiced_at) ASC NULLS FIRST, 
      e.created_at DESC
  `).all(filter === 'archived' ? 1 : 0) as Exercise[];

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
      MAX(p.practiced_at) as last_practiced_at,
      COUNT(p.id) as practice_count,
      COUNT(CASE WHEN p.practiced_at >= datetime('now', '-7 days') THEN 1 END) as practice_count_7d
    FROM exercises e
    LEFT JOIN practice_sessions p ON e.id = p.exercise_id
    WHERE e.id = ? AND e.is_deleted = 0
    GROUP BY e.id, e.title, e.notes, e.created_at, e.is_deleted, e.is_archived
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

export async function addExercise(title: string, notes: string = '') {
    try {
        const db = getDb();
        const id = crypto.randomUUID();

        db.prepare(`
        INSERT INTO exercises (id, title, notes)
        VALUES (?, ?, ?)
    `).run(id, title, notes);

        revalidatePath('/');
        return { success: true, id };
    } catch (error: any) {
        console.error("Database Error:", error);
        throw new Error(`Failed to add exercise: ${error?.message || error}`);
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
