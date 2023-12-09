import { Interweave } from "interweave";
import { UrlMatcher } from "interweave-autolink";
import type { MouseEvent } from "react";
import {
  ContentTypeId,
  type CachedMessage,
  ContentTypeText,
} from "@xmtp/react-sdk";

interface MessageContentControllerProps {
  message: CachedMessage;
  isSelf: boolean;
}

const MessageContentController = ({
  message,
  isSelf,
}: MessageContentControllerProps) => {
  const contentType = ContentTypeId.fromString(message.contentType);

  if (contentType.sameAs(ContentTypeText)) {
    const content = message.content as string;
    return (
      <span className="interweave-content" data-testid="message-tile-text">
        <Interweave
          content={content}
          newWindow
          escapeHtml
          onClick={(event: MouseEvent<HTMLDivElement>) =>
            event.stopPropagation()
          }
          matchers={[new UrlMatcher("url")]}
        />
      </span>
    );
  }

  // message content type not supported, display fallback
  return <span>{message.contentFallback}</span>;
};

export default MessageContentController;
