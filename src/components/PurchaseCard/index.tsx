import { Download, FileText } from 'lucide-react'

type PurchaseCardProps = {
    id: string
    title: string
    orderedAt?: string | null
    orderNumber: string
    tags: string[]
    iconColor?: string // e.g. 'bg-blue-50 text-blue-600'
}

export function PurchaseCard({
    id,
    title,
    orderedAt,
    orderNumber,
    tags,
    iconColor = 'bg-blue-50 text-blue-600',
}: PurchaseCardProps) {
    const formattedDate = orderedAt ? new Date(orderedAt).toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }) : 'N/A'

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconColor}`}>
                    <FileText size={20} />
                </div>

                <div className="min-w-0">
                    <h3 className="font-semibold text-primary">{title}</h3>
                    <p className="text-sm text-gray-500">
                        Ordered: {formattedDate} &bull; Order #{orderNumber}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <a
                href={`/api/documents/${id}/download`}
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition-colors"
            >
                <Download size={14} />
                Download
            </a>
        </div >
    )
}