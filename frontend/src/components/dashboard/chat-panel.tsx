"use client";

import {
  ArrowUp,
  LoaderCircle,
  MessageSquarePlus,
  Sparkles,
} from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  listThreads,
  loadThread,
  streamAgentChat,
  ThreadSummary,
} from "@/lib/agent";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { MarkdownMessage } from "./markdown-message";

const styles = {
  root: "flex h-svh overflow-hidden",
  overlay: "fixed inset-0 z-30 bg-foreground/20 backdrop-blur-[2px] md:hidden",
  aside:
    "fixed inset-y-0 left-0 z-40 flex w-[18.5rem] flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl transition-transform md:static md:translate-x-0",
  asideOpen: "translate-x-0",
  asideClosed: "-translate-x-full",
  brandRow: "flex items-center justify-between gap-2 px-4 pt-4 pb-3",
  brandLeft: "flex min-w-0 items-center gap-2.5",
  brandIcon:
    "flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground",
  brandIconSvg: "size-4",
  brandText: "min-w-0",
  brandTitle: "font-heading text-lg font-semibold tracking-tight",
  brandSubtitle: "truncate text-xs text-muted-foreground",
  mobileCloseBtn: "md:hidden",
  topActions: "space-y-3 px-3 pb-3",
  newChatBtn:
    "w-full justify-start gap-2 rounded-xl border-sidebar-border bg-card/70 text-sm",
  newChatIcon: "size-4",
  separator: "opacity-70",
  chatsSection: "flex min-h-0 flex-1 flex-col px-2 pt-3",
  chatsTitle: "mb-2 px-2 text-sm font-semibold text-sidebar-foreground",
  chatsScroll: "min-h-0 flex-1 px-1 pb-3",
  chatsEmpty: "px-2 py-3 text-sm leading-relaxed text-muted-foreground",
  threadList: "space-y-1",
  threadBtn:
    "w-full rounded-xl px-3 py-2.5 text-left transition-colors disabled:opacity-50",
  threadBtnActive: "bg-sidebar-accent text-sidebar-accent-foreground",
  threadBtnIdle: "hover:bg-sidebar-accent/60",
  threadTitle: "line-clamp-2 text-sm font-medium leading-snug",
  threadTime: "mt-1 block text-xs text-muted-foreground",
  footer: "mt-auto border-t border-sidebar-border p-3",
  main: "relative flex min-w-0 flex-1 flex-col",
  header:
    "flex h-14 shrink-0 items-center gap-3 border-b border-border/70 bg-background/50 px-3 backdrop-blur-md md:px-5",
  mobileMenuBtn: "md:hidden",
  menuIcon: "size-5",
  headerText: "min-w-0",
  headerTitle: "truncate text-base font-semibold",
  headerSubtitle: "truncate text-sm text-muted-foreground",
  chatColumn: "relative flex min-h-0 flex-1 flex-col",
  messagesScroll: "h-full min-h-0 flex-1",
  messagesInner: "mx-auto w-full max-w-3xl px-4 py-8 sm:px-6",
  emptyState:
    "flex min-h-[52vh] flex-col items-center justify-center text-center",
  emptyIcon:
    "mb-5 flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground",
  emptyIconSvg: "size-6",
  emptyTitle: "font-heading text-3xl font-semibold tracking-tight sm:text-4xl",
  emptyCopy: "mt-3 max-w-md text-base leading-relaxed text-muted-foreground",
  suggestions: "mt-8 flex flex-wrap justify-center gap-2",
  suggestionBtn: "rounded-full border-border/80 bg-card/80 px-3.5 text-[13px]",
  messageList: "space-y-6",
  statusRow: "flex items-center gap-2 text-sm text-muted-foreground",
  statusIcon: "size-4 animate-spin",
  statusIconSm: "size-3.5 animate-spin",
  messageRow: "message-enter flex w-full min-w-0",
  messageRowUser: "justify-end",
  messageRowAssistant: "justify-start",
  bubble:
    "min-w-0 max-w-[min(100%,42rem)] overflow-hidden break-words [overflow-wrap:anywhere]",
  bubbleUser:
    "rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground",
  bubbleAssistant:
    "rounded-2xl rounded-bl-md bg-card px-4 py-3 text-foreground ring-1 ring-primary/15",
  bubbleSystem: "rounded-2xl bg-muted px-4 py-2.5 text-muted-foreground",
  thinking: "inline-flex items-center gap-2 text-sm text-muted-foreground",
  userText: "whitespace-pre-wrap text-[15px] leading-7",
  composerWrap:
    "shrink-0 border-t border-border/60 bg-background/70 px-4 py-4 backdrop-blur-md sm:px-6",
  composerForm:
    "composer-glow mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border border-border/80 bg-card p-2.5",
  composerInput:
    "max-h-40 min-h-[44px] flex-1 resize-none border-0 bg-transparent px-3 py-2.5 text-[15px] shadow-none focus-visible:ring-0",
  sendBtn: "mb-0.5 size-10 shrink-0 rounded-xl",
  sendIcon: "size-4",
  sendIconSpin: "size-4 animate-spin",
  composerHint:
    "mx-auto mt-2.5 max-w-3xl text-center text-[11px] text-muted-foreground",
} as const;

type Props = {
  sessionToken: string;
  connections?: ReactNode;
  footer?: ReactNode;
};

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

const WELCOME =
  "Connect Google Calendar, then ask about today's agenda, create a Meet, or reschedule something.";

const SUGGESTIONS = [
  "What's on today?",
  "What's on tomorrow?",
  "Find a free slot tomorrow morning",
  "Create a meeting on 20th aug and keep the time as 10am for 30 minutes and keep sangammukherjee1996@gmail as attendee",
];

function WelcomeMessage(): Message {
  return {
    id: "welcome",
    role: "assistant",
    content: WELCOME,
  };
}

function ChatPanel({ sessionToken, connections, footer }: Props) {
  const [threadId, setThreadId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([WelcomeMessage()]);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const showEmpty =
    messages.length === 1 && messages[0]?.id === "welcome" && !running;

  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshThreads = useCallback(async () => {
    try {
      const data = await listThreads(sessionToken);
      setThreads(data.threads);
    } catch {}
  }, [sessionToken]);

  useEffect(() => {
    refreshThreads();
  }, [refreshThreads]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, progress]);

  function startNewChat() {
    if (running) return;
    setThreadId(crypto.randomUUID());
    setMessages([WelcomeMessage()]);
    setPrompt("");
  }

  async function resumeThread(nextThreadId: string) {
    if (running || loadingThread || nextThreadId === threadId) return;
    setLoadingThread(true);
    setProgress(null);

    try {
      const data = await loadThread(sessionToken, nextThreadId);
      setThreadId(data.threadId);
      setMessages(
        data.messages.length > 0 ? data.messages : [WelcomeMessage()],
      );
      setPrompt("");
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "system",
          content: "Could not load the chat",
        },
      ]);
    } finally {
      setLoadingThread(false);
    }
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();

    if (!trimmed || running || loadingThread) return;
    const assistantId = crypto.randomUUID();

    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      },
      {
        id: assistantId,
        role: "assistant",
        content: "",
      },
    ]);

    setPrompt("");
    setRunning(true);
    setProgress(null);

    try {
      await streamAgentChat(
        sessionToken,
        {
          message: trimmed,
          threadId,
        },
        (event) => {
          if (event.type === "progress" && event.message) {
            setProgress(event.message);
          }
          if (event.type === "token" && event.token) {
            setProgress(null);
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? {
                      ...message,
                      content: message.content + event.token,
                    }
                  : message,
              ),
            );
          }

          if (event.type === "error") {
            setProgress(null);
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? {
                      ...message,
                      content: event.message ?? "Agent failed",
                    }
                  : message,
              ),
            );
          }
        },
      );

      refreshThreads();
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "system",
          content: "Could not reach the agent API",
        },
      ]);
    } finally {
      setRunning(false);
      setProgress(null);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    sendMessage(prompt);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(prompt);
    }
  }

  return (
    <div className={styles.root}>
      <aside className={styles.aside}>
        <div className={styles.brandRow}>
          <div className={styles.brandLeft}>
            <div className={styles.brandIcon}>
              <Sparkles className={styles.brandIconSvg} />
            </div>
            <div className={styles.brandText}>
              <p className={styles.brandTitle}>Meet Agent</p>
            </div>
          </div>
        </div>

        <div className={styles.topActions}>
          <Button
            onClick={startNewChat}
            variant="outline"
            className={styles.newChatBtn}
          >
            <MessageSquarePlus className={styles.newChatIcon} />
            New Chat
          </Button>
          {connections}
        </div>
        <Separator className={styles.separator} />
        <div className={styles.chatsSection}>
          <p className={styles.chatsTitle}>Chats</p>
          <ScrollArea className={styles.chatsScroll}>
            {threads.length === 0 ? (
              <p className={styles.chatsEmpty}>
                No chats yet. Start one and it will show up here.
              </p>
            ) : (
              <div className={styles.threadList}>
                {threads.map((thread) => {
                  const active = thread.id === threadId;
                  return (
                    <button
                      key={thread.id}
                      type="button"
                      disabled={running || loadingThread}
                      onClick={() => resumeThread(thread.id)}
                      className={cn(
                        styles.threadBtn,
                        active ? styles.threadBtnActive : styles.threadBtnIdle,
                      )}
                    >
                      <span className={styles.threadTitle}>{thread.title}</span>
                      <span className={styles.threadTime}>
                        {thread.updatedAt}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
        <Separator className={styles.separator} />

        <div className={styles.footer}>{footer}</div>
      </aside>

      <section className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <p className={styles.headerTitle}>Assistant</p>
            <p className={styles.headerSubtitle}>
              Schedule, reschedule, and brief your day
            </p>
          </div>
        </header>

        <div className={styles.chatColumn}>
          <ScrollArea className={styles.messagesScroll}>
            <div className={styles.messagesInner}>
              {showEmpty ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Sparkles className={styles.emptyIconSvg} />
                  </div>
                  <h2 className={styles.emptyTitle}>Meeting Assistant</h2>
                  <p className={styles.emptyCopy}>{WELCOME}</p>
                  <div className={styles.suggestions}>
                    {SUGGESTIONS.map((currentSuggestionItem) => (
                      <Button
                        key={currentSuggestionItem}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage(currentSuggestionItem)}
                        className={styles.suggestionBtn}
                        disabled={running || loadingThread}
                      >
                        {currentSuggestionItem}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.messageList}>
                  {loadingThread ? (
                    <div className={styles.statusRow}>
                      <LoaderCircle className={styles.statusIcon} />
                      Loading Chat...
                    </div>
                  ) : (
                    messages.map((message) => {
                      if (message.id === "welcome" && messages.length > 1) {
                        return null;
                      }

                      return (
                        <div
                          key={message.id}
                          className={cn(
                            styles.messageRow,
                            message.role === "user"
                              ? styles.messageRowUser
                              : styles.messageRowAssistant,
                          )}
                        >
                          <div
                            className={cn(
                              styles.bubble,
                              message.role === "user" && styles.bubbleUser,
                              message.role === "assistant" &&
                                styles.bubbleAssistant,
                              message.role === "system" && styles.bubbleSystem,
                            )}
                          >
                            {!message.content && running ? (
                              <span className={styles.thinking}>
                                <LoaderCircle className={styles.statusIconSm} />
                                Thinking...
                              </span>
                            ) : message.role === "user" ? (
                              <p className={styles.userText}>
                                {message.content}
                              </p>
                            ) : (
                              <MarkdownMessage
                                content={message.content}
                                tone={
                                  message.role === "system"
                                    ? "system"
                                    : "assistant"
                                }
                              />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {progress ? (
                    <div className={styles.statusRow}>
                      <LoaderCircle className={styles.statusIconSm} />
                      {progress}
                    </div>
                  ) : null}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
          </ScrollArea>

          <div className={styles.composerWrap}>
            <form onSubmit={onSubmit} className={styles.composerForm}>
              <Textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={1}
                onKeyDown={onKeyDown}
                disabled={running}
                placeholder="Ask about your calendar..."
                className={styles.composerInput}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!prompt.trim() || running}
                className={styles.sendBtn}
                aria-label="Send Text Message"
              >
                {running ? (
                  <LoaderCircle className={styles.sendIconSpin} />
                ) : (
                  <ArrowUp className={styles.sendIcon} />
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ChatPanel;
