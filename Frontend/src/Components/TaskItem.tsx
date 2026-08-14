import { useState } from "react";
import type { Task } from "../Types/task";

interface TaskItemProps {
    task: Task;
    onUpdate: (task: Task) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [busy, setBusy] = useState(false);

    async function run(action: () => Promise<void>) {
        setBusy(true);
        try {
            await action();
        } finally {
            setBusy(false);
        }
    }

    // PUT is a full replace: every field goes back, with just the one changed.
    function handleToggle() {
        void run(() => onUpdate({ ...task, isCompleted: !task.isCompleted }));
    }

    function handleSave() {
        if (title.trim() === "" || description.trim() === "") {
            return;
        }
        void run(async () => {
            await onUpdate({
                ...task,
                title: title.trim(),
                description: description.trim(),
            });
            setEditing(false);
        });
    }

    function handleCancel() {
        setTitle(task.title);
        setDescription(task.description);
        setEditing(false);
    }

    if (editing) {
        return (
            <li className="rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-slate-500"
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={2000}
                    rows={2}
                    className="mt-2 w-full resize-none rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-slate-500"
                />
                <div className="mt-2 flex gap-2">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={busy || title.trim() === "" || description.trim() === ""}
                        className="rounded bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700 disabled:bg-slate-300"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={busy}
                        className="rounded px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                        Cancel
                    </button>
                </div>
            </li>
        );
    }

    return (
        <li className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={handleToggle}
                disabled={busy}
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-slate-900"
            />

            <div className="min-w-0 flex-1">
                <p
                    className={
                        "text-sm font-medium break-words " +
                        (task.isCompleted
                            ? "text-slate-400 line-through"
                            : "text-slate-900")
                    }
                >
                    {task.title}
                </p>
                <p className="mt-0.5 text-sm break-words text-slate-500">
                    {task.description}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                    {new Date(task.createdAt).toLocaleString()}
                </p>
            </div>

            <div className="flex shrink-0 gap-1">
                <button
                    type="button"
                    onClick={() => setEditing(true)}
                    disabled={busy}
                    className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:text-slate-300"
                >
                    Edit
                </button>
                <button
                    type="button"
                    onClick={() => void run(() => onDelete(task.id))}
                    disabled={busy}
                    className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:text-slate-300"
                >
                    Delete
                </button>
            </div>
        </li>
    );
}
