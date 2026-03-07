'use server';

import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export type Exercise = {
    id: string;
    title: string;
    notes: string;
    created_at: string;
    last_practiced_at?: string | null;
    practice_count: number;
};

export type PracticeSession = {
    id: string;
    exercise_id: string;
    practiced_at: string;
};

export async function getExercises(): Promise<Exercise[]> {
    const db = getDb();

    // Fetch exercises and their latest practice session
    const exercises = db.prepare(`
    SELECT 
      e.id, 
      e.title, 
      e.notes, 
      e.created_at,
      MAX(p.practiced_at) as last_practiced_at,
      COUNT(p.id) as practice_count
    FROM exercises e
    LEFT JOIN practice_sessions p ON e.id = p.exercise_id
    GROUP BY e.id, e.title, e.notes, e.created_at
    ORDER BY p.practiced_at ASC NULLS FIRST, e.created_at DESC
  `).all() as Exercise[];

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
      MAX(p.practiced_at) as last_practiced_at,
      COUNT(p.id) as practice_count
    FROM exercises e
    LEFT JOIN practice_sessions p ON e.id = p.exercise_id
    WHERE e.id = ?
    GROUP BY e.id, e.title, e.notes, e.created_at
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
    const db = getDb();
    const id = crypto.randomUUID();

    db.prepare(`
    INSERT INTO exercises (id, title, notes)
    VALUES (?, ?, ?)
  `).run(id, title, notes);

    revalidatePath('/');
    return id;
}

export async function updateExerciseNotes(id: string, notes: string) {
    const db = getDb();

    db.prepare(`
    UPDATE exercises
    SET notes = ?
    WHERE id = ?
  `).run(notes, id);

    revalidatePath('/');
    revalidatePath(`/exercise/${id}`);
}

export async function logPracticeSession(exerciseId: string) {
    const db = getDb();
    const id = crypto.randomUUID();

    db.prepare(`
    INSERT INTO practice_sessions (id, exercise_id)
    VALUES (?, ?)
  `).run(id, exerciseId);

    revalidatePath('/');
    revalidatePath(`/exercise/${exerciseId}`);
}
