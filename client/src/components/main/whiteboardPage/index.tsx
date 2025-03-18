import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './index.css';
import { addWhiteboard } from '../../../services/whiteboardService';

const WhiteboardPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [size, setSize] = useState<number>(2);
  const [color, setColor] = useState<string>('#000000');
  const [title, setTitle] = useState<string>('');
  const [accessType, setAccessType] = useState<string>('read-only');
  const { username } = useParams<{ username: string }>();

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

  const handleCreateWhiteboard = async () => {
    if (!username) return;
    const dateCreated = new Date();
    const uniqueLink = crypto.randomUUID();
    const content: string[][] = Array.from({ length: 3 }, () => 
    Array.from({ length: 4 }, () => '#FFFFFF')
    );
    const whiteboard = await addWhiteboard(username, title, dateCreated, content, uniqueLink, accessType);
  };

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
      context.closePath();
      setIsDrawing(false);
    }
  };

  return (
    // <button className='btn-create-whiteboard' onClick={handleCreateWhiteboard}>Create Whiteboard</button>
    <div className='whiteboard-container'>
      <div className='horizontal-flex'>
        <button className='btn-create-whiteboard' onClick={handleCreateWhiteboard}>Create Whiteboard</button>
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

export default WhiteboardPage;
