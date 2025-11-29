import { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';
import { CodeEditor } from './code-presenter/CodeEditor';
import { ConfigPanel, type ConfigItem } from './code-presenter/ConfigPanel';
import { PreviewPanel } from './code-presenter/PreviewPanel';

import { parseLineConfig } from './code-presenter/focus';

export interface CodePresenterState {
  code: string;
  configList: ConfigItem[];
  selectedConfigId: string | null;
  exportWidth: string;
  exportHeight: string;
  showHtml: boolean;
}

export interface CodePresenterProps {
  initialState?: Partial<CodePresenterState>;
}

export interface CodePresenterRef {
  getState: () => CodePresenterState;
}

const CodePresenter = forwardRef<CodePresenterRef, CodePresenterProps>(({ initialState }, ref) => {
  const [code, setCode] = useState<string>(initialState?.code || `package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, World!")\n}`);
  const [configList, setConfigList] = useState<ConfigItem[]>(initialState?.configList || []);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(initialState?.selectedConfigId || null);
  const [showHtml, setShowHtml] = useState<boolean>(initialState?.showHtml || false);
  const [exportWidth, setExportWidth] = useState<string>(initialState?.exportWidth || '');
  const [exportHeight, setExportHeight] = useState<string>(initialState?.exportHeight || '');

  useImperativeHandle(ref, () => ({
    getState: () => ({
      code,
      configList,
      selectedConfigId,
      exportWidth,
      exportHeight,
      showHtml
    })
  }));

  const previewRef = useRef<HTMLDivElement>(null!);

  const selectedConfig = configList.find(c => c.id === selectedConfigId);
  const focusLinesInput = selectedConfig ? selectedConfig.lines : '';
  const focusedLines = parseLineConfig(focusLinesInput);
  const isFocusMode = !!selectedConfigId;

  // Update dimensions when content changes
  useEffect(() => {
    if (previewRef.current) {
      const { clientWidth, clientHeight } = previewRef.current;
      setExportWidth(clientWidth.toString());
      setExportHeight(clientHeight.toString());
    }
  }, [code, isFocusMode, focusedLines.length]);

  const handleDimensionsChange = useCallback((width: number, height: number) => {
    setExportWidth(width.toString());
    setExportHeight(height.toString());
  }, []);

  const handleExportPng = useCallback(async () => {
    if (previewRef.current === null) return;
    try {
      const width = exportWidth ? parseInt(exportWidth, 10) : undefined;
      const height = exportHeight ? parseInt(exportHeight, 10) : undefined;
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        backgroundColor: '#1e1e1e',
        width,
        height,
        canvasWidth: width,
        canvasHeight: height
      });
      const link = document.createElement('a');
      link.download = 'code-snippet.png';
      link.href = dataUrl;
      link.click();
      toast.success('Exported successfully!');
    } catch (err) {
      console.error('Failed to export PNG', err);
      toast.error('Failed to export PNG');
    }
  }, [previewRef, exportWidth, exportHeight]);

  const handleCopyPng = useCallback(async () => {
    if (previewRef.current === null) return;
    try {
      const width = exportWidth ? parseInt(exportWidth, 10) : undefined;
      const height = exportHeight ? parseInt(exportHeight, 10) : undefined;
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        backgroundColor: '#1e1e1e',
        width,
        height,
        canvasWidth: width,
        canvasHeight: height
      });
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      toast.success('Image copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy PNG', err);
      toast.error('Failed to copy image.');
    }
  }, [previewRef, exportWidth, exportHeight]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h2>Code Presenter</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <CodeEditor code={code} onChange={setCode} />

          <ConfigPanel
            exportWidth={exportWidth}
            setExportWidth={setExportWidth}
            exportHeight={exportHeight}
            setExportHeight={setExportHeight}
            configList={configList}
            setConfigList={setConfigList}
            selectedConfigId={selectedConfigId}
            setSelectedConfigId={setSelectedConfigId}
            onExportPng={handleExportPng}
            onCopyPng={handleCopyPng}
            showHtml={showHtml}
            setShowHtml={setShowHtml}
          />
        </div>

        <PreviewPanel
          code={code}
          isFocusMode={isFocusMode}
          focusedLines={focusedLines}
          showHtml={showHtml}
          onDimensionsChange={handleDimensionsChange}
          previewRef={previewRef}
        />
      </div>
    </div>
  );
});

CodePresenter.displayName = 'CodePresenter';

export default CodePresenter;
