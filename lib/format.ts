export function formatDate(date: string | undefined): string {
    const parts = (date ?? "").split("-");
    return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : date ?? "";
}

export function photoCountLabel(count: number): string {
    return `${count} ${count === 1 ? "scatto" : "scatti"}`;
}

export function chapterCountLabel(count: number): string {
    return `${count} ${count === 1 ? "capitolo" : "capitoli"}`;
}

export function seriesIndex(position: number): string {
    return String(position + 1).padStart(2, "0");
}
