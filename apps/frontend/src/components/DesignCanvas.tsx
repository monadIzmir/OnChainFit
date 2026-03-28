// src/components/DesignCanvas.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'

interface DesignCanvasProps {
  productTemplate: any
  onSave?: (designData: any) => void
}

export function DesignCanvas({ productTemplate, onSave }: DesignCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null)
  const [fontSize, setFontSize] = useState(16)
  const [fontColor, setFontColor] = useState('#000000')

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize Fabric.js canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: productTemplate.areaWidth || 400,
      height: productTemplate.areaHeight || 300,
      backgroundColor: '#ffffff',
      renderOnAddRemove: true,
    })

    fabricRef.current = canvas

    // Add background image (product template)
    fabric.Image.fromURL(productTemplate.imageUrl, (img) => {
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        left: 0,
        top: 0,
        scaleX: canvas.width! / img.width!,
        scaleY: canvas.height! / img.height!,
      })
    })

    // Draw printable zone rect if defined
    if (productTemplate.printZone) {
      const rect = new fabric.Rect({
        left: productTemplate.printZone.x,
        top: productTemplate.printZone.y,
        width: productTemplate.printZone.width,
        height: productTemplate.printZone.height,
        fill: 'transparent',
        stroke: '#ff0000',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        evented: false,
      })
      canvas.add(rect)
    }

    // Handle selection
    canvas.on('selection:created', (e) => {
      setSelectedObject(e.selected?.[0] || null)
    })

    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0] || null)
    })

    canvas.on('selection:cleared', () => {
      setSelectedObject(null)
    })

    return () => {
      canvas.dispose()
    }
  }, [productTemplate])

  const addText = () => {
    const text = new fabric.Text('Edit me', {
      left: 50,
      top: 50,
      fontSize,
      fill: fontColor,
      fontFamily: 'Arial',
    })
    fabricRef.current?.add(text)
    fabricRef.current?.setActiveObject(text)
    fabricRef.current?.renderAll()
  }

  const addShape = (shape: 'rect' | 'circle') => {
    let obj: fabric.Object

    if (shape === 'rect') {
      obj = new fabric.Rect({
        left: 50,
        top: 50,
        width: 100,
        height: 100,
        fill: '#ff6b6b',
        stroke: '#000',
        strokeWidth: 2,
      })
    } else {
      obj = new fabric.Circle({
        left: 50,
        top: 50,
        radius: 50,
        fill: '#4ecdc4',
        stroke: '#000',
        strokeWidth: 2,
      })
    }

    fabricRef.current?.add(obj)
    fabricRef.current?.setActiveObject(obj)
    fabricRef.current?.renderAll()
  }

  const deleteSelected = () => {
    if (selectedObject) {
      fabricRef.current?.remove(selectedObject)
      fabricRef.current?.renderAll()
      setSelectedObject(null)
    }
  }

  const handleSave = () => {
    if (!fabricRef.current) return

    const designData = {
      canvas: fabricRef.current.toJSON(),
      image: fabricRef.current.toDataURL('image/png'),
    }

    onSave?.(designData)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-100 rounded-lg">
        <button
          onClick={addText}
          className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          📝 Add Text
        </button>
        <button
          onClick={() => addShape('rect')}
          className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          ⬜ Rectangle
        </button>
        <button
          onClick={() => addShape('circle')}
          className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          ⭕ Circle
        </button>

        {selectedObject && (
          <>
            <div className="border-l border-gray-300 mx-2"></div>
            <input
              type="color"
              value={fontColor}
              onChange={(e) => {
                setFontColor(e.target.value)
                if (selectedObject) {
                  selectedObject.set({ fill: e.target.value })
                  fabricRef.current?.renderAll()
                }
              }}
              className="w-10 h-10 border border-gray-300 rounded"
              title="Color"
            />
            <button
              onClick={deleteSelected}
              className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              🗑️ Delete
            </button>
          </>
        )}

        <button
          onClick={handleSave}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Design
        </button>
      </div>

      {/* Canvas */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <canvas
          ref={canvasRef}
          className="border border-dashed border-gray-400 mx-auto"
        />
      </div>
    </div>
  )
}
