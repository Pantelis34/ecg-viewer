import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import ecgData from './ecg_graph_dto_realistic.json';
import './App.css';

const App = () => {
  const [signals, setSignals] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    setSignals(ecgData.signals);
    setAnnotations(ecgData.beats);
  }, []);

  const handleLabelChange = (e) => {
    const newLabel = e.target.value;
    setAnnotations((prev) =>
      prev.map((ann, i) =>
        i === selectedAnnotation ? { ...ann, label: newLabel } : ann
      )
    );
  };

  const handlePointClick = (data) => {
    const x = data.points[0].x;
    const foundIndex = annotations.findIndex((a) => a.rPeak === x);
    if (foundIndex !== -1) {
      setSelectedAnnotation(foundIndex);
    }
  };

  const handleSelectedRegion = (eventData) => {
    if (!eventData.range) return;
    const { x } = eventData.range;
    const beatsInRange = annotations.filter(
      (a) => a.startInMs >= x[0] && a.endInMs <= x[1]
    );
    const durationMs = x[1] - x[0];
    const hr = beatsInRange.length / (durationMs / 60000); // bpm
    setSelection({ durationMs, hr });
  };

  return (
    <div className="App">
      <h1>ECG Viewer</h1>
      <Plot
        data={[
          {
            x: signals.map((s) => s.timeInMs),
            y: signals.map((s) => s.point),
            type: 'scatter',
            mode: 'lines',
            name: 'ECG Signal',
          },
          {
            x: annotations.map((a) => signals[a.beatIndex].timeInMs),
            y: annotations.map((a) => a.rPeak),
            type: 'scatter',
            mode: 'markers+text',
            text: annotations.map((a) => a.label),
            textposition: 'top center',
            marker: { size: 8, color: 'red' },
            name: 'Annotations',
          },
        ]}
        layout={{
          width: 1000,
          height: 600,
          title: 'ECG Graph',
          dragmode: 'select',
          xaxis: { title: 'Time (ms)' },
          yaxis: { title: 'Amplitude' },
        }}
        onClick={handlePointClick}
        onSelected={handleSelectedRegion}
      />

      {selectedAnnotation !== null && (
        <div className="editor">
          <h3>Edit Annotation</h3>
          <label>
            Label:
            <input
              type="text"
              value={annotations[selectedAnnotation].label}
              onChange={handleLabelChange}
            />
          </label>
        </div>
      )}

      {selection && (
        <div className="info">
          <p>Duration: {selection.durationMs.toFixed(2)} ms</p>
          <p>Estimated HR: {selection.hr.toFixed(2)} bpm</p>
        </div>
      )}
    </div>
  );
};

export default App;
