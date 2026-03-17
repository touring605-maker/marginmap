import { MarginMapProvider, useMarginMap } from './margin-map/MarginMapContext';
import { SetupWizard } from './margin-map/SetupWizard';
import { ScenarioDashboard } from './margin-map/ScenarioDashboard';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';

function MarginMapContent() {
  const { state, dispatch } = useMarginMap();
  const [showReset, setShowReset] = useState(false);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Margin Map</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {state.setupComplete
              ? 'Model trade-offs across your three revenue channels'
              : 'Set up your baseline business data to start scenario planning'}
          </p>
        </div>
        {state.setupComplete && (
          <div className="relative">
            <button
              onClick={() => setShowReset(!showReset)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground border border-border rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            {showReset && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-border rounded-xl shadow-lg p-4 z-50">
                <p className="text-xs text-foreground font-medium mb-2">Reset all data?</p>
                <p className="text-xs text-muted-foreground mb-3">This will clear your baseline and all scenarios. This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReset(false)}
                    className="flex-1 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { dispatch({ type: 'RESET_ALL' }); setShowReset(false); }}
                    className="flex-1 px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {state.setupComplete ? <ScenarioDashboard /> : <SetupWizard />}
    </div>
  );
}

export default function MarginMap() {
  return (
    <MarginMapProvider>
      <MarginMapContent />
    </MarginMapProvider>
  );
}
