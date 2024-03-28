// @ts-nocheck
import type React from "react";
import { useEffect, useRef } from "react";

interface BlockiesProps {
  className?: string;
  size?: number;
  scale?: number;
  seed?: string;
  color?: string;
  bgColor?: string;
  spotColor?: string;
}

export const Blockies: React.FC<BlockiesProps> = ({
  className = "identicon",
  size = 8,
  scale = 4,
  seed = Math.floor(Math.random() * 10 ** 16).toString(16),
  color,
  bgColor,
  spotColor,
}: BlockiesProps) => {
  const identiconRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const randseed = new Array(4);

    const seedrand = (seed: string) => {
      for (let i = 0; i < randseed.length; i++) {
        randseed[i] = 0;
      }
      for (let i = 0; i < seed.length; i++) {
        randseed[i % 4] = (randseed[i % 4] << 5) - randseed[i % 4] + seed.charCodeAt(i);
      }
    };

    const rand = () => {
      const t = randseed[0] ^ (randseed[0] << 11);
      randseed[0] = randseed[1];
      randseed[1] = randseed[2];
      randseed[2] = randseed[3];
      randseed[3] = randseed[3] ^ (randseed[3] >> 19) ^ t ^ (t >> 8);
      return (randseed[3] >>> 0) / ((1 << 31) >>> 0);
    };

    const createColor = () => {
      const h = Math.floor(rand() * 360);
      const s = `${rand() * 60 + 40}%`;
      const l = `${(rand() + rand() + rand() + rand()) * 25}%`;
      return `hsl(${h},${s},${l})`;
    };

    const createImageData = (size: number) => {
      const width = size;
      const height = size;
      const dataWidth = Math.ceil(width / 2);
      const mirrorWidth = width - dataWidth;
      const data = [];
      for (let y = 0; y < height; y++) {
        let row = [];
        for (let x = 0; x < dataWidth; x++) {
          row[x] = Math.floor(rand() * 2.3);
        }
        const r = row.slice(0, mirrorWidth);
        r.reverse();
        row = row.concat(r);
        for (let i = 0; i < row.length; i++) {
          data.push(row[i]);
        }
      }
      return data;
    };

    const setCanvas = (
      identicon: HTMLCanvasElement,
      imageData: number[],
      color: string,
      scale: number,
      bgcolor: string,
      spotcolor: string,
    ) => {
      const width = Math.sqrt(imageData.length);
      const size = width * scale;
      identicon.width = size;
      identicon.style.width = `${size}px`;
      identicon.height = size;
      identicon.style.height = `${size}px`;
      const cc = identicon.getContext("2d");
      cc.fillStyle = bgcolor;
      cc.fillRect(0, 0, identicon.width, identicon.height);
      cc.fillStyle = color;
      for (let i = 0; i < imageData.length; i++) {
        cc.fillStyle = imageData[i] === 1 ? color : spotcolor;
        if (imageData[i]) {
          const row = Math.floor(i / width);
          const col = i % width;
          cc.fillRect(col * scale, row * scale, scale, scale);
        }
      }
    };

    seedrand(seed);
    const colorValue = color || createColor();
    const bgColorValue = bgColor || createColor();
    const spotColorValue = spotColor || createColor();
    const imageData = createImageData(size);

    if (identiconRef.current) {
      setCanvas(
        identiconRef.current,
        imageData,
        colorValue,
        scale,
        bgColorValue,
        spotColorValue,
      );
    }
  }, [size, scale, seed, color, bgColor, spotColor]);

  return <canvas ref={identiconRef} className={className} />;
};
