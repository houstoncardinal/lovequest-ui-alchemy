import React from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
  const emojis = [
    '😊', '😂', '🥰', '😍', '🤗', '🤔', '😘', '😉',
    '👋', '👏', '🙏', '💪', '👍', '👎', '✌️', '🤞',
    '❤️', '💕', '💖', '💯', '🔥', '⭐', '🎉', '🎊',
    '🌟', '🌈', '☀️', '🌙', '🌸', '🌺', '🌻', '🌹',
    '🎵', '🎶', '🎤', '🎬', '📱', '💻', '📚', '✈️',
    '🍕', '🍔', '🍟', '🍦', '🍰', '☕', '🥤', '🍃'
  ];

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 w-72 max-h-48 overflow-y-auto">
      <div className="grid grid-cols-8 gap-2">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-lg transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;