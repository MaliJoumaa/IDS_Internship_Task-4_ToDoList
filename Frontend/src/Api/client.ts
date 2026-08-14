import type { Task, TaskCreateRequest, TaskUpdateRequest } from "../Types/task";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (response.status === 204) {
        return undefined as T;
    }
    return response.json() as Promise<T>;
}

/**
 * Fetches tasks. Pass `isCompleted` to filter server-side; omit it for all tasks.
 */
export function getTasks(isCompleted?: boolean): Promise<Task[]> {
    const query = isCompleted === undefined ? "" : `?isCompleted=${isCompleted}`;
    return request<Task[]>(`/api/tasks${query}`);
}

export function createTask(task: TaskCreateRequest): Promise<Task> {
    return request<Task>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(task),
    });
}

export function updateTask(task: TaskUpdateRequest): Promise<Task> {
    return request<Task>(`/api/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify(task),
    });
}

export async function deleteTask(id: string): Promise<void> {
    await request<void>(`/api/tasks/${id}`, {
        method: "DELETE",
    });
}
