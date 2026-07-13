const TypingIndicator = ({ names }) => {
  if (!names || names.length === 0) return null;

  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
      ? `${names[0]} and ${names[1]} are typing`
      : `${names.length} people are typing`;

  return (
    <div className="typing-indicator">
      <span className="typing-dots">
        <span /> <span /> <span />
      </span>
      {label}
    </div>
  );
};

export default TypingIndicator;
