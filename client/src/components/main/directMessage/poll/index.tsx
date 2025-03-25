import React, { useEffect, useState } from 'react';
import Modal from '../modal';
import './index.css';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pollData: { question: string; options: string[] }) => void;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [question, setQuestion] = useState<string>('');
  const [options, setOptions] = useState<string[]>(['', '']); // start with two empty options

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmedQuestion = question.trim();
    const trimmedOptions = options.map(opt => opt.trim()).filter(opt => opt);
    if (!trimmedQuestion || trimmedOptions.length < 2) {
      setError('Please enter a poll question and at least two options.');
      return;
    }
    setError(null);
    onSubmit({ question: trimmedQuestion, options: trimmedOptions });
    // Reset the fields (optional)
    setQuestion('');
    setOptions(['', '']);
  };

  useEffect(() => {
    if (!isOpen) {
      // Reset the fields when the modal is closed
      setQuestion('');
      setOptions(['', '']);
      setError(null);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className='create-poll-modal'>
        <h3>Create a New Poll</h3>
        <div className='form-group'>
          <label>Poll Question:</label>
          <input
            type='text'
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder='Enter your poll question'
          />
        </div>
        <div className='form-group'>
          <label>Options:</label>
          {options.map((option, index) => (
            <input
              key={index}
              type='text'
              value={option}
              onChange={e => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
          ))}
          <button className='custom-modal-button' onClick={addOption}>
            Add Option
          </button>
          {error && <div className='error-message'>{error}</div>}
        </div>
        <div className='modal-actions'>
          <button className='custom-modal-button' onClick={handleSubmit}>
            Send Poll
          </button>
          <button className='custom-modal-button' onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePollModal;
