import { User, Bot } from "lucide-react";

interface ChatMessageProps {
    role: "user" | "system";
    content: React.ReactNode;
    timestamp?: Date;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
    return (
        <div className={`flex w-full mb-4 ${role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[85%] ${role === "user" ? "flex-row-reverse" : "flex-row"} gap-3`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${role === "user" ? "bg-primary text-primary-foreground" : "bg-orange-500 text-white"
                    }`}>
                    {role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div className={`flex flex-col ${role === "user" ? "items-end" : "items-start"}`}>
                    <div
                        className={`px-4 py-3 rounded-2xl text-sm ${role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-white border border-slate-200 shadow-sm rounded-tl-none text-slate-800"
                            }`}
                    >
                        {content}
                    </div>
                    {timestamp && (
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
