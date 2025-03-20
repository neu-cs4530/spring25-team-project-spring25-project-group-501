import React, { useRef, useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './index.css';
import UserContext from '../../../../contexts/UserContext';
import { getWhiteboard } from '../../../../services/whiteboardService';

const SpecificWhiteboardPage = () => {
  const { whiteboardID } = useParams();
  const [whiteboard, setWhiteboard] = useState<string>('');
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [size, setSize] = useState<number>(2);
  const [color, setColor] = useState<string>('#000000');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const user = useContext(UserContext);

  useEffect(() => {
    const fetchWhiteboard = async () => {
      if (!whiteboardID) return;
      const fetchedWhiteboard = await getWhiteboard(whiteboardID);
      setWhiteboard(JSON.stringify(fetchedWhiteboard));
    };

    fetchWhiteboard();
  }, [whiteboardID]);

  useEffect(() => {
    if (!user) return;
    if (user.socket && whiteboardID) {
      user.socket.emit('joinWhiteboard', whiteboardID);
      user.socket.on('whiteboardContent', (content: string) => {
        setWhiteboard(content);
      });
    }

    return () => {
      if (user.socket) {
        user.socket.off('whiteboardContent');
      }
    };
  }, [user?.socket]);

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
        setContext(ctx);
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

  const startDrawing = (e: React.MouseEvent) => {
    if (context) {
      context.beginPath();
      context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !context) return;
    context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    context.stroke();
  };

  const stopDrawing = () => {
    if (context) {
      const content = canvasRef.current?.toDataURL();
      if (content && whiteboardID) {
        user?.socket?.emit('updateWhiteboard', whiteboardID, content);
      }
      context.closePath();
      setIsDrawing(false);
    }
  };

  return (
    <div className='whiteboard-container'>
      <div className='horizontal-flex'>
        <div className='horizontal-flex'>
          <p>Size: </p>
          <input
            type='range'
            min='1'
            max='20'
            value={size}
            onChange={e => setSize(Number(e.target.value))}></input>
        </div>
        <div className='horizontal-flex'>
          <p>Color: </p>
          <input type='color' value={color} onChange={e => setColor(e.target.value)}></input>
        </div>
      </div>
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
    </div>
  );
};

export default SpecificWhiteboardPage;
