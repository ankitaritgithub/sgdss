import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import "./chatbotresponse.css";
import copyIcon from "../assets/copy-icon.svg";
import downloadIcon from "../assets/Download.svg";
import AIAvatar from "../assets/AIAvatar.svg";
import tickIcon from '../assets/tick.svg';
import expandIcon from '../assets/expandicons.svg';

const ChatbotResponse = ({ content, isNewResponse, realJsonn, onExpandClick, chatHistory, index, setSelectedAnswer, setSelectedQuestion }) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [
  showExpandButton, setShowExpandButton] = useState(false);

  useEffect(() => {
    if (!content) return;

    setShowExpandButton(content.length > 500);

    if (!isNewResponse) {
      setDisplayedContent(content);
      setIsTyping(false);
      return;
    }

    setDisplayedContent("");
    setIsTyping(true);

    const typingSpeed = 30;
    let currentIndex = -1;

    const typingInterval = setInterval(() => {
      if (currentIndex < content.length - 1) {
        currentIndex++;
        setDisplayedContent(prev => prev + content[currentIndex]);
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, typingSpeed);

    return () => {
      clearInterval(typingInterval);
      setIsTyping(false);
    };
  }, [content, isNewResponse]);

  const handleDownload = async () => {
    try {
      const response = await fetch(
        "http://localhost:8009/download-report/newman-report.html",
        {
          method: 'GET',
          headers: {
            'Accept': 'text/html',
            'Content-Type': 'text/html',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "newman-report.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleViewReport = () => {
    window.open('http://127.0.0.1:8000/view-report/newman-report.html', '_blank');
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    console.log(chatHistory[index -1], index, chatHistory)
    setSelectedAnswer(chatHistory[index])
    setSelectedQuestion(chatHistory[index - 1])
    if (onExpandClick) {
      onExpandClick();
    }
  };

  const isReportResponse = displayedContent.includes('Report successfully generated.') && displayedContent.includes('Download the HTML');

  return (
    <div className={`message bot ${isExpanded ? 'expanded' : ''}`}>
      <div className="bot-message">
        <div className={`message-container ${showExpandButton ? 'long-response' : ''}`}>
          <div className="message-header-wrapper">
            <div className="message-avatar">
            <img src={AIAvatar} alt="AI Avatar" className="avatar-circle" />
            </div>
            {showExpandButton && !isExpanded && (
              <button 
                className="expand-toggle-button"
                onClick={handleExpand}
              >
                <img 
                  src={expandIcon} 
                  className={`expand-icon ${isExpanded ? 'rotated' : ''}`}
                />
              </button>
            )}
          </div>
          <div className={`content-text markdown-body ${isExpanded ? 'expanded' : ''}`}>
            <ReactMarkdown
              children={displayedContent || ''}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={{
                code: ({node, inline, className, children, ...props}) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline ? (
                    <pre className={className}>
                      <code className={match ? `language-${match[1]}` : ''} {...props}>
                        {String(children)}
                      </code>
                    </pre>
                  ) : (
                    <code className={className} {...props}>
                      {String(children)}
                    </code>
                  );
                }
              }}
            />
            {(isReportResponse && realJsonn?.download_url) && !isTyping && (
              <div className="report-actions">
                <button onClick={handleDownload} className="report-button">
                  ⬇️ Download Report
                </button>
                <button onClick={handleViewReport} className="report-button">
                  ↗️ View Report
                </button>
              </div>
            )}
            <div className="status-indicator-bottom">
              {isTyping ? (
                <div className="typing-status">Typing...</div>
              ) : (
                <button className="copy-button" onClick={copyToClipboard}>
                  <img src={isCopied ? tickIcon : copyIcon} alt={isCopied ? "Copied" : "Copy"} className="copy-icon" />
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotResponse;
