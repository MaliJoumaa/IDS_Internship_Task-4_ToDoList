export interface Task {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    isCompleted: boolean;
}

export interface TaskCreateRequest {
    title: string;
    description: string;
}

export interface TaskUpdateRequest {
    id: string;
    title: string;
    description: string;
    isCompleted: boolean;
}

/** Which tasks the list is currently showing. */
export type TaskFilter = "all" | "active" | "completed";

/**
 * Maps a UI filter to the backend's `isCompleted` query parameter.
 * `undefined` means "don't send the parameter at all", i.e. return everything.
 */
export function filterToIsCompleted(filter: TaskFilter): boolean | undefined {
    switch (filter) {
        case "active":
            return false;
        case "completed":
            return true;
        case "all":
            return undefined;
    }
}
