import React, { useRef, useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import './index.css';
import { faEraser, faPaintBrush } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UserContext from '../../../../contexts/UserContext';
import { getWhiteboard } from '../../../../services/whiteboardService';
import { Whiteboard } from '../../../../types/types';

const SpecificWhiteboardPage = () => {
  const { whiteboardID } = useParams();
  const [whiteboard, setWhiteboard] = useState<string>('');
  const [context, SetContext] = useState<CanvasRenderingContext2D | null>(null);
  const [size, setSize] = useState<number>(2);
  const [color, setColor] = useState<string>('#000000');
  const [previousColor, setPreviousColor] = useState<string>('#000000');
  const [previousSize, setPreviousSize] = useState<number>(2);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const user = useContext(UserContext);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [whiteboardObject, setWhiteboardObject] = useState<Whiteboard | null>(null);

  useEffect(() => {
    if (user?.socket && whiteboardID) {
      const fetchWhiteboard = async () => {
        const fetchedWhiteboard = await getWhiteboard(whiteboardID);
        if (fetchedWhiteboard) {
          if (fetchedWhiteboard.accessType === 'editable') {
            setIsReadOnly(false);
          } else {
            setIsReadOnly(true);
          }
          setWhiteboardObject(fetchedWhiteboard);
        }
      };
      fetchWhiteboard();

      user?.socket.emit('joinWhiteboard', whiteboardID);
      user?.socket.on('whiteboardContent', (content: string) => {
        setWhiteboard(content);
      });
    }

    return () => {
      if (user?.socket && whiteboardID) {
        user?.socket.off('whiteboardContent');
        user?.socket.emit('leaveWhiteboard', whiteboardID);
      }
    };
  }, [user, user?.socket, whiteboardID]);

  useEffect(() => {
    if (context) {
      context.lineWidth = size;
    }
  }, [size, context]);

  useEffect(() => {
    if (context) {
      context.strokeStyle = color;
    }
  }, [color, context]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        SetContext(ctx);
      }
    }
  }, []);

  useEffect(() => {
    if (context && whiteboard) {
      const img = new Image();
      img.src = whiteboard;
      img.onload = () => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clear the canvas
        context.drawImage(img, 0, 0); // Draw the image on the canvas
      };
    }
  }, [whiteboard, context]);

  const toggleEraser = () => {
    if (!isEraser) {
      // Switching to eraser
      setPreviousColor(color);
      setPreviousSize(size);
      setColor('#FFFFFF');
      setSize(40); // Much larger eraser size
      setIsEraser(true);
    } else {
      // Switching back to pen
      setColor(previousColor);
      setSize(previousSize);
      setIsEraser(false);
    }
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (isReadOnly && whiteboardObject?.owner !== user?.user.username) return;
    if (context) {
      context.beginPath();
      context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (isReadOnly && whiteboardObject?.owner !== user?.user.username) return;
    if (!isDrawing || !context) return;
    context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    context.stroke();
  };

  const stopDrawing = () => {
    if (isReadOnly && whiteboardObject?.owner !== user?.user.username) return;
    if (context) {
      const content = canvasRef.current?.toDataURL();
      if (content && whiteboardID) {
        user?.socket?.emit('updateWhiteboard', whiteboardID, content);
      }
      context.closePath();
      setIsDrawing(false);
    }
  };

  const canEdit = !isReadOnly || (isReadOnly && whiteboardObject?.owner === user?.user.username);

  const updateDrawingColor = (newColor: string) => {
    if (!isEraser) {
      setColor(newColor);
      setPreviousColor(newColor);
    }
  };

  const updateDrawingSize = (newSize: number) => {
    if (isEraser) {
      // Allow adjusting eraser size but keep it larger
      setSize(newSize * 2); // Double the size for eraser mode
    } else {
      setSize(newSize);
      setPreviousSize(newSize);
    }
  };

  return (
    <div className='m-4'>
      <div className='flex gap-2 items-end'>
        <h2 className='font-bold text-2xl'>{whiteboardObject?.title}</h2>
        <p className='italic'>{whiteboardObject ? `Owned By ${whiteboardObject.owner}` : ''}</p>
      </div>

      {isReadOnly && whiteboardObject?.owner !== user?.user.username && (
        <p>This whiteboard is read-only.</p>
      )}
      {canEdit && (
        <div className='horizontal-flex'>
          <div className='horizontal-flex'>
            <p>Size: </p>
            <input
              type='range'
              value={isEraser ? size / 2 : size}
              onChange={e => updateDrawingSize(Number(e.target.value))}
              min={isEraser ? '10' : '1'}
              max={isEraser ? '50' : '20'}
            />
          </div>
          <div className='horizontal-flex'>
            <p>Color: </p>
            <input
              type='color'
              value={isEraser ? previousColor : color}
              onChange={e => updateDrawingColor(e.target.value)}
              disabled={isEraser}
            />
          </div>
          <div className='horizontal-flex tool-toggle'>
            <button
              className={`tool-btn ${isEraser ? 'active' : ''}`}
              onClick={toggleEraser}
              title={isEraser ? 'Switch to Brush' : 'Switch to Eraser'}>
              <FontAwesomeIcon icon={isEraser ? faPaintBrush : faEraser} />
              {isEraser ? ' Brush' : ' Eraser'}
            </button>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ backgroundColor: 'white', border: '1px solid #ccc' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      {whiteboardID && (
        <div className='flex'>
          <button
            className='btn-copy-whiteboard'
            onClick={e => navigator.clipboard.writeText(whiteboardID)}>
            Copy Whiteboard ID
          </button>
          <button
            className='px-[20px] py-[10px] bg-[#007bff] text-white rounded-md'
            onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
      )}
    </div>
  );
};

export default SpecificWhiteboardPage;
