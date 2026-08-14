import { useCallback, useEffect, useState } from "react";
import { createTask, deleteTask, getTasks, updateTask } from "./Api/client";
import { filterToIsCompleted } from "./Types/task";
import type { Task, TaskCreateRequest, TaskFilter } from "./Types/task";
import FilterBar from "./Components/FilterBar";
import TaskForm from "./Components/TaskForm";
import TaskItem from "./Components/TaskItem";

const EMPTY_MESSAGE: Record<TaskFilter, string> = {
    all: "No tasks yet. Add one above.",
    active: "Nothing active — everything is done.",
    completed: "No completed tasks yet.",
};

function messageOf(error: unknown): string {
    return error instanceof Error ? error.message : "Something went wrong.";
}

export default function App() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filter, setFilter] = useState<TaskFilter>("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setTasks(await getTasks(filterToIsCompleted(filter)));
        } catch (err) {
            setError(messageOf(err));
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        void load();
    }, [load]);

    const mutate = useCallback(
        async (action: () => Promise<unknown>) => {
            setError(null);
            try {
                await action();
                await load();
            } catch (err) {
                setError(messageOf(err));
            }
        },
        [load],
    );

    const handleCreate = useCallback(
        (input: TaskCreateRequest) => mutate(() => createTask(input)),
        [mutate],
    );

    const handleUpdate = useCallback(
        (task: Task) => mutate(() => updateTask(task)),
        [mutate],
    );

    const handleDelete = useCallback(
        (id: string) => mutate(() => deleteTask(id)),
        [mutate],
    );

    const showSpinner = loading && tasks.length === 0;

    return (
        <div className='min-h-screen bg-slate-50 text-slate-900'>
            <div className='mx-auto max-w-2xl px-4 py-10'>
                <header className='mb-6'>
                    <h1 className='text-3xl font-bold tracking-tight'>Tasks</h1>
                </header>

                <TaskForm onCreate={handleCreate} />

                <FilterBar value={filter} onChange={setFilter} />

                {error && (
                    <div className='mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
                        <span>{error}</span>
                        <button
                            type='button'
                            onClick={() => void load()}
                            className='shrink-0 rounded border border-red-300 px-2 py-1 text-xs font-medium hover:bg-red-100'
                        >
                            Retry
                        </button>
                    </div>
                )}

                {showSpinner ? (
                    <p className='text-sm text-slate-500'>Loading…</p>
                ) : tasks.length === 0 ? (
                    <p className='text-sm text-slate-500'>
                        {EMPTY_MESSAGE[filter]}
                    </p>
                ) : (
                    <ul className='flex flex-col gap-2'>
                        {tasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onUpdate={handleUpdate}
                                onDelete={handleDelete}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
