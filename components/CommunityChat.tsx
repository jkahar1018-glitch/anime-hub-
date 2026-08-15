"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaComments,
  FaPaperPlane,
  FaTimes,
} from "react-icons/fa";

import {
  createClient,
  type RealtimeChannel,
} from "@supabase/supabase-js";

type CommunityMessage = {
  id: string | number;
  name: string;
  message: string;
  created_at: string;
};

type PresenceUser = {
  name: string;
  typing: boolean;
};

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(
        supabaseUrl,
        supabaseKey
      )
    : null;

const CHANNEL_NAME =
  "animehub-community-room";

function formatTime(date: string) {
  try {
    return new Date(date).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return "";
  }
}

export default function CommunityChat() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const [messages, setMessages] =
    useState<CommunityMessage[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [loadingMessages, setLoadingMessages] =
    useState(true);

  const [typingUsers, setTypingUsers] =
    useState<PresenceUser[]>([]);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const channelRef =
    useRef<RealtimeChannel | null>(null);

  const typingTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  /*
   * LOAD SAVED NAME
   */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedName =
          localStorage.getItem(
            "animehub-chat-name"
          );

        if (savedName) {
          setName(savedName);
        }
      } catch {
        // Ignore localStorage errors.
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /*
   * LOAD MESSAGES
   */

  const loadMessages = async () => {
    try {
      const response = await fetch(
        "/api/community-chat",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to load messages"
        );
      }

      if (
        Array.isArray(
          data?.messages
        )
      ) {
        setMessages(
          data.messages
        );
      }
    } catch (error) {
      console.error(
        "Community chat loading error:",
        error
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMessages();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /*
   * SUPABASE REALTIME
   */

  useEffect(() => {
    if (!supabase) {
      console.error(
        "Supabase is not configured."
      );

      return;
    }

    const channel =
      supabase.channel(
        CHANNEL_NAME,
        {
          config: {
            broadcast: {
              self: false,
            },
            presence: {
              key: Math.random()
                .toString(36)
                .substring(2),
            },
          },
        }
      );

    channelRef.current =
      channel;

    /*
     * NEW MESSAGE
     */

    channel.on(
      "broadcast",
      {
        event: "new-message",
      },
      (payload) => {
        const incoming =
          payload?.payload
            ?.message as
            | CommunityMessage
            | undefined;

        if (!incoming) {
          return;
        }

        if (!incoming.id) {
          return;
        }

        setMessages(
          (current) => {
            const exists =
              current.some(
                (item) =>
                  String(
                    item.id
                  ) ===
                  String(
                    incoming.id
                  )
              );

            if (exists) {
              return current;
            }

            return [
              ...current,
              incoming,
            ];
          }
        );
      }
    );

    /*
     * TYPING
     */

    channel.on(
      "broadcast",
      {
        event: "typing",
      },
      (payload) => {
        const data =
          payload?.payload;

        if (
          !data ||
          typeof data.name !==
            "string"
        ) {
          return;
        }

        const typingName =
          data.name.trim();

        if (!typingName) {
          return;
        }

        const isTyping =
          Boolean(
            data.typing
          );

        setTypingUsers(
          (current) => {
            const filtered =
              current.filter(
                (user) =>
                  user.name !==
                  typingName
              );

            if (!isTyping) {
              return filtered;
            }

            return [
              ...filtered,
              {
                name:
                  typingName,
                typing: true,
              },
            ];
          }
        );

        if (isTyping) {
          window.setTimeout(() => {
            setTypingUsers(
              (current) =>
                current.filter(
                  (user) =>
                    user.name !==
                    typingName
                )
            );
          }, 2500);
        }
      }
    );

    channel.subscribe(
      (status) => {
        console.log(
          "AnimeHub Community Realtime:",
          status
        );

        if (
          status ===
          "SUBSCRIBED"
        ) {
          console.log(
            "AnimeHub Community Chat connected."
          );
        }

        if (
          status ===
          "CHANNEL_ERROR"
        ) {
          console.warn(
            "Supabase Realtime unavailable. Chat will continue using database polling."
          );
        }

        if (
          status ===
          "TIMED_OUT"
        ) {
          console.warn(
            "Supabase Realtime timed out."
          );
        }
      }
    );

    return () => {
      if (
        typingTimeoutRef.current
      ) {
        clearTimeout(
          typingTimeoutRef.current
        );
      }

      try {
        supabase.removeChannel(
          channel
        );
      } catch {
        // Ignore cleanup errors.
      }

      channelRef.current =
        null;
    };
  }, []);

  /*
   * POLLING FALLBACK
   */

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        void loadMessages();
      }, 5000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, []);

  /*
   * AUTO SCROLL
   */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [messages]);

  /*
   * SEND TYPING STATUS
   */

  const sendTypingStatus = async (
    value: string
  ) => {
    setMessage(value);

    const channel =
      channelRef.current;

    if (!channel) {
      return;
    }

    const cleanName =
      name.trim();

    if (!cleanName) {
      return;
    }

    const typing =
      value.trim().length > 0;

    try {
      await channel.send({
        type: "broadcast",
        event: "typing",
        payload: {
          name: cleanName,
          typing,
        },
      });
    } catch {
      // Realtime is optional.
    }

    if (
      typingTimeoutRef.current
    ) {
      clearTimeout(
        typingTimeoutRef.current
      );
    }

    if (typing) {
      typingTimeoutRef.current =
        setTimeout(
          async () => {
            try {
              await channel.send({
                type: "broadcast",
                event: "typing",
                payload: {
                  name: cleanName,
                  typing: false,
                },
              });
            } catch {
              // Ignore.
            }
          },
          2000
        );
    }
  };

  /*
   * NAME CHANGE
   */

  const handleNameChange = (
    value: string
  ) => {
    setName(value);

    try {
      localStorage.setItem(
        "animehub-chat-name",
        value
      );
    } catch {
      // Ignore.
    }
  };

  /*
   * SEND MESSAGE
   */

  const sendMessage = async () => {
    const cleanName =
      name.trim();

    const cleanMessage =
      message.trim();

    if (
      !cleanName ||
      !cleanMessage ||
      loading
    ) {
      return;
    }

    setLoading(true);

    try {
      localStorage.setItem(
        "animehub-chat-name",
        cleanName
      );
    } catch {
      // Ignore.
    }

    const channel =
      channelRef.current;

    if (channel) {
      try {
        await channel.send({
          type: "broadcast",
          event: "typing",
          payload: {
            name: cleanName,
            typing: false,
          },
        });
      } catch {
        // Ignore.
      }
    }

    try {
      const response =
        await fetch(
          "/api/community-chat",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name: cleanName,
              message:
                cleanMessage,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Message failed."
        );
      }

      const newMessage =
        data?.message as
          | CommunityMessage
          | undefined;

      if (newMessage) {
        setMessages(
          (current) => {
            const exists =
              current.some(
                (item) =>
                  String(
                    item.id
                  ) ===
                  String(
                    newMessage.id
                  )
              );

            if (exists) {
              return current;
            }

            return [
              ...current,
              newMessage,
            ];
          }
        );

        if (channel) {
          try {
            await channel.send({
              type: "broadcast",
              event: "new-message",
              payload: {
                message:
                  newMessage,
              },
            });
          } catch (error) {
            console.warn(
              "Realtime broadcast failed:",
              error
            );
          }
        }
      }

      setMessage("");
    } catch (error) {
      console.error(
        "Community Chat Error:",
        error
      );

      alert(
        "Message send nahi hua. Please dobara try karo."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ENTER KEY
   */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      void sendMessage();
    }
  };

  /*
   * UI
   */

  return (
    <>
      {/* FLOATING BUTTON */}

      <button
        type="button"
        onClick={() =>
          setOpen(
            (value) => !value
          )
        }
        className="fixed bottom-24 right-5 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-black shadow-2xl shadow-orange-500/30 transition hover:scale-110 hover:bg-orange-400 sm:right-6"
        aria-label="Live Community Chat"
        aria-expanded={open}
      >
        {open ? (
          <FaTimes size={20} />
        ) : (
          <FaComments size={22} />
        )}
      </button>

      {/* CHAT PANEL */}

      {open && (
        <div className="fixed bottom-44 right-5 z-[9998] flex h-[min(650px,75vh)] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#090909] shadow-2xl shadow-black/60 sm:right-6">
          {/* HEADER */}

          <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-4 text-black">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/15">
                <FaComments size={18} />
              </div>

              <div>
                <h2 className="font-black">
                  Live Community
                </h2>

                <p className="text-xs font-semibold text-black/60">
                  Real-time anime chat
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-black/10"
              aria-label="Close chat"
            >
              <FaTimes />
            </button>
          </div>

          {/* MESSAGES */}

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#0b0b0b] px-4 py-4">
            {loadingMessages ? (
              <div className="flex h-full items-center justify-center text-sm text-white/40">
                Loading community...
              </div>
            ) : messages.length ===
              0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <div className="mb-2 text-3xl">
                    👋
                  </div>

                  <strong className="text-white">
                    Be the first to
                    say hi!
                  </strong>

                  <p className="mt-1 text-xs text-white/40">
                    Start a conversation
                    with anime fans.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map(
                  (item) => (
                    <div
                      key={String(
                        item.id
                      )}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <b className="text-sm text-orange-400">
                          {item.name}
                        </b>

                        <small className="text-[10px] text-white/30">
                          {formatTime(
                            item.created_at
                          )}
                        </small>
                      </div>

                      <p className="mt-1 break-words text-sm leading-6 text-white/80">
                        {item.message}
                      </p>
                    </div>
                  )
                )}

                {typingUsers.length >
                  0 && (
                  <div className="text-xs text-white/40">
                    {typingUsers
                      .slice(0, 2)
                      .map(
                        (user) =>
                          user.name
                      )
                      .join(", ")}{" "}
                    typing...
                  </div>
                )}

                <div
                  ref={
                    messagesEndRef
                  }
                />
              </div>
            )}
          </div>

          {/* NAME */}

          <div className="shrink-0 border-t border-white/10 bg-[#101010] px-3 pt-3">
            <input
              type="text"
              value={name}
              onChange={(event) =>
                handleNameChange(
                  event.target.value
                )
              }
              placeholder="Your name"
              maxLength={30}
              className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-orange-500/50"
            />
          </div>

          {/* MESSAGE INPUT */}

          <div className="shrink-0 bg-[#101010] p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(event) =>
                  void sendTypingStatus(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder="Write a message..."
                maxLength={500}
                disabled={loading}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-orange-500/50"
              />

              <button
                type="button"
                onClick={() =>
                  void sendMessage()
                }
                disabled={
                  loading ||
                  !name.trim() ||
                  !message.trim()
                }
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <FaPaperPlane
                  size={14}
                />
              </button>
            </div>

            <p className="mt-2 text-center text-[10px] text-white/25">
              AnimeHub Community Chat
            </p>
          </div>
        </div>
      )}
    </>
  );
}