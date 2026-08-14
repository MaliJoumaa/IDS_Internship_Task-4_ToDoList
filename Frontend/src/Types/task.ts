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

export type TaskFilter = "all" | "active" | "completed";

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
